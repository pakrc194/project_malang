const express = require('express')
const util = require('util')
const router = express.Router()
const path = require('path')
const conn = require('../db/db')
const { base_date_format, base_time_format } = require('../func/date.js')

function isLoggedIn(req, res, next) {
    if (req.session?.email || req.session?.kakao_email) {
        console.log('id confirm')
        next();
    } else {
        console.log('id confirm xxxx')
        res.send(`
            <script>
                alert('로그인 후 이용 가능합니다.');
                window.location.href = '/login';
            </script>
        `);
    }
}

let titleArr = {
    grade: '내등급', reserveSelect: '예매내역', pwChange: '비밀번호 변경', memberOut: '회원 탈퇴'
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

    const email = req.session?.email || req.session?.kakao_email;
    const sessionuserid = req.session?.user_id
    console.log(sessionuserid)

    

    //res.render('../views/mypage.html')
    //res.sendFile(path.join(__dirname, '../views/mypage.html'))
    if (email == null) {
        res.redirect('/login')
    } else {
        res.redirect('/mypage/myInfo')     //  리다이렉트 '/info/hello' 로 URL 이동
    }
})

router.get('/myInfo', (req, res) => {
    console.log('email', req.session.email)
    const email = req.session?.email || req.session?.kakao_email;
    const sessionuserid = req.session?.user_id
    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name

    let selectSQL = 'select * from user_info join user_grade on user_info.grade_id = user_grade.grade_id where email = ?'
    let reservSQL = 'select count(*) from reservation_info where user_id = ?'
    let interestSQL = 'select count(*) from user_interest_actor where user_id = ?'
    let tasks = []

    let reservCnt = 0
    let interestCnt = 0
    conn.query(selectSQL, [email], async (userInfoErr, userInfoQuery) => {
        console.log(userInfoQuery)
        if (userInfoQuery.length > 0) {
            let userId = userInfoQuery[0].user_id
            tasks.push(conn.query(reservSQL, [userId]))
            tasks.push(conn.query(interestSQL, [userId]))

            let [reservQuery, interestQuery] = await Promise.all(tasks)
            console.log('reserv----', reservQuery)
            console.log(reservQuery[0]['count(*)'])
            reservCnt = reservQuery[0]['count(*)']
            interestCnt = interestQuery[0]['count(*)']
            console.log(sessionuserid)
           
            userInfoQuery[0].score = Number(userInfoQuery[0].score).toLocaleString()

            res.render("../views/mypage/mypage.html", { mainUrl: 'myInfo', myInfo: userInfoQuery[0], reservCnt, interestCnt, loginout, name })
        }
    })
    //res.render("../views/list.html")
})

router.get('/reserveSelect', isLoggedIn, (req, res) => {

    data.mainUrl = 'reserveSelect'

    const email = req.session?.email || req.session?.kakao_email;
    const sessionuserid = req.session?.user_id

    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name

    const sort = req.query.sort || 'latest';

    let orderSql = 'reservation_info.resv_date DESC'
    if (sort === 'name') orderSql = 'performance_info.perf_name ASC'

    console.log(email)

    const sql = ` 
     select
     
     user_info.user_name,
     user_info.email,
     reservation_info.resv_id, 
     reservation_info.resv_number,
     reservation_info.resv_status,
     reservation_info.final_amount,
     reservation_info.resv_date,
     perf_schedule.schedule_date, 
     perf_schedule.schedule_time,
     venue_info.venue_name,
     performance_info.poster_url,
     performance_info.perf_name,
     reservation_info.seat_id_arr,
     reservation_info.resv_count

     from reservation_info

     join user_info on user_info.user_id = reservation_info.user_id 
     join perf_schedule on perf_schedule.schedule_id = reservation_info.schedule_id
     join venue_info on venue_info.venue_id = perf_schedule.venue_id
     join performance_info on performance_info.perf_id = perf_schedule.perf_id
     where user_info.email = ? AND perf_schedule.schedule_id = reservation_info.schedule_id
     AND performance_info.perf_id = perf_schedule.perf_id
     ORDER BY ${orderSql}
     `

     //
    conn.query(sql, [email], async (err, rows) => {
        if (err) {
            console.error('예매 내역 조회 에러:', err);
            return res.status(500).send('서버 에러');
        }
        console.log(sessionuserid)

        const today = new Date();

        for (const row of rows) {
            row.resv_date = base_date_format(row.resv_date);
            row.schedule_date = base_date_format(row.schedule_date);
            row.schedule_time = base_time_format(row.schedule_time);

            const perfDate = new Date(row.schedule_date);
            const diff = Math.ceil((perfDate - today) / (1000 * 60 * 60 * 24));

            if (diff > 0) {
                row.d_day = `D-${diff}`
                row.cancelable = true
            } else if (diff === 0) {
                row.d_day = 'D-DAY'
                row.cancelable = false
            } else {
                row.d_day = '공연 종료'
                row.cancelable = false
            }

            const seatArr = row.seat_id_arr ? row.seat_id_arr.split(',') : [];

            if (seatArr.length > 0) {
                const seatSql = `SELECT seat_id, seat_row, seat_number, grade_code, area FROM seat_layout WHERE seat_id IN (?)`;
                const [seatRows] = await conn.promise().query(seatSql, [seatArr]);


                const seatNumbers = []
                for (let i = 0; i < seatRows.length; i++) {
                    seatNumbers.push(seatRows[i].seat_number)
                }

                row.seats = seatRows;
            } else {
                row.seats = []
            }
        }

       

        res.render('mypage/mypage.html', {
            title: data.title,
            aside: data.aside,
            mainUrl: data.mainUrl,    
            resvList: rows,    
            sort,
            loginout,
            name
        })

    })

})


