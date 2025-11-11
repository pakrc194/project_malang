create user malang@localhost IDENTIFIED by '1234';

SELECT email FROM user_info WHERE email = 'sck09013@naver.com' && sign_method = 'local'

SELECT email, password FROM USER_INFO WHERE password = '2222'

select 
    user_info.user_name,
    user_info.email,
    reservation_info.resv_id, 
    reservation_info.resv_number,
    reservation_info.final_amount,
    reservation_info.resv_date,
    seat_layout.seat_number,
    perf_schedule.schedule_date, 
    perf_schedule.schedule_time,
    venue_info.venue_name,
    performance_info.poster_url,
    performance_info.perf_name
    
    from reservation_info 
    join user_info on user_info.user_id = reservation_info.user_id 
    join seat_layout on seat_layout.seat_id = reservation_info.seat_id_arr
    join perf_schedule on perf_schedule.schedule_id = reservation_info.schedule_id
    join venue_info on venue_info.venue_id = perf_schedule.venue_id
    join performance_info on performance_info.perf_id = perf_schedule.perf_id

    where user_info.email = 'dlrhkdwo@naver.com'

    
    select
     
     user_info.user_name,
     user_info.email,
     reservation_info.resv_id, 
     reservation_info.resv_number,
     reservation_info.resv_status,
     reservation_info.final_amount,
     reservation_info.resv_date,
     perf_schedule.schedule_date, 
     perf_schedule.schedule_time,
     venue_info.venue_name,
     performance_info.poster_url,
     performance_info.perf_name,
     reservation_info.seat_id_arr
    
     from reservation_info

     join user_info on user_info.user_id = reservation_info.user_id 
     join perf_schedule on perf_schedule.schedule_id = reservation_info.schedule_id
     join venue_info on venue_info.venue_id = perf_schedule.venue_id
     join performance_info on performance_info.perf_id = perf_schedule.perf_id
     where user_info.email = 'dlrhkdwo@naver.com'

     const query(sql, [email], (err, rows)=>{
        const seatArr = rows[0].seat_id_arr.split(',')
     })

  