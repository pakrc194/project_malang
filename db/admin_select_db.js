let sPrefCastWpid = `SELECT
    PINFO.perf_name,       
    A.actor_name,           
    A.actor_profile_url,    
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
    P.perf_id = ?  -- 특정 공연 ID로 필터링
    
ORDER BY
    CINFO.cast_name, A.actor_name;`


let sPrefScheduleWpid = `SELECT
    S.*, 
    V.*
FROM
    PERF_SCHEDULE AS S
INNER JOIN
    VENUE_INFO AS V ON S.venue_id = V.venue_id
    
WHERE
    S.perf_id = ?         
    
ORDER BY
    S.schedule_date, S.schedule_time`


let sPrefCastIdWpid = `SELECT       
    *            
FROM 
    PERF_CAST AS P
    
INNER JOIN 
    ACTOR_INFO AS A ON P.actor_id = A.actor_id
    
INNER JOIN 
    CAST_INFO AS CINFO ON P.cast_id = CINFO.cast_id
    
INNER JOIN 
    PERFORMANCE_INFO AS PINFO ON P.perf_id = PINFO.perf_id
    
WHERE 
    P.perf_id = ?
    
ORDER BY
    CINFO.cast_id;`

let sScheduleCast = `SELECT
    S.schedule_id,
    S.schedule_date,
    S.schedule_time,
    S.schedule_round,
    CI.cast_name,           
    AI.actor_name,          -- 배우 이름
    AI.actor_profile_url    -- 배우 프로필 사진 URL
FROM
    SCHEDULE_CAST AS SC  -- 스케줄 캐스팅 연결 테이블
INNER JOIN
    PERF_SCHEDULE AS S ON SC.schedule_id = S.schedule_id
INNER JOIN
    CAST_INFO AS CI ON SC.cast_id = CI.cast_id
INNER JOIN
    ACTOR_INFO AS AI ON SC.actor_id = AI.actor_id
WHERE
    S.perf_id = ?
ORDER BY
    S.schedule_date, S.schedule_time, CI.cast_id;`

module.exports = {sPrefCastWpid, sPrefScheduleWpid, sPrefCastIdWpid, sScheduleCast}