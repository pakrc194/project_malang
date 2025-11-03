-- Active: 1761802030139@@127.0.0.1@3306@malang_db
-- 이벤트 스케줄러 켜기
SET GLOBAL event_scheduler = ON;

-- 만료된 데이터 자동 삭제 이벤트 생성
CREATE EVENT IF NOT EXISTS delete_expired_data
ON SCHEDULE EVERY 1 MINUTE
DO
  DELETE FROM temp_data WHERE expires_at <= NOW();

  
DROP EVENT IF EXIStS delete_expired_date;