
const express = require('express');
const router = express.Router()
const conn = require('../db/db')
const path = require('path');

// 이메일
const { sendVerificationEmail } = require('../func/mailer'); 
let emailCodes = {};

// 정적 파일
router.use(express.static(path.join(__dirname, '../views')));

// POST 처리
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// 화면
router.get('/', (req, res) => {
const loginout = req.session.email || req.session.kakao_email
    const name = req.session.user_name
  res.render('../views/mypage/joinmem.html', loginout, name)
    // res.sendFile(path.join(__dirname, '../views/mypage/joinmem.html'))
})

// 이메일 중복 확인(joinmemRouter.js) => 아직 중복 확인 안함(베타)
router.post('/emailoverlap', (req, res) => {
    console.log('이메일 중복확인 요청:', req.body);

    const email1 = req.body.email1;
    const email2 = req.body.email2;
    const email = email1 + email2;

    if (!email1 || !email2) {
        return res.json({ success: false, message: '이메일을 입력하세요.' });
    }

    const sql = `SELECT COUNT(*) AS cnt FROM user_info WHERE email = ?`;

    conn.query(sql, [email], (err, rows) => {
        if (err) {
            console.error('이메일 중복확인 DB 에러:', err.message);
            return res.json({ success: false, message: 'DB 오류가 발생했습니다.' });
        }

        const count = rows[0].cnt;
        console.log('이메일 중복 개수:', count);

        if (count > 0) {
            // 이미 존재하는 이메일 (local 또는 kakao 포함)
            return res.json({
                success: false,
                message: '중복된 이메일입니다. 다른 이메일을 사용하세요.'
            });
        } else {
            // 사용 가능한 이메일
            return res.json({
                success: true,
                message: '사용 가능한 이메일입니다.'
            });
        }
    });
});

// 이메일 인증 코드
router.post('/sendEmail', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: '이메일을 입력하세요.' });
  }

  //
  const allowedDomains = ['gmail.com', 'naver.com'];
  const domain = email.split('@')[1];
  if (!allowedDomains.includes(domain)) {
    return res.json({ success: false, message: '구글 또는 네이버 이메일만 사용 가능합니다.' });
  }

  // 6자리 인증 코드
  const code = Math.floor(100000 + Math.random() * 900000);
  emailCodes[email] = { code, expires: Date.now() + 5 * 60 * 1000 }; // 5분 유효

  try {
    await sendVerificationEmail(email, code); // mailer.js의 함수 사용
    res.json({ success: true, message: '인증코드가 이메일로 전송되었습니다.' });
  } catch (err) {
    console.error('메일 전송 실패:', err);
    res.status(500).json({ success: false, message: '메일 전송 실패' });
  }
});

// 인증코드 확인
router.post('/verifyCode', (req, res) => {
  const { email, code } = req.body;
  const record = emailCodes[email];

  if (!record) {
    return res.json({ success: false, message: '인증 요청이 없습니다.' });
  }

  if (Date.now() > record.expires) {
    delete emailCodes[email];
    return res.json({ success: false, message: '인증코드가 만료되었습니다.' });
  }

  if (record.code.toString() === code.toString()) {
    req.session.verifiedEmail = email;
    delete emailCodes[email];
    return res.json({ success: true, message: '이메일 인증이 성공하였습니다.' });
  } else {
    return res.json({ success: false, message: '인증코드가 일치하지 않습니다.' });
  }
});

// 회원가입 버튼 email(이메일), name(이름), pw1(비밀번호), pw2(비밀번호 확인), question(질문), answer(답변)

// 1. 입력안할 경우
// 2. 비밀번호 일치 X (pw1 !== pw2)
// 3. email, name, password, question, answer, score, sign_method DB에 저장 sign_method는 local 처리
// 4. 이메일 인증 안할 경우

router.post('/submit', (req, res) => {
  const { email, name, pw1, pw2, question, answer } = req.body;

  // 1. 필수 항목 확인
  if (!email || !name || !pw1 || !pw2 || !answer) {
    return res.json({ success: false, message: '모든 항목을 입력하세요.' });
  }

  // 2. 비밀번호 일치 확인
  if (pw1 !== pw2) {
    return res.json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
  }

  // 6. 비밀번호 정규식
  const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#&*])[A-Za-z\d!@#&*]{8,16}$/;
  if (!pwRegex.test(pw1)) {
    return res.json({
      success: false,
      message: '8~16자, 영문자, 숫자, 특수문자(!,@,#,&,*)를 포함해야 합니다'
    });
  }

  // 3. 이메일 인증 확인
  if (!req.session.verifiedEmail || req.session.verifiedEmail !== email) {
    return res.json({ success: false, message: '이메일 인증이 필요합니다.' });
  }

  // 4. 이메일 중복 체크 후 DB 저장
  const checkSql = 'SELECT COUNT(*) AS cnt FROM USER_INFO WHERE email = ?';
  conn.query(checkSql, [email], (err, rows) => {
    if (err) return res.json({ success: false, message: 'DB 조회 오류' });
    if (rows[0].cnt > 0) {
      return res.json({ success: false, message: '이미 가입된 이메일입니다.' });
    }

    // 5. 중복 없을 때 회원가입 처리
    const sql = 'INSERT INTO USER_INFO (email, user_name, password, question, answer, score, sign_method) VALUES (?, ?, ?, ?, ?, 0, "local")';
    conn.query(sql, [email, name, pw1, question, answer], (err, result) => {
      if (err) {
        console.error('회원가입 실패:', err.message);
        return res.json({ success: false, message: '회원가입 실패하였습니다.' });
      }

      console.log('회원가입 성공:', result);
      req.session.verifiedEmail = null; // 인증 정보 초기화
      res.json({ success: true, message: '회원가입되었습니다.', redirect: '/login' });
    });
  });
});

    module.exports = router;

