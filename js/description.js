function click_poster(){
    console.log('포스터 클릭')
    document.querySelector(".big_poster").style.display = "block"
    document.querySelector("body").style.overflow="hidden"
}

function ck_big(){
    console.log('큰 포스터 클릭')
    document.querySelector("body").style.overflow = "none"
    document.querySelector(".big_poster").style.display = "none"
}