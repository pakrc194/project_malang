const express = require('express')
const nunjucks = require('nunjucks')
const app = express()
const path = require('path')

app.use(express.urlencoded({extended:true}))
app.use(express.json())

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.use('/style', express.static(path.join(__dirname, 'style')))
app.use('/img', express.static(path.join(__dirname, 'img')))


const perfRouter = require('./routes/perfRouter')
const mainRouter = require('./routes/mainRouter')
const desRouter = require('./routes/desRouter')

app.use('/perf', perfRouter)
app.use('/main', mainRouter)
app.use('/desc', desRouter)

app.get('/', (req, res)=>{
    res.redirect('/main')
})

app.listen(80, ()=>{
    console.log('app 80 서버 확인')
})