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


-- 좌석 가격
INSERT INTO seat_price (grade, price) VALUES
    ("R", 160000),
    ("S", 130000),
    ("A", 90000);

    insert into actor_info (name, profile, birth, gender) VALUES 
    ('박규원', 'hook_pkw_841761909473010.png','1984','M'),
    ('최호승', 'hook_chs_851761909445555.png','1985','M'),
    ('박상혁', 'hook_psh_991761909601674.png','1999','M'),
    ('김도빈', 'feter_kdb_821761909330222.png','1982','M'),
    ('최민우', 'feter_cmw_921761909027638.png','1992','M'),
    ('정우연', 'wendy_jwy_921761909636454.png','1992','F'),
    ('김주연', 'wendy_kjy_931761909650953.png','1993','F'),
    ('박새힘', 'wendy_psh_941761909667609.png','1994','F'),
    ('동현', 'feter_dh_891761909243536.png','1989','M');

    INSERT INTO coupon_info VALUES
    (1, "첫번째_쿠폰", 10000),
    (2, "두번째_쿠폰", 20000),
    (3, "세번째_쿠폰", 30000),
    (4, "네번째_쿠폰", 40000),
    (5, "다섯번째_쿠폰", 50000);

    DROP TABLE seat_layout;
    CREATE TABLE seat_layout(
        seat_id INT PRIMARY KEY AUTO_INCREMENT,
        venue_id INT,
        area VARCHAR(10),
        seat_row INT,
        seat_number INT,
        grade_code ENUM('R', 'S', 'A')
    );
    -- INSERT INTO SEAT_LAYOUT (venue_id, area, seat_row, seat_number, grade_code)
    -- SELECT
    -- 1 AS venue_id,
    -- 'I' AS area,
    -- r.n AS seat_row,
    -- s.n AS seat_number,
    -- 'A' AS grade_code
    -- FROM (
    -- SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    -- ) r,
    -- (
    -- SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    -- UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    -- ) s
    -- ORDER BY seat_row, seat_number;

    INSERT INTO SEAT_LAYOUT (venue_id, area, seat_row, seat_number, grade_code)
SELECT
    1 AS venue_id,
    a.area,
    r.n AS seat_row,
    s.n AS seat_number,
    CASE
        WHEN a.area IN ('A','B','C') THEN 'R'
        WHEN a.area IN ('D','E','F') THEN 'S'
        WHEN a.area IN ('G','H','I') THEN 'A'
    END AS grade_code
FROM
    (SELECT 'A' AS area UNION SELECT 'B' UNION SELECT 'C'
     UNION SELECT 'D' UNION SELECT 'E' UNION SELECT 'F'
     UNION SELECT 'G' UNION SELECT 'H' UNION SELECT 'I') a,
    (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) r,
    (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
     UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) s
ORDER BY a.area, r.n, s.n;

