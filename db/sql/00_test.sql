select *
        from actor_info
        join schedule_cast on actor_info.actor_id = schedule_cast.actor_id 
        join perf_schedule on schedule_cast.schedule_id = perf_schedule.schedule_id 
        join performance_info on perf_schedule.perf_id = performance_info.perf_id
        where actor_info.actor_id =2