router.get('/pwChange', isLoggedIn, (req, res) => {
    data.mainUrl = `pwChange`

    const email = req.session?.email || req.session?.kakao_email;
    const sessionuserid = req.session?.user_id

    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name

    console.log(sessionuserid)
    console.log(loginout)
    console.log(email)

    res.render("../views/mypage/mypage.html", { mainUrl : data.mainUrl, loginout, name })
})

router.get('/memberOut', isLoggedIn, (req, res) => {

    data.mainUrl = 'memberOut'
    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name

    res.render("../views/mypage/mypage.html", { mainUrl : data.mainUrl, loginout, name })
})

// ------------------------------------------------------------------------------------------

// 비밀번호 변경해야함.

router.post("/checkpw", isLoggedIn, (req, res) => {
    const { oldpw } = req.body

    const email = req.session?.email || req.session?.kakao_email;
    const sessionuserid = req.session?.user_id
    

    console.log(sessionuserid)
    console.log(email)

    if (req.session?.kakao_email) {
        return res.json({ exists: false, message: "카카오 로그인 사용자는 비밀번호 변경이 불가합니다." });
    }

    const sql = "SELECT * FROM user_info WHERE password = ?"
    conn.query(sql, [oldpw], (err, results) => {
        if (err) {
            console.error('이메일 확인 오류:', err.message)
            return res.status(500).json({ exists: false })
        }

        res.json({ exists: results.length > 0 });
    })
});

// 새 비밀번호 변경
router.post("/changepw", isLoggedIn, (req, res) => {
    const { newpw1 } = req.body;
    const email = req.session?.email || req.session?.kakao_email;
    const sessionuserid = req.session?.user_id

    if (req.session?.kakao_email) {
        return res.json({ success: false, message: "카카오 로그인 사용자는 비밀번호 변경이 불가합니다." });
    }

    console.log(newpw1)
    console.log(email)

    if (!newpw1) return res.json({ success: false, message: "새 비밀번호를 입력해주세요." });

    const sql = "UPDATE user_info SET password = ? WHERE email = ?";
    conn.query(sql, [newpw1, email], (err, result) => {
        if (err) {
            console.log('비밀번호 변경 오류:', err.message)
            return res.status(500).json({ success: false, message: "DB 오류" })
        };

        console.log(sessionuserid)

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다." });
        } else {
            res.json({ success: false, message: "비밀번호 변경에 실패하였습니다." });
        }
    });
});

// ------------------------------------------------------------------------------------------ 회원 탈퇴

router.post('/pwout', isLoggedIn, (req, res) => {

    const email = req.session?.email || req.session?.kakao_email;
    const sessionuserid = req.session?.user_id
    const { pwout } = req.body

    if (!email) return res.json({ success: false, message: "로그인이 필요합니다." });
    if (!pwout) return res.json({ success: false, message: "비밀번호를 입력하세요." });

    console.log(pwout)
    console.log(email)
    console.log(sessionuserid)



    const sql = 'SELECT password FROM user_info WHERE email = ?'
    conn.query(sql, [email], (err, rows) => {
        if (err) { return res.status(500).json({ success: false, message: "DB 오류" }) }
        if (!rows.length) return res.json({ success: false, message: '회원 정보 찾을 수 없습니다.' })

        if (rows[0].password !== pwout) { return res.json({ success: false, message: '비밀번호가 일치하지 않습니다.' }) }
    })

    const updateSql = "UPDATE USER_INFO SET account_status = 'WITHDRAWAL' WHERE email = ?"
    conn.query(updateSql, [email], (err2) => {
        if (err2) { return res.status(500).json({ success: false, message: '탈퇴 오류' }) }

        req.session.destroy(() => {
            res.json({ success: true, message: "회원 탈퇴가 완료되었습니다." });
        })
    })

})

