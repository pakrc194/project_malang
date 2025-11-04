
const express = require('express');
const router = express.Router();
const path = require('path');
const conn = require('../db/db');

const kakaoRouter = require('../func/kakaoLogin');
router.use('/kakao', kakaoRouter);

// 정적 처리
router.use(express.static(path.join(__dirname, '..', 'views')));

// POST 처리
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// 로그인 화면
router.get('/', (req, res) => {
    if (req.session.email || req.session.kakao_access_token) {
        // 이미 로그인되어 있으면 메인화면
        res.redirect('/main');
    } else {
        // 로그인 안된 경우 로그인 화면
        res.sendFile(path.join(__dirname, '../views/mypage/login.html'));
    }
});


// 로그인 처리
router.post('/login', (req, res) => {
    const { email, pw } = req.body;

    if (!email || !pw) {
        return res.json({ success: false, message: '이메일, 비밀번호 입력하세요' })
    }
    // DB 조회(이메일, 비밀번호, 회원주소, 활성화 상태)
    const sql = 'SELECT email, password, sign_method, account_status FROM USER_INFO WHERE email = ?';
    conn.query(sql, [email], (err, results) => {
        if (err) {
            console.error('DB 에러 발생:', err);
            return res.json({ success: false, message: '서버 에러 발생' });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: '존재하지 않는 이메일입니다.' });
        }

        const user = results[0];

        // 탈퇴회원 차단
        if (user.account_status && user.account_status.toUpperCase() === 'WITHDRAWAL') {
            console.log(`탈퇴회원 차단: ${email}`);
            return res.json({ success: false, message: '탈퇴한 회원은 로그인할 수 없습니다.' });
        }

        // 비밀번호 인증
        if (user.password !== pw) {
            return res.json({ success: false, message: '비밀번호가 올바르지 않습니다.' });
        }

        // 로그인 성공
        req.session.email = user.email;
        req.session.signMethod = user.sign_method;

        console.log('로그인 성공:', user.email);

        // 관리자인 경우 managermain.html 으로 이동
        if (user.sign_method === 'admin') {
            return res.json({ success: true, message: '로그인 성공(매니저)', redirect: '/admin' });
        } else {
            return res.json({ success: true, message: '로그인 성공(일반회원)', redirect: '/main' });
        }
    });
});


// 회원가입
router.get('/joinmem', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/mypage/joinmem.html'));
});

// 아이디비번찾기
router.get('/idpwsearch', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/mypage/idpwsearch.html'));
});

// 예외 처리
router.use((err, req, res, next) => {
    console.log('예외처리');
    res.status(500).send(`500 : 에러 처리 => ${err.message} <br/>`);
});

module.exports = router;



