const express = require('express');
const router = express.Router();
const path = require('path');
const conn = require('../db/db'); // db 연결
const { sendVerificationEmail } = require('../func/mailer');

// 정적 파일
router.use(express.static(path.join(__dirname, '../views')))
// json 
router.use(express.json());
// POST 처리
router.use(express.urlencoded({ extended: true }));

// 화면 띄우기
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/mypage/idpwsearch.html'));
});

async function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM user_info WHERE email = ?';
        conn.query(sql, [email], (err, rows) => {
            if (err) reject(err);
            else resolve(rows[0]);
        });
    });
}

// 이메일 인증번호 전송
router.post('/sendCode', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) return res.json({ success: false, message: '존재하지 않는 이메일입니다.' });

        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 인증번호

        // 이메일 발송
        await sendVerificationEmail(email, code);

        // 세션 저장
        req.session.email = email;
        req.session.emailCode = code;
        req.session.emailCodeExpire = Date.now() + 5 * 60 * 1000; // 5분 유효

        res.json({ success: true, message: '인증번호가 이메일로 전송되었습니다.' });
    } catch (err) {
        console.error('이메일 인증 오류:', err);
        res.status(500).json({ success: false, message: '이메일 전송 실패' });
    }
});

// 인증번호 검증
router.post('/verifyCode', (req, res) => {
    const { email, code } = req.body;
    const now = Date.now();

    if (
        req.session.email === email &&
        req.session.emailCode === code &&
        req.session.emailCodeExpire > now
    ) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

// 아이디 찾기
router.post('/findid', (req, res) => {
    const { name, question, answer } = req.body;
    const sql = 'SELECT email FROM USER_INFO WHERE user_name = ? AND question = ? AND answer = ?';
    conn.query(sql, [name, question, answer], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'DB 오류' });
        }

        if (rows.length > 0) {
            const emails = rows.map(r => r.email);
            res.json({ success: true, emails });
        } else {
            res.json({ success: false, message: '일치하는 정보 없음' });
        }
    });
});

// 이메일 확인
router.post('/checkmail', (req, res) => {
    const { email } = req.body;
    const sql = "SELECT * FROM user_info WHERE email = ?";
    conn.query(sql, [email], (err, results) => {
        if (err) {
            console.error("이메일 확인 오류:", err.message);
            return res.status(500).json({ exists: false });
        }
        res.json({ exists: results.length > 0 });
    });
});

// 비밀번호 변경
router.post('/changepw', (req, res) => {
    const { email, newchangepw } = req.body;

    if (!email || !newchangepw) {
        return res.status(400).json({ success: false, message: "입력바랍니다." });
    }

    if (!req.session.email || req.session.email !== email) {
        return res.status(403).json({ success: false, message: '이메일 인증을 먼저 진행해주세요.' });
    }

    const checkSql = "SELECT sign_method FROM user_info WHERE email = ?";
    conn.query(checkSql, [email], (err, rows) => {
        if (err) {
            console.error("카카오 계정 확인 오류:", err);
            return res.status(500).json({ success: false, message: "DB 오류" });
        }


        if (rows.length === 0) {
            return res.json({ success: false, message: "존재하지 않는 이메일입니다." });
        }


        if (rows[0].sign_method === 'kakao') {
            return res.json({ success: false, message: "카카오 로그인 계정은 비밀번호 재설정이 불가합니다." });
        }

        const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#&*])[A-Za-z\d!@#&*]{8,16}$/;
        if (!pwRegex.test(newchangepw)) {
            return res.json({
                success: false,
                message: '비밀번호는 8~16자, 영문자, 숫자, 특수문자를 포함해야 합니다.',
            });
        }


        const sql = "UPDATE user_info SET password = ? WHERE email = ?";
        conn.query(sql, [newchangepw, email], (err, result) => {
            if (err) {
                console.error("비밀번호 변경 오류:", err);
                return res.status(500).json({ success: false, message: "DB 오류" });
            }

            if (result.affectedRows > 0) {
                req.session.email = null;
                req.session.emailCode = null;
                req.session.emailCodeExpire = null;
                
                return res.json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다." });
            } else {
                return res.json({ success: false, message: "존재하지 않는 이메일입니다." });
            }
        });
    });
});

module.exports = router;