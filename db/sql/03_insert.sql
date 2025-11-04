
-- Active: 1761632592171@@127.0.0.1@3306@malang_db
insert into venue_info (venue_name, region, venue_type) VALUES 
    ("샤롯데씨어터", "서울", "대극장"),
    ("드림씨어터", "부산", "대극장"),
    ("대학로예술극장", "서울", "소극장"),
    ("창원성산아트홀", "창원", "소극장");
>>>>>>> psj

insert into user_grade (grade_name, grade_image_url, grade_score, discount_rate) VALUES 
    ("입문", 'grade_shape_3.png', 0, 0),
    ("애호", 'grade_shape_4.png', 100000, 0),
    ("열정", 'grade_shape_5.png', 300000, 0.05),
    ("전문", 'grade_shape_6.png', 1000000, 0.08),
    ("명예", 'grade_shape_star.png', 5000000, 0.10);


insert into actor_info (actor_name, profile_image_url, birth_year, gender) VALUES 
    ('박규원', 'hook_pkw_841761909473010.png','1984','M'),
    ('최호승', 'hook_chs_851761909445555.png','1985','M'),
    ('박상혁', 'hook_psh_991761909601674.png','1999','M'),
    ('김도빈', 'feter_kdb_821761909330222.png','1982','M'),
    ('최민우', 'feter_cmw_921761909027638.png','1992','M'),
    ('동현', 'feter_dh_891761909243536.png','1989','M'),
    ('정우연', 'wendy_jwy_921761909636454.png','1992','F'),
    ('김주연', 'wendy_kjy_931761909650953.png','1993','F'),
    ('박새힘', 'wendy_psh_941761909667609.png','1994','F');


<<<<<<< HEAD
insert into product_info (name, poster, synopsis) VALUES 
    ("hook", "hook_poster.jpg", "hook_synopsis.jpg");

insert into cast_info (pr_id, name, background) VALUES 
    (1, "후크", "난 니들이 알던 후크랑은 달라"),
    (1, "피터", "나랑 놀자. 하루 종일. 놀기 위해 태어났는걸"),
    (1, "웬디", "여긴 너와 내가 만든 세상, 모든게 가능해");


ALTER TABLE USER_INFO
MODIFY COLUMN sign_method ENUM('local', 'kakao', 'admin') NOT NULL COMMENT '가입/로그인 방식';

insert into user_grade (grade_name, grade_image_url, grade_score, discount_rate) VALUES 
    ("입문", 'grade_shape_3.png', 0, 0),
    ("애호", 'grade_shape_4.png', 100000, 0),
    ("열정", 'grade_shape_5.png', 300000, 0.05),
    ("전문", 'grade_shape_6.png', 1000000, 0.08),
    ("명예", 'grade_shape_star.png', 5000000, 0.10);  

    ALTER TABLE user_info 
MODIFY grade_id INT NOT NULL DEFAULT 1 COMMENT '회원 등급 FK';

=======
-- insert into cast_info (pr_id, name, background) VALUES 
--     (1, "후크", "난 니들이 알던 후크랑은 달라"),
--     (1, "피터", "나랑 놀자. 하루 종일. 놀기 위해 태어났는걸"),
--     (1, "웬디", "여긴 너와 내가 만든 세상, 모든게 가능해");
>>>>>>> psj
