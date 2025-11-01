
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
    const sql = 'SELECT email, pw FROM user_info WHERE email = ? AND pw = ?';
    conn.query(sql, [email, pw], (err, results) => {
        if (err) {
            console.error('DB 오류:', err);
            return res.json({ success: false, message: '서버 오류' })
        }

        if (results.length > 0) {
            const user = results[0];

            // ✅ 세션 정보 저장
            req.session.email = user.email;
            req.session.pw = user.pw;

            console.log('로그인 성공:', user.email)
            return res.json({ success: true, message: '로그인 성공' })
            // console.log('이름:', req.session.pname);
            // console.log('이메일:', req.session.email);
            // console.log('비밀번호:', req.session.pw);

            // console.log('세션 정보:', user.pw, user.email);
            // ✅ 로그인 성공 시 main.html로 이동
            // return res.send(`
            //     <script>
            //         alert('${msg}');
            //         location.href='/main.html';
            //     </script>
            // `);
        }
        res.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' })
    });

    const sql2 = 'SELECT * FROM user_info WHERE sign_method = "manager"'
        conn.query(sql2, [email, pw1], (err, resQuery) => {
            if (err) {
                console.log('매니저 sql 실패', err.message)
                res.sendFile(path.join(__dirname, '../views/joinmem.html'))
            } else {
                console.log('매니저 sql 성공', resQuery)
                res.sendFile(path.join(__dirname, '../views/managermain.html'))
            }
            res.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다' })
        })
});

// router.post("/checkEmail", (req, res) => {
//   const { email } = req.body;
//   const sql = "SELECT * FROM user_info WHERE email = ?";
//   conn.query(sql, [email], (err, results) => {
//     if (err) {
//       console.error("이메일 확인 오류:", err);
//       return res.status(500).json({ exists: false });
//     }
//     res.json({ exists: results.length > 0 });
//   });
// });

// // 비밀번호 변경
// router.post("/changePw", (req, res) => {
//   const { email, newPw } = req.body;
//   if (!email || !newPw) {
//     return res.status(400).json({ success: false, message: "필수 정보가 누락되었습니다." });
//   }

//   const sql = "UPDATE user_info SET pw = ? WHERE email = ?";
//   conn.query(sql, [newPw, email], (err, result) => {
//     if (err) {
//       console.error("비밀번호 변경 오류:", err);
//       return res.status(500).json({ success: false, message: "DB 오류" });
//     }

//     if (result.affectedRows > 0) {
//       res.json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다." });
//     } else {
//       res.json({ success: false, message: "존재하지 않는 이메일입니다." });
//     }
//   });
// });




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