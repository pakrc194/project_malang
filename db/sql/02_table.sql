-- Active: 1761802030139@@127.0.0.1@3306@malang_db
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
    th_id int,
    date VARCHAR(20),
    round varchar(5),
    time varchar(20)
);

drop table user_info;

CREATE TABLE user_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    uid varchar(20),
    name varchar(10),
    pw varchar(20),
    email VARCHAR(30),
    score int,
    sign_method varchar(10)
);

drop table grade_info;

CREATE TABLE grade_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    uid varchar(20),
    name varchar(10),
    pw varchar(20),
    email VARCHAR(30),
    score int,
    sign_method varchar(10)
);

drop table product_info;

CREATE TABLE product_info(  
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    name VARCHAR(20),
    poster VARCHAR(50),
    synopsis VARCHAR(50)
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
    s_col int
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
    name VARCHAR(20),
    birth int,
    gender varchar(5),
    profile varchar(50)
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
    uid VARCHAR(20),
    cid VARCHAR(100),
    coupon_issuance_date date,
    expiration_date date,
    coupon_use_date date,
    coupon_state VARCHAR(20)
);

DROP TABLE coupon_info;

CREATE TABLE coupon_info(
    cid VARCHAR(100),
    coupon_name VARCHAR(100),
    discount_price int
);