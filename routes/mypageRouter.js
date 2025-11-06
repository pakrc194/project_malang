const express = require('express')
const util = require('util')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')


let titleArr = {
    grade: '내등급',reserveSelect: '예매내역', pwChange: '비밀번호 변경', memberOut: '회원 탈퇴'
}

let data = {}

// ------------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------------------

router.get('/', (req, res) => {
    //res.render('../views/mypage.html')
    //res.sendFile(path.join(__dirname, '../views/mypage.html'))
    res.redirect('/mypage/myInfo')     //  리다이렉트 '/info/hello' 로 URL 이동
})

router.get('/myInfo', (req, res) => {
    console.log('email', req.session.email)
    let email = 'abc111@gmail.com'
    let selectSQL = 'select * from user_info join user_grade on user_info.grade_id = user_grade.grade_id where email = ?'
    let reservSQL = 'select count(*) from reservation_info where user_id = ?'
    let tasks = []


    conn.query(selectSQL, [email], async (userInfoErr, userInfoQuery)=> {
        console.log(userInfoQuery)
        let userId = userInfoQuery[0].user_id
        tasks.push(conn.query(reservSQL, [userId]))

        let[reservQuery, couponQuery]= await Promise.all(tasks)
        console.log('reserv----', reservQuery)
        console.log(reservQuery[0]['count(*)'])
        

        res.render("../views/mypage/mypage.html",{mainUrl:'myInfo', myInfo: userInfoQuery[0], reservCnt :reservQuery[0]['count(*)']})
    })
    //res.render("../views/list.html")
})

 router.get('/reserveSelect', (req, res) => {

    data.mainUrl = 'reserveSelect'

     const email = req.session?.email || req.session?.kakao_email;

     console.log(email)

     const sql = ` 
     select
     
     user_info.name AS user_name,
     user_info.email,
     reservation_info.resv_id, 
     reservation_info.resv_number,
     reservation_info.resv_status,
     reservation_info.final_amount,
     reservation_info.resv_date,
     seat_layout.seat_number,
     seat_layout.seat_row,
     perf_schedule.schedule_date, 
     perf_schedule.schedule_time,
     venue_info.venue_name,
     performance_info.poster_url,
     performance_info.name AS performance_name
    
     from reservation_info 
     join user_info on user_info.user_id = reservation_info.user_id 
     join seat_layout on seat_layout.seat_id = reservation_info.seat_id
     join perf_schedule on perf_schedule.schedule_id = reservation_info.schedule_id
     join venue_info on venue_info.venue_id = perf_schedule.venue_id
     join performance_info on performance_info.perf_id = perf_schedule.perf_id

     where user_info.email = ?
     `

      conn.query(sql, [email], (err, rows) => {
         if (err) {
             console.error('예매 내역 조회 에러:', err);
             return res.status(500).send('서버 에러');
         }

         console.log(rows)
         res.render('../views/mypage/mypage.html', { mainUrl : 'reserveSelect', resvList : rows });

 })

})

    
router.get('/pwChange', (req, res) => {
    data.mainUrl = `pwChange`

    res.render("../views/mypage/mypage.html", data)
})

router.get('/memberOut', (req, res) => {

    data.mainUrl = 'memberOut'

    res.render("../views/mypage/mypage.html", data)
})

// ------------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------------------ 회원 탈퇴

router.post('/pwout', (req, res)=>{
    const email = req.session?.email || req.session?.kakao_email;
    const { pwout } = req.body
    
    if (!email) return res.json({ success: false, message: "로그인이 필요합니다." });
    if (!pwout) return res.json({ success: false, message: "비밀번호 입력하세요." });

    console.log(pwout)
    console.log(email)

    

    const sql = 'SELECT password FROM user_info WHERE email = ?'
    conn.query(sql, [email], (err, rows)=>{
        if(err){return res.status(500).json({ success: false, message: "DB 오류" })}
        if(!rows.length) return res.json({ success : false, message : '회원 정보 찾을 수 없음'})

        if(rows[0].password !== pwout)
        {return res.json({ success: false, message : '비밀번호 일치하지 않습니다.'})}
    })

    const updateSql = "UPDATE USER_INFO SET account_status = 'WITHDRAWAL' WHERE email = ?"
    conn.query(updateSql, [email], (err2)=>{
        if(err2){return res.status(500).json({ success: false, message : '탈퇴 오류'})}

        req.session.destroy(()=>{
            res.json({ success: true, message: "회원 탈퇴가 완료되었습니다." });
        })
    })

})

router.get('/resvDetail', (req, res)=>{
    res.sendFile(path.join(__dirname, '../views/ticketinfo.html'))
})
      
module.exports = router