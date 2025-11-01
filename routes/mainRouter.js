const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')

// router.get('/', (req, res)=>{
//     res.render('../views/main.html')
// })

router.get('/', (req, res)=>{
     res.sendFile(path.join(__dirname, '../views/main.html'))
 })

module.exports = router