const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format } = require('../func/date.js')

// router.get('/', (req, res)=>{
//     res.render('../views/main.html')
// })




router.get('/', (req, res) => {
    console.log('세션 이메일 확인: ', req.session.kakao_email)


    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name || req.session.kakao_name
    const data = {
        year: new Date().getFullYear(),
        pageTitle: '말랑뮤즈 - 메인 페이지'
    };

    // 1. 메인배너(현재 상영)
    const mainbenner = `
    SELECT * FROM performance_info
    WHERE start_date <= NOW() AND end_date >= NOW() and is_hidden = 0
    LIMIT 10
  `;

    // 2. 오픈 예정
    const comingbenner = `
    SELECT * FROM performance_info
    WHERE start_date > NOW() and is_hidden = 0
    ORDER BY start_date ASC
    LIMIT 5
  `;

    // 3. 배우 추천
    const actorbenner = `
    SELECT
    T1.actor_id,
    AI.actor_name,
    AI.actor_profile_url,      
    T1.interest_count
FROM
    (
        SELECT
            actor_id,
            COUNT(*) AS interest_count
        FROM
            user_interest_actor
        GROUP BY
            actor_id
        ORDER BY
            interest_count DESC
        LIMIT 5
    ) AS T1
INNER JOIN
    ACTOR_INFO AS AI ON T1.actor_id = AI.actor_id 
ORDER BY
    RAND();
  `;

  const user_name = `
  select
  user_name from user_info where user_name = ? `;

    conn.query(mainbenner, (err1, main_bennr) => {
        if (err1) {
            console.log('현재 상영작 조회 실패:', err1.message)
        } else {
            for (const row of main_bennr) {
                row.start_date = base_date_format(row.start_date);
                row.end_date = base_date_format(row.end_date);
            }
        }

        conn.query(comingbenner, (err2, coming_benner) => {
            if (err2) {
                console.log('오픈 예정작 조회 실패:', err2.message)
            } else {
                for (const row of coming_benner) {
                    row.start_date = base_date_format(row.start_date);
                    row.end_date = base_date_format(row.end_date);
                }
            }

            conn.query(actorbenner, (err3, actor_benner) => {
                if (err3) {
                    console.log('배우 조회 실패:', err3.message)
                } 
                console.log('배우 조회 성공')

                    res.render('../views/main.html', { loginout, main_bennr, coming_benner, actor_benner, name, data })
            })
        })
    })
})

router.get('/grade', (req, res) => {
    conn.query('select * from user_grade', (err, resQuery) => {
        if (err) {
            console.log('등급 조회 실패', err.message)

            res.render('../views/grade.html')
        } else {
            console.log('등급 조회 성공', resQuery)
            console.log('등급 조회 성공', resQuery[0])
            console.log('등급 조회 성공', resQuery[0].grade_score)

            for (resq of resQuery){
                resq.grade_score = Number(resq.grade_score).toLocaleString()
            }
             
            res.render('../views/grade.html', { grade_list: resQuery })
        }
    })
})


module.exports = router