// 1 웹소켓 서버에 연결시도
        const socket = new WebSocket('ws://localhost:80')
        // 2 웹소켓 서버에 연결성공
        // socket.onopen = ()=>{
        //     // 3.1 클라이언트가 송신
        //     socket.send('연결성공')
        // }
        // // 3.2 클라이언트가 수신
        // socket.onmessage = (e)=>{
        //     console.log(`desc에서 수신: `, e.data)
        // }

// const conn = require('../db/db')

// conn.query('select * from actor_info', (err, res)=>{
//     console.log(res)
// })

function click_poster(){
    console.log('포스터 클릭')
    document.querySelector(".big_poster").style.display = "block"
    document.querySelector("body").style.overflow="hidden"
}

function ck_big(){
    console.log('큰 포스터 클릭')
    document.querySelector(".big_poster").style.display = "none"
    document.querySelector("body").style.overflow = "visible"
}

window.addEventListener('DOMContentLoaded', function(){
    for (let i=0 ; i<10; i++) {
        document.querySelector(".actor_box").innerHTML += 
        `<div class="ind_actor act${i}">
            <img src="../img/cat3_cut.jpg" alt="">
            <div class="actor_name">배우${i}</div>
            <div calss="cast_name">배역${i}</div>
        </div>`
    }
    document.querySelectorAll(".ind_actor").forEach(act_box =>{
        act_box.addEventListener("click", ()=>{
            console.log(act_box.classList[1])
            fetch(`/desc/actor?actor_id=${act_box.classList[1]}`, {
                // method: 'GET',
                // headers: {'Content-Type': 'application/json'},
                // body: JSON.stringify()
                // body: ddd
            })
            .then(answer=>answer.json())
            // console.log(`배우 상세 페이지로 이동`)
            // window.location.href="/desc/actor"
            // window.open("/")
            
        })
    })
})
