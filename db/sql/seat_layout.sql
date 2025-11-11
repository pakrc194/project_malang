-- 1. 0~9까지 숫자를 생성하는 임시 테이블 (a, b)
--    두 테이블을 CROSS JOIN 하면 00부터 99까지 100개의 조합이 생성됨
--    (MySQL 8.0 미만에서 효율적인 숫자 생성 방식)
INSERT INTO SEAT_LAYOUT (venue_id, area, seat_row, seat_number, grade_code)
SELECT
    v.id AS venue_id,
    a_area.area_name,
    n_row.num AS seat_row,
    n_num.num AS seat_number,
    CASE
        WHEN a_area.area_name IN ('A', 'B', 'C') THEN 'R'
        WHEN a_area.area_name IN ('D', 'E', 'F') THEN 'S'
        WHEN a_area.area_name IN ('G', 'H', 'I') THEN 'A'
        ELSE NULL
    END AS grade_code
FROM 
    (SELECT 1 AS id UNION ALL SELECT 2 AS id) AS v -- venue_id (1, 2)
CROSS JOIN
    (
      SELECT 1 AS num UNION ALL SELECT 2 UNION ALL SELECT 3
    ) AS n_row -- seat_row (1~3 수동 생성)
CROSS JOIN
    (
      SELECT 1 AS num UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL 
      SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL 
      SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL 
      SELECT 10
    ) AS n_num -- seat_number (1~10 수동 생성)
CROSS JOIN
    (SELECT 'A' AS area_name UNION ALL SELECT 'B' UNION ALL SELECT 'C' UNION ALL 
     SELECT 'D' UNION ALL SELECT 'E' UNION ALL SELECT 'F' UNION ALL
     SELECT 'G' UNION ALL SELECT 'H' UNION ALL SELECT 'I') AS a_area; -- area (A~I)