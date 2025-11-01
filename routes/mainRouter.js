const express = require('express')
const router = express.Router()
const conn = require('../db/db')



router.get('/', (req, res)=>{
    // conn.query('select * from 테이블 limit 시작번호, 몇개', (err, resQuery)=>{
    //     if(err) {
    //         console.log('테이블 조회 실패', err.message)
    //         res.render('../views/list.html')
    //     } else {
    //         console.log('테이블 조회 성공', resQuery)
    //         res.render('../views/list.html', {res : resQuery})
    //     }
    // })

    conn.query('select * from performance_info limit 0, 5', (err, resQuery)=>{
        if(err) {
            console.log('테이블 조회 실패', err.message)
            res.render('../views/main.html')
        } else {
            console.log('테이블 조회 성공', resQuery)
            res.render('../views/main.html', {res : resQuery})
        }
    })


    // res.render('../views/main.html')
})

router.get('/search', (req, res)=>{
    res.render('../views/search.html')
})



module.exports = router