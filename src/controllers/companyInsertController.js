const db = require("../../web.js");
const axios = require("axios");
const path = require("path"); //img file path
const fs = require("fs"); //read img file
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
module.exports.insert_rank_info = async function getRankInfo() {
  const sql =
    "select symbol, rank() over (order by cap desc) as ranking from daily group by symbol;";

  db.query(sql, (err, result) => {
    console.log(result);
  });
};
module.exports.insert_cap_info = async function getInfo() {
  const sql = "select symbol, max(date) as date from daily group by symbol;";
  db.query(sql, (err, result) => {
    // console.log(result);
    Object.keys(result).forEach(async function (key) {
      let symbol = result[key].symbol;
      console.log(result[key].symbol);
      console.log(result[key].date);
      let start_date = result[key].date;
      // console.log(start_date);
      const st_year = start_date.getFullYear();
      const st_month = start_date.getMonth();
      const st_date = start_date.getDate();
      const start = st_year + "-" + (st_month + 1) + "-" + st_date;
      console.log(start);
      const sql = `select cap from daily where symbol = "${symbol}" and date = "${start}"`;
      db.query(sql, async (err, result) => {
        Object.keys(result).forEach(async function (key) {
          const sql1 = `update info set cap = ${result[key].cap} where symbol = "${symbol}"`;
          db.query(sql1, async (err, result) => {
            if (err) console.log(err);
          });
          //console.log(result[key].cap);
        });
      });
    });
  });
};

async function insertInfo(symbol) {
  const count = 500;
  // try {
  //   const sql = `UPDATE company_info SET img='${imgstr}' WHERE symbol = '${symbol}'`;
  //   db.query(sql, function (err, rows, fields) {
  //     if (err) console.log(err);
  //     //console.log(rows);
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;

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
  try {
    let per = await resData["PERatio"];
    let pbr = await resData["PriceToBookRatio"];
    let eps = await resData["EPS"];
    let roe = await resData["ReturnOnEquityTTM"];
    let high = await resData["52WeekHigh"];
    let low = await resData["52WeekLow"];
    let sql = `insert IGNORE into info(symbol,per,pbr,eps,roe,highest,lowest) values (?)`;
    const array = [symbol, per, pbr, eps, roe, high, low];
    db.query(sql, [array], function (err, rows, fields) {
      if (err) console.log(err);
    });
    count -= 1;
    console.log(
      symbol + " inserted into database : " + count + " symbols left"
    );
  } catch {
    console.log("sql error");
  }
  // console.log(resApi);
  // console.log(symbol);
}

