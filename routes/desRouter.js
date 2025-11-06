const express = require('express')
const nunjucks = require('nunjucks')
const conn = require('../db/db')
const { base_date_format } = require('../func/date')
const { isLoggedIn } = require('../func/ck_login')
const router = express.Router()
const app = express()

// template
nunjucks.configure('views', {
    autoescape: true,
    express: app
})


// 상세페이지
router.get('/:id', (req, res)=>{
    let email = ''
    if (req.session.email) {
        email = req.session.email
    }
    else {
        email = req.session.kakao_email
    }

        console.log('상세페이지 세션 이메일 확인: ', email)

    let venue_id = 0
    let query = `SELECT 
    p.id AS performance_id,
    p.name AS performance_name,
    p.poster_url,
    p.synopsis_url,
    p.start_date,
    p.end_date,
    p.genre,
    p.running_time,

    v.venue_id,
    v.venue_name,
    v.region,
    v.venue_type,
    v.seat_class,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'actor_id', a.id,
            'actor_name', a.actor_name,
            'profile_image_url', a.profile_image_url,
            'cast_name', c.cast_name,
            'cast_story', c.cast_story
        )
    ) AS cast_list

    FROM performance_info p
    JOIN venue_info v 
        ON p.venue_id = v.venue_id
    JOIN perf_cast pc 
        ON p.id = pc.perf_id
    JOIN actor_info a 
        ON pc.actor_id = a.id
    JOIN cast_info c 
        ON pc.cast_id = c.cast_id

    WHERE p.id = ${req.params.id}
    GROUP BY 
        p.id, p.name, p.poster_url, p.synopsis_url, 
        p.start_date, p.end_date, p.genre, p.running_time,
        v.venue_id, v.venue_name, v.region, v.venue_type, v.seat_class;
    `

    // conn.query(query, (err, rrr)=>{
    //     console.log(rrr)
    //     console.log(rrr[0].cast_list)
    // })
    // let qq = `select performance_info.*, venue_info.venue_name as th_name from performance_info join venue_info where performance_info.venue_id = venue_info.venue_id and performance_info.id = ${req.params.id}`
    conn.query(query, (err, resPerf)=>{
        if (resPerf && resPerf.length > 0){
            venue_id = resPerf[0].venue_id
        }
        // 공연장에 해당하는 좌석 가격 가져오기
        conn.query(`select * from seat_price join venue_info on find_in_set(seat_price.grade, venue_info.seat_class) where venue_info.venue_id="${venue_id}" `, (err, resP)=>{
            if (!resPerf || resPerf.length === 0) {
                return res.status(404).send("해당 공연을 찾을 수 없습니다.");
            }
            if (resPerf && resPerf.length > 0){
                res.render("description.html", {perf: resPerf[0], musical: resP})
            }

        })
    })
})

router.post('/reserve/:id', isLoggedIn, (req, res)=>{
    conn.query('delete from seat_temp')
    // console.log(req.body.items[0])
    // console.log(req.params.id)
    console.log('예매 세션 이메일 확인: ', req.session.kakao_email)
    conn.query(`select * from performance_info join venue_info where performance_info.venue_id = venue_info.venue_id and performance_info.id = ${req.params.id}`, (err, resPf)=>{
        let venue_id = resPf[0].venue_id
        conn.query(`select seat_price.grade, seat_price.price from seat_price join venue_info on find_in_set(seat_price.grade, venue_info.seat_class) where venue_info.venue_id="${venue_id}" `, (err, resP)=>{
            
            let arr={
                date: req.body.items[0],  // 선택 날짜
                time: req.body.items[1],  // 선택 회차
                flag: req.body.items[2], // 표시해야할 날짜
                name: resPf[0].venue_name // 공연장 이름
            }

            // let dd = base_date_format(arr.date)
           
            // conn.query(`select * from seat_status join perf_schedule where seat_status.schedule_id = perf_schedule.schedule_id 
                
            //     and perf_schedule.perf_id = ${req.params.id}
            //     and perf_schedule.round = ${arr.time}
            //     and perf_schedule.schedule_date = "${dd}"
            //     `,
            // (err, queryData)=>{
            //     console.log(queryData.length)
            //     wss.clients.forEach(client => {
            //         for (let i of queryData){
            //             console.log(i)
            //             client.send(JSON.stringify({ type: 'seat_status', i }));
            //         }
            //         // if (client !== ws && client.readyState === WebSocket.OPEN) {
            //         // }
            //     });
            //     console.log(queryData)
                
            // })
            if (resPf && resPf.length > 0){
                res.render("reserve.html", {perf: resPf[0], arr, seat: resP, id:req.params.id})
            }
        })
    })
    
})


