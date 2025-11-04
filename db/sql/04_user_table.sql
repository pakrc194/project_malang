-- Active: 1761830851051@@127.0.0.1@3306@malang_db
-- 1. USER_GRADE (회원 등급)
drop database malang_db;

CREATE DATABASE malang_db DEFAULT CHARACTER SET utf8mb4;

use malang_db;

CREATE TABLE USER_GRADE (
    grade_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '등급 ID',
    grade_name VARCHAR(50) NOT NULL COMMENT '등급 이름 (예: VIP)',
    grade_score INT NOT NULL COMMENT '등급 기준 누적 점수',
    discount_rate DECIMAL(5, 2) NOT NULL COMMENT '등급 할인율 (예: 0.10)',
    grade_image_url VARCHAR(255) COMMENT '등급 이미지 URL'
);


-- 2. USER_INFO (회원 정보)
CREATE TABLE USER_INFO (
    user_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '사용자 ID',
    email VARCHAR(100) COMMENT '로그인 ID 및 이메일 (탈퇴 시 NULL)',
    password VARCHAR(255) COMMENT '비밀번호 (로컬 로그인 시, 탈퇴 시 NULL)',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    question VARCHAR(255) COMMENT '이메일 찾기 질문',
    answer VARCHAR(255) COMMENT '이메일 찾기 답변',
    sign_method ENUM('local', 'kakao') NOT NULL COMMENT '가입/로그인 방식', 
    account_status ENUM('ACTIVE', 'WITHDRAWAL') NOT NULL DEFAULT 'ACTIVE' COMMENT '계정 상태 (ACTIVE:정상, WITHDRAWAL:탈퇴)',
    score DECIMAL(10, 0) NOT NULL DEFAULT 0 COMMENT '누적 등급 점수',
    grade_id INT NOT NULL COMMENT '회원 등급 FK',
    FOREIGN KEY (grade_id) REFERENCES USER_GRADE(grade_id)
);

-- 3. USER_COUPON (회원 쿠폰)
CREATE TABLE USER_COUPON (
    coupon_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '쿠폰 ID',
    user_id INT NOT NULL COMMENT '회원 FK',
    coupon_name VARCHAR(100) NOT NULL COMMENT '쿠폰 이름',
    discount_value DECIMAL(10, 2) NOT NULL COMMENT '할인 금액',
    issued_date DATE DEFAULT (CURRENT_DATE()) COMMENT '발급일',
    expiry_date DATE COMMENT '만료일',
    is_used BOOLEAN NOT NULL DEFAULT FALSE COMMENT '사용 여부',
    FOREIGN KEY (user_id) REFERENCES USER_INFO(user_id) ON DELETE CASCADE
);

-- 4. ACTOR_INFO (배우 정보) - 이름 변경
CREATE TABLE ACTOR_INFO (
    actor_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '배우 ID',
    actor_name VARCHAR(50) NOT NULL COMMENT '배우 이름',
    birth_year YEAR NOT NULL COMMENT '출생년도',
    gender ENUM('M', 'F') NOT NULL COMMENT '성별',
    profile_image_url VARCHAR(255) COMMENT '프로필 이미지 URL'
);

-- 18. USER_INTEREST_ACTOR (관심 배우) - FK 참조 업데이트
CREATE TABLE USER_INTEREST_ACTOR (
    interest_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK',
    user_id INT NOT NULL COMMENT '회원 FK',
    actor_id INT NOT NULL COMMENT '배우 FK',
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
    FOREIGN KEY (user_id) REFERENCES USER_INFO(user_id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES ACTOR_INFO(actor_id) ON DELETE CASCADE
);