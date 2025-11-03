
const express = require('express');
const router = express.Router();
const path = require('path');
const conn = require('../db/db');  // ✅ DB 연결 모듈 추가

const kakaoRouter = require('../func/kakaoLogin');
router.use('/kakao', kakaoRouter);

// ✅ views 폴더를 정적 경로로 등록
router.use(express.static(path.join(__dirname, '..', 'views')));

// POST 처리
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// ✅ 메인 로그인 페이지
router.get('/', (req, res) => {
    if (req.session.email || req.session.kakao_access_token) {
        // 이미 로그인되어 있으면 메인화면으로 이동
        res.redirect('/main.html');
    } else {
        // 로그인 안된 경우 로그인 페이지로 이동
        res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
    }
});


// ✅ 로그인 처리 (DB 기반)
router.post('/login', (req, res) => {
    const { email, pw } = req.body;

    if (!email || !pw) {
        return res.json({ success: false, message: '이메일, 비밀번호 입력하세요' })
    }
    // DB에서 사용자 정보 조회
    const sql = 'SELECT email, password, sign_method FROM USER_INFO WHERE email = ? AND password = ?';
    conn.query(sql, [email, pw], (err, results) => {
        if (err) {
            console.error('DB 오류:', err);
            return res.json({ success: false, message: '서버 오류' })
        }

        if (results.length > 0) {
            const user = results[0];
            const signMethod = user.sign_method

            // ✅ 세션 정보 저장
            req.session.email = user.email;
            req.session.pw = user.pw;
            req.session.signMethod = signMethod;

            console.log('로그인 성공:', user.email)

            if(signMethod === 'admin'){
                return res.json({ success: true, message: '로그인 성공(매니저)', redirect: '/managermain.html' })
            }else{
            return res.json({ success: true, message: '로그인 성공(일반회원)', redirect: '/main' })
            }
           
        }
        res.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' })
    });

});



// ✅ 회원가입 / 아이디 찾기 페이지 라우팅
router.get('/joinmem', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'joinmem.html'));
});

router.get('/idpwsearch', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'idpwsearch.html'));
});



// ✅ 예외 처리 미들웨어
router.use((err, req, res, next) => {
    console.log('예외처리');
    res.status(500).send(`500 : 에러 처리 => ${err.message} <br/>`);
});

module.exports = router;