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

    let resvCurMonthSQL = `SELECT
        DATE_FORMAT(resv_date, '%Y-%m') AS resv_month,
        SUM(final_amount) AS total_monthly_amount
    FROM
        reservation_info
    WHERE
        final_amount IS NOT NULL AND final_amount > 0 
        AND resv_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        AND resv_status='PAID'
        AND user_id = ?
    GROUP BY
        resv_month
    ORDER BY
        resv_month;`

        
    let selectSQL = 'select * from user_info join user_grade on user_info.grade_id = user_grade.grade_id where email = ?'
    let nextGradeSQL = 'select * from user_grade where grade_id = ?'

    let tasks = []
    conn.query(selectSQL, [email], async (userInfoErr, userInfoQuery)=> {
        console.log(userInfoQuery)
        let myGrade = eval(userInfoQuery[0].grade_id)+1
        tasks.push(conn.query(nextGradeSQL, [myGrade]))
        tasks.push(conn.query(resvCurMonthSQL, [6, userInfoQuery[0].user_id]))
        tasks.push(conn.query(resvCurMonthSQL, [5, userInfoQuery[0].user_id]))

        let [nextGradeQuery, curMonthTotalQuery, nextMonthTotalQuery] = await Promise.all(tasks)
        console.log(curMonthTotalQuery)
        let curMonthTotal = 0
        for(let monthTotal of curMonthTotalQuery) {
            curMonthTotal+=eval(monthTotal.total_monthly_amount)
        }
        console.log(curMonthTotal)

        console.log(nextMonthTotalQuery)
        let nextMonthTotal = 0
        for(let monthTotal of nextMonthTotalQuery) {
            nextMonthTotal+=eval(monthTotal.total_monthly_amount)
        }
        console.log(nextMonthTotal)

        let needNextGrade = 0
        if(nextGradeQuery.length>0)
            needNextGrade = nextGradeQuery[0].grade_score-curMonthTotal
        let total = {
            curMonthTotal : Number(curMonthTotal).toLocaleString(),
            nextMonthTotal : Number(nextMonthTotal).toLocaleString(),
            needNextGrade : Number(needNextGrade).toLocaleString()
        }
        console.log(total)
        res.render("../views/mypage/mypage.html",{mainUrl:'myGrade', myGrade:userInfoQuery[0], nextGrade:nextGradeQuery[0], total, loginout, name})
    })
    //res.render("../views/list.html")
})


module.exports = router