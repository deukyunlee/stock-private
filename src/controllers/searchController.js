//Search API

//[GET]/search/:method/:keyword
/*  method
  1. symbol : symbol검색 
  2. kr : 한글 검색
  3. en : 영어 검색
*/
// 반환 => {symbol, name_kr, name_en, objectID, img}

// const router = require("express").Router();
const algoliasearch = require("algoliasearch");
// const dotenv = require("dotenv");
const db = require("../../web.js");

// dotenv.config();
// Algolia client credentials
/* .env
ALGOLIA_APP_ID=G69K6UV1U4
ALGOLIA_API_KEY=be6185c5571c66bfa404b48609bf3257
ALGOLIA_INDEX_NAME=sample
*/
/*
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;
*/

ALGOLIA_APP_ID = "G69K6UV1U4";
ALGOLIA_API_KEY = "be6185c5571c66bfa404b48609bf3257";
ALGOLIA_INDEX_NAME = "sample";
//keyword로 search
async function searchdata(endpoint, method) {
  try {
    // Initialize the client
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
    // Initialize an index
    const index = client.initIndex(ALGOLIA_INDEX_NAME);

    index
      .setSettings({
        queryLanguages: ["ko", "en"],
        removeStopWords: true,
        ignorePlurals: true,
      })
      .wait();

    if (method === "symbol") {
      res = await index.search(endpoint, {
        restrictSearchableAttributes: ["symbol"],
        attributesToRetrieve: "symbol",
      });
    } else if (method === "kr") {
      res = await index.search(endpoint, {
        restrictSearchableAttributes: ["kr_name"],
        attributesToRetrieve: "symbol",
      });
    } else if (method === "en") {
      res = await index.search(endpoint, {
        restrictSearchableAttributes: ["name"],
        attributesToRetrieve: "symbol",
      });
    }

    //console.log(res);
    console.log(res.hits); //콘솔로 확인

    return res.hits;
  } catch (error) {
    console.log(error);
  }
}

// /search/:method/:keyword
/*  method
  1. symbol
  2. kr
  3. en
*/

module.exports.search_stock = (req, res, next) => {
  const method = req.params.method;
  const keyword = req.params.keyword;
  let symbols = [];
  let sql =
    "SELECT symbol, name_en, name_kr, objectID, img FROM company_info where symbol in(";
  searchdata(keyword, method).then((result) => {
    //res.json(result); //알고리아 검색결과
    if (!result.length) {
      console.log("검색결과없음");
      res.send("검색결과없음");
      return;
    }
    result.forEach((res) => {
      let onesymbol = "'" + res["symbol"] + "'";
      symbols.push(onesymbol);
    });
    sql += symbols.toString();
    sql += ") order by objectID;";
    // console.log(sql);

    db.query(sql, function (err, rows, fields) {
      if (err) throw err;
      res.json(rows);
      // console.log(rows);
    });
  });
};

// module.exports = router;
