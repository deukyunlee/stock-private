const db = require("../../web.js");
const axios = require("axios");
const delayFunc = require("../funcs/delayFuncs");
const API_KEY = process.env.ALPHAVANTAGEAPI;
module.exports.insert_company_cap = async function getSymbol() {
  let count = 500;
  let sql = `select symbol from company_info`;
  url = [];
  // var arr = new Array();
  db.query(sql, (err, result) => {
    Object.keys(result).forEach(async function (key) {
      // console.log(result[key].symbol);

      // arr[key] = result[key].symbol;

      // console.log(result[key].symbol);
      symbol = result[key].symbol;
      url[
        key
      ] = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
    });
  });
  // console.log(url[key].toString());
  for (var key in url) {
    await delayFunc.sleep(12050);
    resApi = await axios({
      method: "get",
      url: url[key],
    });
    let resData = resApi.data;

    const marketCap = await resData["MarketCapitalization"];
    if (marketCap) {
      const sql = `insert IGNORE into company_info(cap) values (?) where symbol =?`;
      count -= 1;
      console.log(
        symbol + " inserted into database : " + count + " symbols left"
      );
      const array = [marketCap, symbol];
      db.query(sql, [array], function (err, rows, fields) {});
    }
  }
  // console.log(arr[0]);

  // const data = await crawling.crawlSymbol();
  // for (var key in data) {
  //   url = new Array();
  //   symbol = data[key].symbol;
  //   url[
  //     key
  //   ] = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
  //   await delayFunc.sleep(12050).then(() =>
  //     axios({
  //       method: "get",
  //       url: url[key],
  //     })
  //       .then((res) => {
  //         let res2 = res.data;
  //         const marketCap = res2["MarketCapitalization"];
  //         if (marketCap) {
  //           const sql = `insert IGNORE into company_info(cap) values (?) where symbol =?`;
  //           count -= 1;
  //           console.log(
  //             symbol + " inserted into database : " + count + " symbols left"
  //           );
  //           const array = [marketCap, symbol];
  //           db.query(sql, [array], function (err, rows, fields) {});
  //         }
  //       })
  //       .catch(() => {
  //         console.log("rejected");
  //       })
  //   );
  // }
};
