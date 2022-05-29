const db = require("../../web.js");

/* CREATE */ 
exports.add = async (req, res, next) => {
  /*
    company 즐겨찾기 추가 요청 API(POST): /favorite
    { headers }: JWT_TOKEN(유저 토큰)
    company_symbol: 회사 symbol(필수)
    * 응답: 
  */
  const  company_symbol  = req.body.symbol; //프론트에서 body로 
  const  user_id  = req.verifiedToken.id; // JWT_TOKEN에서 추출한 값 가져옴

  let company_id;
  //회사 symbol (company_symbol 받아온거)로 company_info 테이블에서 objectID찾기
  const companyidsearchsql = "SELECT objectID, symbol FROM company_info WHERE symbol='" +company_symbol+ "';"
  const insertsql = `INSERT INTO favorite(user_id, company_id) VALUES (?)`
  db.query(companyidsearchsql, function(err, result, field) {
    if (result.length) { //있으면 userId, userToken 전송
      console.log("company_id: ", result[0].objectID);
      company_id = result[0].objectID;

      //favorite테이블에 유저id와 회사심볼id(=objectID)넣기
      const array = [user_id, company_id];
      db.query(insertsql, [array], function (err, rows, fields) {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(412).json({ "isSuccess": false, "code": 412, "message": "이미 즐겨찾기에 추가된 항목입니다." })
          }
          else {
            return res.send(err);
          }
        }
        if(rows.affectedRows) {
          return res.json({ "isSuccess": true, "code": 200, "message": "즐겨찾기 추가 성공",
            "result" : {"user_id" : user_id, "symbol" : company_symbol} })
        }
      });
      
    }
    else {
      return res.status(412).json({ "isSuccess": false, "code": 412, "message": "symbol이 DB에 존재하지않음" })
    }
  })


}

/* READ */ 
exports.list = async function (req, res) {
  /*
    company 즐겨찾기 리스트 요청 API(GET): /favorite/list
    { headers }: JWT_TOKEN(유저 토큰)
    * 응답: 즐겨찾기한 symbol들 json {img, symbol, name_en, name_kr, cap}
  */

  const user_id = req.verifiedToken.id; // JWT_TOKEN에서 추출한 값 가져옴

  const searchsql = "SELECT * FROM dufqkd1004.company_info WHERE objectID IN(SELECT company_id FROM dufqkd1004.favorite WHERE user_id='" +user_id+ "')"
  db.query(searchsql, function(err, result, field){
    //console.log(result);
    if (result.length) {
      return res.json({ "isSuccess": true, "code": 200, "message": "즐겨찾기한 종목들 불러옴" ,
        "result" : {"user_id" : user_id, "symbol" : result}})
    }
    else {
      return res.json({ "isSuccess": true, "code": 200, "message": "즐겨찾기 한 symbol이 없음" ,
        "result" : {"user_id" : user_id, "symbol" : null}}) //result하면 []로 뜸
    }
  })
};

/* DELETE */ 
exports.delete = async (req, res, next) => {
  /*
    company 즐겨찾기 삭제 요청 API(DELETE): /favorite
    { headers }: JWT_TOKEN(유저 토큰)
    company_symbol: 회사 symbol(필수)
    * 응답: status = 반영된 즐겨찾기 상태
  */
  const  company_symbol  = req.body.symbol; //프론트에서 body로 
  const  user_id  = req.verifiedToken.id; // JWT_TOKEN에서 추출한 값 가져옴

  //console.log("company_symbol : ", company_symbol);
  //console.log("user_id : ", user_id);

  let company_id;
  //회사 symbol (company_symbol 받아온거)로 company_info 테이블에서 objectID찾기
  const companyidsearchsql = "SELECT objectID, symbol FROM company_info WHERE symbol='" +company_symbol+ "';"
  
  db.query(companyidsearchsql, function(err, result, field) {
    if (result.length) { //있으면 userId, userToken 전송
      console.log("company_id: ", result[0].objectID);
      company_id = result[0].objectID;

      const deletesql = "DELETE FROM favorite WHERE user_id ='" + user_id + "' and company_id ='" + company_id + "';"  

      //favorite테이블에서 user_id와 company_id에 해당하는 것 삭제
      db.query(deletesql, function (err, rows, fields) {
        if (rows.affectedRows) {
          return res.json({ "isSuccess": true, "code": 200, "message": "즐겨찾기 삭제 성공",
            "result" : {"user_id" : user_id, "symbol" : company_symbol} })
        }
        else {
          return res.status(412).json({ "isSuccess": false, "code": 412, "message": "symbol이 즐겨찾기DB에 존재하지않음" })
        }
      });


    }
    else {
      return res.status(412).json({ "isSuccess": false, "code": 412, "message": "symbol이 DB에 존재하지않음" })
    }
  })


}