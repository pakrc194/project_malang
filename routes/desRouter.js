const express = require('express')
const nunjucks = require('nunjucks')
const conn = require('../db/db')
const router = express.Router()
const app = express()

// template
nunjucks.configure('views', {
    autoescape: true,
    express: app
})


// 상세페이지
router.get('/:id', (req, res)=>{
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

router.post('/reserve/:id', (req, res)=>{
    console.log(req.body.items[0])
    console.log(req.params.id)
    conn.query(`select * from performance_info join venue_info where performance_info.venue_id = venue_info.venue_id and performance_info.id = ${req.params.id}`, (err, resPf)=>{
        let venue_id = resPf[0].venue_id
        conn.query(`select seat_price.grade, seat_price.price from seat_price join venue_info on find_in_set(seat_price.grade, venue_info.seat_class) where venue_info.venue_id="${venue_id}" `, (err, resP)=>{
            
            let arr={
                date: req.body.items[0],  // 선택 날짜
                time: req.body.items[1],  // 선택 회차
                flag: req.body.items[2], // 표시해야할 날짜
                name: resPf[0].venue_name // 공연장 이름
            }
            
            if (resPf && resPf.length > 0){
                res.render("reserve.html", {perf: resPf[0], arr, seat: resP, id:req.params.id})
            }
        })
    })
    
})


router.post('/coupon/:id', (req, res)=>{
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

    conn.query('select * from coupon_info', (err, resC)=>{
        if (err) console.log(err.message)
        // 회원 등급 정보, 공연정보 보내야함
        conn.query('select choice_date, choice_time from seat_temp', (err, resS)=>{
            if (err) console.log(err.message)
            let arr1 = {
                choice_time: resS[0].choice_time, 
                year: resS[0].choice_date.getFullYear(), 
                month: resS[0].choice_date.getMonth() +1,
                day: resS[0].choice_date.getDate()
            }
            conn.query(`select * from performance_info where id = ${req.params.id}`, (err, resCP)=>{
                console.log(resCP)
                res.render('coupon.html', {ptot: ptot, temp_data, coupon:resC, cnt: cnt, seat: arr1, perf: resCP[0]})
            })

        })
    })

})


router.get('/actor', (req, res)=>{
    console.log('배우 상세정보 페이지로 이동')
    console.log(req.query.actor_id)
    // console.logo(req.body)
    // conn.query('select * from actor_info', (err, res)=>{
    //     console.log(res)
    // })
})

let payment_info = {}
router.post('/payment', (req, res)=>{
    console.log('쿠폰정보: ', req.body.items)
    payment_info = JSON.parse(req.body.items)
    console.log(JSON.parse(req.body.items)[1])

    conn.query('select seat_temp.*, seat_price.price from seat_temp join seat_price on find_in_set (seat_temp.grade, seat_price.grade)', (err, resQ)=>{

        // console.log(resQ)
        res.render('../views/payment.html', {payment_info, ticket: resQ})
    })
})





module.exports = router