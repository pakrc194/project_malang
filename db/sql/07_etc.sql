-- 17. REVIEW_INFO (리뷰 정보) - 이름 변경 및 FK 참조 업데이트
CREATE TABLE REVIEW_INFO (
    review_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '리뷰 ID',
    user_id INT NOT NULL COMMENT '작성자 FK',
    perf_id INT NOT NULL COMMENT '공연 FK',
    resv_id INT NOT NULL COMMENT '예매 FK (관람 정보 연결)',
    content TEXT NOT NULL COMMENT '리뷰 내용',
    written_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '작성 날짜',
    blind_status BOOLEAN NOT NULL DEFAULT FALSE COMMENT '관리자 블라인드 여부',
    like_count INT NOT NULL DEFAULT 0 COMMENT '좋아요 수',
    applaud_count INT NOT NULL DEFAULT 0 COMMENT '공감 수',
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE COMMENT '회원 요청 숨김 여부 (좋아요/공감 시 삭제 불가)',
    FOREIGN KEY (user_id) REFERENCES USER_INFO(user_id) ON DELETE CASCADE,
    FOREIGN KEY (perf_id) REFERENCES PERFORMANCE_INFO(perf_id) ON DELETE CASCADE,
    FOREIGN KEY (resv_id) REFERENCES RESERVATION_INFO(resv_id) ON DELETE CASCADE
);

-- 18. REVIEW_REACTION (리뷰 반응) - FK 참조 업데이트
CREATE TABLE REVIEW_REACTION (
    reaction_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'PK',
    review_id INT NOT NULL COMMENT '리뷰 FK',
    user_id INT NOT NULL COMMENT '반응한 회원 FK',
    reaction_type ENUM('LIKE', 'APPLAUSE', 'REPORT') NOT NULL COMMENT '반응 타입 (좋아요/공감/신고)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '반응 일시',
    FOREIGN KEY (review_id) REFERENCES REVIEW_INFO(review_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER_INFO(user_id) ON DELETE CASCADE,
    UNIQUE KEY (review_id, user_id, reaction_type)
);