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


