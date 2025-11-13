const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format } = require('../func/date')


router.get('/', (req, res) => {
    console.log('email', req.session.email)
    const email = req.session?.email || req.session?.kakao_email;
    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name || req.session.kakao_name
    const data = {
        year: new Date().getFullYear(),
        pageTitle: '말랑뮤즈 - 메인 페이지'
    };

    let interestSQL = 'select * from user_interest_actor join actor_info on user_interest_actor.actor_id = actor_info.actor_id where user_id = ?'
    let userId = req.session?.user_id
    conn.query(interestSQL, [userId], (userInfoErr, interestQuery)=> {
        console.log(interestQuery)
        res.render("../views/mypage/mypage.html",{mainUrl:'interest', actorList:interestQuery, loginout, name, data })
    })
    //res.render("../views/list.html")
})


module.exports = router