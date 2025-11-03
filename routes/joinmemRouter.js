
const express = require('express');
const router = express.Router()
const conn = require('../db/db')
const path = require('path');

// 정적 파일
router.use(express.static(path.join(__dirname, '../views')));

// POST 처리
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// 화면 띄우기
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/joinmem.html'))
})

// 이메일 중복 확인(joinmemRouter.js)
router.post('/emailoverlap', (req, res) => {
    console.log('이메일 중복확인 :', req.body)
    console.log(req.body.email1 + req.body.email2)
    res.json(req.body.email1 + req.body.email2)
})

// 회원가입 버튼 누르면 email
router.post('/submit', (req, res) => {
    const { email, name, pw1, pw2, question, answer } = req.body;

    if (!email || !name || !pw1 || !pw2 || !answer) {
        return res.json({ success: false, message: '모든 항목을 입력하세요.' });
    }

    if (pw1 !== pw2) {
        return res.json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    const sql = 'INSERT INTO USER_INFO (email, name, password, question, answer, score, sign_method) VALUES (?, ?, ?, ?, ?, 0, "local")';
    conn.query(sql, [email, name, pw1, question, answer], (err, result) => {
        if (err) {
            console.error('회원가입 실패:', err.message);
            return res.json({ success: false, message: '회원가입 실패' });
        }

        console.log('회원가입 성공:', result);
        res.json({ success: true, message: '회원가입 성공', redirect: '/login' });
    });
});

module.exports = router;

