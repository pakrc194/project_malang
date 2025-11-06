const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format } = require('../func/date')


router.get('/', (req, res) => {
    console.log('email', req.session.email)
    const email = req.session?.email || req.session?.kakao_email;
    let interestSQL = 'select * from user_interest_actor join actor_info on user_interest_actor.actor_id = actor_info.actor_id where user_id = ?'
    let userId = '7'
    conn.query(interestSQL, [userId], (userInfoErr, interestQuery)=> {
        console.log(interestQuery)
        res.render("../views/mypage/mypage.html",{mainUrl:'interest', actorList:interestQuery})
    })
    //res.render("../views/list.html")
})


module.exports = router