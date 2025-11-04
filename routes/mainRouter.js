const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')

// router.get('/', (req, res)=>{
//     res.render('../views/main.html')
// })


router.get('/', (req, res) => {

    const loginout = req.session.email || req.session.kakao_email

    res.render('../views/main.html', { loginout: loginout })

})


module.exports = router