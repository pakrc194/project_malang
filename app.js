const express = require('express')
const path = require('path')
const nunjucks = require('nunjucks')
const session = require('express-session')
const app = express()
const websocket = require('ws')
const http = require('http')
const conn = require('./db/db')


app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use(session({
    secret : 'qwer1234!@#$',
    resave : false,
    saveUninitialized : true,
    cookie : { secure : false },
})
)

app.use('/style', express.static(path.join(__dirname, 'style')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use(express.static(path.join(__dirname, 'views')));

nunjucks.configure('views', {
    autoescape: true,
    express: app
})


const perfRouter = require('./routes/perfRouter')
const mainRouter = require('./routes/mainRouter')
const desRouter = require('./routes/desRouter')
const loginRouter = require('./routes/loginRouter')
const joinmemRouter = require('./routes/joinmemRouter')
const idpwsearchRouter = require('./routes/idpwsearchRouter')
const mypageRouter = require('./routes/mypageRouter')
const adminRouter = require('./routes/adminRouter')
const searchRouter = require('./routes/searchRouter')
const listRouter = require('./routes/listRouter')
const myGradeRouter = require('./routes/gradeRouter')
const interestRouter = require('./routes/interestRouter')
const actorInfoRouter = require('./routes/actorInfoRouter')
const castInfoRouter = require('./routes/castInfoRouter')
const { base_date_format } = require('./func/date')
const { isLoggedIn } = require('./func/ck_login')


app.use('/perf', perfRouter)
app.use('/main', mainRouter)
app.use('/login', loginRouter)
app.use('/joinmem', joinmemRouter)
app.use('/idpwsearch', idpwsearchRouter)
app.use('/mypage', mypageRouter)
app.use('/admin', adminRouter)
app.use('/search', searchRouter)
app.use('/list', listRouter)
app.use('/mypage/grade', myGradeRouter)
app.use('/mypage/interest', interestRouter)
app.use('/desc', desRouter)
app.use('/actor', actorInfoRouter)
app.use('/cast', castInfoRouter)

app.get('/', (req, res)=>{    
    res.redirect('/main')
})

app.get('/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      console.error('세션 삭제 에러 :', err.message);
      return res.status(500).send('로그아웃 실패');
    }

    // 쿠키 제거
    res.clearCookie('connect.sid');

    // 메인으로 이동
    res.redirect('/main');
  });
});


// 1 express 기반 http 서버 생성
const server = http.createServer(app)
// 2 WebSocket 서버 생성
const wss = new websocket.Server({server})
// 4 클라이언트 접속

