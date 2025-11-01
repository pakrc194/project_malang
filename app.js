const express = require('express')
const nunjucks = require('nunjucks')
const app = express()
const path = require('path')
const websocket = require('ws')
const http = require('http')
const conn = require('./db/db')


app.use(express.urlencoded({extended:true}))
app.use(express.json())

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.use('/style', express.static(path.join(__dirname, 'style')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/js', express.static(path.join(__dirname, 'js')))


const perfRouter = require('./routes/perfRouter')
const mainRouter = require('./routes/mainRouter')
const desRouter = require('./routes/desRouter')

app.use('/perf', perfRouter)
app.use('/main', mainRouter)
app.use('/desc', desRouter)

app.get('/', (req, res)=>{
    res.redirect('/main')
})

// 1 express 기반 http 서버 생성
const server = http.createServer(app)
// 2 WebSocket 서버 생성
const wss = new websocket.Server({server})
// 4 클라이언트 접속

let arr = []

wss.on('connection', (ws, req)=>{
    // 5.1 클라이언트로부터 메세지 수신
    ws.on('message', (msg)=>{
        console.log(`클라이언트로부터 받은 메세지 : `, msg.toString())

        arr = msg.toString().split(' ')

        let find_seat = `select * from seat_temp where grade = "${arr[0]}" and area = "${arr[1]}" and s_row = "${arr[2]}" and s_col = "${arr[3]}";`

        function st_in(sql, arr){
            conn.query(sql, arr, (err, res, field)=>{
                send_data()
            })
        }

        function st_sel(sql, arr){
            conn.query(sql, (err, res, field)=>{
                if (res.length == 0) {
                    st_in(`insert into seat_temp (grade, area, s_row, s_col) values (?, ?, ?, ?)`, arr)
                }
                else {
                    st_del(`delete from seat_temp where grade = "${arr[0]}" and area = "${arr[1]}" and s_row = "${arr[2]}" and s_col = "${arr[3]}"`)
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
                ws.send(JSON.stringify({ type: 'temp', result }))
            })
        }
        

        // ws.send('서버가 보냄')
        
        st_sel(find_seat, arr)

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