const express = require('express')
const nunjucks = require('nunjucks')
const session = require('express-session')
const path = require('path')
const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use(session({
    secret : 'qwer1234!@#$',
    resave : false,
    saveUninitialized : true,
    cookie : { secure : false },
})
)

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.use(express.static(path.join(__dirname, 'views')));


const perfRouter = require('./routes/perfRouter')
const mainRouter = require('./routes/mainRouter')
const loginRouter = require('./routes/loginRouter')


app.use('/perf', perfRouter)
app.use('/main', mainRouter)
app.use('/login', loginRouter)


app.get('/', (req, res)=>{
    res.redirect('/main')
})

app.listen(80, ()=>{
    console.log('app 80 서버 확인')
})