-- Active: 1761632592171@@127.0.0.1@3306@malang_db
select * from perf_cast;

select * from perf_cast where perf_id = 1;
select * from performance_info as perf join perf_cast where perf.perf_id = 1;

select * from performance_info join venue_info where performance_info.perf_id = venue_info.venue_id


SELECT
    PINFO.name,       
    A.actor_name,           
    A.profile_image_url,    
    CINFO.cast_name,        
    CINFO.cast_story,        
    P.perf_id,              -- 공연 ID
    P.cast_id,              -- 배역 ID
    P.actor_id              -- 배우 ID
FROM 
    PERF_CAST AS P
    
INNER JOIN 
    ACTOR_INFO AS A ON P.actor_id = A.actor_id
    
INNER JOIN 
    CAST_INFO AS CINFO ON P.cast_id = CINFO.cast_id
    
INNER JOIN 
    PERFORMANCE_INFO AS PINFO ON P.perf_id = PINFO.perf_id
    
WHERE 
    P.perf_id = 1  -- 특정 공연 ID로 필터링
    
ORDER BY
    CINFO.cast_name, A.actor_name;



SELECT
    V.*,          
    S.schedule_date,
    S.schedule_time
FROM
    PERF_SCHEDULE AS S
INNER JOIN
    VENUE_INFO AS V ON S.venue_id = V.venue_id
WHERE
    S.perf_id = 18;


SELECT
    S.*,  -- PERF_SCHEDULE 테이블의 모든 컬럼 (일정 날짜, 시간 등)
    V.* -- VENUE 테이블의 모든 컬럼 (공연장 이름, 주소 등)
FROM
    PERF_SCHEDULE AS S
INNER JOIN
    VENUE_INFO AS V ON S.venue_id = V.venue_id
    
WHERE
    S.perf_id = 19           -- 👈 공연 ID 18로 필터링
    
ORDER BY
    S.schedule_date, S.schedule_time;

select * from cast_info where perf_id = 1;



SELECT
    S.*,                    
    CI.cast_name,
    AI.actor_name,
    AI.profile_image_url
FROM
    SCHEDULE_CAST AS SC
INNER JOIN
    PERF_SCHEDULE AS S ON SC.schedule_id = S.schedule_id
INNER JOIN
    CAST_INFO AS CI ON SC.cast_id = CI.cast_id
INNER JOIN
    ACTOR_INFO AS AI ON SC.actor_id = AI.actor_id
WHERE
    S.perf_id = 1
ORDER BY
    S.schedule_date, S.schedule_time, CI.cast_id;

    select actor_id, count(*) from user_interest_actor group by actor_id ORDER BY count(*) desc;


SELECT
    T1.actor_id,
    AI.actor_name,        -- 👈 배우 이름 추가
    T1.interest_count
FROM
    (
        -- 1. 배우별 관심 사용자 수 카운트 및 상위 5명 선택
        SELECT
            actor_id,
            COUNT(*) AS interest_count
        FROM
            user_interest_actor
        GROUP BY
            actor_id
        ORDER BY
            interest_count DESC
        LIMIT 5
    ) AS T1
INNER JOIN
    ACTOR_INFO AS AI ON T1.actor_id = AI.actor_id  -- 👈 ACTOR_INFO 테이블과 조인
ORDER BY
    RAND();  -- 2. 상위 5명의 순서를 랜덤으로 섞음

select actor_info.*, 
performance_info.perf_name, performance_info.poster_url,
performance_info.start_date, performance_info.end_date
from actor_info 
join perf_cast on actor_info.actor_id = perf_cast.actor_id
join performance_info on performance_info.perf_id = perf_cast.perf_id
where actor_info.actor_id = 7;

select * from performance_info join venue_info 
        where performance_info.perf_id = venue_info.venue_id and 
        performance_info.genre = '오리지널'