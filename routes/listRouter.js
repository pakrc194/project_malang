const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format } = require('../func/date')


router.get('/', (req, res) => {
    let listSql = 'select * from performance_info join venue_info where performance_info.perf_id = venue_info.venue_id'
    conn.query(listSql, (err, listQuery)=>{
        console.log(listQuery)
        for(let perf of listQuery) {
            perf.start_date = base_date_format(perf.start_date)
            perf.end_date = base_date_format(perf.end_date)
        }
        res.render('../views/list.html', {perfList: listQuery})
    })
    
})


module.exports = router