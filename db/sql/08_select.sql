-- Active: 1761830225502@@127.0.0.1@3306@malang_db
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

    SELECT
    T1.actor_id,
    AI.actor_name,       
    T1.interest_count
FROM
    (
        
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
    ACTOR_INFO AS AI ON T1.actor_id = AI.actor_id 
ORDER BY
    RAND();

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



UPDATE seat_status SET seat_status = "Sold" 
                WHERE schedule_id = (SELECT schedule_id FROM perf_schedule
                    WHERE schedule_date = "2025-11-29" 
                    AND schedule_round = 1)
                    
                AND seat_id = (SELECT seat_id FROM seat_layout 
                    WHERE area = "F"
                    AND seat_row = 3
                    AND seat_number = 6);

SELECT schedule_id FROM perf_schedule
                    WHERE schedule_date = "2025-11-29" 
                    AND schedule_round = 1
                    AND perf_id = 1


                    SELECT seat_id FROM seat_layout 
                    WHERE area = "F"
                    AND seat_row = 3
                    AND seat_number = 6
                    AND venue_id = 1;


select * from seat_status where schedule_id = 57 and seat_id = 294



select * from schedule_cast where schedule_cast.cast_id = 1

select schedule_cast.cast_id, schedule_cast.actor_id,
perf_schedule.schedule_date, perf_schedule.schedule_time, perf_schedule.schedule_round
 from schedule_cast 
    join perf_schedule on schedule_cast.schedule_id = perf_schedule.schedule_id
    where schedule_cast.cast_id = 1


select schedule_cast.*, CI.cast_name, AI.actor_name,
PS.schedule_date, PS.schedule_time, PS.schedule_round 
from schedule_cast 
join perf_schedule as PS on schedule_cast.schedule_id = PS.schedule_id
and PS.perf_id = 1
JOIN
    CAST_INFO AS CI ON schedule_cast.cast_id = CI.cast_id
JOIN
    ACTOR_INFO AS AI ON schedule_cast.actor_id = AI.actor_id
ORDER BY
    schedule_cast.schedule_id, CI.cast_id;


select actor_info.* from perf_cast 
join actor_info on actor_info.actor_id = perf_cast.actor_id
where perf_cast.cast_id = 1 and perf_cast.perf_id = 1


select * from performance_info join venue_info 
where performance_info.perf_id = venue_info.venue_id 



select schedule_cast.*, CI.cast_name, AI.actor_name,
        PS.schedule_date, PS.schedule_time, PS.schedule_round 
        from schedule_cast 
        join perf_schedule as PS on schedule_cast.schedule_id = PS.schedule_id
        JOIN
            CAST_INFO AS CI ON schedule_cast.cast_id = CI.cast_id
        JOIN
            ACTOR_INFO AS AI ON schedule_cast.actor_id = AI.actor_id
        where ps.perf_id = '1'
        ORDER BY
            schedule_cast.schedule_id, CI.cast_id
        limit 0, 100;


SELECT
        DATE_FORMAT(resv_date, '%Y-%m') AS resv_month,
        SUM(final_amount) AS total_monthly_amount
    FROM
        reservation_info
    WHERE
        final_amount IS NOT NULL 
        AND final_amount > 0 
        -- 최근 6개월의 데이터만 필터링
        AND resv_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
        /* 💡 애플리케이션에서 :selected_month_param 값이 있을 때만 이 줄을 추가 */
        -- AND DATE_FORMAT(resv_date, '%Y-%m') = :selected_month_param 
        AND resv_status='PAID'
    GROUP BY
        resv_month
    ORDER BY
        resv_month;



        SELECT
    -- final_amount의 전체 합계를 계산합니다.
    SUM(final_amount) AS total_amount_last_6_months 
FROM
    reservation_info
WHERE
    -- 유효한 final_amount 값만 포함합니다.
    final_amount IS NOT NULL AND final_amount > 0 
    -- resv_date가 현재 날짜(CURDATE())의 6개월 전보다 크거나 같은지 확인합니다.
    -- (즉, 최근 6개월 기간에 해당되는지 필터링합니다.)
    AND resv_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    and user_id = 7;

select * from user_grade