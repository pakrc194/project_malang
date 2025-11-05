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
        })
    })
})
