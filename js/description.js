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

