const express = require('express')
const router = express.Router()
const conn = require('../db/db')
const {multer} = require('../func/multer')

router.get('/perf', (req, res)=>{
    res.redirect('/admin/perf/list')
})
router.get('/actor', (req, res)=>{
    res.redirect('/admin/actor/list')
})

//공연 데이터가 없어서 공연장으로 임시 대체
router.get('/perf/list', (req, res)=>{
    conn.query('select * from theater_info', (err, resQuery)=>{
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

router.post('/perf/upload', multer.fields(arr), (req, res)=>{
    for(let idx in req.files) {
        req.body[idx] = req.files[idx][0].filename
    }
    console.log('req : ', req.body)
    res.redirect('/')
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
        let sql = `insert into actor_info (name, profile, birth, gender)
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