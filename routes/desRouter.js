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

let user_id = 0
let init_perf_id = 0
let email=''
let venue_id = 0

// 상세페이지
router.get('/:id', (req, res)=>{
    init_perf_id = req.params.id
       
    
    let query = `SELECT 
    p.perf_id AS performance_id,
    p.perf_name AS performance_name,
    p.poster_url,
    p.synopsis_url,
    p.start_date,
    p.end_date,
    p.genre,
    p.running_time,

    v.venue_id,
    v.venue_name,
    v.venue_region,
    v.venue_type,
    v.seat_grade,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'actor_id', a.actor_id,
            'actor_name', a.actor_name,
            'actor_profile_url', a.actor_profile_url,
            'cast_id', c.cast_id,
            'cast_name', c.cast_name,
            'cast_story', c.cast_story
        )
    ) AS cast_list

    FROM performance_info p
    JOIN venue_info v 
        ON p.venue_id = v.venue_id
    JOIN perf_cast pc 
        ON p.perf_id = pc.perf_id
    JOIN actor_info a 
        ON pc.actor_id = a.actor_id
    JOIN cast_info c 
        ON pc.cast_id = c.cast_id

    WHERE p.perf_id = ${init_perf_id}
    GROUP BY 
        p.perf_id, p.perf_name, p.poster_url, p.synopsis_url, 
        p.start_date, p.end_date, p.genre, p.running_time,
        v.venue_id, v.venue_name, v.venue_region, v.venue_type, v.seat_grade;
    `

    // conn.query(query, (err, rrr)=>{
    //     console.log(rrr)
    //     console.log(rrr[0].cast_list)
    // })
    // let qq = `select performance_info.*, venue_info.venue_name as th_name from performance_info join venue_info where performance_info.venue_id = venue_info.venue_id and performance_info.id = ${req.params.id}`
    conn.query(query, (err, resPerf)=>{
        // console.log(resPerf)
        venue_id = resPerf[0].venue_id
        // 공연장에 해당하는 좌석 가격 가져오기
        conn.query(`select * from perf_price where venue_id=${venue_id} AND perf_id=${init_perf_id}`, (err, resP)=>{
            if (!resPerf || resPerf.length === 0) {
                return res.status(404).send("해당 공연을 찾을 수 없습니다.");
            }
            if (resPerf && resPerf.length > 0){
                resPerf[0].start_date = base_date_format(resPerf[0].start_date)
                resPerf[0].end_date = base_date_format(resPerf[0].end_date)
                // console.log('resPerf', resPerf[0])
                // 스케줄(공연 날짜, 회차)
                conn.query(`select * from perf_schedule where venue_id=${venue_id} AND perf_id=${init_perf_id}`, (err, sche)=>{
                    // console.log(sche)
                    
                    res.render("reserv/description.html", {perf: resPerf[0], musical: resP, sche: sche})
                })
            }

        })
    })
})


let schedule_id = 0

