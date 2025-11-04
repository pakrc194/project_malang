WITH RECURSIVE DateSeries (schedule_date) AS (
    SELECT DATE '2025-11-01'
    UNION ALL
    SELECT DATE_ADD(schedule_date, INTERVAL 1 DAY)
    FROM DateSeries
    WHERE schedule_date < '2025-12-31'
)
INSERT INTO PERF_SCHEDULE (perf_id, venue_id, schedule_date, schedule_time, round)
SELECT
    1,
    1,
    schedule_date,
    time_slot,
    ROW_NUMBER() OVER (PARTITION BY schedule_date ORDER BY time_slot)
FROM
    DateSeries
CROSS JOIN
    (SELECT TIME '14:00:00' AS time_slot UNION ALL SELECT TIME '19:00:00') AS Times
ORDER BY
    schedule_date, time_slot;



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