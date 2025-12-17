-- Active: 1761830225502@@127.0.0.1@3306@malang_db
insert into venue_info (venue_name, region, venue_type, seat_class) VALUES 
    ("샤롯데씨어터", "서울", "대극장", "R,S,A"),
    ("드림씨어터", "부산", "대극장", "R,S,A"),
    ("대학로예술극장", "서울", "소극장", "S,A"),
    ("창원성산아트홀", "창원", "소극장", "S,A");

DROP TABLE venue_info;
CREATE TABLE venue_info (
    venue_id INT PRIMARY KEY AUTO_INCREMENT,
    venue_name VARCHAR(50),
    region VARCHAR(10),
    venue_type VARCHAR(50),
    seat_class VARCHAR(10)
);

insert into actor_info (actor_name, actor_profile_url, actor_birth_year, actor_gender) VALUES 
    ('박규원', 'hook_pkw_841761909473010.png','1984','M'),
    ('최호승', 'hook_chs_851761909445555.png','1985','M'),
    ('박상혁', 'hook_psh_991761909601674.png','1999','M'),
    ('김도빈', 'feter_kdb_821761909330222.png','1982','M'),
    ('최민우', 'feter_cmw_921761909027638.png','1992','M'),
    ('동현', 'feter_dh_891761909243536.png','1989','M'),
    ('정우연', 'wendy_jwy_921761909636454.png','1992','F'),
    ('김주연', 'wendy_kjy_931761909650953.png','1993','F'),
    ('박새힘', 'wendy_psh_941761909667609.png','1994','F');

CREATE TABLE performance_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    name VARCHAR(20),
    poster_url varchar(50),
    synopsis_url varchar(50),
    start_date varchar(20),
    end_date varchar(20),
    genre varchar(20),
    running_time int,
    venue_id int,
    reg_date varchar(50),
    is_hidden BOOLEAN,
    resv_status ENUM('OPEN', 'CLOSED', 'PREPARING')
);
INSERT INTO PERFORMANCE_INFO (
    name, poster_url, synopsis_url, start_date, end_date, genre, 
    running_time, venue_id, reg_date, is_hidden, resv_status
)
VALUES (
    '후크',
    'hook_poster176222137',
    'hook_synopsis17622213',
    '2025-11-01',
    '2025-12-31',
    '창작',
    150,
    1,
    '2025-11-04 10:56:17',
    0,
    'PREPARING'
);

DROP TABLE cast_info;
CREATE TABLE cast_info(
    cast_id INT PRIMARY KEY,
    perf_id INT,
    cast_name VARCHAR(50),
    cast_story TEXT,
    FOREIGN KEY (perf_id) REFERENCES performance_info(id)
);
INSERT INTO CAST_INFO (cast_id, perf_id, cast_name, cast_story)
VALUES
    (1, 1, '후크', '난 니들이 알던 후크랑은 달라'),
    (2, 1, '피터', '나랑 놀자. 하루 종일. 놀기 위해 태어났어'),
    (3, 1, '웬디', '여긴 너와 내가 만든 세상, 모든게 가능해');


CREATE TABLE perf_cast(
    perf_cast_id INT PRIMARY KEY AUTO_INCREMENT,
    perf_id INT,
    cast_id INT,
    actor_id INT,
    FOREIGN KEY (perf_id) REFERENCES performance_info(id),
    FOREIGN KEY (cast_id) REFERENCES cast_info(cast_id),
    FOREIGN KEY (actor_id) REFERENCES actor_info(id)
);
INSERT INTO PERF_CAST (perf_id, cast_id, actor_id)
VALUES
    (1, 1, 1),
    (1, 1, 2),
    (1, 1, 3),
    (1, 2, 4),
    (1, 2, 5),
    (1, 2, 6),
    (1, 3, 7),
    (1, 3, 8),
    (1, 3, 9);

DROP TABLE perf_price;
CREATE TABLE perf_price (
    perf_price_id INT PRIMARY KEY AUTO_INCREMENT,
    perf_id INT,
    venue_id INT,
    grade_code ENUM('R', 'S', 'A'),
    price DECIMAL(10, 0),
    FOREIGN KEY (perf_id) REFERENCES performance_info(id)
);
INSERT INTO PERF_PRICE (perf_id, venue_id, grade_code, price)
VALUES
    (1, 1, 'R', 100000),
    (1, 1, 'S', 70000), 
    (1, 1, 'A', 50000);