router.post('/reserve/:id', isLoggedIn, (req, res)=>{
    // 회원 이메일
    if (req.session.email) {
        email = req.session.email
    }
    else {
        email = req.session.kakao_email
    }
    // 회원 id
    conn.query(`select user_id FROM user_info where email = "${email}"`, (err, req_id)=>{
        user_id = req_id[0].user_id
    })
        
    // conn.query('delete from seat_temp')

    conn.query(`select performance_info.*, venue_info.venue_name from performance_info join venue_info 
                where performance_info.venue_id = venue_info.venue_id and performance_info.perf_id = ${init_perf_id}`, (err, resPf)=>{
        let venue_id = resPf[0].venue_id
        console.log('reserve_venue_id', venue_id)
        // conn.query(`select seat_price.grade, seat_price.price from seat_price join venue_info on find_in_set(seat_price.grade, venue_info.seat_grade) where venue_info.venue_id="${venue_id}" `, (err, resP)=>{
        conn.query(`select grade_code, price FROM perf_price where perf_price.venue_id="${venue_id}" AND perf_price.perf_id=${init_perf_id}`, (err, resP)=>{
            
            let arr={
                date: req.body.items[0],  // 선택 날짜
                time: req.body.items[1],  // 선택 회차
                flag: req.body.items[2], // 표시해야할 날짜
                name: resPf[0].venue_name, // 공연장 이름
            }

            // console.log(resP)
            // and seat_status.seat_status != "Available"
            console.log('arr: ', arr)
            conn.query(`select * from seat_status join perf_schedule where seat_status.schedule_id = perf_schedule.schedule_id 
                
                and perf_schedule.perf_id = ${init_perf_id}
                and perf_schedule.schedule_round = ${req.body.items[1]}
                and perf_schedule.schedule_date = "${base_date_format(req.body.items[0])}"
                
                `, (err, resSold)=>{
                    // console.log('resSold: ', resSold)
                    if (resPf && resPf.length > 0){
                        res.render("reserv/reserve.html", {perf: resPf[0], arr, seat: resP, id:req.params.id, avoid: resSold, user_id: user_id})
                    }
                })
            
        })
    })
    
})


router.post('/discount/:id', (req, res)=>{
    let email = ''
    if (req.session.email) {
        email = req.session.email
    }
    else {
        email = req.session.kakao_email
    }
    console.log('할인 세션 이메일 확인: ', email)
    console.log('items : ',req.body.items[0])

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

    conn.query(`SELECT * FROM seat_status WHERE user_id = ${user_id} AND seat_status = "Reserved"`, (err, resS)=>{
        conn.query(`SELECT * FROM perf_schedule WHERE schedule_id = ${resS[0].schedule_id}`, (err, resSche)=>{
            console.log(resSche)
            let date = new Date(resSche[0].schedule_date)
            let arr1 = {
                choice_time: resSche[0].schedule_round, 
                year: date.getFullYear(), 
                month: date.getMonth() +1,
                day: date.getDate()
            }
            console.log(arr1)
            conn.query(`select * from performance_info where perf_id = ${req.params.id}`, (err, resCP)=>{
                conn.query(discountQuery, (err, resDC)=>{
                    // resDC = 회원 등급 이름, 등급 할인률, 회원id
                    res.render('reserv/discount.html', {ptot: ptot, temp_data, cnt: cnt, seat: arr1, perf: resCP[0], DC: resDC[0], id: req.params.id})
                })
            })
        })
    })
})


router.get('/actor/:id', (req, res)=>{

    conn.query(`select * from actor_info where actor_id = ${req.params.id}`, (err, resActor)=>{
        res.render("../views/actorInfo.html", {id: req.params.id, actor: resActor[0]})
    })

})


