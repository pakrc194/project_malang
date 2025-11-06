create user malang@localhost IDENTIFIED by '1234';

SELECT email FROM user_info WHERE email = 'sck09013@naver.com' && sign_method = 'local'

SELECT email, password FROM USER_INFO WHERE password = '2222'

select 
    user_info.name AS *user_name* ,
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
    performance_info.name
    
    from reservation_info 
    join user_info on user_info.user_id = reservation_info.user_id 
    join seat_layout on seat_layout.seat_id = reservation_info.seat_id
    join perf_schedule on perf_schedule.schedule_id = reservation_info.schedule_id
    join venue_info on venue_info.venue_id = perf_schedule.venue_id
    join performance_info on performance_info.perf_id = perf_schedule.perf_id

    where user_info.email = 'dlrhkdwo@naver.com'

    
    select DISTINCT seat_status.* from seat_status join perf_schedule JOIN seat_layout where seat_status.schedule_id = perf_schedule.schedule_id 
                
                 and perf_schedule.perf_id = 1
                 and perf_schedule.round = 1
                 and perf_schedule.schedule_date = "2025-11-06"
                 and seat_status.seat_id = (select seat_id from seat_layout where
                 seat_layout.area = "F"
                 and seat_layout.seat_row = 1
                 and seat_layout.seat_number = 1);


    select * from payment_info;

    insert into payment_info(transaction_id, payment_method, amount, payment_date, payment_status, card_number) VALUES
    ('이메일+날짜', 'card', '할인된 금액', '오늘날짜', 'SUCCESS', '받은 카드번호');