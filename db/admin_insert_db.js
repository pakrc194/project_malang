let iPerfSql = `insert into performance_info (perf_name, poster_url, synopsis_url, start_date, end_date, genre, running_time, venue_id)
                    values(?, ?, ?, ?, ?, ?, ?, ?)`
let iActorSql = `insert into actor_info (actor_name, actor_profile_url, actor_birth_year, actor_gender)
                values(?, ?, ?, ?)`
let iCastSql = `insert into cast_info (perf_id, cast_name, cast_story)
                    values(?, ?, ?)`
let iPerfCastSql = `insert into perf_cast (perf_id, cast_id, actor_id)
                    values(?, ?, ?)`
let iPerfPriceSql = `insert into perf_price (perf_id, venue_id, grade_code, price)
                    values(?, ?, ?, ?)`    
let iPerfScheduleSql = `insert into perf_schedule (perf_id, venue_id, schedule_date, schedule_time, schedule_round)
                    values(?, ?, ?, ?, ?)`    
let iScheduleCastSql = `insert into schedule_cast (schedule_id, cast_id, actor_id)
                    values(?, ?, ?)`

module.exports = {iPerfSql, iActorSql, iCastSql, iPerfCastSql, iPerfPriceSql, iPerfScheduleSql, iScheduleCastSql}