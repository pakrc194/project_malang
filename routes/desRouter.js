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
router.get('/', (req, res)=>{
    conn.query(`select * from seat_price join theater_info on find_in_set(seat_price.grade, theater_info.seat_class) where theater_info.id="1" `, (err, resP)=>{
        res.render("description.html", {musical:resP})
    })
    // conn.query(`select * from actor_info`)

})

let arr={}

router.get('/reserve', (req, res)=>{
    res.render("reserve.html", arr)
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

    conn.query('select * from coupon_info', (err, resQ)=>{
        console.log(res)
        res.render('../views/coupon.html', {ptot: ptot, temp_data, coupon:resQ})
    })

})

router.post('/coupon', (req, res)=>{
    temp_data = req.body
})

router.get('/actor', (req, res)=>{
    console.log('배우 상세정보 페이지로 이동')
    console.log(req.query.actor_id)
    // console.logo(req.body)
    // conn.query('select * from actor_info', (err, res)=>{
    //     console.log(res)
    // })
})



module.exports = router