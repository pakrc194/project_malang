const express = require('express')
const router = express.Router()
const conn = require('../db/db')
const {multer} = require('../func/multer')
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
            res.render('../views/admin_perf_list.html', {res : resQuery})
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
        req.body.fstart, req.body.fend, req.body.fgenre, req.body.frunning]

    let castDataArr = req.body.castData
    let actorDataArr = req.body.actorData

    var venue_id = req.body.ftheator
    let seatData = {R:req.body.fclassR, S:req.body.fclassS, A:req.body.fclassA}

    console.log(`perf Info : ${perfData}`)
    console.log(`cast Info : ${castDataArr}`)
    console.log(`actor Info : ${actorDataArr}`)

    let perfSql = `insert into performance_info (name, poster_url, synopsis_url, start_date, end_date, genre, running_time)
                        values(?, ?, ?, ?, ?, ?, ?)`
    let castSql = `insert into cast_info (perf_id, cast_name, cast_story)
                        values(?, ?, ?)`
    let perfCastSql = `insert into perf_cast (perf_id, cast_id, actor_id)
                        values(?, ?, ?)`
    let perfPriceSql = `insert into perf_price (perf_id, venue_id, grade_code, price)
                        values(?, ?, ?, ?)`    

    try {
        const perfRet = await conn.query(perfSql, perfData)
        const perf_id = perfRet.insertId
        console.log('perf query 성공', perf_id)

        const tasks = []
        for (let grade in seatData) {
            const perfPriceData = [perf_id, venue_id, grade, seatData[grade]];
            tasks.push(conn.query(perfPriceSql, perfPriceData));
        }

        
        for (const cast of JSON.parse(castDataArr)) {
            const castData = [perf_id, cast.castName, cast.castBg];
            
            // castSql은 반드시 순차적으로 실행하여 cast_id를 얻어야 함
            const castRet = await conn.query(castSql, castData); 
            const cast_id = castRet.insertId;
            console.log('cast query 성공', cast_id);

            // 2-3. PERF_CAST 등록 (배역 등록 후 바로 기본 캐스팅 연결)
            for (let actor_id of actorDataArr.split(',')) {
                const perfCastData = [perf_id, cast_id, actor_id];
                // Promise를 tasks 배열에 추가
                tasks.push(conn.query(perfCastSql, perfCastData));
            }
        }
        // 3. 모든 병렬 작업 완료 대기
        await Promise.all(tasks);
        
        // 4. 모든 DB 작업이 성공적으로 완료되면 응답 전송
        console.log('모든 DB 작업 성공적으로 완료.');
        res.redirect('/admin/perf/list'); // ⭐ 여기서 안전하게 응답 처리

    } catch(err) {
        console.error('공연 등록 전체 트랜잭션 실패:', err.message);
        // 트랜잭션 사용 시: 롤백 처리
        // 사용자에게 에러 페이지 또는 메시지 전송
        res.status(500).send('공연 등록 중 오류가 발생했습니다.');
    }
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
    let sql = `insert into actor_info (actor_name, profile_image_url, birth_year, gender)
                values(?, ?, ?, ?)`
    let {fname, fbirth, fgender} = req.body
    let data =[fname, req.file.filename, fbirth, fgender]

    conn.query(sql, data, (err, ret)=>{
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