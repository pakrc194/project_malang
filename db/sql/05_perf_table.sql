-- 5. PERFORMANCE_INFO (공연 정보) - 이름 변경
CREATE TABLE PERFORMANCE_INFO (
    perf_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '공연 ID',
    name VARCHAR(100) NOT NULL COMMENT '공연 이름',
    poster_url VARCHAR(255) COMMENT '포스터 사진 URL',
    synopsis_url VARCHAR(255) COMMENT '시놉시스 사진 URL',
    start_date DATE NOT NULL COMMENT '공연 시작 날짜',
    end_date DATE NOT NULL COMMENT '공연 종료 날짜',
    genre VARCHAR(50) NOT NULL COMMENT '장르',
    running_time INT NOT NULL COMMENT '러닝타임 (분)',
    reg_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '공연 등록일',
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE COMMENT '공연 숨김 처리 여부',
    resv_status ENUM('OPEN', 'CLOSED', 'PREPARING') NOT NULL DEFAULT 'PREPARING' COMMENT '예매 가능 상태'
);

-- 6. CAST_INFO (배역 정보) - 이름 변경 및 FK 참조 업데이트
CREATE TABLE CAST_INFO (
    cast_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '배역 ID',
    perf_id INT NOT NULL COMMENT '공연 FK',
    cast_name VARCHAR(50) NOT NULL COMMENT '배역 이름',
    cast_story TEXT COMMENT '배역 줄거리',
    FOREIGN KEY (perf_id) REFERENCES PERFORMANCE_INFO(perf_id) ON DELETE CASCADE 
);

-- 7. PERF_CAST (공연 기본 캐스팅) - FK 참조 업데이트
CREATE TABLE PERF_CAST (
    perf_cast_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK',
    perf_id INT NOT NULL COMMENT '공연 FK',
    cast_id INT NOT NULL COMMENT '배역 FK',
    actor_id INT NOT NULL COMMENT '배우 FK',
    FOREIGN KEY (perf_id) REFERENCES PERFORMANCE_INFO(perf_id) ON DELETE CASCADE,
    FOREIGN KEY (cast_id) REFERENCES CAST_INFO(cast_id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES ACTOR_INFO(actor_id) ON DELETE CASCADE,
    UNIQUE KEY (perf_id, cast_id, actor_id)
);

-- 8. VENUE_INFO (공연장 정보) - 이름 변경
CREATE TABLE VENUE_INFO (
    venue_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '공연장 ID',
    venue_name VARCHAR(100) NOT NULL COMMENT '공연장 이름',
    venue_type ENUM('대극장', '소극장') NOT NULL COMMENT '공연장 분류',
    region VARCHAR(50) NOT NULL COMMENT '공연장 지역 (예: 서울, 부산)' 
);

-- 9. SEAT_LAYOUT (좌석 배치) - FK 참조 업데이트
CREATE TABLE SEAT_LAYOUT (
    seat_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '좌석 ID',
    venue_id INT NOT NULL COMMENT '공연장 FK',
    area VARCHAR(10) NOT NULL COMMENT '좌석 구역 (A, B, C 등)',
    seat_row VARCHAR(10) NOT NULL COMMENT '좌석 열',
    seat_number INT NOT NULL COMMENT '좌석 번호',
    grade_code ENUM('R', 'S', 'A') NOT NULL COMMENT '좌석 등급 (R, S, A)', 
    FOREIGN KEY (venue_id) REFERENCES VENUE_INFO(venue_id),
    UNIQUE KEY (venue_id, area, seat_row, seat_number)
);

-- 10. PERF_PRICE (공연별/공연장별 좌석 가격) - FK 참조 업데이트
CREATE TABLE PERF_PRICE (
    perf_price_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK',
    perf_id INT NOT NULL COMMENT '공연 FK',
    venue_id INT NOT NULL COMMENT '공연장 FK', 
    grade_code ENUM('R', 'S', 'A') NOT NULL COMMENT '좌석 등급 FK (R, S, A)',
    price DECIMAL(10, 0) NOT NULL COMMENT '좌석 등급별 가격',
    FOREIGN KEY (perf_id) REFERENCES PERFORMANCE_INFO(perf_id) ON DELETE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES VENUE_INFO(venue_id), 
    UNIQUE KEY (perf_id, venue_id, grade_code) 
);

-- 11. PERF_SCHEDULE (공연 스케줄) - FK 참조 업데이트
CREATE TABLE PERF_SCHEDULE (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '스케줄 ID',
    perf_id INT NOT NULL COMMENT '공연 FK',
    venue_id INT NOT NULL COMMENT '공연장 FK',
    schedule_date DATE NOT NULL COMMENT '상영 날짜',
    schedule_time TIME NOT NULL COMMENT '상영 시간 (12:00, 19:00)',
    round INT NOT NULL COMMENT '회차 (일별 1회, 2회)',
    FOREIGN KEY (perf_id) REFERENCES PERFORMANCE_INFO(perf_id) ON DELETE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES VENUE_INFO(venue_id),
    UNIQUE KEY (perf_id, schedule_date, schedule_time)
);

-- 12. SCHEDULE_CAST (스케줄별 최종 캐스팅) - FK 참조 업데이트
CREATE TABLE SCHEDULE_CAST (
    schedule_cast_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK',
    schedule_id INT NOT NULL COMMENT '스케줄 FK',
    cast_id INT NOT NULL COMMENT '배역 FK',
    actor_id INT NOT NULL COMMENT '배우 FK',
    FOREIGN KEY (schedule_id) REFERENCES PERF_SCHEDULE(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (cast_id) REFERENCES CAST_INFO(cast_id),
    FOREIGN KEY (actor_id) REFERENCES ACTOR_INFO(actor_id),
    UNIQUE KEY (schedule_id, cast_id)
);