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

let venue_id = 0

// 상세페이지
router.get('/:id', (req, res)=>{
    conn.query(`select performance_info.*, theater_info.name as th_name from performance_info join theater_info where performance_info.venue_id = theater_info.id and performance_info.id = ${req.params.id}`, (err, resPerf)=>{
        // res.render("description.html", {perf: resPerf})
        if (resPerf && resPerf.length > 0){
            venue_id = resPerf[0].venue_id
        }
        conn.query(`select * from seat_price join theater_info on find_in_set(seat_price.grade, theater_info.seat_class) where theater_info.id="${venue_id}" `, (err, resP)=>{
            // console.log(resP)
            // console.log(resPerf)
            if (resPerf && resPerf.length > 0){
                res.render("description.html", {perf: resPerf[0], musical: resP})
            }

        })
    })
})
let arr={}

router.get('/reserve/:id', (req, res)=>{
    // res.render("reserve.html", {arr})
    
    conn.query(`select performance_info.*, theater_info.name as th_name from performance_info join theater_info where performance_info.venue_id = theater_info.id and performance_info.id = ${req.params.id}`, (err, resPf)=>{
        conn.query(`select seat_price.grade, seat_price.price from seat_price join theater_info on find_in_set(seat_price.grade, theater_info.seat_class) where theater_info.id="${venue_id}" `, (err, resP)=>{
            // console.log(resP)
            // console.log(resP)

            res.render("reserve.html", {perf: resPf[0], arr, seat: resP})
        })
    })
    
})


router.post('/temp/:id', (req, res)=>{
    const {dd, tt, flag} = req.body
    conn.query(`select theater_info.* from performance_info join theater_info where performance_info.venue_id = theater_info.id and performance_info.id = ${req.params.id}`, (err, resQuery)=>{
        if(err) {
            console.log('sql 실패', err.message)
            res.render('../views/list.html')
        }
        else {
            arr = {
                date: dd,  // 선택 날짜
                time: tt,  // 선택 회차
                flag: flag, // 표시해야할 날짜
                name: resQuery[0].name // 공연장 이름
            }
        }
    })
    
    res.json({message: 'receive'})
})

let temp_data = [] // grade, area, s_row, s_col, price
router.post('/coupon', (req, res)=>{
    // temp_data = JSON.parse(req.body.items[0])
    // console.log(JSON.parse(req.body.items[0])[0].split(' '))
    // console.log((req.body.items[0]).split(' '))
    // console.log(JSON.parse(req.body.items[0]).length)
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

            res.render('coupon.html', {ptot: ptot, temp_data, coupon:resC, cnt: cnt, seat: arr1})
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
    // console.log('쿠폰정보: ', req.body.items)
    payment_info = JSON.parse(req.body.items)
    console.log(JSON.parse(req.body.items)[1])

    conn.query('select seat_temp.*, seat_price.price from seat_temp join seat_price on find_in_set (seat_temp.grade, seat_price.grade)', (err, resQ)=>{

        // console.log(resQ)
        res.render('../views/payment.html', {payment_info, ticket: resQ})
    })
})





module.exports = router