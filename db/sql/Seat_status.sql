-- Active: 1761632592171@@127.0.0.1@3306@malang_db
DROP TABLE seat_status;
CREATE TABLE seat_status (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT,
    seat_id INT,
    seat_status ENUM('Available', 'Reserved', 'Sold'),
    user_id INT,
    temp_resv_time DATETIME,
    Foreign Key (seat_id) REFERENCES seat_layout(seat_id),
    Foreign Key (schedule_id) REFERENCES perf_schedule(schedule_id)
);

-- INSERT INTO seat_status (schedule_id, seat_id, seat_status)
--     SELECT
--     r.n AS schedule_id,  -- 100개
--     s.n AS seat_id,      -- 270개
--     "Available" AS seat_status
--     FROM (
--     SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
--     UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
--     ) r,
--     (
--     SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
--     UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
--     ) s
--     ORDER BY schedule_id, seat_id;



-- 🔹 1. 1~100까지 temp_r 생성
DROP TEMPORARY TABLE IF EXISTS temp_r;
CREATE TEMPORARY TABLE temp_r AS
WITH RECURSIVE r AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM r WHERE n < 100
)
SELECT n FROM r;

-- 🔹 2. 1~270까지 temp_s 생성
DROP TEMPORARY TABLE IF EXISTS temp_s;
CREATE TEMPORARY TABLE temp_s AS
WITH RECURSIVE s AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM s WHERE n < 270
)
SELECT n FROM s;

-- 🔹 3. seat_status에 삽입
INSERT INTO seat_status (schedule_id, seat_id, seat_status)
SELECT 
    r.n AS schedule_id,
    s.n AS seat_id,
    'Available' AS seat_status
FROM temp_r AS r
CROSS JOIN temp_s AS s
ORDER BY r.n, s.n;