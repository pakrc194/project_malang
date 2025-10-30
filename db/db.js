const mysql = require('mysql2')

/**
 * user : malang
 * pw : 1234
 * db : malang_db
 * url : localhost
 */

// db 연결 객체 생성
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'malang',
    password: '1234',
    database: 'malang_db',
})

// 연결시도 필수!!!!!!!!!
conn.connect((err)=>{
    if(err) {
        console.log('연결실패', err.message)
    } else {
        console.log('연결성공', conn.threadId)
    }
})

//쿼리문 실행
// conn.query('select * from theater_info', (err, res)=>{
//     if(err) {
//         console.log('sql 실패', err.message)
//     } else {
//         console.log('sql 성공', res)
//     }
// })


// //연결 종료 필수!!!!!!!!!!
//conn.end()

module.exports = conn