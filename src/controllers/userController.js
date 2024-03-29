"use strict";

const jwt = require("jsonwebtoken");
//const { send } = require('express/lib/response');
const db = require("../../web.js");
const axios = require("axios");

//apple login
const path = require("path");
const AppleAuth = require("apple-auth");
const appleConfig = require("../../config/appleConfig");
const auth = new AppleAuth(
  appleConfig,
  path.join(__dirname, "../../config/AuthKey_6925SRZ8A4.p8")
);


const google_url = "https://oauth2.googleapis.com/tokeninfo";
const kakao_url = "https://kapi.kakao.com/v2/user/me";

// Google 로그인 및 회원가입
exports.googlelogin = async (req, res, next) => {
  //google에서 주는 access토큰
  const googleToken = req.body.accessToken; //내가 넣어준거 (클라이언트에서 받아올거)
  const query = "?id_token=" + googleToken;

  //1. access토큰을 받아서 사용자 정보(id)받아오기
  let user_info = "";
  try {
    const info = await axios({
      method: "get",
      url: google_url + query,
    });
    user_info = JSON.parse(JSON.stringify(info.data));
    //if (user_info.sub === 'undefined' || !user_info.sub) throw 'bad token'
  } catch (e) {
    console.log(e);
    console.log("google accesstoken error");
    res.status(412).send({
      isSuccess: false,
      code: 412,
      message: "[ERROR] Google AccessToken error",
    });
    return;
  }

  console.log("user_info (id) : ", user_info.sub);
  console.log("user_info (nickname) : ", user_info.name);

  // 2. DB에 이미 저장되어있는 회원인지 확인
  db.query(
    "SELECT id, name, userToken FROM user WHERE snsId='" +
      user_info.sub +
      "' AND sns='google';",
    function (err, result, field) {
      if (err) throw err;
      //console.log("length: ", result.length);
      const exist_user = result.length; //있으면 1, 없으면 0 저장됨

      if (exist_user) {
        //있으면 userId, userToken 전송
        //console.log(result[0]);
        //res.json({'userId' : result[0].id, 'userToken' : result[0].userToken})
        return res.json({
          isSuccess: true,
          code: 200,
          message: "[SUCCESS] 이미 가입한 회원",
          result: {
            userId: result[0].id,
            name: result[0].name,
            userToken: result[0].userToken,
          },
        });
        //기존 회원은 밑으로 안넘어가고 위 응답으로 return되고 끝나게 만들어야함
      } else {
        // 3. 신규회원 - DB에 새로 저장해야함
        //신규 회원 정보
        const name = user_info.name;
        const snsId = user_info.sub;
        const id = String(snsId).slice(0, 6); //6자리
        const sns = "google";

        // (3-1) token 생성
        const jwttoken = jwt.sign(
          {
            id: id,
            name: name,
            sns: "google",
          },
          "jwtsecretkey",
          {
            expiresIn: "60d",
            issuer: "stockking",
          }
        );
        const userToken = jwttoken;

        // (3-2) DB에 유저 정보 저장
        const array = [id, name, snsId, sns, userToken];
        db.query(
          `insert IGNORE into user(id, name, snsId, sns, userToken) values (?)`,
          [array],
          function (err, rows, fields) {
            if (err) throw err;
            else {
              res.json({
                isSuccess: true,
                code: 200,
                message: "[SUCCESS] 회원 가입 성공",
                result: { userId: id, name: name, userToken: userToken },
              });
              return;
            }
          }
        );
      }
    }
  );
};

// kakao 로그인 및 회원가입
exports.kakaologin = async (req, res, next) => {
  //kakao에서 주는 access토큰
  const kakaoToken = req.body.accessToken; //내가 넣어준거 (클라이언트에서 받아올거)

  //1. access토큰을 받아서 사용자 정보(id)받아오기
  let user_info = "";
  try {
    user_info = await axios({
      method: "get",
      url: kakao_url,
      headers: {
        Authorization: `Bearer ${kakaoToken}`,
      },
    });
  } catch (e) {
    console.log("kakao accesstoken error");
    res.status(412).send({
      isSuccess: false,
      code: 412,
      message: "[ERROR] Kakao AccessToken error",
    });
    return;
  }

  //console.log("user_info: " , user_info.data);
  console.log("user_info (id) : ", user_info.data.id);
  console.log("user_info (nickname) : ", user_info.data.properties.nickname); //노나현

  // 2. DB에 이미 저장되어있는 회원인지 확인
  db.query(
    "SELECT id, name, userToken FROM user WHERE snsId='" +
      user_info.data.id +
      "' AND sns='kakao';",
    function (err, result, field) {
      if (err) throw err;
      //console.log("length: ", result.length);
      const exist_user = result.length; //있으면 1, 없으면 0 저장됨

      if (exist_user) {
        //있으면 userId, userToken 전송
        //console.log(result[0]);
        //res.json({'userId' : result[0].id, 'userToken' : result[0].userToken})
        return res.json({
          isSuccess: true,
          code: 200,
          message: "[SUCCESS] 이미 가입한 회원",
          result: {
            userId: result[0].id,
            name: result[0].name,
            userToken: result[0].userToken,
          },
        });
        //기존 회원은 밑으로 안넘어가고 위 응답으로 return되고 끝나게 만들어야함
      } else {
        // 3. 신규회원 - DB에 새로 저장해야함
        //신규 회원 정보
        const name = user_info.data.properties.nickname;
        const snsId = user_info.data.id;
        const id = String(snsId).slice(0, 6); //6자리
        const sns = "kakao";

        // (3-1) token 생성
        const jwttoken = jwt.sign(
          {
            id: id,
            name: name,
            sns: "kakao",
          },
          "jwtsecretkey",
          {
            expiresIn: "60d",
            issuer: "stockking",
          }
        );
        const userToken = jwttoken;

        // (3-2) DB에 유저 정보 저장
        const array = [id, name, snsId, sns, userToken];
        db.query(
          `insert IGNORE into user(id, name, snsId, sns, userToken) values (?)`,
          [array],
          function (err, rows, fields) {
            if (err) throw err;
            else {
              res.json({
                isSuccess: true,
                code: 200,
                message: "[SUCCESS] 회원 가입 성공",
                result: { userId: id, name: name, userToken: userToken },
              });
              return;
            }
          }
        );
      }
    }
  );
};

