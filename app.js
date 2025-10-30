const express = require('express')
const nunjucks = require('nunjucks')
const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json())

nunjucks.configure('views', {
    autoescape: true,
    express: app
})


const perfRouter = require('./routes/perfRouter')
const mainRouter = require('./routes/mainRouter')

app.use('/perf', perfRouter)
app.use('/main', mainRouter)

app.get('/', (req, res)=>{
    res.redirect('/main')
})

app.listen(80, ()=>{
    console.log('app 80 서버 확인')
})