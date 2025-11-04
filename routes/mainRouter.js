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
            res.render('../views/grade.html', {minsu : resQuery})
        }
    })
})

router.get('/venue', (req, res)=>{
    conn.query('select * from venue_info', (err, resQuery)=>{
        if(err) {
            console.log('공연장 실패', err.message)

            res.render('../views/venue.html')
        } else {
            console.log('공연장 성공', resQuery[0])
            console.log('공연장 성공', resQuery[0].venue_id)
            console.log('공연장 성공', resQuery[0].venue_name)
            console.log('공연장 성공', resQuery[0].venue_type)
            console.log('공연장 성공', resQuery[0].region)

            res.render('../views/venue.html', {mino : resQuery[0]})
        }
    })
})

router.get('/venue', (req, res)=>{
    conn.query('select * from venue_info', (err, resQuery)=>{
        if(err) {
            console.log('공연장 실패', err.message)

            res.render('../views/venue.html')
        } else {
            console.log('공연장 성공', resQuery[1])
            console.log('공연장 성공', resQuery[1].venue_id)
            console.log('공연장 성공', resQuery[1].venue_name)
            console.log('공연장 성공', resQuery[1].venue_type)
            console.log('공연장 성공', resQuery[1].region)

            res.render('../views/venue.html', {mino : resQuery[1]})
        }
    })
})


router.get('/venue', (req, res)=>{
    conn.query('select * from venue_info', (err, resQuery)=>{
        if(err) {
            console.log('공연장 실패', err.message)

            res.render('../views/venue.html')
        } else {
            console.log('공연장 성공', resQuery[2])
            console.log('공연장 성공', resQuery[2].venue_id)
            console.log('공연장 성공', resQuery[2].venue_name)
            console.log('공연장 성공', resQuery[2].venue_type)
            console.log('공연장 성공', resQuery[2].region)

            res.render('../views/venue.html', {mino : resQuery[2]})
        }
    })
})


router.get('/venue', (req, res)=>{
    conn.query('select * from venue_info', (err, resQuery)=>{
        if(err) {
            console.log('공연장 실패', err.message)

            res.render('../views/venue.html')
        } else {
            console.log('공연장 성공', resQuery[3])
            console.log('공연장 성공', resQuery[3].venue_id)
            console.log('공연장 성공', resQuery[3].venue_name)
            console.log('공연장 성공', resQuery[3].venue_type)
            console.log('공연장 성공', resQuery[3].region)

            res.render('../views/venue.html', {mino : resQuery[3]})
        }
    })
})


router.get('/venue', (req, res)=>{
    conn.query('select * from venue_info', (err, resQuery)=>{
        if(err) {
            console.log('공연장 실패', err.message)

            res.render('../views/venue.html')
        } else {
            console.log('공연장 성공', resQuery[4])
            console.log('공연장 성공', resQuery[4].venue_id)
            console.log('공연장 성공', resQuery[4].venue_name)
            console.log('공연장 성공', resQuery[4].venue_type)
            console.log('공연장 성공', resQuery[4].region)

            res.render('../views/venue.html', {mino : resQuery[4]})
        }
    })
})


//nodemon --config .nodemon.json


module.exports = router






