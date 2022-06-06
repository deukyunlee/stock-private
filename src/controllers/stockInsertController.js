// const db = require("../../web.js");
const mysql = require("mysql");
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "111111",
//   database: "capstone",
//   port: "3306",
//   multipleStatements: true,
//   // dateStrings: "date",
//   //socketPath: socket_path,
// });
const db = mysql.createConnection({
  host: "stockking.cafe24app.com",
  user: "dufqkd1004",
  password: "capstone!!",
  database: "dufqkd1004",
  port: "3306",
  multipleStatements: true,
  typeCast: function (field, next) {
    if (field.type == "VAR_STRING") {
      return field.string();
    }
    return next();
  },
  multipleStatements: true,
  // dateStrings: "date",
  //socketPath: socket_path,
});
const axios = require("axios");
const delayFunc = require("../funcs/delayFuncs");
const API_KEY = "ZO8S591P8HTYI8LV";
const API_KEY2 = "Q1G3FXNOWQ51WUD9";
const cron = require("node-cron");

module.exports.insert_daily_data = async function getDaily() {
  console.log("insert");
  let symbol = "A";
  let resApi;
  let resData;
  let content;
  let count;
  let id = 0;
  let url = [];

  url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${API_KEY}`;
  //console.log(url);
  try {
    resApi = await axios({
      method: "get",
      url: url,
    });
  } catch {
    console.log("axios failed");
  }
  // console.log(resApi);
  try {
    resData = resApi.data;
  } catch {
    console.log("no data");
  }

  try {
    content = await resData["Time Series (Daily)"];
    if (content) {
      const keys = Object.keys(content);
      // console.log(content);
      let sql = `insert IGNORE into daily(symbol, date, open, high,low,close,volume) values (?)`;

      keys.forEach(function (key, index) {
        const row = content[key];
        const date = keys[index];
        //console.log(date);
        const open = parseFloat(row["1. open"]);
        const high = parseFloat(row["2. high"]);
        const low = parseFloat(row["3. low"]);
        const close = parseFloat(row["4. close"]);
        const volume = parseInt(row["5. volume"]);
        const array = [symbol, date, open, high, low, close, volume];
        db.query(sql, [array], function (err, rows, fields) {
          if (err) console.log(err);
          // console.log(rows);
        });
      });
      sql = `select max(date) as max from daily where symbol = 'a'`;
      db.query(sql, function (err, rows, fields) {
        console.log("here");
        if (err) console.log(err);
        // console.log(rows);
        let max = rows[0].max;
        console.log(max);

        const max_year = max.getFullYear();
        const max_month = max.getMonth();
        console.log(max_month);
        const max_date = max.getDate();
        max = max_year + "-" + (max_month + 1) + "-" + max_date;

        sql = `UPDATE company_info SET updatedAt_daily = ? where symbol = "a";`;
        db.query(sql, max, function (err, rows, fields) {
          sql = `SELECT symbol from company_info where date(updatedAt_daily<'${max}') OR updatedAt_daily IS null`;
          db.query(sql, async function (err, rows, fields) {
            if (err) console.log(err);
            for (var i in rows) {
              let symbol = rows[i].symbol;
              console.log(symbol);
              // let shareout = rows[i].shareout;
              // console.log(shareout);
              await delayFunc.sleep(12050);
              count = rows.length - id;
              id += 1;
              // console.log(count);

              if (symbol) {
                try {
                  url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${API_KEY}`;
                  // console.log(url);
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

              let content = await resData["Time Series (Daily)"];
              if (content) {
                const keys = Object.keys(content);

                let sql = `insert IGNORE into daily(symbol, date, open, high,low,close,volume, cap) values (?)`;

                console.log(
                  `${symbol} inserted into database : ${count} symbols left`
                );
                // let sqlShareout = `select shareout from company_info`;
                // let sharArr = new Array();
                // db.query(sqlShareout, (err, rows, fields) => {
                //   sharArr = rows;
                // });
                // console.log(sharArr);
                keys.forEach(function (key, index) {
                  const row = content[key];
                  const date = keys[index];
                  const open = parseFloat(row["1. open"]);
                  const high = parseFloat(row["2. high"]);
                  const low = parseFloat(row["3. low"]);
                  const close = parseFloat(row["4. close"]);
                  const volume = parseInt(row["5. volume"]);
                  const cap = close * shareout;
                  const array = [
                    symbol,
                    date,
                    open,
                    high,
                    low,
                    close,
                    volume,
                    cap,
                  ];
                  db.query(sql, [array], function (err, rows, fields) {
                    // const sql = `update daily set cap = shareout * close where symbol = ${symbol} and date = ${date}`;
                    // db.query(sql, (err, rows, fields) => {});
                    if (err) console.log(err);
                    // const sql
                  });
                });

                let sql2 = `UPDATE company_info SET updatedAt_daily='${max}' where symbol = "${symbol}"`;
                db.query(sql2, function (err, rows, fields) {
                  if (err) console.log(err);
                  let sql3 = `select date, (close - lag(close, 1) over (order by date)) as value, ((close - lag(close, 1) over (order by date))/ lag(close, 1) over (order by date)*100) as percent from daily where symbol = ?;`;
                  db.query(sql3, symbol, function (err, rows, fields) {
                    for (var i in rows) {
                      let date = rows[i].date;
                      const date_year = date.getFullYear();
                      const date_month = date.getMonth();
                      const date_date = date.getDate();
                      date =
                        date_year + "-" + (date_month + 1) + "-" + date_date;

                      let value = rows[i].value;
                      let percent = rows[i].percent;
                      // console.log(value);
                      sql = `update daily set change_percent = '${percent}', change_value = ${value} where symbol = ? and date = '${date}'`;
                      db.query(sql, symbol, function (err, rows, fields) {
                        if (err) console.log(err);
                      });
                    }
                  });
                });
              }
            }
          });
        });
      });
    }
  } catch {
    console.log("sql error");
  }
};

