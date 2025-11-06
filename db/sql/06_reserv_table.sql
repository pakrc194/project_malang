-- 13. RESERVATION_INFO (예매 정보) - 이름 변경 및 FK 참조 업데이트
CREATE TABLE RESERVATION_INFO (
    resv_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '예매 ID',
    user_id INT NOT NULL COMMENT '회원 FK',
    schedule_id INT NOT NULL COMMENT '스케줄 FK',
    resv_number VARCHAR(50) UNIQUE NOT NULL COMMENT '예매 번호 (고유값)',
    
    total_amount DECIMAL(10, 0) NOT NULL COMMENT '할인 전 총 금액',
    
    used_coupon_id INT COMMENT '사용 쿠폰 FK (NULL 허용)',
    grade_discount_rate_at_resv DECIMAL(5, 2) NOT NULL DEFAULT 0 COMMENT '예매 시점 회원 등급 할인율',
    
    final_amount DECIMAL(10, 0) NOT NULL COMMENT '최종 결제 금액',
    
    resv_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '예매 일시',
    resv_status ENUM('PAID', 'CANCELLED') NOT NULL DEFAULT 'PAID' COMMENT '예매 상태',
    
    FOREIGN KEY (user_id) REFERENCES USER_INFO(user_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES PERF_SCHEDULE(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (used_coupon_id) REFERENCES USER_COUPON(coupon_id)
);


-- 15. PAYMENT_INFO (결제 정보) - 이름 변경 및 FK 참조 업데이트
CREATE TABLE PAYMENT_INFO (
    payment_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '결제 ID',
    resv_id INT UNIQUE NOT NULL COMMENT '예매 FK (1:1 관계)',
    transaction_id VARCHAR(255) UNIQUE NOT NULL COMMENT 'PG사 거래 ID',
    payment_method VARCHAR(50) NOT NULL COMMENT '결제 수단',
    amount DECIMAL(10, 0) NOT NULL COMMENT '실제 결제 금액',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '결제 성공 일시',
    payment_status ENUM('SUCCESS', 'REFUNDED') NOT NULL COMMENT '결제 상태', 
    FOREIGN KEY (resv_id) REFERENCES RESERVATION_INFO(resv_id) ON DELETE CASCADE
);

-- 16. SEAT_STATUS (스케줄별 좌석 상태)
CREATE TABLE SEAT_STATUS (
    status_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '상태 ID',
    schedule_id INT NOT NULL COMMENT '스케줄 FK',
    seat_id INT NOT NULL COMMENT '좌석 FK',
    seat_status ENUM('Available', 'TempReserved', 'Reserved') NOT NULL COMMENT '좌석 상태', 
    user_id INT COMMENT 'TempReserved 상태일 때 임시 예매자',
    temp_resv_time DATETIME COMMENT '임시 예매 시작 시간 (Time-out 관리를 위해 사용)',
    FOREIGN KEY (schedule_id) REFERENCES PERF_SCHEDULE(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES SEAT_LAYOUT(seat_id),
    FOREIGN KEY (user_id) REFERENCES USER_INFO(user_id),
    UNIQUE KEY (schedule_id, seat_id)
);