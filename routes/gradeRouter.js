const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format } = require('../func/date')


router.get('/', (req, res) => {
    console.log('email', req.session.email)
    const email = req.session?.email || req.session?.kakao_email;
    const loginout = req.session.email || req.session.kakao_email && req.session.user_name
    const name = req.session.user_name
    let selectSQL = 'select * from user_info join user_grade on user_info.grade_id = user_grade.grade_id where email = ?'
    let nextGradeSQL = 'select * from user_grade where grade_id = ?'
    conn.query(selectSQL, [email], (userInfoErr, userInfoQuery)=> {
        console.log(userInfoQuery)
        let myGrade = eval(userInfoQuery[0].grade_id)+1
        conn.query(nextGradeSQL, [myGrade], (nextGradeErr, nextGradeQuery)=> {
            console.log(nextGradeQuery)
            res.render("../views/mypage/mypage.html",{mainUrl:'myGrade', myGrade:userInfoQuery[0], nextGrade:nextGradeQuery[0], loginout, name})
        })
    })
    //res.render("../views/list.html")
})


module.exports = router