const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format } = require('../func/date')

router.get('/', (req, res) => {
    res.redirect('/list/all')
})

router.get('/:genre', (req, res) => {
    let genre = req.params.genre 
    if(genre == 'all') {
        let listSql = 'select * from performance_info join venue_info where performance_info.perf_id = venue_info.venue_id'
        conn.query(listSql, (err, listQuery)=>{
            console.log(listQuery)
            for(let perf of listQuery) {
                perf.start_date = base_date_format(perf.start_date)
                perf.end_date = base_date_format(perf.end_date)
            }
            res.render('../views/list.html', {perfList: listQuery, genre:genre})
        })
    } else {
        let genreList = {origin:"오리지널", creative:'창작', license:'라이선스', nonVerbal:'넌버벌퍼포먼스'}
        let listSql = `select * from performance_info join venue_info 
        where performance_info.perf_id = venue_info.venue_id
        and performance_info.genre = '${genreList[genre]}'`
        conn.query(listSql, (err, listQuery)=>{
            console.log(listQuery)
            for(let perf of listQuery) {
                perf.start_date = base_date_format(perf.start_date)
                perf.end_date = base_date_format(perf.end_date)
            }
            res.render('../views/list.html', {perfList: listQuery, genre:genre})
        })
    }
})


module.exports = router