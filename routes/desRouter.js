const express = require('express')
const nunjucks = require('nunjucks')
const conn = require('../db/db')
const router = express.Router()
const app = express()

const socket = new WebSocket('ws://localhost:80')



// template
nunjucks.configure('views', {
    autoescape: true,
    express: app
})


// 상세페이지
router.get('/', (req, res)=>{
    conn.query(`select * from seat_price join theater_info on find_in_set(seat_price.grade, theater_info.seat_class) where theater_info.id="1" `, (err, resP)=>{
        res.render("description.html", {musical:resP})
    })
    // conn.query(`select * from actor_info`)
    const venueId = 1
    const areas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
    const rowPerArea = 10
    const seatsPerRow = 12

    for (const area of areas){
        for (let row = 1; row <= rowPerArea; row++){
            for (let number = 1; number <= seatsPerRow; number++) {
                let grade
                if (area == 'A' || area == 'B' || area == 'C'){
                    grade = "R"
                }
                else if (area == 'D' || area == 'E' || area == 'F'){
                    grade = "S"
                }
                else {
                    grade = "A"
                }

                conn.query(`INSERT INTO SEAT_LATOUT (venue_id, area, seat_row, seat_number, grade_code)
                    VALUES (?, ?, ?, ?, ?)`, [venueId, area, row, number, grade])
            }
        }
    }

})

let arr={}

router.get('/reserve', (req, res)=>{
    res.render("reserve.html", {arr, area:"C", row: 5, col: 11})
})


router.post('/temp', (req, res)=>{
    const {dd, tt, flag} = req.body
    
    conn.query('select * from theater_info where id = "1"', (err, resQuery)=>{
        if(err) {
            console.log('sql 실패', err.message)
            res.render('../views/list.html')
        }
        else {
            arr = {
                date: dd,  // 선택 날짜
                time: tt,  // 선택 회차
                flag: flag, // 표시해야할 날짜
                res: resQuery // 공연장 이름
            }
        }
        // console.log(arr)
    })
    
    res.json({message: 'receive'})
})

let temp_data = {}
router.get('/coupon', (req, res)=>{
    let ptot = 0
    for (let i in temp_data){
        ptot += temp_data[i].price
    }
    let cnt = temp_data.length

    conn.query('select * from coupon_info', (err, resC)=>{
        // 회원 등급 정보, 공연정보 보내야함
        conn.query('select choice_date, choice_time from seat_temp', (err, resS)=>{
            let arr = {
                choice_time: resS[0].choice_time, 
                year: resS[0].choice_date.getFullYear(), 
                month: resS[0].choice_date.getMonth() +1,
                day: resS[0].choice_date.getDate()
            }

            res.render('../views/coupon.html', {ptot: ptot, temp_data, coupon:resC, cnt: cnt, seat: arr})
        })
    })

})

router.post('/coupon', (req, res)=>{
    temp_data = req.body
    res.json({message: 'receive'})
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
router.get('/payment', (req, res)=>{

    conn.query('select seat_temp.*, seat_price.price from seat_temp join seat_price on find_in_set (seat_temp.grade, seat_price.grade)', (err, resQ)=>{

        console.log(resQ)
        res.render('../views/payment.html', {payment_info, ticket: resQ})
    })
})

router.post('/payment', (req, res)=>{
    console.log('쿠폰정보: ', req.body)
    payment_info = req.body
})



module.exports = router