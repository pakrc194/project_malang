window.addEventListener('DOMContentLoaded', function(){
    let area = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
    let row = ["first", "second", "third"]
    let color = ["red", "green", "blue"]

    for(let aa = 0; aa < 3; aa++) {

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 12; j++) {
                document.querySelector(`.${row[aa]} > .section`).innerHTML += `<input type="checkbox" value="${area[aa*3]} ${i+1} ${j+1}" onclick="ck_cnt(this)">`
            }
        }
        for (let i = 1; i < 12*10+1; i++) {
            document.querySelector(`.${row[aa]} > .section:nth-of-type(1) > input:nth-of-type(${i})`).style.marginLeft = "8px"
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 12; j++) {
                document.querySelector(`.${row[aa]} > .section ~ .section`).innerHTML += `<input type="checkbox" value="${area[aa*3+1]} ${i+1} ${j+1}" onclick="ck_cnt(this)">`
            }
        }
        for (let i = 1; i < 12*10+1; i++) {
            document.querySelector(`.${row[aa]} > .section ~ .section > input:nth-of-type(${i})`).style.marginLeft = "8px"
        }

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 12; j++) {
                document.querySelector(`.${row[aa]} > .section ~ .section ~ .section`).innerHTML += `<input type="checkbox" value="${area[aa*3+2]} ${i+1} ${j+1}" onclick="ck_cnt(this)">`
            }
        }
        for (let i = 1; i < 12*10+1; i++) {
            document.querySelector(`.${row[aa]} > .section ~ .section ~ .section > input:nth-of-type(${i})`).style.marginLeft = "8px"
        }
    }

    document.querySelector(".reserve").onclick
})

let cnt = 0
// 예매 개수 4개로 제한
function ck_cnt(obj) {
    
    if (obj.checked == true){
        cnt++
    }
    else {
        cnt--
    }
    if (cnt > 4){
        alert('선택 안됨')
        obj.checked = false
        --cnt
    }
    console.log(obj.value, cnt)
    
}

