
const express = require('express')
const nunjucks = require('nunjucks')
const path = require('path')

const app = express()

nunjucks.configure('views',{
    autoescape:true,
    express: app
})



let asideArr = [ 'hello', 'history', 'location' ]

let data = {}

//aside 구성
app.use((req,res,next)=>{
    data.aside = ''
    for (const kk in asideArr) {
        data.aside += `<a href='/info/${kk}'>${asideArr[kk]}</a><br/>`    
    }
    next()
})

app.get('/',(req,res)=>{
    
    res.redirect('/info/hello')     //  리다이렉트 '/info/hello' 로 URL 이동
})

app.get('/info/hello',(req,res)=>{
    data.main = '인사말 입니다'
    
    res.render("views/mypage.html",data)
})


app.get('/info/history',(req,res)=>{
    
    data.main = '연혁 입니다'
    
    res.render("views/mypage.html",data)
})

app.get('/info/location',(req,res)=>{
   
    data.main = '오시는길 입니다'
    
    res.render("views/mypage.html",data)
})

app.listen(80,()=>{
    console.log("useTemp 서버 시작")
})


































































// const express = require("express");
// const router = express.Router();
// const path = require("path");
// const conn = require("../db/db");

// // 마이페이지 메인
// router.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../views/mypage.html"));
// });

// // 예매 내역 화면 (HTML 조각)
// router.get("/reserve", (req, res) => {
//   // 일단 테스트용 HTML — 나중에 DB와 연동 가능
//   res.send(`
//     <h2>예매 내역</h2>
//     <ul>
//       <li>뮤지컬 <strong>레미제라블</strong> - 2025.11.12</li>
//       <li>연극 <strong>햄릿</strong> - 2025.12.01</li>
//     </ul>
//   `);
// });

// // 비밀번호 변경
// router.post("/changepw", (req, res) => {
//   const { oldpw, newpw } = req.body;
//   const email = req.session?.user?.email || "test@test.com"; // 세션 연동 시 수정

//   const checkSql = "SELECT password FROM USER_INFO WHERE email = ?";
//   conn.query(checkSql, [email], (err, rows) => {
//     if (err) return res.json({ success: false, message: "DB 오류" });
//     if (!rows.length || rows[0].password !== oldpw)
//       return res.json({ success: false, message: "기존 비밀번호가 일치하지 않습니다." });

//     const updateSql = "UPDATE USER_INFO SET password = ? WHERE email = ?";
//     conn.query(updateSql, [newpw, email], (err) => {
//       if (err) return res.json({ success: false, message: "비밀번호 변경 실패" });
//       res.json({ success: true, message: "비밀번호가 변경되었습니다." });
//     });
//   });
// });

// // 회원 탈퇴
// router.post("/delete", (req, res) => {
//   const email = req.session?.user?.email || "test@test.com";

//   const sql = "DELETE FROM USER_INFO WHERE email = ?";
//   conn.query(sql, [email], (err) => {
//     if (err) return res.json({ success: false, message: "회원 탈퇴 실패" });
//     res.json({ success: true, message: "탈퇴되었습니다." });
//   });
// });

// module.exports = router;