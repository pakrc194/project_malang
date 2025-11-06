const express = require('express');
const router = express.Router();
const path = require('path');
const conn = require('../db/db'); // db 연결

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

// 아이디 찾기(idpwsearch.html fetch, /findid) 이름, 질문, 답변이 일치해야함.
router.post('/findid', (req, res) => {
    const { name, question, answer } = req.body;

    const sql = 'SELECT email FROM USER_INFO WHERE user_name = ? AND question = ? AND answer = ?';
    conn.query(sql, [name, question, answer], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'DB 오류' });
        }

        if (rows.length > 0) {
            const emails = [];
            for (const row of rows) {
                emails.push(row.email);
            }
            res.json({ success: true, emails });
        } else {
            res.json({ success: false, message: '일치하는 정보 없음' });
        }
    });
});

// 이메일 확인(idpwsearch.html fetch, /checkmail)
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


// 비밀번호 변경(idpwsearch.html fetch, /changepw) 이메일 확인한 후 비밀번호 변경 update set
router.post('/changepw', (req, res) => {
    const { email, newchangepw } = req.body; // email, newchagepw 만 받을 것임.
    if (!email || !newchangepw) { // 입력 안할 경우
        return res.status(400).json({ success: false, message: "입력바랍니다." });
    }

    
    const sql = "UPDATE user_info SET password = ? WHERE email = ?";
    conn.query(sql, [newchangepw, email], (err, result) => {
        if (err) {
            console.error("비밀번호 변경 오류:", err);
            return res.status(500).json({ success: false, message: "DB 오류" });
        }

        if (result.affectedRows > 0) { // 행 개수가 0보다 크면 변경
            res.json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다." });
        } else {
            res.json({ success: false, message: "존재하지 않는 이메일입니다." });
        }
    });
});

module.exports = router;

