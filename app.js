const express = require('express')
const path = require('path')
const nunjucks = require('nunjucks')
const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use('/style', express.static(path.join(__dirname, 'style')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/js', express.static(path.join(__dirname, 'js')))

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

const perfRouter = require('./routes/perfRouter')
const mainRouter = require('./routes/mainRouter')
const adminRouter = require('./routes/adminRouter')


app.use('/perf', perfRouter)
app.use('/main', mainRouter)
app.use('/admin', adminRouter)

app.get('/', (req, res)=>{
    res.redirect('/main')
})

app.listen(80, ()=>{
    console.log('app 80 서버 확인')
})
