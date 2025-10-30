const express = require('express')
const router = express.Router()
const conn = require('../db/db')
const {multer} = require('../func/multer')

router.get('/', (req, res)=>{
    res.redirect('/perf/list')
})

//공연 데이터가 없어서 공연장으로 임시 대체
router.get('/list', (req, res)=>{
    conn.query('select * from theater_info', (err, resQuery)=>{
        if(err) {
            console.log('sql 실패', err.message)
            res.render('../views/list.html')
        } else {
            console.log('sql 성공', resQuery)
            res.render('../views/list.html', {res : resQuery})
        }
    })
})

router.get('/upload', (req, res)=>{
    res.render('../views/upload.html')
})

router.post('/upload', multer.single('fname'), (req, res)=>{
    console.log('req : ', req.body)
    res.redirect('/')
})



module.exports = router 