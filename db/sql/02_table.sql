-- Active: 1761632592171@@127.0.0.1@3306@malang_db
drop table theater_info;

CREATE TABLE theater_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    name VARCHAR(20),
    location varchar(10),
    seat_class varchar(10)
);

drop table perf_schedule;

CREATE TABLE perf_schedule(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    perf_id int,
    venue_id int,
    schedule_date VARCHAR(20),
    round varchar(5),
    schedule_time varchar(20),
    FOREIGN KEY (perf_id) REFERENCES performance_info(id),
    FOREIGN KEY (venue_id) REFERENCES venue_info(id)
);

drop table user_info;

CREATE TABLE user_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    name varchar(10),
    pw varchar(20),
    email VARCHAR(30),
    score int,
<<<<<<< HEAD
    sign_method varchar(10),
    question varchar(50),
    answer varchar(50)
=======
    sign_method varchar(10)  
>>>>>>> psj
);

drop table grade_info;

CREATE TABLE grade_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    name varchar(10),
    shape varchar(50),
    point int,
    discount int,
    coupon_value varchar(10)
);

drop table actor_info;

CREATE TABLE actor_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    name VARCHAR(20),
    birth int,
    gender varchar(5),
    profile varchar(50)
);


drop table cast_info;

CREATE TABLE cast_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    pr_id int,
    name VARCHAR(20),
    background VARCHAR(255)
);

drop table actor_schedule_info;

CREATE TABLE actor_schedule_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    ps_id int,
    ac_id int
);

DROP TABLE seat_temp;
-- 좌석정보 임시 저장할 테이블
CREATE TABLE seat_temp (
    grade VARCHAR(10),
    area VARCHAR(10),
    s_row int,
    s_col int,
    choice_date DATE,
    choice_time int,
    expires DATETIME
);

-- 좌석 가격 테이블
CREATE TABLE seat_price (
    grade VARCHAR(10),
    price int
)

DROP TABLE seat_price;


drop table actor_info;

CREATE TABLE actor_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    actor_name VARCHAR(20),
    birth_year int,
    gender varchar(5),
    profile_image_url varchar(50)
);


drop table perf_info;

CREATE TABLE perf_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    name VARCHAR(20),
    poster varchar(50),
    synopsis varchar(50),
    start_date varchar(20),
    end_date varchar(20),
    genre varchar(20),
    running_time int,
    th_id int,
    reg_date varchar(50)
);

drop table perf_th_price;

CREATE TABLE perf_th_price(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    perf_id int,
    th_id int,
    grade varchar(2),
    price int
);

DROP TABLE user_coupon;

CREATE TABLE user_coupon (
    user_email VARCHAR(30),
    coupon_id VARCHAR(100),
    coupon_issuance_date date,
    expiration_date date,
    coupon_use_date date,
    coupon_state VARCHAR(20)
);

DROP TABLE coupon_info;

CREATE TABLE coupon_info(
    cid VARCHAR(100),
    coupon_name VARCHAR(100),
    discount_price INT
);



DROP TABLE seat_status;
CREATE TABLE seat_status(
    status_id INT,
    schedule_id INT,
    seat_id INT,
    seat_status ENUM('Available', 'Reserved', 'Sold'),
    user_id INT,
    temp_resv_time DATETIME,
    FOREIGN KEY (seat_id) REFERENCES seat_layout(seat_id)
);