const express = require('express')
const path = require('path')
const nunjucks = require('nunjucks')
const session = require('express-session')
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

app.use('/style', express.static(path.join(__dirname, 'style')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use(express.static(path.join(__dirname, 'views')));

nunjucks.configure('views', {
    autoescape: true,
    express: app
})



const perfRouter = require('./routes/perfRouter')
const mainRouter = require('./routes/mainRouter')
const loginRouter = require('./routes/loginRouter')
const joinmemRouter = require('./routes/joinmemRouter')
const idpwsearchRouter = require('./routes/idpwsearchRouter')
const mypageRouter = require('./routes/mypageRouter')
const adminRouter = require('./routes/adminRouter')
const searchRouter = require('./routes/searchRouter')


app.use('/perf', perfRouter)
app.use('/main', mainRouter)
app.use('/login', loginRouter)
app.use('/joinmem', joinmemRouter)
app.use('/idpwsearch', idpwsearchRouter)
app.use('/mypage', mypageRouter)
app.use('/admin', adminRouter)
app.use('/search', searchRouter)

app.get('/', (req, res)=>{
    res.redirect('/main')
})

app.get('/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      console.error('세션 삭제 에러 :', err.message);
      return res.status(500).send('로그아웃 실퍂');
    }

    // 쿠키 제거
    res.clearCookie('connect.sid');

    // 메인으로 이동
    res.redirect('/main');
  });
});


app.listen(80, ()=>{
    console.log('app 80 서버 확인')
})