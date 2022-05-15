const db = require("../../web.js");
const axios = require("axios");
const delayFunc = require("../funcs/delayFuncs");
const API_KEY = "JDBVQUW2HL07WAGK";
module.exports.insert_company_cap = async function getSymbol() {
  let symbol = "A";
  let resApi;
  let resData;
  let content;
  let count;
  let id = 0;
  let url = [];

  url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
  try {
    resApi = await axios({
      method: "get",
      url: url,
    });
  } catch {
    console.log("axios failed");
  }

  try {
    resData = resApi.data;
  } catch {
    console.log("no data");
  }

  content = await resData["SharesOutstanding"];
  if (content) {
    console.log(content);
    const shareout = Number(content);
    let sql = `Update company_info SET shareout =${shareout} where symbol = "${symbol}"`;

    db.query(sql, function (err, rows, fields) {
      if (err) console.log(err);
      // console.log(rows);
    });

    sql = `select symbol from company_info where shareout is null`;
    db.query(sql, async function (err, rows, fields) {
      for (var i in rows) {
        let symbol = rows[i].symbol;
        await delayFunc.sleep(12050);
        count = rows.length - id;
        id += 1;
        console.log(symbol);

        if (symbol) {
          try {
            url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
          } catch {
            console.log("symbol or url not found");
          }
        }
        try {
          resApi = await axios({
            method: "get",
            url: url,
          });
        } catch {
          console.log("axios failed");
        }
        try {
          resData = resApi.data;
        } catch {
          console.log("no data");
        }
        let content = await resData["SharesOutstanding"];

        if (content) {
          console.log(content);
          const shareout = Number(content);
          let sql = `Update company_info SET shareout =${shareout} where symbol = "${symbol}"`;

          db.query(sql, function (err, rows, fields) {
            if (err) console.log(err);
            console.log(
              `${symbol} inserted into database : ${count} symbols left`
            );
          });
        }
        //             if (symbol) {
        //               try {
        //                 url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=full&apikey=${API_KEY}`;
        //               } catch {
        //                 console.log("symbol or url not found");
        //               }
        //             }
        //             try {
        //               resApi = await axios({
        //                 method: "get",
        //                 url: url,
        //               });
        //             } catch {
        //               console.log("axios failed");
        //             }

        //             try {
        //               resData = resApi.data;
        //             } catch {
        //               console.log("no data");
        //             }

        //             let content = await resData["Time Series (5min)"];
        //             if (content) {
        //               const keys = Object.keys(content);

        //               let sql = `insert IGNORE into intraday(symbol, datetime, open, high,low,close,volume) values (?)`;

        //               console.log(
        //                 `${symbol} inserted into database : ${count} symbols left`
        //               );

        //               keys.forEach(function (key, index) {
        //                 const row = content[key];
        //                 const date = keys[index];
        //                 const open = parseFloat(row["1. open"]);
        //                 const high = parseFloat(row["2. high"]);
        //                 const low = parseFloat(row["3. low"]);
        //                 const close = parseFloat(row["4. close"]);
        //                 const volume = parseInt(row["5. volume"]);
        //                 const array = [symbol, date, open, high, low, close, volume];
        //                 db.query(sql, [array], function (err, rows, fields) {
        //                   if (err) console.log(err);
        //                 });
        //               });

        //               let sql2 = `UPDATE company_info SET updatedAt_intraday = '${max}' where symbol = ?`;
        //               db.query(sql2, symbol, function (err, rows, fields) {
        //                 if (err) console.log(err);
        //               });
        //             }
        //           }
        //         });
        //       });
        //     });
        //   }
        // }
      }
    });
  }

  //     sql = `select max(datetime) as max from intraday where symbol = 'a'`;
  //     db.query(sql, function (err, rows, fields) {
  //       let max = rows[0].max;
  //       sql = `UPDATE company_info SET updatedAt_intraday = ? where symbol = "a";`;
  //       db.query(sql, max, function (err, rows, fields) {
  //         sql = `SELECT symbol from company_info where updatedAt_intraday<'${max}' OR updatedAt_intraday IS null`;
  //         db.query(sql, async function (err, rows, fields) {
  //           for (var i in rows) {
  //             let symbol = rows[i].symbol;
  //             await delayFunc.sleep(12050);
  //             count = rows.length - id;
  //             id += 1;
  //             console.log(symbol);

  //             if (symbol) {
  //               try {
  //                 url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=full&apikey=${API_KEY}`;
  //               } catch {
  //                 console.log("symbol or url not found");
  //               }
  //             }
  //             try {
  //               resApi = await axios({
  //                 method: "get",
  //                 url: url,
  //               });
  //             } catch {
  //               console.log("axios failed");
  //             }

  //             try {
  //               resData = resApi.data;
  //             } catch {
  //               console.log("no data");
  //             }

  //             let content = await resData["Time Series (5min)"];
  //             if (content) {
  //               const keys = Object.keys(content);

  //               let sql = `insert IGNORE into intraday(symbol, datetime, open, high,low,close,volume) values (?)`;

  //               console.log(
  //                 `${symbol} inserted into database : ${count} symbols left`
  //               );

  //               keys.forEach(function (key, index) {
  //                 const row = content[key];
  //                 const date = keys[index];
  //                 const open = parseFloat(row["1. open"]);
  //                 const high = parseFloat(row["2. high"]);
  //                 const low = parseFloat(row["3. low"]);
  //                 const close = parseFloat(row["4. close"]);
  //                 const volume = parseInt(row["5. volume"]);
  //                 const array = [symbol, date, open, high, low, close, volume];
  //                 db.query(sql, [array], function (err, rows, fields) {
  //                   if (err) console.log(err);
  //                 });
  //               });

  //               let sql2 = `UPDATE company_info SET updatedAt_intraday = '${max}' where symbol = ?`;
  //               db.query(sql2, symbol, function (err, rows, fields) {
  //                 if (err) console.log(err);
  //               });
  //             }
  //           }
  //         });
  //       });
  //     });
  //   }
  // }
};

// let count = 500;
// let sql = `select symbol from company_info`;
// url = [];
// // var arr = new Array();
// db.query(sql, (err, result) => {
//   Object.keys(result).forEach(async function (key) {
//     // console.log(result[key].symbol);
//     // arr[key] = result[key].symbol;
//     // console.log(result[key].symbol);
//     symbol = result[key].symbol;
//     if (symbol) {
//       url[
//         key
//       ] = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
//     } else console.log("no symbol");
//   });
// });
// // console.log(url);
// for (var key in url) {
//   console.log(url);
//   await delayFunc.sleep(12050);
//   console.log(url);
//   try {
//     resApi = await axios({
//       method: "get",
//       url: url[key],
//     });
//     console.log(resApi);
//   } catch {
//     console.log("axios failed");
//   }
//   let resData = resApi.data;
//   const marketCap = await resData["MarketCapitalization"];
//   if (marketCap) {
//     const sql = `insert IGNORE into company_info(cap) values (?) where symbol =?`;
//     count -= 1;
//     console.log(
//       symbol + " inserted into database : " + count + " symbols left"
//     );
//     const array = [marketCap, symbol];
//     db.query(sql, [array], function (err, rows, fields) {});
//   } else {
//     console.log("no data");
//   }
// }
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

module.exports.insert_img = async function image_insertion() {};