router.post('/discount/:id', (req, res)=>{
    console.log('할인 세션 이메일 확인: ', req.session.kakao_email)
    let email = ''
    if (req.session.email) {
        email = req.session.email
    }
    else {
        email = req.session.kakao_email
    }

    let temp_data = [] // grade, area, s_row, s_col, price
    for (let i of JSON.parse(req.body.items[0])){
        // console.log(i.split(' '))
        temp_data.push(
            {
                grade: i.split(' ')[0],
                area: i.split(' ')[1],
                s_row: i.split(' ')[2],
                s_col: i.split(' ')[3],
                price: i.split(' ')[4]
            }
        )
    }
    let ptot = req.body.items[1]
    let cnt = JSON.parse(req.body.items[0]).length

    let discountQuery = `select user_grade.discount_rate, user_grade.grade_name, user_info.user_id FROM user_grade join user_info 
    where user_info.grade_id = user_grade.grade_id and user_info.email = "${email}"`
    conn.query('select choice_date, choice_time from seat_temp', (err, resS)=>{
        if (err) console.log(err.message)
        let arr1 = {
            choice_time: resS[0].choice_time, 
            year: resS[0].choice_date.getFullYear(), 
            month: resS[0].choice_date.getMonth() +1,
            day: resS[0].choice_date.getDate()
        }
        conn.query(`select * from performance_info where id = ${req.params.id}`, (err, resCP)=>{
            conn.query(discountQuery, (err, resDC)=>{
                // resDC = 회원 등급 이름, 등급 할인률, 회원id
                res.render('discount.html', {ptot: ptot, temp_data, cnt: cnt, seat: arr1, perf: resCP[0], DC: resDC[0], id: req.params.id})
            })
        })
    })
})


router.get('/actor/:id', (req, res)=>{
    console.log('배우 상세정보 페이지로 이동')

    conn.query(`select * from actor_info where id = ${req.params.id}`, (err, resActor)=>{
        console.log(resActor[0])
        res.render("../views/actor.html", {id: req.params.id, actor: resActor[0]})
    })

})


router.post('/payment', (req, res)=>{
    let email = ''
    if (req.session.email) {
        email = req.session.email
    }
    else {
        email = req.session.kakao_email
    }
    // let dd = base_date_format(arr.date)
    console.log('정보: ', req.body.items)
    console.log('카드번호: ', req.body.items[0])
    console.log('유저id, 등급, 할인율: ', req.body.items[1].split(' '))
    console.log('작품id: ', req.body.items[2])
    console.log('작품 선택 날짜, 회차: ', req.body.items[3].split(' '))
    console.log('총 금액: ', req.body.items[4])
    console.log('할인 금액: ', req.body.items[5])
    for (let i = 6; i < req.body.items.length; i++) {
        console.log('티켓 정보: ', req.body.items[i].split(' '))
    }

    // 결제 테이블에 저장
    let insertQ = `INSERT INTO payment_info(transaction_id, payment_method, amount, payment_date, payment_status, card_number)
                    VALUES (?, ?, ?, ?, ?, ?)`
    let t_id = `${email.split('@')[0]}_${Date.now()}`
    console.log(t_id)
    let insertI = [t_id, 'card', req.body.items[5], new Date(), 'SUCCESS', req.body.items[0]]

    conn.query(insertQ, insertI, (err, resIn)=>{
        if (err){
            console.log(err.message)
        }
        else {
            console.log(resIn)
        }
    })

    // 사용자 정보 업데이트
    let userUpQ = `UPDATE user_info SET score = score + ${req.body.items[5]} WHERE user_id = ${req.body.items[1].split(' ')[0]}`
    conn.query(userUpQ)
    // 좌석 상태 업데이트
    let date = `${req.body.items[3].split(' ')[0]}-${req.body.items[3].split(' ')[1]}-${req.body.items[3].split(' ')[2]}`

    // let seatUpQ = `UPDATE seat_status SET seat_status = "Sold" 
    //             WHERE seat_status.schedule_id = (SELECT schedule_id FROM perf_schedule
    //                 WHERE schedule_date = "${base_date_format(date)}" 
    //                 AND round = ${req.body.items[3].split(' ')[3]})
                    
    //             AND seat_id = (SELECT seat_id FROM seat_layout 
    //                 WHERE area = ${req.body.items[i].split(' ')[1]}
    //                 AND seat_row = ${req.body.items[i].split(' ')[2]}
    //                 AND seat_number = ${req.body.items[i].split(' ')[3]})`

    for (let i = 6; i < req.body.items.length; i++) {
        conn.query(`UPDATE seat_status SET seat_status = "Sold" 
                WHERE schedule_id = (SELECT schedule_id FROM perf_schedule
                    WHERE schedule_date = "${base_date_format(date)}" 
                    AND round = ${req.body.items[3].split(' ')[3]})
                    
                AND seat_id = (SELECT seat_id FROM seat_layout 
                    WHERE area = "${req.body.items[i].split(' ')[1]}"
                    AND seat_row = ${req.body.items[i].split(' ')[2]}
                    AND seat_number = ${req.body.items[i].split(' ')[3]})`)
    }
    

    res.render('../views/payment.html', {info: req.body.items})
})





module.exports = router