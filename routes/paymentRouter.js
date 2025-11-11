const express = require('express')
const router = express.Router()
const conn = require('../db/db')

//결제 메인
router.get('/', (req, res)=>{
    res.render('../views/payment.html')
})

// 결제 실패시
router.post('/fail', (req, res)=>{
    console.log('post fail', req.body)
    console.log('post fail', req.body.code)
    console.log('post fail', req.body.message)

    res.render('../views/pay_fail.html')
})

//결제 성공시
router.post('/success', (req, res)=>{
    console.log('post success', req.body)
    console.log('post success', req)

    res.render('../views/pay_success.html')
})

// 결제 성공 후 가는 페이지
router.get('/ticket', (req, res)=>{
    console.log('get ticket')
    res.render('../views/azik.html')
})



module.exports = router