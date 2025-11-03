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
    res.render("description.html")
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
                date: dd,
                time: tt,
                flag: flag,
                res: resQuery
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

    res.render('../views/coupon.html', {ptot: ptot, temp_data})
})

router.post('/coupon', (req, res)=>{
    console.log('쿠폰에 넘길 데이터: ', req.body)
    temp_data = req.body
})

router.get('/main_poster', (req, res)=>{
    res.render("main_poster.html")
})


module.exports = router