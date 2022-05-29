'use strict'

const jwt = require('jsonwebtoken');
//const { send } = require('express/lib/response');
const db = require("../../web.js");
const axios = require("axios");


//const google_url = "https://oauth2.googleapis.com/tokeninfo"
const kakao_url = "https://kapi.kakao.com/v2/user/me"


// Google 로그인 및 회원가입


// kakao 로그인 및 회원가입
exports.kakaologin = async (req,res, next) => {  

  //kakao에서 주는 access토큰
  const kakaoToken = req.body.accessToken; //내가 넣어준거 (클라이언트에서 받아올거)
  
  //1. access토큰을 받아서 사용자 정보(id)받아오기
  let user_info ="" ;
  try{
    user_info = await axios({
      method:'get',
      url: kakao_url,
      headers:{
        Authorization: `Bearer ${kakaoToken}`
      }
    })   
  }catch(e){
    console.log("kakao accesstoken error");
    res.json(e.data); //******************카카오토큰오류메세지전송하기!!!!!!!!!!!!! res.status(412).send({'msg' : err, 'code' : -412});
  }

  //console.log("user_info: " , user_info.data);
  console.log("user_info (id) : " , user_info.data.id);
  console.log("user_info (nickname) : ", user_info.data.properties.nickname ); //노나현
  

  // 2. DB에 이미 저장되어있는 회원인지 확인 
  db.query("SELECT id, userToken FROM user WHERE snsId='" +user_info.data.id+ "' AND sns='kakao';", function(err, result, field){
    //console.log("length: ", result.length);
    const exist_user = result.length; //있으면 1, 없으면 0 저장됨
    if (exist_user) { //있으면 userId, userToken 전송
      //console.log(result[0]);
      return res.json({'userId' : result[0].id, 'userToken' : result[0].userToken})
    }
  })

  // 3. 신규회원 - DB에 새로 저장해야함
  //신규 회원 정보
  const name = user_info.data.properties.nickname;
  const snsId = user_info.data.id;
  const id = String(snsId).slice(0, 6); //6자리
  const sns = 'kakao';

  // (3-1) token 생성
  const jwttoken = jwt.sign({
      id : id,
      name : name,
      sns : 'kakao'
    },"jwtsecretkey", {
      expiresIn : '60d',
      issuer : 'stockking'
  });
  const userToken = jwttoken;

  // (3-2) DB에 유저 정보 저장
  const array = [id, name, snsId, sns, userToken];
  try {
    db.query(`insert IGNORE into user(id, name, snsId, sns, userToken) values (?)`, [array], function (err, rows, fields) {});
    return res.json({ "isSuccess": true, "code": 200, "message": "[SUCCESS]userToken_verification_success", 
      "result" : {'userId' : id, 'name' : name, 'userToken' : userToken}});
  }catch(err){
    console.log("DB insert query error");
    res.status(412).send(err);

  }
}

//자동로그인
exports.autoLogin = async function (req, res) {
  const userIdResult = req.verifiedToken.id;
  const userNameResult = req.verifiedToken.name;

  return res.send({ "isSuccess": true, "code": 200, "message": "[SUCCESS]userToken_verification_success", "result" : {userIdResult, userNameResult}});
};


// User 삭제
exports.deleteAccount = async (req, res, next) => {
  const user_info = req.verifiedToken;

  // DB에서 유저 삭제
  try {
    db.query("DELETE FROM user WHERE id='" + user_info.id + "';", function (err, rows, fields) {
      res.send(err);
    });
    return res.json({ "isSuccess": true, "code": 200, "message": " 유저 삭제 성공" })
  }catch(err) {
    console.log(err);
    console.log("DB 삭제 실패")
    return res.status(412).json({ "isSuccess": false, "code": 412, "message": "DB error-삭제 실패" })
  }
    
}
