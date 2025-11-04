-- Active: 1761802030139@@127.0.0.1@3306@malang_db

    -- WITH RECURSIVE DateSeries (schedule_date) AS (
    --     SELECT DATE('2025-11-01')
    --     UNION ALL
    --     SELECT DATE_ADD(schedule_date, INTERVAL 1 DAY)
    --     FROM DateSeries
    --     WHERE schedule_date < DATE('2025-12-31')
    -- )
    -- INSERT INTO PERF_SCHEDULE (perf_id, venue_id, schedule_date, schedule_time, round)
    -- SELECT
    --     1,
    --     1,
    --     schedule_date,
    --     time_slot,
    --     ROW_NUMBER() OVER (PARTITION BY schedule_date ORDER BY time_slot)
    -- FROM
    --     DateSeries
    -- CROSS JOIN
    --     (SELECT TIME('14:00:00') AS time_slot UNION ALL SELECT TIME('19:00:00')) AS Times;

        

-- 1️⃣ 먼저 재귀 CTE 결과를 임시 테이블로 생성
CREATE TEMPORARY TABLE tmp_dates AS
WITH RECURSIVE DateSeries (schedule_date) AS (
    SELECT DATE('2025-11-01')
    UNION ALL
    SELECT DATE_ADD(schedule_date, INTERVAL 1 DAY)
    FROM DateSeries
    WHERE schedule_date < DATE('2025-12-31')
)
SELECT schedule_date
FROM DateSeries;

-- 2️⃣ 그 임시 테이블을 이용해 INSERT 실행
INSERT INTO PERF_SCHEDULE (perf_id, venue_id, schedule_date, schedule_time, round)
SELECT
    1 AS perf_id,
    1 AS venue_id,
    d.schedule_date,
    t.time_slot,
    ROW_NUMBER() OVER (PARTITION BY d.schedule_date ORDER BY t.time_slot) AS round
FROM
    tmp_dates d
CROSS JOIN
    (SELECT TIME('14:00:00') AS time_slot
     UNION ALL
     SELECT TIME('19:00:00')) AS t;

-- 3️⃣ 필요하면 임시 테이블 삭제
DROP TEMPORARY TABLE IF EXISTS tmp_dates;





-- 1. 모든 스케줄 ID (1번부터 122번까지)를 생성하는 CTE
WITH RECURSIVE ScheduleSeries (schedule_id, schedule_index) AS (
    -- 시작점 (첫 스케줄 ID와 인덱스 0)
    SELECT 1, 0
    UNION ALL
    -- 재귀 (다음 스케줄 ID와 인덱스 증가)
    SELECT schedule_id + 1, schedule_index + 1
    FROM ScheduleSeries
    WHERE schedule_id < 122 -- 총 스케줄 개수 (11/1 ~ 12/31 = 61일 * 2회 = 122회)
),
-- 2. 배역별 배우 로테이션 목록 정의
CastRotation (cast_id, actor_list, list_length) AS (
    SELECT 1, '1,2,3', 3 UNION ALL
    SELECT 2, '4,5,6', 3 UNION ALL
    SELECT 3, '7,8,9', 3
)
-- 3. 모든 데이터를 결합하여 SCHEDULE_CAST에 삽입
INSERT INTO SCHEDULE_CAST (schedule_id, cast_id, actor_id)
SELECT
    S.schedule_id,
    CR.cast_id,
    -- 로테이션 인덱스 계산: (스케줄 순번 % 배우 목록 길이) + 1
    SUBSTRING_INDEX(
        SUBSTRING_INDEX(CR.actor_list, ',', (S.schedule_index % CR.list_length) + 1),
        ',', -1
    ) AS actor_id
FROM
    ScheduleSeries AS S
CROSS JOIN
    CastRotation AS CR
ORDER BY
    S.schedule_id, CR.cast_id;


CREATE TABLE schedule_cast(
    schedule_cast_id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT,
    cast_id INT,
    actor_id INT,
    Foreign Key (schedule_id) REFERENCES perf_schedule(id),
    Foreign Key (cast_id) REFERENCES cast_info(cast_id),
    Foreign Key (actor_id) REFERENCES actor_info(id)
);


    -- Step 1: CTE 결과 미리 확인
-- (기존 테이블이 있으면 삭제)
DROP TEMPORARY TABLE IF EXISTS tmp_schedule_cast;

-- 1️⃣ 재귀 CTE + 캐스트 목록을 임시 테이블로 저장
CREATE TEMPORARY TABLE tmp_schedule_cast AS
WITH RECURSIVE ScheduleSeries (schedule_id, schedule_index) AS (
    SELECT 1, 0
    UNION ALL
    SELECT schedule_id + 1, schedule_index + 1
    FROM ScheduleSeries
    WHERE schedule_id < 122 -- 122회 (61일 * 2)
),
CastRotation (cast_id, actor_list, list_length) AS (
    SELECT 1, '1,2,3', 3 UNION ALL
    SELECT 2, '4,5,6', 3 UNION ALL
    SELECT 3, '7,8,9', 3
)
SELECT
    S.schedule_id,
    CR.cast_id,
    SUBSTRING_INDEX(
        SUBSTRING_INDEX(CR.actor_list, ',', (S.schedule_index % CR.list_length) + 1),
        ',', -1
    ) AS actor_id
FROM
    ScheduleSeries AS S
CROSS JOIN
    CastRotation AS CR
ORDER BY
    S.schedule_id, CR.cast_id;


INSERT INTO SCHEDULE_CAST (schedule_id, cast_id, actor_id)
SELECT schedule_id, cast_id, actor_id
FROM tmp_schedule_cast;


-- Step 2: 결과 확인 후 INSERT INTO SCHEDULE_CAST (...) SELECT ... 붙이기
-- INSERT INTO SCHEDULE_CAST (schedule_id, cast_id, actor_id)
-- SELECT
--     S.schedule_id,
--     CR.cast_id,
--     -- 로테이션 인덱스 계산: (스케줄 순번 % 배우 목록 길이) + 1
--     SUBSTRING_INDEX(
--         SUBSTRING_INDEX(CR.actor_list, ',', (S.schedule_index % CR.list_length) + 1),
--         ',', -1
--     ) AS actor_id
-- FROM
--     ScheduleSeries AS S
-- CROSS JOIN
--     CastRotation AS CR
-- ORDER BY
--     S.schedule_id, CR.cast_id;