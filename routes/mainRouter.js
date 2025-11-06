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

    const mainbenner = `
    SELECT * FROM performance_info
    WHERE start_date <= NOW() AND end_date >= NOW()
    LIMIT 10
  `;

    // 2. 오픈 예정 (아직 시작 안한 공연)
    const comingbenner = `
    SELECT * FROM performance_info
    WHERE start_date > NOW()
    ORDER BY start_date ASC
    LIMIT 5
  `;

    // 3. 배우 추천 (관심순 정렬 후 랜덤 추출)
    const actorbenner = `
    SELECT * FROM actor_info
    ORDER BY RAND()
    LIMIT 5
  `;

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

                res.render('../views/main.html', { loginout, main_bennr, coming_benner, actor_benner })
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
            res.render('../views/grade.html', { grade_list: resQuery })
        }
    })
})


module.exports = router