let arr = []
let date = ""
let time = 0
let venue_id = 0
let perf_id = 0
let schedule_id = 0
let seat_id = 0
wss.on('connection', (ws, req)=>{
    // 5.1 클라이언트로부터 메세지 수신
    wss.clients.forEach((client) => {
        // client.send('test')
        // client.send(JSON.stringify({ type: 'sold', queryData }));
            // if (client.readyState == websocket.OPEN){
            // }
            
    });
    // ws.send('서버 보냄', arr)

    ws.on('message', (msg)=>{
        console.log(`클라이언트로부터 받은 메세지 : `, msg.toString())
        arr = msg.toString().split(' ')
        if (arr[0] == "select_date"){
            perf_id = arr[1]
            date = base_date_format(arr[2])
            time = arr[3]
            venue_id = arr[4]
            // 선택한 날짜와 회차를 클라이언트로부터 받음
            // and seat_status.seat_status != "Available"
           
            // conn.query(`select distinct seat_status.schedule_id from seat_status join perf_schedule where seat_status.schedule_id = perf_schedule.schedule_id 
                
            //     and perf_schedule.perf_id = ${arr[1]}
            //     and perf_schedule.schedule_round = ${time}
            //     and perf_schedule.schedule_date = "${date}"
                
            //     `,
            // (err, queryData)=>{
            //     console.log('좌석 정보 :', queryData)
            //     schedule_id = queryData[0].schedule_id
            //     console.log(arr, time, date)
                
            // })

        }
        else {
            arr.push(new Date(Date.now() + 5*60*1000))
            console.log('arr: ', arr)
            // arr: 0좌석등급, 1구역, 2열, 3번호, 4유저id, 5작품id, 날짜, 회차, 만료시간

            conn.query(`select distinct seat_status.schedule_id from seat_status join perf_schedule where seat_status.schedule_id = perf_schedule.schedule_id 
                
                and perf_schedule.perf_id = ${arr[5]}
                and perf_schedule.schedule_round = ${arr[7]}
                and perf_schedule.schedule_date = "${base_date_format(arr[6])}"
                
                `,
            (err, queryData)=>{
                console.log('좌석 정보 :', queryData)
                schedule_id = queryData[0].schedule_id
                console.log(arr, time, date)
                
            })
            

            conn.query(`SELECT seat_id FROM seat_layout WHERE venue_id = ${venue_id} 
                AND area = "${arr[1]}" AND seat_row = ${arr[2]} AND seat_number = ${arr[3]}`, (err, seat) =>{
                    seat_id = seat[0].seat_id

                    let find_seat_status = `SELECT seat_status, seat_id FROM seat_status 
                            WHERE schedule_id = ${schedule_id}
                            AND seat_id = ${seat_id}`

                    
                    conn.query(find_seat_status, (err, s_s_up)=>{
                        // console.log('s_s_up: ', s_s_up)
                        
                        let expires = new Date(Date.now() + 5*60*1000)
                        let formatted = expires.toISOString().slice(0, 19).replace('T', ' ')
                        console.log(new Date(), formatted)

                        let update_seat_status_R = `UPDATE seat_status SET seat_status = "Reserved", user_id = ${arr[4]}, temp_resv_time = "${formatted}"
                                WHERE schedule_id = ${schedule_id} AND seat_id = ${seat_id}`
                        let update_seat_status_A = `UPDATE seat_status SET seat_status = "Available", user_id = null, temp_resv_time = null
                                WHERE schedule_id = ${schedule_id} AND seat_id = ${seat_id}`
                                // 등급, 구역, 열 s_row, 번호 s_col, 가격 price
                        let send_seat_status = `
                                SELECT
                                perf_price.grade_code AS grade,
                                seat_layout.area AS area,
                                seat_layout.seat_row AS s_row,
                                seat_layout.seat_number AS s_col,
                                perf_price.price AS price,
                                seat_status.seat_id AS seat_id,
                                seat_status.user_id AS user_id

                                FROM seat_status 
                                JOIN seat_layout ON seat_status.seat_id = seat_layout.seat_id
                                JOIN perf_price ON seat_layout.venue_id = perf_price.venue_id
                                
                                WHERE seat_status.seat_status = "Reserved" 
                                AND seat_status.user_id = ${arr[4]}
                                AND perf_price.perf_id = ${arr[5]}
                                AND seat_layout.grade_code = perf_price.grade_code
                                AND seat_status.schedule_id = ${schedule_id}
                                `

                        if (s_s_up[0].seat_status == "Available"){
                            console.log('상태 변경: ', arr[4], schedule_id, seat_id)
                            // 좌석 정보를 Reserved로 변경
                            conn.query(update_seat_status_R, (err, res_R)=>{
                                conn.query(send_seat_status, (err, send_s1)=>{
                                    console.log('send_s1, Reserved: ', send_s1)
                                    ws.send(JSON.stringify({ type: 'temp', result: send_s1 }))
                                    // wss.clients.forEach((client) => {
                                    //     client.send(JSON.stringify({ type: 'temp', result: send_s1 }));
                                    //     if (client.readyState == websocket.OPEN){
                                    //     }
                                    
                                    // });
                                })
                            })        
                        }
                        else if (s_s_up[0].seat_status == "Reserved"){
                            // 좌석 정보를 Available로 변경
                            conn.query(update_seat_status_A, (err, res_A)=>{
                                conn.query(send_seat_status, (err, send_s1)=>{
                                    console.log('send_s1: ', send_s1[0])
                                    ws.send(JSON.stringify({ type: 'temp', result: send_s1 }))

                                    // Available로 변경된 좌석정보 전송
                                    conn.query(`select * from seat_layout where seat_id = ${s_s_up[0].seat_id}`, (err, a_up)=>{

                                        wss.clients.forEach((client) => {
                                            client.send(JSON.stringify({ type: 'A', result: a_up, schedule_id: schedule_id }));
                                            if (client != ws){

                                            }
                                        });
                                    })
                                })
                            })
                        }
                        let send_seat_status_not_me = `
                                SELECT 
                                perf_price.grade_code AS grade,
                                seat_layout.area AS area,
                                seat_layout.seat_row AS s_row,
                                seat_layout.seat_number AS s_col,
                                perf_price.price AS price,
                                seat_status.seat_id AS seat_id,
                                seat_status.user_id AS user_id,
                                seat_status.seat_status AS seat_status,
                                seat_status.schedule_id AS schedule_id

                                FROM seat_status 
                                JOIN seat_layout ON seat_status.seat_id = seat_layout.seat_id
                                JOIN perf_price ON seat_layout.venue_id = perf_price.venue_id
                                WHERE seat_status.seat_status != "Available"
                                AND perf_price.perf_id = ${arr[5]}
                                AND seat_layout.grade_code = perf_price.grade_code
                                AND seat_status.schedule_id = ${schedule_id}
                                `
                        
                        conn.query(send_seat_status_not_me, (err, send_s2)=>{
                            console.log('send_s2: ', send_s2)
                            wss.clients.forEach((client) => {
                                if (client.readyState == websocket.OPEN){
                                    client.send(JSON.stringify({ type: 'seat_status', result: send_s2 }));
                                }
                                
                            });
                        })
                    })
                })
        }

    })
    
    // 5.2 서버가 메세지 송신
    // ws.send('서버가 메세지 보냄')

    ws.on('err', (err)=>{
        console.log(`에러발생 : ${err.message}`)
    })

    ws.on('close', ()=>{
        console.log(`클라이언트 연결 종료`)
    })
})


// 3 서버 실행
server.listen(80, ()=>{
    console.log('웹소켓 server 80 서버 확인')
})