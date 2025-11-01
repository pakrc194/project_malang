-- Active: 1761919734604@@127.0.0.1@3306@malang_db
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


insert into grade_info (name, shape, point, discount, coupon_value) VALUES 
    ("입문", 'grade_shape_3.jpg', 0, 0, 0),
    ("애호", 'grade_shape_4.jpg', 10, 0, 3000),
    ("열정", 'grade_shape_5.jpg', 30, 5, 5000),
    ("전문", 'grade_shape_6.jpg', 100, 8, 10000),
    ("명예", 'grade_shape_star.jpg', 500, 10, 30000);    


insert into actor_info (name, profile, birth, gender) VALUES 
    ('박규원', 'hook_pkw_841761909473010.png','1984','남자'),
    ('최호승', 'hook_chs_851761909445555.png','1985','남자'),
    ('박상혁', 'hook_psh_991761909601674.png','1999','남자'),
    ('김도빈', 'feter_kdb_821761909330222.png','1982','남자'),
    ('최민우', 'feter_cmw_921761909027638.png','1992','남자'),
    ('정우연', 'wendy_jwy_921761909636454.png','1992','여자'),
    ('김주연', 'wendy_kjy_931761909650953.png','1993','여자'),
    ('박새힘', 'wendy_psh_941761909667609.png','1994','여자'),
    ('동현', 'feter_dh_891761909243536.png','1989','남자');