module.exports.insert_company_info = async function getInfo() {
  let symbol;
  let resApi;
  let resData;
  let count = 500;
  let id = 0;
  let url = [];
  const symbols = [
    "GL",
    "BWA",
    "TPR",
    "SEE",
    "IVZ",
    "LUMN",
    "CDAY",
    "ALLE",
    "MHK",
    "LW",
    "PNR",
    "AIZ",
    "NRG",
    "FRT",
    "OGN",
    "VNO",
    "RL",
    "PBCT",
    "NCLH",
    "DXC",
    "PENN",
    "PNW",
    "HII",
    "UAA",
    "UA",
    "IPGP",
    "PVH",
    "NLSN",
  ];
  for (const symbol of symbols) {
    //console.log(symbol + " insert . . . ");
    await delayFunc.sleep(12050);

    await insertInfo(symbol);
  }
  // sql = `select symbol from company_info;`;

  // db.query(sql, (err, result, fields) => {
  //   // console.log(rows);
  //   Object.keys(result).forEach(async function (key) {
  //     symbol = result[key].symbol;
  //     if (symbol) {
  //       // console.log(symbol);
  //       url[
  //         key
  //       ] = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
  //     } else console.log("no symbol");

  // for (var key in url) {
  //   //console.log(url[key]);
  //   await delayFunc.sleep(12050);
  //   console.log(url[key]);
  // try {
  //   resApi = await axios({
  //     method: "get",
  //     url: url[key],
  //   });
  // } catch {
  //   console.log("axios failed");
  // }
  // await console.log(resApi);
  // try {
  //   resData = resApi.data;
  // } catch {
  //   console.log("no data");
  // }
  // try {
  //   let per = await resData["PERatio"];
  //   let pbr = await resData["PriceToBookRatio"];
  //   let eps = await resData["EPS"];
  //   let roe = await resData["ReturnOnEquityTTM"];
  //   let sql = `insert IGNORE into info(symbol,per,pbr,eps,roe) values (?)`;
  //   const array = [symbol, per, pbr, eps, roe];
  //   db.query(sql, [array], function (err, rows, fields) {
  //     if (err) console.log(err);
  //   });
  //   count -= 1;
  //   console.log(
  //     symbol + " inserted into database : " + count + " symbols left"
  //   );
  // } catch {
  //   console.log("sql error");
  // }
  //}
  // });

  // console.log(url);
  // console.log(key);

  // db.query(sql, (err, result) => {
  //   Object.keys(result).forEach(async function (key) {
  //     symbol = result[key].symbol;
  //     console.log(symbol);
  //     if (symbol) {
  //       url[
  //         key
  //       ] = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
  //     } else console.log("no symbol");

  //     for (var key in url) {
  //       console.log(url);
  //     }
  //     /*
  //       await delayFunc.sleep(12050);
  //       try {
  //         resApi = await axios({
  //           method: "get",
  //           url: url,
  //         });
  //       } catch {
  //         console.log("axios failed");
  //       }

  //       try {
  //         resData = resApi.data;
  //       } catch {
  //         console.log("no data");
  //       }

  //       try {
  //         let per = await resData["PERatio"];
  //         let pbr = await resData["PriceToBookRatio"];
  //         let eps = await resData["EPS"];
  //         let roe = await resData["ReturnOnEquityTTM"];

  //         let sql = `insert IGNORE into info(symbol, per,pbr,pes,roe) values (?)`;

  //         const array = [symbol, per, pbr, eps, roe];
  //         db.query(sql, [array], function (err, rows, fields) {
  //           if (err) console.log(err);
  //         });
  //         count -= 1;
  //         console.log(
  //           symbol + " inserted into database : " + count + " symbols left"
  //         );
  //       } catch {
  //         console.log("sql error");
  //       }
  //       */
  //   });
  // });
  // console.log(url);
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

//store logo img to CompanyInfo table ('img' column)
async function insertImg(symbol) {
  try {
    const filepath = "../../public/img/" + symbol + ".svg";
    const img = path.join(__dirname, filepath);
    //console.log(img); //파일 절대경로
    const imgstr = fs.readFileSync(img).toString(); //파일 읽어오기
    const sql = `UPDATE company_info SET img='${imgstr}' WHERE symbol = '${symbol}'`;

    db.query(sql, function (err, rows, fields) {
      if (err) console.log(err);
      //console.log(rows);
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports.insert_img = async function image_insertion() {
  const symbols = [
    "AAPL",
    "MSFT",
    "GOOG",
    "GOOGL",
    "AMZN",
    "TSLA",
    "NVDA",
    "FB",
    "V",
    "JPM",
    "UNH",
    "JNJ",
    "PG",
    "WMT",
    "BAC",
    "MA",
    "HD",
    "XOM",
    "DIS",
    "PFE",
    "KO",
    "CVX",
    "ABBV",
    "CSCO",
    "AVGO",
    "PEP",
    "LLY",
    "COST",
    "NKE",
    "VZ",
    "WFC",
    "TMO",
    "CMCSA",
    "ADBE",
    "ABT",
    "ACN",
    "ORCL",
    "CRM",
    "MRK",
    "DHR",
    "QCOM",
    "MCD",
    "AMD",
    "INTC",
    "UPS",
    "NFLX",
    "PM",
    "T",
    "MS",
    "SCHW",
    "UNP",
    "LIN",
    "TMUS",
    "TXN",
    "LOW",
    "AXP",
    "BMY",
    "NEE",
    "RTX",
    "INTU",
    "MDT",
    "CVS",
    "C",
    "HON",
    "AMGN",
    "BA",
    "PYPL",
    "AMAT",
    "COP",
    "GS",
    "BLK",
    "DE",
    "IBM",
    "NOW",
    "EL",
    "ANTM",
    "BKNG",
    "SBUX",
    "PLD",
    "LMT",
    "AMT",
    "CAT",
    "CHTR",
    "GE",
    "MU",
    "ISRG",
    "TGT",
    "MO",
    "SYK",
    "MDLZ",
    "SPGI",
    "CB",
    "CME",
    "USB",
    "PNC",
    "ADI",
    "MMM",
    "ADP",
    "TFC",
    "LRCX",
    "TJX",
    "CSX",
    "DUK",
    "MMC",
    "GILD",
    "HCA",
    "BDX",
    "CI",
    "F",
    "GM",
    "SHW",
    "CCI",
    "ICE",
    "SO",
    "ITW",
    "CL",
    "REGN",
    "EW",
    "EOG",
    "NSC",
    "D",
    "COF",
    "ATVI",
    "FCX",
    "EQIX",
    "PGR",
    "FISV",
    "ETN",
    "NOC",
    "AON",
    "BSX",
    "PSA",
    "MCO",
    "GD",
    "MRNA",
    "WM",
    "FDX",
    "VRTX",
    "FIS",
    "MET",
    "MAR",
    "PXD",
    "SLB",
    "EMR",
    "KLAC",
    "NEM",
    "APD",
    "HUM",
    "SPG",
    "AIG",
    "ECL",
    "FTNT",
    "NXPI",
    "ILMN",
    "CNC",
    "ADSK",
    "KHC",
    "TEL",
    "ROP",
    "DG",
    "JCI",
    "APH",
    "CTSH",
    "BK",
    "ORLY",
    "KMB",
    "MPC",
    "DOW",
    "SNPS",
    "IQV",
    "SRE",
    "PRU",
    "MNST",
    "ADM",
    "MSCI",
    "INFO",
    "LHX",
    "CMG",
    "AEP",
    "SYY",
    "HLT",
    "PAYX",
    "HSY",
    "IDXX",
    "BAX",
    "TRV",
    "AFL",
    "GIS",
    "STZ",
    "EXC",
    "MCK",
    "DD",
    "WBA",
    "MCHP",
    "A",
    "AZO",
    "DLR",
    "ALGN",
    "HPQ",
    "GPN",
    "ANET",
    "PH",
    "CTAS",
    "APTV",
    "CARR",
    "O",
    "KMI",
    "CDNS",
    "PSX",
    "RSG",
    "WELL",
    "DXCM",
    "OXY",
    "CTVA",
    "MSI",
    "DVN",
    "EA",
    "YUM",
    "SIVB",
    "LVS",
    "TDG",
    "WMB",
    "XEL",
    "DFS",
    "TT",
    "PPG",
    "VLO",
    "ALL",
    "GLW",
    "EBAY",
    "IFF",
    "STT",
    "RMD",
    "KR",
    "TSN",
    "NUE",
    "CBRE",
    "AMP",
    "ODFL",
    "ROST",
    "LYB",
    "FITB",
    "EQR",
    "TROW",
    "AVB",
    "PEG",
    "PCAR",
    "EXPE",
    "OTIS",
    "AJG",
    "DLTR",
    "MTD",
    "SBAC",
    "CMI",
    "BIIB",
    "ROK",
    "VRSK",
    "MTCH",
    "FRC",
    "ED",
    "BKR",
    "ARE",
    "AME",
    "ABC",
    "DHI",
    "FAST",
    "KEYS",
    "BLL",
    "WY",
    "HES",
    "CPRT",
    "HAL",
    "NDAQ",
    "ES",
    "WEC",
    "OKE",
    "WTW",
    "TWTR",
    "DAL",
    "WST",
    "LUV",
    "AWK",
    "CERN",
    "LYV",
    "SWK",
    "LEN",
    "EXR",
    "MKC",
    "ANSS",
    "EFX",
    "CCL",
    "HRL",
    "EPAM",
    "CDW",
    "NTRS",
    "LH",
    "VMC",
    "GWW",
    "TSCO",
    "MAA",
    "CHD",
    "MLM",
    "FANG",
    "KEY",
    "STX",
    "IT",
    "HIG",
    "MTB",
    "BBY",
    "FE",
    "DTE",
    "VRSN",
    "VFC",
    "DOV",
    "FOX",
    "FOXA",
    "FTV",
    "HBAN",
    "EIX",
    "SYF",
    "STE",
    "PKI",
    "K",
    "URI",
    "HPE",
    "RJF",
    "CFG",
    "SWKS",
    "RF",
    "ALB",
    "GRMN",
    "AEE",
    "IR",
    "RCL",
    "ESS",
    "MPWR",
    "VTR",
    "ETR",
    "DRE",
    "ULTA",
    "SBNY",
    "NTAP",
    "CINF",
    "JBHT",
    "MGM",
    "PPL",
    "TDY",
    "WAT",
    "PAYC",
    "COO",
    "BXP",
    "PFG",
    "ENPH",
    "GNRC",
    "TER",
    "BRO",
    "CLX",
    "DRI",
    "CTRA",
    "TTWO",
    "POOL",
    "FLT",
    "CMS",
    "IP",
    "WAB",
    "GPC",
    "EXPD",
    "AMCR",
    "VTRS",
    "BIO",
    "CTLT",
    "OMC",
    "UDR",
    "HOLX",
    "WDC",
    "CAG",
    "NVR",
    "TRMB",
    "PEAK",
    "KMX",
    "MRO",
    "CZR",
    "TYL",
    "CNP",
    "MOS",
    "BR",
    "XYL",
    "EMN",
    "NLOK",
    "AKAM",
    "ETSY",
    "WRB",
    "DPZ",
    "TECH",
    "CF",
    "DGX",
    "CE",
    "J",
    "UAL",
    "TXT",
    "ROL",
    "DISH",
    "L",
    "BEN",
    "FDS",
    "INCY",
    "DISCK",
    "DISCA",
    "SJM",
    "CAH",
    "AVY",
    "CEG",
    "CRL",
    "FMC",
    "TFX",
    "KIM",
    "PWR",
    "HWM",
    "QRVO",
    "IEX",
    "ATO",
    "LKQ",
    "LNT",
    "IPG",
    "AES",
    "MKTX",
    "PKG",
    "EVRG",
    "MAS",
    "HST",
    "SEDG",
    "ABMD",
    "CPB",
    "HAS",
    "AAP",
    "NDSN",
    "RHI",
    "NWS",
    "NWSA",
    "LDOS",
    "CTXS",
    "BBWI",
    "PTC",
    "CBOE",
    "CMA",
    "JKHY",
    "IRM",
    "LNC",
    "WRK",
    "FFIV",
    "FBHS",
    "XRAY",
    "WHR",
    "PHM",
    "CHRW",
    "RE",
    "APA",
    "AAL",
    "SNA",
    "HSIC",
    "REG",
    "AOS",
    "NI",
    "JNPR",
    "DVA",
    "NWL",
    "UHS",
    "WYNN",
    "TAP",
    "GL",
    "BWA",
    "TPR",
    "SEE",
    "IVZ",
    "LUMN",
    "CDAY",
    "ALLE",
    "MHK",
    "LW",
    "PNR",
    "AIZ",
    "NRG",
    "FRT",
    "OGN",
    "VNO",
    "RL",
    "PBCT",
    "NCLH",
    "DXC",
    "PENN",
    "PNW",
    "HII",
    "UAA",
    "UA",
    "IPGP",
    "PVH",
    "NLSN",
  ];
  for (const symbol of symbols) {
    //console.log(symbol + " insert . . . ");
    await insertImg(symbol);
  }
  console.log("--Done!");
};
