-- Active: 1761903911506@@127.0.0.1@3306@malang_db
insert into venue_info (venue_name, region, venue_type) VALUES 
    ("샤롯데씨어터", "서울", "대극장"),
    ("드림씨어터", "부산", "대극장"),
    ("대학로예술극장", "서울", "소극장"),
    ("창원성산아트홀", "창원", "소극장");

INSERT INTO PERFORMANCE_INFO (
    name, 
    poster_url, 
    synopsis_url, 
    start_date, 
    end_date, 
    genre, 
    running_time
) VALUES 
(
    'CABIN', 
    'cabin.jpg', 
    'cabin_syn.jpg', 
    '2024-10-01', 
    '2024-12-31', 
    '창작', 
    150
),
(
    '천로역정', 
    'pilgrims_progress.jpg', 
    'pilgrims_progress_syn.jpg', 
    '2024-11-15', 
    '2025-01-31', 
    '창작', 
    130
),
(
    '김종욱찾기', 
    'finding_kim.jpg', 
    'finding_kim_syn.jpg', 
    '2024-09-01', 
    '2025-03-30', 
    '창작', 
    100
),
(
    '어서오세요, 휴남동 서점입니다', 
    'welcome_hyunam_bookstore.jpg', 
    'welcome_hyunam_bookstore_syn.jpg', 
    '2024-12-01', 
    '2025-02-28', 
    '창작', 
    120
),
(
    '미세스 다웃파이어', 
    'mrs_doubtfire.jpg', 
    'mrs_doubtfire_syn.jpg', 
    '2025-01-20', 
    '2025-04-10', 
    '라이선스', 
    160
);