//자동로그인
exports.autoLogin = async function (req, res) {
  const userIdResult = req.verifiedToken.id;
  const userNameResult = req.verifiedToken.name;

  return res.send({
    isSuccess: true,
    code: 200,
    message: "[SUCCESS]AUTO LOGIN - userToken_verification_success",
    result: { userId: userIdResult, name: userNameResult },
  });
};

//applelogin
exports.applelogin = async (req, res, next) => {
  //apple에서 주는 code

  const code = req.body.code;

  if (!code)
    return res.send({
      isSuccess: false,
      code: 200,
      message: "APPLE authorization code를 입력해주세요",
    });

  //1. 사용자 정보 받아오기
  let response = ``;
  let idToken = ``;

  try {
    response = await auth.accessToken(code);
    idToken = jwt.decode(response.id_token);
    // console.log(response, idToken);
  } catch (err) {
    console.log(err);
    return res.send({
      isSuccess: false,
      code: 2000,
      message: "유효하지 않은 APPLE authorization code입니다.",
    });
  }

  let email = idToken.email;
  email = email.split("@");
  const name = email[0];
  const snsId = idToken.sub;
  console.log("snsId : ", snsId);

  // 2. DB에 이미 저장되어있는 회원인지 확인
  db.query(
    "SELECT id, name, userToken FROM user WHERE snsId='" +
      snsId +
      "' AND sns='apple';",
    function (err, result, field) {
      if (err) throw err;
      //console.log("length: ", result.length);
      const exist_user = result.length; //있으면 1, 없으면 0 저장됨

      if (exist_user) {
        //있으면 userId, userToken 전송

        return res.json({
          isSuccess: true,
          code: 200,
          message: "[SUCCESS] 이미 가입한 회원",
          result: {
            userId: result[0].id,
            name: result[0].name,
            userToken: result[0].userToken,
          },
        });
        //기존 회원은 밑으로 안넘어가고 위 응답으로 return되고 끝나게 만들어야함
      } else {
        // 3. 신규회원 - DB에 새로 저장해야함
        //신규 회원 정보
        //const name = response.user.name.firstname; //지우기 (위에있음)
        //const snsId = idToken.sub;  //지우기 (위에있음)
        const id = String(snsId).slice(0, 6); //6자리
        const sns = "apple";

        // (3-1) token 생성
        const jwttoken = jwt.sign(
          {
            id: id,
            name: name,
            sns: "apple",
          },
          "jwtsecretkey",
          {
            expiresIn: "60d",
            issuer: "stockking",
          }
        );
        const userToken = jwttoken;

        // (3-2) DB에 유저 정보 저장
        const array = [id, name, snsId, sns, userToken];
        db.query(
          `insert IGNORE into user(id, name, snsId, sns, userToken) values (?)`,
          [array],
          function (err, rows, fields) {
            if (err) throw err;
            else {
              res.json({
                isSuccess: true,
                code: 200,
                message: "[SUCCESS] 회원 가입 성공",
                result: { userId: id, name: name, userToken: userToken },
              });
              return;
            }
          }
        );
      }
    }
  );
};

exports.appleloginCallback = async function (req, res) {
  return res.status(200).json();
};

// User 삭제
exports.deleteAccount = async (req, res, next) => {
  const user_info = req.verifiedToken;

  // DB에서 유저 삭제
  db.query(
    "DELETE FROM user WHERE id='" + user_info.id + "';",
    function (err, rows, fields) {
      if (rows.affectedRows) {
        res.json({ isSuccess: true, code: 200, message: " 유저 삭제 성공" });
        return;
      } else {
        console.log(fields);
        console.log("DB 삭제 실패");
        res
          .status(412)
          .json({ isSuccess: false, code: 412, message: "DB error-삭제 실패" });
        return;
      }
    }
  );
};