router.get('/resvDetail', (req, res) => {

     const email = req.session?.email || req.session?.kakao_email;
    const sessionuserid = req.session?.user_id

    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name

    console.log(sessionuserid)
    console.log(email)

    const sql = ` 
     select
     
     user_info.user_name,
     user_info.email,
     user_info.user_id,
     payment_info.payment_id,
     reservation_info.user_id,
     reservation_info.resv_number,
     reservation_info.resv_count,
     reservation_info.total_amount,
     reservation_info.discount_rate,
     reservation_info.final_amount,
     payment_info.payment_method,
     reservation_info.resv_id,
     reservation_info.seat_id_arr
     
     from reservation_info

     join user_info on user_info.user_id = reservation_info.user_id
     join payment_info on payment_info.payment_id = reservation_info.payment_id

     where user_info.email = ? AND reservation_info.resv_id = ?
     `

    const resv_id = req.query.resv_id

    conn.query(sql, [email, resv_id], async (err, cancelresv) => {
        if (err) {
            console.error('예매 내역 조회 에러:', err);
            
            return res.status(500).send('서버 에러');
            
        } else {
            console.log(cancelresv[0])

            for (const cclresv of cancelresv) {
            
            const seatArr = cclresv.seat_id_arr ? cclresv.seat_id_arr.split(',') : [];

            if (seatArr.length > 0) {
                const seatSql = `SELECT seat_id, seat_row, seat_number, grade_code, area FROM seat_layout WHERE seat_id IN (?)`;
                const [seatRows] = await conn.promise().query(seatSql, [seatArr]);


                const seatNumbers = []
                for (let i = 0; i < seatRows.length; i++) {
                    seatNumbers.push(seatRows[i].seat_number)
                }

                cclresv.seats = seatRows;
            } else {
                cclresv.seats = []
            }
        }
        console.log(cancelresv)
            res.render("../views/ticketinfo.html", { io : cancelresv[0], loginout, name })

        }
})
});

router.get('/resvCancel', async (req, res) => {

    const email = req.session?.email || req.session?.kakao_email;
    const sessionuserid = req.session?.user_id

    const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name

    console.log(sessionuserid)
    console.log(email)

    // reservation_info.schedule_id = perf_schedule.schedule_id
    const sql = ` 
     select
     
     user_info.user_name,
     user_info.email,
     user_info.user_id,
     payment_info.payment_id,
     reservation_info.user_id,
     reservation_info.resv_number,
     reservation_info.resv_count,
     reservation_info.total_amount,
     reservation_info.discount_rate,
     reservation_info.final_amount,
     payment_info.payment_method,
     reservation_info.resv_id,
     reservation_info.seat_id_arr,
     payment_info.payment_date,
     venue_info.venue_name,
     performance_info.poster_url,
     performance_info.perf_name,
     perf_schedule.schedule_date, 
     perf_schedule.schedule_time
     
     from reservation_info

     join user_info on user_info.user_id = reservation_info.user_id
     join payment_info on payment_info.payment_id = reservation_info.payment_id
     join perf_schedule on perf_schedule.schedule_id = reservation_info.schedule_id
     join venue_info on venue_info.venue_id = perf_schedule.venue_id
     join performance_info on performance_info.perf_id = perf_schedule.perf_id

     where user_info.email = ? AND reservation_info.resv_id = ?
     `

    const resv_id = req.query.resv_id

    conn.query(sql, [email, resv_id], async (err, cancelresv) => {
        if (err) {
            console.error('예매 내역 조회 에러:', err);
            
            return res.status(500).send('서버 에러');
            
        } else {
            console.log(cancelresv[0])

            const today = new Date();

            for (const cclresv of cancelresv) {

                cclresv.payment_date = base_date_format(cclresv.payment_date)
                
                
            const seatArr = cclresv.seat_id_arr ? cclresv.seat_id_arr.split(',') : [];

            if (seatArr.length > 0) {
                const seatSql = `SELECT seat_id, seat_row, seat_number, grade_code, area FROM seat_layout WHERE seat_id IN (?)`;
                const [seatRows] = await conn.promise().query(seatSql, [seatArr]);


                const seatNumbers = []
                for (let i = 0; i < seatRows.length; i++) {
                    seatNumbers.push(seatRows[i].seat_number)
                }

                cclresv.seats = seatRows;
            } else {
                cclresv.seats = []
            }
        }

        console.log(cancelresv)
            res.render("../views/ticketcancel.html", { io : cancelresv[0], loginout, name })

        }
    })

});

module.exports = router