const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format } = require('../func/date')


router.get('/info', async (req, res) => {
    console.log('email', req.session.email)
    const email = req.session?.email || req.session?.kakao_email;
    let castId = req.query.cast
    let actorId = req.query.actor
    console.log('cast : ', castId, actorId)

    let castInfoSQL = `select cast_info.*, actor_info.* from cast_info
        join actor_info 
        join perf_cast on perf_cast.cast_id = cast_info.cast_id 
        and perf_cast.actor_id = actor_info.actor_id
        where cast_info.cast_id = ? and actor_info.actor_id = ?`
    let castInfoQuery = await conn.query(castInfoSQL, [castId, actorId])
    let perfId = castInfoQuery[0].perf_id
    console.log('castInfoQuery-------')
    console.log(castInfoQuery)

    let tasks = []
    let perfInfoSQL = `select P.perf_id, P.perf_name, P.poster_url from performance_info as P where P.perf_id = ?`
    tasks.push(conn.query(perfInfoSQL, [perfId]))

    let perfCastSQL = `select actor_info.* from perf_cast 
        join actor_info on actor_info.actor_id = perf_cast.actor_id
        where perf_cast.cast_id = ? and perf_cast.perf_id = ?`
    tasks.push(conn.query(perfCastSQL, [castId, perfId]))
    
    let scheduleCastSQL = `select schedule_cast.*, CI.cast_name, AI.actor_name,
        PS.schedule_date, PS.schedule_time, PS.schedule_round 
        from schedule_cast 
        join perf_schedule as PS on schedule_cast.schedule_id = PS.schedule_id
        JOIN
            CAST_INFO AS CI ON schedule_cast.cast_id = CI.cast_id
        JOIN
            ACTOR_INFO AS AI ON schedule_cast.actor_id = AI.actor_id
        ORDER BY
            schedule_cast.schedule_id, CI.cast_id
        limit 0, 100;`
    tasks.push(conn.query(scheduleCastSQL, [castId]))

    let [perfInfoQuery, castActorQuery, scheduleCastQuery] = await Promise.all(tasks)
    console.log('perfInfoQuery-------\n', perfInfoQuery)
    console.log('castActorQuery-------\n', castActorQuery)
    console.log('scheduleCastQuery-------\n', scheduleCastQuery[0])
    for(let scheduleCast of scheduleCastQuery) {
        scheduleCast.schedule_date = base_date_format(scheduleCast.schedule_date)
    }

    res.render("../views/castInfo.html",{perfInfo : perfInfoQuery[0], castInfo: castInfoQuery[0], castActorList: castActorQuery, scheduleCastList : scheduleCastQuery})

    //res.render("../views/list.html"
})


module.exports = router