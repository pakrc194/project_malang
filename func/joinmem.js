
const express = require('express');
const session = require('express-session');
const conn = require('../db/db')
const path = require('path');
const app = express();

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '.')));

// POST 처리
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// 세션 처리
app.use(session({
    secret: 'qwer1234!@#$',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 30
    },
    rolling: true
}));

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/joinmem.html'))
})

// 이메일 중복 확인
app.post('/emailoverlap', (req, res) => {
    console.log('이메일 중복확인 :', req.body)
    console.log(req.body.email1 + req.body.email2)
    res.json(req.body.email1 + req.body.email2)
})

// 가입 완료
app.post('/submit', (req, res) => {

    const { email, name, pw1, pw2, question, answer } = req.body;

    if (pw1 !== pw2 && name == '' && email == '' && answer == '') {
        res.sendFile(path.join(__dirname, '../views/joinmem.html'))
    }

    const sql = 'insert into user_info (email, name, pw, question, answer, score, sign_method) values (?, ?, ?, ?, ?, 0, "local")'
    conn.query(sql, [email, name, pw1, question, answer], (err, resQuery) => {
        if (err) {
            console.log('회원가입 sql 실패', err.message)
            res.sendFile(path.join(__dirname, '../views/joinmem.html'))
        } else {
            console.log('회원가입 sql 성공', resQuery)
            res.sendFile(path.join(__dirname, '../views/login.html'))
        }})

});

// 서버 시작
app.listen(80, () => {
    console.log('서버 실행')
});
