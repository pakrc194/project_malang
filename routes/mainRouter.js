const express = require('express')
const router = express.Router()
const conn = require('../db/db')



router.get('/', (req, res)=>{
    res.render('../views/main.html')
})

router.get('/search', (req, res)=>{
    res.render('../views/search.html')
})


module.exports = router