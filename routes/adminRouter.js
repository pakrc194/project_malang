const express = require('express')
const router = express.Router()
const conn = require('../db/db')
const {iPerfSql, iCastSql, iPerfCastSql, iPerfPriceSql, iActorSql, iPerfScheduleSql} = require('../db/admin_insert_db')
const {sPrefCastWpid, sPrefScheduleWpid} = require('../db/admin_select_db')
const {multer} = require('../func/multer')
const {base_date_format} = require('../func/date')
const util = require('util');

router.get('/perf', (req, res)=>{
    res.redirect('/admin/perf/list')
})
router.get('/actor', (req, res)=>{
    res.redirect('/admin/actor/list')
})

conn.query = util.promisify(conn.query);

//공연 데이터가 없어서 공연장으로 임시 대체
router.get('/perf/list', (req, res)=>{
    conn.query('select * from performance_info', (err, resQuery)=>{
        if(err) {
            console.log('sql 실패', err.message)
            res.render('../views/admin_perf_list.html')
        } else {
            console.log('sql 성공', resQuery)
            for(const perf of resQuery) {
                perf.start_date = base_date_format(perf.start_date)
                perf.end_date = base_date_format(perf.end_date)
                perf.reg_date = base_date_format(perf.reg_date)
            }
            res.render('../views/admin_perf_list.html', {res : resQuery})
        }
    })
})
router.get('/perf/detail/:id', (req, res)=>{
    const tasks = []
    console.log(req.params)
    conn.query('select * from performance_info where perf_id = ?', [req.params.id], async (perfInfoErr, perfInfoQuery)=>{
        if(perfInfoErr) {
            console.log('sql 실패', perfInfoErr.message)
            res.render('../views/admin_perf_list.html')
        } else {
            console.log('sql 성공', perfInfoQuery)
            perfInfoQuery[0].start_date = base_date_format(perfInfoQuery[0].start_date)
            perfInfoQuery[0].end_date = base_date_format(perfInfoQuery[0].end_date)
            perfInfoQuery[0].reg_date = base_date_format(perfInfoQuery[0].reg_date)
            
            let sVenueInfo = 'select * from venue_info where venue_id = ?'

            tasks.push(conn.query(sVenueInfo, [perfInfoQuery[0].venue_id]))
            tasks.push(conn.query(sPrefCastWpid, [req.params.id]))
            tasks.push(conn.query(sPrefScheduleWpid, [req.params.id]))
            
            const [venueQuery, perfCastQuery, perfSceduleQuery] = await Promise.all(tasks);
            for(perfScedule of perfSceduleQuery) {
                perfScedule.schedule_date = base_date_format(perfScedule.schedule_date)
            }
            console.log(perfCastQuery)

            res.render('../views/admin_perf_detail.html', {perfInfo : perfInfoQuery[0], perfCast : perfCastQuery, perfScedule : perfSceduleQuery, venueInfo: venueQuery[0]})
        }
    })
})

router.get('/perf/upload', (req, res)=>{
    conn.query('select * from actor_info', (err, resQuery)=>{
        if(err) {
            console.log('sql 실패', err.message)
            res.render('../views/admin_perf_upload.html')
        } else {
            console.log('sql 성공', resQuery)
            res.render('../views/admin_perf_upload.html', {res : resQuery})
        }
    })
})

const arr = [
    {name: 'fposter'},
    {name: 'fsynopsis'}
]

router.post('/perf/upload', multer.fields(arr), async (req, res)=>{
    for(let idx in req.files) {
        req.body[idx] = req.files[idx][0].filename
    }
    console.log('req : ', req.body)
    let perfData = [req.body.fname, req.body.fposter, req.body.fsynopsis, 
        req.body.fstart, req.body.fend, req.body.fgenre, req.body.frunning, req.body.ftheator]

    let castDataArr = req.body.castData
    let prefCastDataArr = req.body.prefCastData

    var venue_id = req.body.ftheator
    let seatData = {R:req.body.fclassR, S:req.body.fclassS, A:req.body.fclassA}

    let sSeatGradeSql = `SELECT DISTINCT grade_code FROM SEAT_LAYOUT WHERE venue_id = ?`

    const tempPrefCastData = {};

    console.log(`perf Info : ${perfData}`)
    console.log(`cast Info : ${castDataArr}`)
    console.log(`prefCast Info : ${prefCastDataArr}`)
    console.log(`seat data :`, seatData)
    
    const tasks = []
        
    try {

        const gradeRet = await conn.query(sSeatGradeSql, [venue_id]);

        const perfRet = await conn.query(iPerfSql, perfData)
        const perf_id = perfRet.insertId
        console.log('perf query 성공', perf_id)

        const currentDate = new Date(req.body.fstart);
        const endDate = new Date(req.body.fend);

        console.log("순회 시작:", currentDate.toISOString());
        console.log("순회 종료:", endDate.toISOString());
        
        while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            
            const dateString = `${year}-${month}-${day}`;
            let perfScheduleData1 = [perf_id, venue_id, dateString, "14:00", 1]
            tasks.push(conn.query(iPerfScheduleSql, perfScheduleData1))
            let perfScheduleData2 = [perf_id, venue_id, dateString, "19:00", 2]
            tasks.push(conn.query(iPerfScheduleSql, perfScheduleData2))
            
            console.log(`순회 날짜: ${perfScheduleData1}`);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        for (const gradeRow of gradeRet) {
            const grade = gradeRow.grade_code;
            const price = seatData[grade];
            
            if (price) {
                const perfPriceData = [perf_id, venue_id, grade, price]
                tasks.push(conn.query(iPerfPriceSql, perfPriceData))
            }
        }


        for (const cast of JSON.parse(castDataArr)) {
            const tempId = cast.id
            const castData = [perf_id, cast.castName, cast.castBg]
            
            const castRet = await conn.query(iCastSql, castData)
            const newCastId = castRet.insertId
            
            tempPrefCastData[tempId] = newCastId
            console.log('cast query 성공', tempId, castRet.insertId)
        }
        
        // 2-3. PERF_CAST 등록 (배역 등록 후 바로 기본 캐스팅 연결)
        for (let prefCast of JSON.parse(prefCastDataArr)) {
            console.log('prefCast', prefCast, Object.keys(prefCast).length > 0)
            if(Object.keys(prefCast).length > 0) {
                for(const cast_id in prefCast) {
                    const actorIdsString = prefCast[cast_id];
                    for(const act_id of actorIdsString.split(',')) {
                        const perfCastData = [perf_id, tempPrefCastData[cast_id], act_id]
                        console.log("perfCastData : ", perfCastData)
                        tasks.push(conn.query(iPerfCastSql, perfCastData))
                    }
                }   
            }
        }



        
        // 3. 모든 병렬 작업 완료 대기
        await Promise.all(tasks);
        
        // 4. 모든 DB 작업이 성공적으로 완료되면 응답 전송
        console.log('모든 DB 작업 성공적으로 완료.');
        if(res.headersSent) {
            console.warn('응답 헤더가 이미 전송되었습니다.')
            return ;
        }
        res.send(`success`);
    } catch(err) {
        console.error('공연 등록 전체 트랜잭션 실패:', err.message);
        res.status(500).send('공연 등록 중 오류가 발생했습니다.');
    }
})

