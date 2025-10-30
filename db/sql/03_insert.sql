-- Active: 1761802030139@@127.0.0.1@3306@malang_db
insert into theater_info (name, location, seat_class) VALUES 
    ("샤롯데씨어터", "서울", "R,S,A"),
    ("드림씨어터", "부산", "R,S,A"),
    ("대학로예술극장", "서울", "S,A"),
    ("창원성산아트홀", "창원", "S,A");

-- let theater = [
--     {name: "샤롯데씨어터", location: "서울", seat_class:"R,S,A"},
--     {name: "드림씨어터", location: "부산", seat_class:"R,S,A"},
--     {name: "대학로예술극장", location: "서울", seat_class:"S,A"},
--     {name: "창원성산아트홀", location: "창원", seat_class:"S,A"},
-- ]


insert into user_info (uid, name, pw, email, score ,sign_method) VALUES 
    (,'김현진','',),
    (,'노민호','',),
    (,'박성진','',),
    (,'박재윤','',),
    (,'이광재','',);


insert into product_info (name, poster, synopsis) VALUES 
    ("hook", "hook_poster.jpg", "hook_synopsis.jpg");

insert into cast_info (pr_id, name, background) VALUES 
    (1, "후크", "난 니들이 알던 후크랑은 달라"),
    (1, "피터", "나랑 놀자. 하루 종일. 놀기 위해 태어났는걸"),
    (1, "웬디", "여긴 너와 내가 만든 세상, 모든게 가능해");

