//kakaoLogin.js

const express = require("express")
const router = express.Router()
const qs = require("qs")
const axios = require("axios")
const path = require("path")
const conn = require('../db/db')
const port = 80

// 변수 지정
const client_id = "9010fbf47377b2f34b0e443ad62a2326"
const client_secret = "XeIcIaPxVYR4u4ZKhOT8VUDqAxGzuyhc"
// 이거 리다이렉트 URL이니까 주소마다 바꿔줘야함.
const domain = "http://192.168.0.67/login/kakao"
const redirect_uri = `${domain}/redirect`
const token_uri = "https://kauth.kakao.com/oauth/token"
const api_host = "https://kapi.kakao.com"

// API 요청 함수
async function call(method, uri, param, header) {
  let rtn
  try {
    rtn = await axios({
      method: method,
      url: uri,
      headers: header,
      data: param,
    })
  } catch (err) {
    rtn = err.response
  }
  return rtn.data
}

// 카카오 인증 서버로 인가 코드 발급 요청
router.get("/authorize", function (req, res) {
  console.log("/authorize 라우트 실행됨")

  let { scope } = req.query
  let scopeParam = ""
  if (scope) {
    scopeParam = "&scope=" + scope
  }

  console.log(`url : https://kauth.kakao.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code${scopeParam}`)

  // 인가 코드 response_type=code${scopeParam}` 없으면 못 받은 것임. 
  res.status(302).redirect(
    `https://kauth.kakao.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code${scopeParam}`
  )
})


// 인가 코드 발급 받으면 해당 코드로 토큰 줄 것임. 그걸로 프로필 조회, DB 등록, 메인화면 이동 가능
router.get("/redirect", async function (req, res) {
  const param = qs.stringify({
    grant_type: "authorization_code",
    client_id: client_id,
    redirect_uri: redirect_uri,
    code: req.query.code,
    client_secret: client_secret,
  })

  const header = { "content-type": "application/x-www-form-urlencoded" }
  const rtn = await call("POST", token_uri, param, header)

  console.log("/redirect")

  // 토큰 못받았으면 서버 보안 및 인가 코드 발급 못받아서 그럼.
  if (!rtn.access_token) {
    console.error("토큰 발급 실패:", rtn)
    return res.status(500).send('로그인 실패')
  }

  // 세션 저장
  req.session.key = rtn.access_token
  req.session.isLoggedIn = true

  
  const uri = api_host + "/v2/user/me"
  const header2 = {
    "content-type": "application/x-www-form-urlencoded",
    Authorization: "Bearer " + req.session.key,
  };

  // 이매일, 이름, sign_method는 kakao 상태로 만들어야함.
  const userInfo = await call("POST", uri, {}, header2)
  const kakaoAccount = userInfo.kakao_account || {}
  // name 닉네임/이름/X
  const name = kakaoAccount.profile?.nickname || "이름없음"
  const email = kakaoAccount.email || null
  const sign_method = "kakao"
  const score = 0

  // 1. 이메일 입력 안할 경우
  // 2. 기존 로그인되어 있는 경우 중복처리( results.length > 0)
  // 3. 신규 로그인 시에만 DB에 추가(results.length == 0)

  if (!email) {
    return res.status(400).send("이메일 정보를 불러오지 못합니다")


  }

  //
  const originMember = "SELECT * FROM USER_INFO WHERE email = ?"
  conn.query(originMember, [email], (err, results) => {
    if (err) {
      console.error("DB 에러:", err)
      return res.status(500).send("DB 실패")

    }

    // 결괏값 0이면 DB 추가 insert into 
    if (results.length === 0) {
      const insertQuery = `
        INSERT INTO USER_INFO (user_name, email, score, sign_method)
        VALUES (?, ?, ?, ?)
      `

      conn.query(insertQuery, [name, email, score, sign_method], (err2) => {
        if (err2) {
          console.error("DB 저장 에러:", err2)
          return res.status(500).send("회원 등록 실패")
        }
        console.log("신규 카카오 회원:", email)
      })
    } else {
      console.log("기존 카카오 회원:", email)
    }

    // 세션 저장
    req.session.kakao_email = email
    req.session.kakao_name = name


    // 세션 저장
    req.session.save((err3) => {
      if (err3) {
        console.error("세션 저장 에러:", err3)
        return res.status(500).send("세션 저장 실패")
      }
      // 메인화면 이동
      res.redirect("/main")
    })
  })
})


// 로그아웃 요청
// router.get("/logout", async function (req, res) {
//   const uri = api_host + "/v1/user/logout";
//   const header = {
//     Authorization: "Bearer " + req.session.key
//   };

//   const rtn = await call("POST", uri, null, header);
//   req.session.destroy();
//   res.send(rtn);
// });

// 연결 해제 요청
router.get("/unlink", async function (req, res) {
  const uri = api_host + "/v1/user/unlink";
  const header = {
    Authorization: "Bearer " + req.session.key
  };

  const rtn = await call("POST", uri, null, header);
  req.session.destroy();
  res.send(rtn);
});

module.exports = router;