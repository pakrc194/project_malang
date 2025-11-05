const express = require('express')
const router = express.Router()
const conn = require('../db/db')
const {iPerfSql, iCastSql, iPerfCastSql, iPerfPriceSql, iActorSql, iPerfScheduleSql, iScheduleCastSql, sPrefCastIdWpid} = require('../db/admin_insert_db')
const {sPrefCastWpid, sPrefScheduleWpid, sScheduleCast} = require('../db/admin_select_db')
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
            res.render('../views/admin/perf_list.html')
        } else {
            console.log('sql 성공', resQuery)
            for(const perf of resQuery) {
                perf.start_date = base_date_format(perf.start_date)
                perf.end_date = base_date_format(perf.end_date)
                perf.reg_date = base_date_format(perf.reg_date)
            }
            res.render('../views/admin/perf_list.html', {res : resQuery})
        }
    })
})
router.get('/perf/detail/:id', (req, res)=>{
    const tasks = []
    console.log(req.params)
    conn.query('select * from performance_info where perf_id = ?', [req.params.id], async (perfInfoErr, perfInfoQuery)=>{
        if(perfInfoErr) {
            console.log('sql 실패', perfInfoErr.message)
            res.render('../views/admin/perf_list.html')
        } else {
            console.log('sql 성공', perfInfoQuery)
            perfInfoQuery[0].start_date = base_date_format(perfInfoQuery[0].start_date)
            perfInfoQuery[0].end_date = base_date_format(perfInfoQuery[0].end_date)
            perfInfoQuery[0].reg_date = base_date_format(perfInfoQuery[0].reg_date)
            
            let sVenueInfo = 'select * from venue_info where venue_id = ?'

            tasks.push(conn.query(sVenueInfo, [perfInfoQuery[0].venue_id]))
            tasks.push(conn.query(sPrefCastWpid, [req.params.id]))
            tasks.push(conn.query(sScheduleCast, [req.params.id]))
            
            const [venueQuery, perfCastQuery, sScheduleQuery] = await Promise.all(tasks);
            for(schedule of sScheduleQuery) {
                schedule.schedule_date = base_date_format(schedule.schedule_date)
            }
            //console.log(perfCastQuery)

            res.render('../views/admin/perf_detail.html', {perfInfo : perfInfoQuery[0], perfCast : perfCastQuery, perfScedule : sScheduleQuery, venueInfo: venueQuery[0]})
        }
    })
})