module.exports.insert_intraday_data = async function getIntraday() {
  let symbol = "A";
  let resApi;
  let resData;
  let content;
  let count;
  let id = 0;
  let url = [];

  url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=full&apikey=${API_KEY2}`;
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
    content = await resData["Time Series (5min)"];
    if (content) {
      const keys = Object.keys(content);

      let sql = `insert IGNORE into intraday(symbol, datetime, open, high,low,close,volume) values (?)`;

      keys.forEach(function (key, index) {
        const row = content[key];
        const date = keys[index];
        const open = parseFloat(row["1. open"]);
        const high = parseFloat(row["2. high"]);
        const low = parseFloat(row["3. low"]);
        const close = parseFloat(row["4. close"]);
        const volume = parseInt(row["5. volume"]);
        const array = [symbol, date, open, high, low, close, volume];
        db.query(sql, [array], function (err, rows, fields) {});
      });
      sql = `select max(date(datetime)) as max from intraday where symbol = 'a'`;
      db.query(sql, function (err, rows, fields) {
        let max = rows[0].max;

        // console.log(max);

        const max_year = max.getFullYear();
        const max_month = max.getMonth();
        console.log(max_month);
        const max_date = max.getDate();
        max = max_year + "-" + (max_month + 1) + "-" + max_date;

        sql = `UPDATE company_info SET updatedAt_intraday = ? where symbol = "a";`;
        db.query(sql, max, function (err, rows, fields) {
          sql = `SELECT symbol from company_info where updatedAt_intraday<'${max}' OR updatedAt_intraday IS null`;
          db.query(sql, async function (err, rows, fields) {
            for (var i in rows) {
              let symbol = rows[i].symbol;
              await delayFunc.sleep(12050);
              count = rows.length - id;
              id += 1;
              console.log(symbol);

              if (symbol) {
                try {
                  url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=full&apikey=${API_KEY2}`;
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

              let content = await resData["Time Series (5min)"];
              if (content) {
                const keys = Object.keys(content);

                let sql = `insert IGNORE into intraday(symbol, datetime, open, high,low,close,volume) values (?)`;

                console.log(
                  `${symbol} inserted into database : ${count} symbols left`
                );

                keys.forEach(function (key, index) {
                  const row = content[key];
                  const date = keys[index];
                  const open = parseFloat(row["1. open"]);
                  const high = parseFloat(row["2. high"]);
                  const low = parseFloat(row["3. low"]);
                  const close = parseFloat(row["4. close"]);
                  const volume = parseInt(row["5. volume"]);
                  const array = [symbol, date, open, high, low, close, volume];
                  db.query(sql, [array], function (err, rows, fields) {
                    if (err) console.log(err);
                  });
                });

                let sql2 = `UPDATE company_info SET updatedAt_intraday = '${max}' where symbol = ?`;
                db.query(sql2, symbol, function (err, rows, fields) {
                  if (err) console.log(err);
                });
              }
            }
          });
        });
      });
    }
  } catch {
    console.log("sql error");
  }
};
