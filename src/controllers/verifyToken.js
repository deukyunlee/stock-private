"use strict";

const jwt = require("jsonwebtoken");
const db = require("../../web.js");

// 토큰 유효한지 테스트 , decoded_user_info로 user_info반환
exports.verifyToken = async (req, res, next) => {
  const userToken = req.headers.authorization; //내가 넣어준부분 jwtToken (프론트에서 헤더로 받아올 내용)
  //{ userId } = req.body;
  if (!userToken) {
    return res
      .status(412)
      .send({ isSuccess: false, code: 412, message: "user token EMPTY" });
  }

  let decoded_user_info;

  try {
    // 요청 헤더에 저장된 토큰(req.headers.authorization)과 비밀키를 사용하여 토큰 반환
    decoded_user_info = jwt.verify(userToken, "jwtsecretkey", {
      ignoreExpiration: true,
    });
  } catch (error) {
    // 인증 실패
    // 유효기간이 초과된 경우
    if (error.name === "TokenExpiredError") {
      return res
        .status(412)
        .json({ isSuccess: false, code: 412, message: "usertoken만료" });
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    return res
      .status(412)
      .json({ isSuccess: false, code: 412, message: "유효하지않은usertoken" });
  }

  db.query(
    "SELECT id, userToken FROM user WHERE id='" +
      decoded_user_info.id +
      "' AND sns='" +
      decoded_user_info.sns +
      "';",
    function (err, result, field) {
      if (result.length) {
        //있으면 userId, userToken 전송
        //console.log(result[0]);
        req.verifiedToken = decoded_user_info;
        //console.log(decoded_user_info);
        next();
      } else {
        return res
          .status(412)
          .json({ isSuccess: false, code: 412, message: "INVALID usertoken" });
      }
    }
  );
};