router.post('/payment', async (req, res)=>{
    let email = ''
    if (req.session.email) {
        email = req.session.email
    }
    else {
        email = req.session.kakao_email
    }

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
    let pay_date = new Date()
    
    let insertI = [t_id, 'card', req.body.items[5], pay_date, 'SUCCESS', req.body.items[0]]

    conn.query(insertQ, insertI)

    // // 사용자 정보 업데이트
    let userUpQ = `UPDATE user_info SET score = (score + ${req.body.items[5]}) WHERE user_id = ${req.body.items[1].split(' ')[0]}`
    conn.query(userUpQ)
    // // 좌석 상태 업데이트
    let date = `${req.body.items[3].split(' ')[0]}-${req.body.items[3].split(' ')[1]}-${req.body.items[3].split(' ')[2]}`


    for (let i = 6; i < req.body.items.length; i++) {
        conn.query(`UPDATE seat_status SET seat_status = "Sold", temp_resv_time = null
                WHERE schedule_id = (SELECT schedule_id FROM perf_schedule
                    WHERE schedule_date = "${base_date_format(date)}" 
                    AND schedule_round = ${req.body.items[3].split(' ')[3]}
                    AND perf_id = ${req.body.items[2]}
                    )
                    
                AND seat_id = (SELECT seat_id FROM seat_layout 
                    WHERE area = "${req.body.items[i].split(' ')[1]}"
                    AND seat_row = ${req.body.items[i].split(' ')[2]}
                    AND seat_number = ${req.body.items[i].split(' ')[3]}
                    AND venue_id = ${venue_id})`)
                    //1번쨰 서브쿼리 perf_id 필요
                    //2번쨰 서브쿼리 venue_id 필요
    }
    
    let reservQ = `INSERT INTO reservation_info(user_id, schedule_id, resv_number, total_amount, discount_rate, final_amount, resv_date, resv_status, resv_count, seat_id_arr, payment_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    let s_id = await conn.query(`SELECT schedule_id FROM perf_schedule
                    WHERE schedule_date = "${base_date_format(date)}" 
                    AND schedule_round = ${req.body.items[3].split(' ')[3]}
                    AND perf_schedule.perf_id = ${req.body.items[2]}`)

    let u_id = await conn.query(`SELECT user_id FROM user_info where email = "${email}"`)
    let seat_arr = []
    for (let i  = 6; i < req.body.items.length; i++){
        let seat_id = await conn.query(`SELECT seat_id FROM seat_layout 
                    WHERE area = "${req.body.items[i].split(' ')[1]}"
                    AND seat_row = ${req.body.items[i].split(' ')[2]}
                    AND seat_number = ${req.body.items[i].split(' ')[3]}`)

        seat_arr.push(seat_id[0].seat_id)
    }
    let s_arr = seat_arr.join(',')
    console.log(seat_arr)
    let pay_id = await conn.query(`SELECT payment_id FROM payment_info where transaction_id = "${t_id}"`)
    let reservI = [u_id[0].user_id, s_id[0].schedule_id, `${Date.now()}`, req.body.items[4], req.body.items[1].split(' ')[2], req.body.items[5], pay_date, "PAID", req.body.items.length-6, `${s_arr}`, `${pay_id[0].payment_id}`]
    conn.query(reservQ, reservI)
    // s_id, u_id, seat_arr, pay_id
    res.render('../views/reserv/payment.html', {info: req.body.items})
})

router.post('/payment/cancel', async (req, res)=>{
    let resv_id = req.body.resvId
    let CancelUpdate = `UPDATE reservation_info SET resv_status="CANCELLED" WHERE resv_id=${resv_id}`
    let RefUpdate = `UPDATE payment_info
                    JOIN reservation_info ON payment_info.payment_id = reservation_info.payment_id
                    SET payment_info.payment_status="REFUNDED"
                    WHERE payment_info.payment_id = reservation_info.payment_id
                    AND reservation_info.resv_id=${resv_id}`
    let ticket_count = `SELECT resv_count FROM reservation_info where resv_id=${resv_id}`
    // ticket_count만큼 반복문 실행 필요
    let SeatstatusUpdate = `UPDATE seat_status
                        JOIN reservation_info ON FIND_IN_SET(seat_status.seat_id, reservation_info.seat_id_arr)
                        SET seat_status.seat_status="Available", seat_status.user_id=NULL
                        WHERE seat_status.schedule_id = reservation_info.schedule_id
                        AND reservation_info.resv_id = ${resv_id}
                        AND FIND_IN_SET(seat_status.seat_id, reservation_info.seat_id_arr)`
                            
    let UserscoreUpdate = `UPDATE user_info
                            JOIN reservation_info ON user_info.user_id = reservation_info.user_id
                            SET user_info.score = (user_info.score-reservation_info.final_amount)
                            WHERE user_info.user_id = reservation_info.user_id
                            AND reservation_info.resv_id=${resv_id}`
    conn.query(CancelUpdate)
    conn.query(RefUpdate)
    conn.query(SeatstatusUpdate)
    conn.query(UserscoreUpdate)
    
    res.json({msg: 'success'})
})



module.exports = router