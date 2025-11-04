-- Active: 1761903911506@@127.0.0.1@3306@malang_db
insert into venue_info (venue_name, region, venue_type) VALUES 
    ("샤롯데씨어터", "서울", "대극장"),
    ("드림씨어터", "부산", "대극장"),
    ("대학로예술극장", "서울", "소극장"),
    ("창원성산아트홀", "창원", "소극장");

INSERT INTO PERFORMANCE_INFO (
    name, 
    poster_url, 
    synopsis_url, 
    start_date, 
    end_date, 
    genre, 
    running_time
) VALUES 
(
    'CABIN', 
    'cabin.jpg', 
    'cabin_syn.jpg', 
    '2024-10-01', 
    '2024-12-31', 
    '창작', 
    150
),
(
    '천로역정', 
    'pilgrims_progress.jpg', 
    'pilgrims_progress_syn.jpg', 
    '2024-11-15', 
    '2025-01-31', 
    '창작', 
    130
),
(
    '김종욱찾기', 
    'finding_kim.jpg', 
    'finding_kim_syn.jpg', 
    '2024-09-01', 
    '2025-03-30', 
    '창작', 
    100
),
(
    '어서오세요, 휴남동 서점입니다', 
    'welcome_hyunam_bookstore.jpg', 
    'welcome_hyunam_bookstore_syn.jpg', 
    '2024-12-01', 
    '2025-02-28', 
    '창작', 
    120
),
(
    '미세스 다웃파이어', 
    'mrs_doubtfire.jpg', 
    'mrs_doubtfire_syn.jpg', 
    '2025-01-20', 
    '2025-04-10', 
    '라이선스', 
    160
);


insert into user_grade (grade_name, grade_image_url, grade_score, discount_rate) VALUES 
    ("입문", 'grade_shape_3.png', 0, 0),
    ("애호", 'grade_shape_4.png', 100000, 0),
    ("열정", 'grade_shape_5.png', 300000, 0.05),
    ("전문", 'grade_shape_6.png', 1000000, 0.08),
    ("명예", 'grade_shape_star.png', 5000000, 0.10);  



    insert into venue_info (venue_name, region, venue_type) VALUES 
    ("샤롯데씨어터", "서울", "대극장"),
    ("드림씨어터", "부산", "대극장"),
    ("대학로예술극장", "서울", "소극장"),
    ("창원성산아트홀", "창원", "소극장");




    insert into actor_info (actor_name, profile_image_url, birth_year, gender) VALUES 
    ('박규원', 'hook_pkw_841761909473010.png','1984','M'),
    ('최호승', 'hook_chs_851761909445555.png','1985','M'),
    ('박상혁', 'hook_psh_991761909601674.png','1999','M'),
    ('김도빈', 'feter_kdb_821761909330222.png','1982','M'),
    ('최민우', 'feter_cmw_921761909027638.png','1992','M'),
    ('정우연', 'wendy_jwy_921761909636454.png','1992','F'),
    ('김주연', 'wendy_kjy_931761909650953.png','1993','F'),
    ('박새힘', 'wendy_psh_941761909667609.png','1994','F'),
    ('동현', 'feter_dh_891761909243536.png','1989','M');
