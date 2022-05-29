'use strict'

const jwt = require('jsonwebtoken');
const db = require("../../web.js");

// 토큰 유효한지 테스트 , decoded_user_info로 user_info반환
exports.verifyToken = async (req, res, next) => {
  const userToken = req.headers.authorization; //내가 넣어준부분 jwtToken (프론트에서 헤더로 받아올 내용)
  if(!userToken) {
    res.status(412).send({ "isSuccess": false, "code": 412, "message": "[ERROR] UserToken EMPTY" })
    return;
  }

  let decoded_user_info;
  
  try {
    // 요청 헤더에 저장된 토큰(req.headers.authorization)과 비밀키를 사용하여 토큰 반환
    decoded_user_info = jwt.verify(userToken, "jwtsecretkey", {
      ignoreExpiration: true,
    });
    //console.log(decoded_user_info)

    db.query("SELECT id, userToken FROM user WHERE id='" +decoded_user_info.id+ "' AND sns='"+decoded_user_info.sns+"';", function(err, result, field){
      if (result.length) { //있으면 userId, userToken 전송
        //console.log(result[0]);
        req.verifiedToken = decoded_user_info;
        //console.log(decoded_user_info);
        console.log("[SUCCESS]userToken_verification_success")
        next();
      }
      else {
        res.status(412).json({ "isSuccess": false, "code": 412, "message": "[ERROR] DBselect error DB에 사용자없음" })
        return;
      }
    })
  


  } 
  catch (error) { // 인증 실패
    // 유효기간이 초과된 경우
    if (error.name === 'TokenExpiredError') {
      res.status(412).json({ "isSuccess": false, "code": 412, "message": "[ERROR] usertoken만료" })
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(412).json({ "isSuccess": false, "code": 412, "message": "[ERROR] INVALID UserToken" })
      return;
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    //res.status(412).json({ "isSuccess": false, "code": 412, "message": "유효하지않은usertoken" })
    //return;
    res.send(error);

  }

}

// User 삭제
exports.deleteAccount = async (req, res, next) => {
  const user_info = req.verifiedToken;

  // DB에서 유저 삭제
  db.query("DELETE FROM user WHERE id='" + user_info.id + "';", function (err, rows, fields) { 
    if (rows.affectedRows) {
      res.json({ "isSuccess": true, "code": 200, "message": " 유저 삭제 성공" })
      return;
    }
    else {
      console.log(fields);
      console.log("DB 삭제 실패")
      res.status(412).json({ "isSuccess": false, "code": 412, "message": "DB error-삭제 실패" })
      return;
    }
  });

}
