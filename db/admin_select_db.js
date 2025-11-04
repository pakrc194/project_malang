let sPrefCastWpid = `SELECT
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


module.exports = {sPrefCastWpid, sPrefScheduleWpid}