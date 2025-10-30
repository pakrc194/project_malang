const express = require('express')
const router = express.Router()
const conn = require('../db/db')

router.get('/', (req, res)=>{
    res.render('../views/main.html')
})

module.exports = router