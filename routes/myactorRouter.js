const express = require('express')
const router = express.Router()
const conn = require('../db/db')
const {multer} = require('../func/multer')

router.get("/", (req, res)=>{
    let favorActorSql = `select 
        user_interest_actor.*,
        user_info.user_name,
        user_grade.grade_id,
        user_grade.grade_name,
        user_grade.grade_image_url,
        actor_info.*
        from user_interest_actor 
        join user_info on user_interest_actor.user_id = user_info.user_id 
        join user_grade on user_info.grade_id = user_grade.grade_id
        join actor_info on user_interest_actor.actor_id = actor_info.actor_id
        where user_interest_actor.user_id = 2`
     
        conn.query(favorActorSql, (err, resQuery)=>{
        if(err) {
            console.log('sql 실패', err.message)
            res.render('../views/favorActor.html')
        } else {
            console.log('sql 성공', resQuery)
            res.render('../views/favorActor.html', {res : resQuery})
        }
    })
})


module.exports = router 