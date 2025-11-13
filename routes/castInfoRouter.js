const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format, base_time_format } = require('../func/date')


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
        where ps.perf_id = ?
        ORDER BY
            schedule_cast.schedule_id, CI.cast_id
        `
    tasks.push(conn.query(scheduleCastSQL, [perfId]))

    let [perfInfoQuery, castActorQuery, scheduleCastQuery] = await Promise.all(tasks)
    console.log('perfInfoQuery-------\n', perfInfoQuery)
    console.log('castActorQuery-------\n', castActorQuery)
    console.log('scheduleCastQuery-------\n', scheduleCastQuery[0])
    
    let scheduleList = []
    let scheduleData = {}

    let scheduleIdx = 0
    const TARGET_ROLE = castInfoQuery[0].cast_name;
    const TARGET_ACTOR = castInfoQuery[0].actor_name;
    for(let scheduleCast of scheduleCastQuery) {
        if (scheduleIdx != scheduleCast.schedule_id) {
            if (scheduleIdx != 0) {
                if (scheduleData.casting[TARGET_ROLE] === TARGET_ACTOR) {
                    scheduleList.push(scheduleData)
                }
            }
            scheduleData = {
                schedule_date: base_date_format(scheduleCast.schedule_date),
                schedule_time: base_time_format(scheduleCast.schedule_time),
                schedule_round: scheduleCast.schedule_round,
                casting: {} // casting 객체를 빈 객체로 초기화
            };
            scheduleIdx = scheduleCast.schedule_id;
        }
        scheduleData.casting[scheduleCast.cast_name] = scheduleCast.actor_name     
    }
    if (Object.keys(scheduleData).length > 0) {
        if (scheduleData.casting[TARGET_ROLE] === TARGET_ACTOR) {
            scheduleList.push(scheduleData);
        }
    }

    console.log(scheduleList[0])
    console.log(scheduleList[1])

    res.render("../views/castInfo.html",{perfInfo : perfInfoQuery[0], castInfo: castInfoQuery[0], castActorList: castActorQuery, scheduleCastList : scheduleList})

    //res.render("../views/list.html"
})


module.exports = router