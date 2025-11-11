function isLoggedIn(req, res, next) {
  if (req.session.email || req.session.kakao_email) {
    // 로그인 상태
    next();
  } else {
    // 로그인 안 한 경우
    res.redirect('/login');
  }
}

module.exports = { isLoggedIn };
