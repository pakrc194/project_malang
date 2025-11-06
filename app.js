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
wss.on('connection', (ws, req)=>{
    // 5.1 클라이언트로부터 메세지 수신
    wss.clients.forEach((client) => {
        client.send('test')
        // client.send(JSON.stringify({ type: 'sold', queryData }));
            // if (client.readyState == websocket.OPEN){
            // }
            
    });


    ws.on('message', (msg)=>{
        console.log(`클라이언트로부터 받은 메세지 : `, msg.toString())
        
        
        
        // arr = msg.toString().replace(/\,/g, ' ')
        arr = msg.toString().split(' ')
        if (arr[0] == "select_date"){
            date = arr[2]
            time = arr[3]
            // 선택한 날짜와 회차를 클라이언트로부터 받음
        let dd = base_date_format(date)
            console.log(date)
           console.log('dd: ', dd)
           
            conn.query(`select * from seat_status join perf_schedule where seat_status.schedule_id = perf_schedule.schedule_id 
                
                and perf_schedule.perf_id = ${arr[1]}
                and perf_schedule.schedule_round = ${time}
                and perf_schedule.schedule_date = "${dd}"
                and seat_status.seat_status != "Available"
                `,
            (err, queryData)=>{
                console.log('좌석 정보 :', queryData)
                
                // wss.clients.forEach(client => {
                //     for (let i of queryData){
                //         // console.log(i)
                //         client.send(JSON.stringify({ type: 'seat_status', i }));
                //     }
                //     // if (client !== ws && client.readyState === WebSocket.OPEN) {
                //     // }
                // });
                // console.log(queryData)
                
            })

        }
        else {
            arr.push(date)
            arr.push(time)
            arr.push(new Date(Date.now() + 5*60*1000))
    
            let find_seat = `select * from seat_temp 
            where grade = "${arr[0]}" and area = "${arr[1]}" and s_row = "${arr[2]}" and s_col = "${arr[3]}"
            and choice_date = "${arr[4]}" and choice_time = "${arr[5]}";`
    
            function st_in(sql, arr){
                conn.query(sql, arr, (err, res, field)=>{
                    send_data()
                })
            }
    
            function st_sel(sql, arr){
                conn.query(sql, (err, res, field)=>{
                    if (res.length == 0) {
                        st_in(`insert into seat_temp (grade, area, s_row, s_col, choice_date, choice_time, expires) values (?, ?, ?, ?, ?, ?, ?)`, arr)
                    }
                    else {
                        st_del(`delete from seat_temp where grade = "${arr[0]}" and area = "${arr[1]}" and s_row = "${arr[2]}" and s_col = "${arr[3]}"
                            and choice_date = "${arr[4]}" and choice_time = "${arr[5]}"`)
                    }
                })
            }
    
            function st_del(sql, arr) {
                conn.query(sql, (err, res)=>{
                    if (err){
                        console.log('임시 좌석 삭제 에러')
                    }
                    send_data()
                })
            }
    
            function send_data() {
                conn.query(`select * from seat_temp INNER JOIN seat_price where seat_temp.grade = seat_price.grade`, (err, result)=>{
                    // ws.send(JSON.stringify({ type: 'temp', result }))
                    // new BroadcastChannel(JSON.stringify({ type: 'temp', result }))
                    wss.clients.forEach((client) => {
                        if (client.readyState == websocket.OPEN){
                            client.send(JSON.stringify({ type: 'temp', result }));
                        }
                        
                    });
                })
            }
            
    
            // ws.send('서버가 보냄')
            
            st_sel(find_seat, arr)
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