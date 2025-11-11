const express = require('express')
const path = require('path')
const nunjucks = require('nunjucks')
const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json())

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.use('/style', express.static(path.join(__dirname, 'style')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/views', express.static(path.join(__dirname, 'views')))

const perfRouter = require('./routes/perfRouter')
const mainRouter = require('./routes/mainRouter')
const paymentRouter = require('./routes/paymentRouter')


app.use('/perf', perfRouter)
app.use('/main', mainRouter)
app.use('/payment', paymentRouter)

app.get('/', (req, res)=>{
    res.redirect('/main')
})

app.listen(80, ()=>{
    console.log('app 80 서버 확인')
})