router.get('/perf/modify/:id', (req, res)=> {
    conn.query('select * from performance_info where perf_id = ?', [req.params.id], (perfInfoErr, perfInfoQuery)=>{
        if(perfInfoErr) {
            console.log('sql 실패', perfInfoErr.message)
            res.render('../views/admin_perf_list.html')
        } else {
            console.log('sql 성공', perfInfoQuery)
            perfInfoQuery.start_date = base_date_format(perfInfoQuery.start_date)
            perfInfoQuery.end_date = base_date_format(perfInfoQuery.end_date)
            perfInfoQuery.reg_date = base_date_format(perfInfoQuery.reg_date)
            
        
            conn.query(sPrefCastWpid, [req.params.id], (perfCastErr, perfCastQuery)=>{
                if(perfCastErr) {
                    console.log('sql 실패', perfCastErr.message)
                    res.render('../views/admin_perf_list.html')
                } else {
                    console.log('prefCast : ', perfCastQuery)
                    res.render('../views/admin_perf_modify.html', {perfInfo : perfInfoQuery[0], perfCast : perfCastQuery})
                }
            })
        }
    })
})

router.get('/perf/schedule/:id', async(req, res)=>{
    const tasks = []    

    let perfSceduleQuery = await(conn.query(sPrefScheduleWpid, [req.params.id]))

    tasks.push(conn.query(sPrefCastWpid, [req.params.id]))
    let sCastInfo = 'select * from cast_info where perf_id = ?;'
    tasks.push(conn.query(sCastInfo, [req.params.id]))
    let sScheduleCast = 'select * from schedule_cast where schedule_id = ?;'
    for(const perfScedule of perfSceduleQuery) {
        tasks.push(conn.query(sScheduleCast, [perfScedule.schedule_id]))
    }       
    const [perfCastQuery, castInfoQuery, ...castQuery] = await Promise.all(tasks);
    for(perfScedule of perfSceduleQuery) {
        perfScedule.schedule_date = base_date_format(perfScedule.schedule_date)
    }
    console.log(perfCastQuery)
    console.log(castQuery)

    res.render('../views/admin_perf_schedule.html', {perfCast : perfCastQuery, perfScedule : perfSceduleQuery, castInfo : castInfoQuery, castActor: castQuery})
})

router.post('/perf/casting', (req, res)=>{
    
    res.json()
})

router.get('/actor/list', (req, res)=>{
    conn.query('select * from actor_info', (err, resQuery)=>{
        if(err) {
            console.log('sql 실패', err.message)
            res.render('../views/admin_actor_list.html')
        } else {
            console.log('sql 성공', resQuery)
            res.render('../views/admin_actor_list.html', {res : resQuery})
        }
    })
})

router.get('/actor/upload', (req, res)=>{
    res.render('../views/admin_actor_upload.html')
})

router.post('/actor/upload', multer.single('fprofile'), (req, res)=>{
    console.log('actor upload req : ', req.body.name, req.body.fbirth, req.body.fgender)
    console.log('actor upload req fname: ', req.file.filename)
    
    let {fname, fbirth, fgender} = req.body
    let data =[fname, req.file.filename, fbirth, fgender]

    conn.query(iActorSql, data, (err, ret)=>{
        if(err) {
            console.log('글쓰기 실패', err.message)
        } else {
            //auto increament로 새로 부여된 ID값
            console.log('글쓰기 성공', ret.insertId)
            
            res.redirect('/admin/actor')
        }
    })
})




module.exports = router 