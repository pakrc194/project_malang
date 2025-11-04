const express = require('express')
const router = express.Router()
const conn = require('../db/db')

//nodemon --config .nodemon.json

router.get('/', (req, res)=>{
    conn.query('select * from performance_info', (err, resQuery)=>{
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


router.get('/grade', (req, res)=>{
    conn.query('select * from user_grade', (err, resQuery)=>{
        if(err) {
            console.log('등급 조회 실패', err.message)

            res.render('../views/grade.html')
        } else {
            console.log('등급 조회 성공', resQuery)
            console.log('등급 조회 성공', resQuery[0])
            console.log('등급 조회 성공', resQuery[0].grade_score)
            res.render('../views/grade.html', {grade_list : resQuery})
        }
    })
})


//nodemon --config .nodemon.json



module.exports = router






