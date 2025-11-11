const express = require('express')
const nunjucks = require('nunjucks')
const path = require('path')
const app = express()


nunjucks.configure('views',{
    autoescape:true,
    express: app
})

app.use(express.static(path.join(__dirname, '../views')))

let titleArr = {
    hello:'인사말',history:'연혁',location:'오시는길'
}

let data = {}


//aside 구성
app.use((req,res,next)=>{
    data.aside = ''
    for (const kk in titleArr) {
        data.aside += `<a href='/info/${kk}'>${titleArr[kk]}</a><br/>`    
    }
    next()
})



app.get('/',(req,res)=>{
    
    res.redirect('/info/hello')     //  리다이렉트 '/info/hello' 로 URL 이동
})


app.get('/info/hello',(req,res)=>{
    data.main = '인사말 입니다'
    
    res.render("/views/mypage.html",data)
})


app.get('/info/history',(req,res)=>{
    
    data.main = '연혁 입니다'
    
    res.render("/views/mypage.html",data)
})

app.get('/info/location',(req,res)=>{
   
    data.main = '오시는길 입니다'
    
    res.render("/views/mypage.html",data)
})

app.listen(80,()=>{
    console.log("useTemp 서버 시작")
})