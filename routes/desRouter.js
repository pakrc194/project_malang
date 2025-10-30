const express = require('express')
const nunjucks = require('nunjucks')
const router = express.Router()
const app = express()

// template
nunjucks.configure('views', {
    autoescape: true,
    express: app
})

// 상세페이지
router.get('/', (req, res)=>{
    // res.send("이동")
    res.render("description.html")
})

router.get('/desc/reserve', (req, res)=>{
    res.render("reserve.html", arr)
})

router.post('/temp', (req, res)=>{
    const {dd, tt, flag} = req.body
    console.log(dd, tt)
    arr = {
        date: dd,
        time: tt,
        flag: flag
    }
    console.log(arr)
    
    res.json({message: 'receive'})
})

router.get('/main_poster', (req, res)=>{
    res.render("main_poster.html")
})


module.exports = router