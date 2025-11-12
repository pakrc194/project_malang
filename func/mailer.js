const nodemailer = require('nodemailer');
require('dotenv').config();

// Gmail transporter 생성
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 연결 테스트
transporter.verify((err, success) => {
  if (err) console.error('메일 서버 연결 실패:', err);
  else console.log('메일 서버 연결 성공');
});

// 인증 메일 전송 함수
async function sendVerificationEmail(toEmail, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: '회원가입 인증코드',
    text: `인증코드는 ${code} 입니다. 5분 내에 입력해주세요.`,
  };

  await transporter.sendMail(mailOptions);
  console.log(`인증코드 ${code}가 ${toEmail} 로 전송됨`);
}

module.exports = { sendVerificationEmail };