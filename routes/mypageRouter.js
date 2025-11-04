const express = require('express')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')

let titleArr = {
    reserveSelect: '예매내역', pwChange: '비밀번호 변경', memberOut: '회원 탈퇴'
}

let data = {}

//header 구성
router.use((req, res, next) => {
    data.title = titleArr[path.basename(req.path)]
    next()
})


//aside 구성
router.use((req, res, next) => {
    data.aside = ''
    for (const kk in titleArr) {
        data.aside += `<a href='/mypage/${kk}'>${titleArr[kk]}</a><br/>`
    }
    next()
})

router.get('/', (req, res) => {
    //res.render('../views/mypage.html')
    //res.sendFile(path.join(__dirname, '../views/mypage.html'))
    res.redirect('/mypage/pwChange')     //  리다이렉트 '/info/hello' 로 URL 이동
})


router.get('/reserveSelect', (req, res) => {
    data.mainUrl = 'reserveSelect'

    res.render("../views/mypage/mypage.html", data)
})


router.get('/pwChange', (req, res) => {
    data.mainUrl = `pwChange`

    res.render("../views/mypage/mypage.html", data)
})

router.get('/memberOut', (req, res) => {

    data.mainUrl = 'memberOut'

    res.render("../views/mypage/mypage.html", data)
})

// 비밀번호 변경해야함.

router.post("/checkpw", (req, res) => {
    const { oldpw } = req.body
    const sql = "SELECT * FROM user_info WHERE password = ?"
    conn.query(sql, [oldpw], (err, results)=>{
        if(err) {
            console.error('이메일 확인 오류:', err.message)
            return res.status(500).json({ exists: false })
        }
        res.json({ exists: results.length > 0 });
    })
});

// 새 비밀번호 변경
router.post("/changepw", (req, res) => {
    const { newpw1 } = req.body;
    const email = req.session?.email || req.session?.kakao_email;

    console.log(newpw1)
    console.log(email)

    if (!newpw1) return res.json({ success: false, message: "새 비밀번호를 입력해주세요." });

    const sql = "UPDATE user_info SET password = ? WHERE email = ?";
    conn.query(sql, [newpw1, email], (err, result) => {
        if (err) {
            console.log('비밀번호 변경 오류:', err.message)
            return res.status(500).json({ success: false, message: "DB 오류" })
        };

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다." });
        } else {
            res.json({ success: false, message: "비밀번호 변경 실패" });
        }
    });
});

module.exports = router