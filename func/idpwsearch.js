const express = require('express');
const path = require('path');
const conn = require('../db/db'); // MySQL 연결
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTML 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/idpwsearch.html'));
});

// 아이디 찾기 POST
app.post('/findid', (req, res) => {
    const { name, question, answer } = req.body;

    const sql = 'SELECT email FROM user_info WHERE name = ? AND question = ? AND answer = ?';
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


app.use(express.static(path.join(__dirname, '../views')));

app.listen(80, () => console.log('서버 실행: http://localhost:80'));