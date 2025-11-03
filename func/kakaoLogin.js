//kakaoLogin.js

const express = require("express");
//const session = require("express-session");
const router = express.Router();
//const loginRouter = require('../routes/loginRouter');
const qs = require("qs");
const axios = require("axios");
const path = require("path");
const conn = require('../db/db')
//const app = express();
const port = 80;


// 변수 지정
const client_id = "9010fbf47377b2f34b0e443ad62a2326";               // 내 앱의 REST API 키로 변경 필수
const client_secret = "XeIcIaPxVYR4u4ZKhOT8VUDqAxGzuyhc";
const domain = "http://192.168.0.22/login/kakao";
const redirect_uri = `${domain}/redirect`;
const token_uri = "https://kauth.kakao.com/oauth/token"; // 액세스 토큰 요청을 보낼 카카오 인증 서버 주소 
const api_host = "https://kapi.kakao.com";               // 카카오 API 호출 서버 주소


// API 요청 함수 정의
async function call(method, uri, param, header) {
  let rtn;
  try {
    // 지정된 method, uri, param, header 값을 사용해 카카오 API 서버로 HTTP 요청 전송
    rtn = await axios({
      method: method,   // "POST" 또는 "GET" 등 HTTP 메서드
      url: uri,         // 요청할 API 주소
      headers: header,  // 요청 헤더 (예: Content-Type, Authorization 등)
      data: param,      // 전송할 요청 데이터 (body)
    });


  } catch (err) {
    // 오류 발생 시, 응답 객체에서 오류 응답 내용 저장
    rtn = err.response;
  }
  // 요청 성공 또는 실패에 상관없이 응답 데이터 반환
  return rtn.data;
}


// 카카오 인증 서버로 인가 코드 발급 요청
router.get("/authorize", function (req, res) {
  console.log("/authorize 라우트 실행됨");

  let { scope } = req.query;
  let scopeParam = "";
  if (scope) {
    scopeParam = "&scope=" + scope;
  }

  console.log(`url : https://kauth.kakao.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code${scopeParam}`)
  // 카카오 인증 서버로 리다이렉트
  // 사용자 동의 후 리다이렉트 URI로 인가 코드가 전달
  console.log("session", req.session)
  //만약 인가코드가 이미 있으면 세션 삭제



  res.status(302).redirect(
    `https://kauth.kakao.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code${scopeParam}`
  );
});



// 카카오 인증 서버에서 전달받은 인가 코드로 액세스 토큰 발급 요청
router.get("/redirect", async function (req, res) {
  // 인가 코드 발급 요청에 필요한 파라미터 구성
  const param = qs.stringify({
    grant_type: "authorization_code",   // 인증 방식 고정값
    client_id: client_id,               // 내 앱의 REST API 키
    redirect_uri: redirect_uri,         // 등록된 리다이렉트 URI
    code: req.query.code,               // 전달받은 인가 코드
    client_secret: client_secret,       // 선택: 클라이언트 시크릿(Client Secret) 사용 시 추가
  });

  // API 요청 헤더 설정
  const header = { "content-type": "application/x-www-form-urlencoded" };

  // 카카오 인증 서버에 액세스 토큰 요청
  const rtn = await call("POST", token_uri, param, header);

  console.log("/redirect");


  //수정: 토큰 발급 실패 시 처리
  if (!rtn.access_token) {
    console.error("토큰 발급 실패:", rtn);
    // 에러 발생 시 로그인 페이지로 다시 리다이렉트 (로그인 실패 처리)
    return res.status(500).send('로그인 실패');
  }

  // 발급받은 액세스 토큰을 세션에 저장 (로그인 상태 유지 목적)
  req.session.key = rtn.access_token;

  // 발급받은 액세스 토큰을 세션에 저장
  req.session.isLoggedIn = true; // 로그인 상태를 나타내는 공통 키 추가



  req.session.save((err) => {
    if (err) {
      return res.status(500).send("세션 저장 실패");
    }
    res.redirect(`/main`); // 프로필 조회 페이지로 리다이렉트
  });

  // 로그인 완료 후 메인 페이지로 이동

});

// 로그인 버튼 누르면 바로 DB에 추가되거나 중복되면 빼는 식으로
router.get("/profile", async function (req, res) {
  // session.key 업으면 정보 받지 못했으니까 
  if (!req.session.key) {
    return res.status(401).send({ msg: "로그인 필요"});
  }

  const uri = api_host + "/v2/user/me";
  const header = {
    "content-type": "application/x-www-form-urlencoded",
    Authorization: "Bearer " + req.session.key,
  };

  const rtn = await call("POST", uri, {}, header);
  const kakaoAccount = rtn.kakao_account || {};

  // 카카오 계정에서 필요한 정보 추출하기 이름, 이메일
  //const name = kakaoAccount.profile?.nickname || "이름없음";
  const name = kakaoAccount.name || "이름없음";
  const email = kakaoAccount.email || null;
  const sign_method = "kakao";
  const score = 0; // 신규 회원 기본값

  // 이메일 없을 경우 메시지 처리
  if (!email) {
    return res.status(400).send("이메일 정보를 불러오지 못합니다");
  }

  // 기존 가입자
  const originMember = "SELECT * FROM USER_INFO WHERE email = ?";
  conn.query(originMember, [email], (err, results) => {
    if (err) {
      console.error("DB 에러:", err);
      return res.status(500).send("DB 실패");
    }

    // 값이 0이면 정보 받아들여야함.
    if (results.length === 0) {
      // 신규 로그인
      const insertQuery = `
        INSERT INTO USER_INFO (name, email, score, sign_method)
        VALUES (?, ?, ?, ?)
      `;
      conn.query(insertQuery, [name, email, score, sign_method], (err2) => {
        if (err2) {
          console.error("DB 저장 오류:", err2);
          return res.status(500).send("회원 등록 실패");
        }
        console.log("신규 카카오 회원:", email);
      });
    } else {
      console.log("기존 카카오 회원:", email);
    }

    //세션 등록
    req.session.isLoggedIn = true;
    req.session.kakao_email = email;
    req.session.kakao_name = name;

    req.session.save((err3) => {
      if (err3) {
        console.error("세션 저장 오류:", err3);
        return res.status(500).send("세션 저장 실패");
      }
      //로그인 후 메인화면으로 이동
      res.redirect("/main");
      //res.redirect("/login/kakao/profile");
    });
  });
});


// 로그아웃 요청: 세션을 종료하고 사용자 로그아웃 처리
router.get("/logout", async function (req, res) {
  const uri = api_host + "/v1/user/logout";  // 로그아웃 API 주소
  const header = {
    Authorization: "Bearer " + req.session.key  // 세션에 저장된 액세스 토큰 전달
  };

  const rtn = await call("POST", uri, null, header);  // 카카오 API에 로그아웃 요청 전송
  req.session.destroy();  // 세션 삭제 (로그아웃 처리)
  res.send(rtn);  // 응답 결과 클라이언트에 반환
});

// 연결 해제 요청: 사용자와 앱의 연결을 해제하고 세션 종료
router.get("/unlink", async function (req, res) {
  const uri = api_host + "/v1/user/unlink";  // 연결 해제 API 주소
  const header = {
    Authorization: "Bearer " + req.session.key  // 세션에 저장된 액세스 토큰 전달
  };

  const rtn = await call("POST", uri, null, header);  // 카카오 API에 연결 해제 요청 전송
  req.session.destroy();  // 세션 삭제 (연결 해제 처리)
  res.send(rtn);  // 응답 결과 클라이언트에 반환
});

module.exports = router;