router.get('/perf/upload', (req, res)=>{
    conn.query('select * from actor_info', (err, resQuery)=>{
        if(err) {
            console.log('sql 실패', err.message)
            res.render('../views/admin/perf_upload.html')
        } else {
            console.log('sql 성공', resQuery)
            res.render('../views/admin/perf_upload.html', {res : resQuery})
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

        console.log('------', seatData)
        for (const gradeRow of gradeRet) {
            const grade = gradeRow.grade_code;
            const price = seatData[grade];
            console.log('price : ', perfPriceData)
            const perfPriceData = [perf_id, venue_id, grade, price]
            tasks.push(conn.query(iPerfPriceSql, perfPriceData))
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

        ///스케줄배정
        let afterTasks = []
        let castArr = {}
        let sScheduleQuery = await conn.query('select * from perf_schedule where perf_id = ?', [perf_id])
        let perfCastQuery = await conn.query('select * from perf_cast where perf_id = ?', [perf_id])
        for(perfCast of perfCastQuery) {
            if(castArr[perfCast.cast_id])
                castArr[perfCast.cast_id] += ','+perfCast.actor_id
            else {
                castArr[perfCast.cast_id] = perfCast.actor_id
            }
        }
        console.log('castArr:' ,castArr)

        const parsedCastArr = {};
        for (const cast_id in castArr) {
            parsedCastArr[cast_id] = castArr[cast_id].toString().split(',');
        }

        let scheduleCount = 0; 

        for (const schedule of sScheduleQuery) {
            for (const cast_id in parsedCastArr) {
                const actorList = parsedCastArr[cast_id];
                const actorListLength = actorList.length;
                
                // 1. 해당 배역의 배우 목록 길이를 기준으로 로테이션 인덱스 계산
                const currentRotationIndex = scheduleCount % actorListLength; 
                const currentActorId = actorList[currentRotationIndex]; 
                
                // 2. DB에 삽입할 값 배열 생성: [스케줄 ID, 배역 ID, 배우 ID]
                const iScheduleCastData = [
                    schedule.schedule_id, 
                    cast_id, 
                    currentActorId
                ];
                console.log('----',iScheduleCastData)
                afterTasks.push(conn.query(iScheduleCastSql, iScheduleCastData));
            }
            scheduleCount++; 
        }
        await Promise.all(afterTasks);

        
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

router.get('/test/:id', async(req, res)=>{
    console.log('-----',req.params.id)
    let perf_id = req.params.id
        ///스케줄배정
    let afterTasks = []
    let castArr = {}
    let sScheduleQuery = await conn.query('select * from perf_schedule where perf_id = ?', [perf_id])
    let perfCastQuery = await conn.query('select * from perf_cast where perf_id = ?', [perf_id])
    for(perfCast of perfCastQuery) {
        if(castArr[perfCast.cast_id])
            castArr[perfCast.cast_id] += ','+perfCast.actor_id
        else {
            castArr[perfCast.cast_id] = perfCast.actor_id
        }
    }
    console.log('castArr:' ,castArr)

    const parsedCastArr = {};
    for (const cast_id in castArr) {
        parsedCastArr[cast_id] = castArr[cast_id].toString().split(',');
    }

    let scheduleCount = 0; 

    for (const schedule of sScheduleQuery) {
        for (const cast_id in parsedCastArr) {
            const actorList = parsedCastArr[cast_id];
            const actorListLength = actorList.length;
            
            // 1. 해당 배역의 배우 목록 길이를 기준으로 로테이션 인덱스 계산
            const currentRotationIndex = scheduleCount % actorListLength; 
            const currentActorId = actorList[currentRotationIndex]; 
            
            // 2. DB에 삽입할 값 배열 생성: [스케줄 ID, 배역 ID, 배우 ID]
            const iScheduleCastData = [
                schedule.schedule_id, 
                cast_id, 
                currentActorId
            ];
            afterTasks.push(conn.query(iScheduleCastSql, iScheduleCastData));
        }
        scheduleCount++; 
    }
    await Promise.all(afterTasks);

    console.log("test", perfCastQuery)
    res.send(`<a href="/admin/test/${perf_id}">테스트</a>`)
})


router.get('/perf/modify/:id', (req, res)=> {
    conn.query('select * from performance_info where perf_id = ?', [req.params.id], (perfInfoErr, perfInfoQuery)=>{
        if(perfInfoErr) {
            console.log('sql 실패', perfInfoErr.message)
            res.render('../views/admin/perf_list.html')
        } else {
            console.log('sql 성공', perfInfoQuery)
            perfInfoQuery.start_date = base_date_format(perfInfoQuery.start_date)
            perfInfoQuery.end_date = base_date_format(perfInfoQuery.end_date)
            perfInfoQuery.reg_date = base_date_format(perfInfoQuery.reg_date)
            
        
            conn.query(sPrefCastWpid, [req.params.id], (perfCastErr, perfCastQuery)=>{
                if(perfCastErr) {
                    console.log('sql 실패', perfCastErr.message)
                    res.render('../views/admin/perf_list.html')
                } else {
                    console.log('prefCast : ', perfCastQuery)
                    res.render('../views/admin/perf_modify.html', {perfInfo : perfInfoQuery[0], perfCast : perfCastQuery})
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

    res.render('../views/admin/perf_schedule.html', {perfCast : perfCastQuery, perfScedule : perfSceduleQuery, castInfo : castInfoQuery, castActor: castQuery})
})

router.post('/perf/casting', (req, res)=>{
    
    res.json()
})

router.get('/actor/list', (req, res)=>{
    conn.query('select * from actor_info', (err, resQuery)=>{
        if(err) {
            console.log('sql 실패', err.message)
            res.render('../views/admin/actor_list.html')
        } else {
            console.log('sql 성공', resQuery)
            res.render('../views/admin/actor_list.html', {res : resQuery})
        }
    })
})

router.get('/actor/upload', (req, res)=>{
    res.render('../views/admin/actor_upload.html')
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

router.get('/user', (req, res)=> {
    res.redirect('/admin/user/list')
})
router.get('/user/list', (req, res)=> {
    let userQuery = 'select * from user_info'
    conn.query(userQuery, (req, ret)=> {
        console.log(ret)
        res.render('../views/admin/user_list.html', {userlist : ret})
    })
})
router.get('/user/detail/:id', (req, res)=> {
    let userQuery = 'select * from user_info where user_id = ?'
    conn.query(userQuery, [req.params.id], (req, ret)=> {
        console.log(ret[0])
        res.render('../views/admin/user_detail.html', {userInfo : ret[0]})
    })
})

router.get('/reserv', (req, res)=>{
    res.redirect('/admin/reserv/list')
})
router.get('/reserv/list', (req, res)=>{
    let reservSQL = 'select * from reservation_info'
    reservSQL = `
        select 
        R.resv_id, R.resv_number, R.total_amount, R.grade_discount_rate_at_resv, R.final_amount,
        R.resv_date, R.resv_status,
        user_info.user_id, user_info.email, P.name, P.poster_url,
        PS.schedule_date, PS.schedule_time, PS.round
        from reservation_info as R
        join user_info on user_info.user_id = R.user_id
        join perf_schedule as PS on PS.schedule_id = R.schedule_id
        join performance_info as P on P.perf_id = PS.schedule_id
    `

    conn.query(reservSQL, (err, reservQuery)=>{
        if(err)
            console.log('err : ', err.message)
        else 
            console.log(reservQuery)
        res.render('../views/admin/perf_reservation.html', {reservList : reservQuery})
    })
})
router.get('/reserv/detail', (req, res)=>{
    let userId = req.query.userId
    let resvId = req.query.resvId
    console.log(userId)
    console.log(resvId)
    
    let reservSQL = `
        select 
        R.resv_id, R.resv_number, R.total_amount, R.grade_discount_rate_at_resv, R.final_amount,
        R.resv_date, R.resv_status,
        user_info.*, P.name, P.poster_url,
        PS.schedule_date, PS.schedule_time, PS.round
        from reservation_info as R
        join user_info on user_info.user_id = R.user_id
        join perf_schedule as PS on PS.schedule_id = R.schedule_id
        join performance_info as P on P.perf_id = PS.schedule_id
        where user_info.user_id = ? and R.resv_id = ?
    `

    conn.query(reservSQL, [userId, resvId], (err, reservQuery)=>{
        if(err)
            console.log('err : ', err.message)
        else 
            console.log(reservQuery)
        res.render('../views/admin/reserv_detail.html', {reserv : reservQuery[0]})
    })
})



module.exports = router 