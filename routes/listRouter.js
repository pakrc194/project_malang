const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format } = require('../func/date')

router.get('/', (req, res) => {
    res.redirect('/list/all')
})


let orderStatus = {1:true, 2:true}

router.get('/:genre', (req, res) => {
    let genre = req.params.genre 
    let order = req.query.order || 0
    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name
    console.log('order : ', order)
    let orderQuery = ''
    if(order == 1) {
        if(orderStatus[1])
            orderQuery = 'order by performance_info.start_date asc'
        else
            orderQuery = 'order by performance_info.start_date desc'
        orderStatus[1] = !orderStatus[1]
    } else if(order=2) {
        if(orderStatus[2])
            orderQuery = 'order by venue_info.venue_region asc'
        else
            orderQuery = 'order by venue_info.venue_region desc'
        orderStatus[2] = !orderStatus[2]
    }

    if(genre == 'all') {
        let listSql = `select * from performance_info join venue_info 
        where performance_info.venue_id = venue_info.venue_id and performance_info.is_hidden = 0 ${orderQuery};`
        conn.query(listSql, (err, listQuery)=>{
            console.log(listQuery)
            for(let perf of listQuery) {
                perf.start_date = base_date_format(perf.start_date)
                perf.end_date = base_date_format(perf.end_date)
            }
            res.render('../views/list.html', {perfList: listQuery, genre:genre , loginout, name})
        })
    } else {
        let genreList = {origin:"오리지널", creative:'창작', license:'라이선스', nonVerbal:'넌버벌퍼포먼스'}
        let listSql = `select * from performance_info join venue_info 
        where performance_info.venue_id = venue_info.venue_id
        and performance_info.is_hidden = 0 
        and performance_info.genre = '${genreList[genre]}'
        ${orderQuery};`
        conn.query(listSql, (err, listQuery)=>{
            console.log(listQuery)
            for(let perf of listQuery) {
                perf.start_date = base_date_format(perf.start_date)
                perf.end_date = base_date_format(perf.end_date)
            }
            res.render('../views/list.html', {perfList: listQuery, genre:genre , loginout, name})
        })
    }
})


module.exports = router