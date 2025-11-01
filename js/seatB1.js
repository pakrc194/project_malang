        // 1 웹소켓 서버에 연결시도
        // const socket = new WebSocket('ws://localhost:80')
        // 2 웹소켓 서버에 연결성공
        socket.onopen = ()=>{
            // 3.1 클라이언트가 송신
            socket.send('seatB1 연결성공')
        }
        // 3.2 클라이언트가 수신
        // socket.onmessage = (e)=>{
        //     console.log(`seatB1에서 수신: `, e.data)
        // }

window.addEventListener('DOMContentLoaded', function(){
    let area = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
    let row = ["first", "second", "third"]
    let color = ["red", "green", "blue"]

    for(let aa = 0; aa < 3; aa++) {

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 12; j++) {
                document.querySelector(`.${row[aa]} > .section`).innerHTML += `<input type="checkbox" value="${area[aa*3]} ${i+1} ${j+1}" class="indiseat" onclick="ck_cnt(this)">`
            }
        }
        for (let i = 1; i < 12*10+1; i++) {
            document.querySelector(`.${row[aa]} > .section:nth-of-type(1) > input:nth-of-type(${i})`).style.marginLeft = "8px"
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 12; j++) {
                document.querySelector(`.${row[aa]} > .section ~ .section`).innerHTML += `<input type="checkbox" value="${area[aa*3+1]} ${i+1} ${j+1}" class="indiseat" onclick="ck_cnt(this)">`
            }
        }
        for (let i = 1; i < 12*10+1; i++) {
            document.querySelector(`.${row[aa]} > .section ~ .section > input:nth-of-type(${i})`).style.marginLeft = "8px"
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 12; j++) {
                document.querySelector(`.${row[aa]} > .section ~ .section ~ .section`).innerHTML += `<input type="checkbox" value="${area[aa*3+2]} ${i+1} ${j+1}" class="indiseat" onclick="ck_cnt(this)">`
            }
        }
        for (let i = 1; i < 12*10+1; i++) {
            document.querySelector(`.${row[aa]} > .section ~ .section ~ .section > input:nth-of-type(${i})`).style.marginLeft = "8px"
        }
    }

    // document.querySelector(".indiseat").onclick = ()=>{
    //     console.log(`좌석클릭 : ${document.querySelector(".indiseat").value}`)
    // }
})

let cnt = 0
// 예매 개수 4개로 제한
function ck_cnt(obj) {
    socket.send(obj.value)

    if (obj.checked == true){
        cnt++
    }
    else {
        cnt--
    }

    if (cnt > 4) {
        alert('선택 안됨')
        obj.checked = false
        cnt--
        socket.send(obj.value)
    }
    
    console.log(obj.value, cnt)
    
}

