var createError = require("http-errors");
const mysql = require("mysql");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const app = require("express")();
const cron = require("node-cron");
const insertController = require("./src/./controllers/stockInsertController");
const https = require("https");
const http = require("http");
const fs = require("fs");
var moment = require("moment");

require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

console.log(moment().format("YYYY-MM-DD HH:mm:ss"));

// const options = {
//   key: fs.readFileSync("./certificates/private.key"),
//   cert: fs.readFileSync("./certificates/certificate.crt"),
// };
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// const options = {
//   key: fs.readFileSync(
//     "/home/hosting_users/dufqkd1004/apps/dufqkd1004_teststock/certificates/private.key"
//   ),
//   cert: fs.readFileSync(
//     "/home/hosting_users/dufqkd1004/apps/dufqkd1004_teststock/certificates/certificate.crt"
//   ),
//   ca: fs.readFileSync(
//     "/home/hosting_users/dufqkd1004/apps/dufqkd1004_teststock/certificates/ca_bundle.crt"
//   ),
// };

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: {
    openapi: "3.0.2",
    info: {
      title: "stockKING API 명세",
      version: "1.2",
    },
    // host: "http://teststock.cafe24app.com",
    // basePath: "/",
    servers: [
      {
        // url: "http://localhost:8001",
        // url: "http://teststock.cafe24app.com",
        url: "http://stockking.cafe24app.com",
      },
    ],
  },

  // apis: ["./api-doc/**/*.yaml"],
  apis: [
    "/home/hosting_users/dufqkd1004/apps/dufqkd1004_stockking/api-doc/**/*.yaml",
  ],

  // apis: ["./api-doc/**/*.yaml"],
  // apis: [
  //   "/home/hosting_users/dufqkd1004/apps/dufqkd1004_teststock/api-doc/**/*.yaml",
  // ],
});

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
// app.use("/", function (req, res, next) {
//   res.send("this");
// });
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

module.exports = db;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// requiring routers
const stock_get = require("./src/routes/stockGetRouter");
const cap_get = require("./src/routes/capGetRouter");
const change_get = require("./src/routes/fluctationGetRouter");
const company_insert = require("./src/routes/companyInsertRouter");
const realtime_get = require("./src/routes/realtimeGetRouter");
const search = require("./src/routes/searchRouter");
const login = require("./src/routes/loginRouter");

// specifying path of routers

const favorite = require("./src/routes/favoriteRouter");
const { symbol } = require("joi");
const { BADQUERY } = require("dns");

app.use("/stock", stock_get);
app.use("/cap", cap_get);
app.use("/change", change_get);
app.use("/company", company_insert);
app.use("/realtime", realtime_get);
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/search", search);
app.use("/login", login);

app.use("/favorite", favorite);

// const update_daily = function () {
//   cron.schedule("0 18 * * * *", () => {
//     insertController.insert_daily_data();
//     console.log("18분!");
//   });
// };
// update_daily();
// cron.schedule("0 0 10 * * *", async function () {
//insertController.insert_daily_data();
// });

// cron.schedule("0 0 21 * * *", async function () {
//   insertController.insert_intraday_data();
// });

// const recentDateSql = `select date from daily where symbol = "a" order by date desc limit 1`;
// // const recentDateSql = `select * from daily where date = "2022-08-08";`;
// db.query(recentDateSql, (err, result) => {
//   if (err) console.log(err);

//   var queryDate = result[0].date;
//   const year = queryDate.getFullYear();
//   const month = queryDate.getMonth();
//   const date = queryDate.getDate();

//   const initialDate = year + "-" + (month + 1) + "-" + date;
//   console.log(initialDate);

//   const remainSql = `select symbol from company_info where updatedAt_daily < ?`;
//   db.query(remainSql, initialDate, (err, result) => {
//     if (result.length) {
//       insertController.insert_daily_data();
//     }
//   });
// });

// const sqlForLag = `select symbol, date, (select date from daily where symbol = a.symbol and date < a.date order by date desc limit 1)lag from daily as a where a.symbol = "aapl" and a.date> "2022-05-05" group by a.symbol, a.date;`;
// const leadDate = new Array();
// const lagDate = new Array();
// const symbolArr = new Array();
// const lagArr = new Array();
// const lagCloseArr = new Array();
// const leadArr = new Array();
// const leadCloseArr = new Array();
// db.query(sqlForLag, async (err, result) => {
//   await Object.keys(result).forEach(async function (key) {
//     const queryDate = result[key].date;
//     // console.log(result[key].date);
//     const year = queryDate.getFullYear();
//     const month = queryDate.getMonth();
//     const date = queryDate.getDate();

//     const initialDate = year + "-" + (month + 1) + "-" + date;
//     console.log(initialDate);
//     leadDate.push(initialDate);
//     const queryDate2 = result[key].lag;
//     // console.log(result[key].date);
//     const year2 = queryDate2.getFullYear();
//     const month2 = queryDate2.getMonth();
//     const date2 = queryDate2.getDate();

//     const initialDate2 = year2 + "-" + (month2 + 1) + "-" + date2;
//     console.log(initialDate2);
//     lagDate.push(initialDate2);
//   });
//   // await console.log(leadDate[1] + "this!");
//   await Object.keys(result).forEach(async function (key) {
//     const sqlThis = `select date, symbol, close from daily where date = "${leadDate[key]}"`;
//     db.query(sqlThis, (err, result) => {
//       // console.log(result[key].date);
//       // console.log(result[key].symbol);
//       // console.log(result[key].close);
//       symbolArr.push(result[key].symbol);
//       lagArr.push(result[key].date);
//       lagCloseArr.push(result[key].close);
//     });
//   });
//   await console.log(lagArr);
//   await Object.keys(result).forEach(async function (key) {
//     const sqlThis = `select date, symbol, close from daily where date = "${lagDate[key]}"`;
//     db.query(sqlThis, (err, result) => {
//       // console.log(result[key].date);
//       // console.log(result[key].symbol);
//       // console.log(result[key].close);
//     });
//   });
// });

// async function test() {
//   const valueArr = new Array();
//   const percentArr = new Array();
//   const dateArr = new Array();
//   const symbolArr2 = new Array();
//   const sql = `select date, symbol,Round(close-(select close from daily where symbol = a.symbol and date<a.date order by date desc limit 1),2) as change_value,Round((close-(select close from daily where symbol = a.symbol and date < a.date order by date desc limit 1))/(select close from daily where symbol = a.symbol and date < a.date order by date desc limit 1)*100,2) as change_percent, close  from daily a where a.date >"2022-05-05" group by a.symbol, a.date;`;
//   db.query(sql, async (err, result) => {
//     await Object.keys(result).forEach(async function (i) {
//       symbolArr2.push(result[i].symbol);
//       //dateArr.push(result[i].date);
//       valueArr.push(result[i].change_value);
//       percentArr.push(result[i].change_percent);

//       var queryDate = result[i].date;
//       const year = queryDate.getFullYear();
//       const month = queryDate.getMonth();
//       const date = queryDate.getDate();

//       const initialDate = year + "-" + (month + 1) + "-" + date;
//       dateArr.push(initialDate);
//       //percentArr[i] = initialDate;
//     });
//     // console.log(dateArr);
//     // console.log(symbolArr2);
//     // console.log(valueArr);
//     // console.log(percentArr);

//     await Object.keys(result).forEach(async function (i) {
//       const sql2 = `update daily set change_percent = ${percentArr[i]}, change_value= ${valueArr[i]} where symbol = ? and date = "${dateArr[i]}"`;
//       console.log(percentArr[i]);
//       console.log(symbolArr2[i]);
//       //console.log(dateArr[i]);

//       db.query(sql2, symbolArr2[i], (err, result) => {
//         if (err) console.log(err);
//         //console.log(result);
//         console.log(result);
//       });
//     });
//   });
// }
//test();

//update daily set change_percent = d.change_percent, change_value= d.lagClose from (select symbol,date,Round(close-(select close from daily where symbol = a.symbol and date < a.date order by date desc limit 1),2) as lagClose, Round((close-(select close from daily where symbol = a.symbol and date < a.date order by date desc limit 1)/(select close from daily where symbol = a.symbol and date < a.date order by date desc limit 1)*100),2) as change_percent from daily as a where a.symbol = "aapl" and a.date> "2022-05-05" group by a.symbol, a.date) as d where daily.symbol = d. symbol;
//update daily a set (change_value,change_percent) = (select Round(close-(select close from daily where symbol = a.symbol and date < a.date order by date desc limit 1),2) as change_value, Round((close-(select close from daily where symbol = a.symbol and date < a.date order by date desc limit 1)/(select close from daily where symbol = a.symbol and date < a.date order by date desc limit 1)*100),2) as change_percent from daily as b where a.symbol = "aapl" and a.date> "2022-05-05"  and a.date = b.date group by a.symbol, a.date);
// async function test() {
//   var symbol2 = new Array();
//   var close1 = new Array();
//   var close2 = new Array();

//   const everySql = "select symbol from company_info";
//   await db.query(everySql, (err, result) => {
//     // console.log(rows[0].symbol);

//     Object.keys(result).forEach(async function (key) {
//       const symbolSelect = result[key].symbol;
//       symbol2.push(result[key].symbol);
//       const sql1 = `select date from daily where symbol = ? order by date desc limit 1`;
//       db.query(sql1, symbolSelect, (err, row) => {
//         var queryDate = row[0].date;
//         const year = queryDate.getFullYear();
//         const month = queryDate.getMonth();
//         const date = queryDate.getDate();

//         const initialDate = year + "-" + (month + 1) + "-" + date;
//         // console.log(initialDate);

//         const sqlPrevious = `select close from daily where date = ? and symbol = "${symbolSelect}"`;
//         db.query(sqlPrevious, initialDate, (err, row) => {
//           for (var i in row) {
//             // const close = row[i].close;
//             close1.push(row[i].close);
//             // console.log(initialDate);
//             // console.log("1" + ":" + close);

//             const sql1 = `select date from daily where symbol = ? order by date desc limit 1 offset 1`;
//             db.query(sql1, symbolSelect, (err, row) => {
//               var queryDate = row[0].date;
//               const year = queryDate.getFullYear();
//               const month = queryDate.getMonth();
//               const date = queryDate.getDate();

//               const initialDate = year + "-" + (month + 1) + "-" + date;
//               // console.log(initialDate);

//               const sqlPrevious = `select close from daily where date = ? and symbol = "${symbolSelect}"`;
//               db.query(sqlPrevious, initialDate, (err, row) => {
//                 Object.keys(row).forEach(async function (key) {
//                   // const close2 = row[key].close;
//                   close2.push(row[key].close);
//                   console.log(close1[key]);
//                   // console.log(initialDate);
//                   // console.log("2" + ":" + close2);
//                   // console.log(close + close2);

//                   const sqlNow = `select date, (${close1[key]} - ${close2[key]}) as value, ((${close1[key]} - ${close2[key]} / ${close2[key]}) *100) as percent from daily`;
//                   db.query(sqlNow, (err, row) => {
//                     console.log(row);
//                     // if (err) console.log(err);
//                     // Object.keys(row).forEach(async function (key) {
//                     //   let date = row[key].date;
//                     //   const date_year = date.getFullYear();
//                     //   const date_month = date.getMonth();
//                     //   const date_date = date.getDate();
//                     //   date = date_year + "-" + (date_month + 1) + "-" + date_date;
//                     //   let value = row[key].value;
//                     //   let percent = row[key].percent;
//                     //   console.log(value);
//                     //   sql = `update daily set change_percent = '${percent}', change_value = ${value} where symbol = ? and date = '${date}'`;
//                     //   db.query(sql, symbolSelect, function (err, rows, fields) {
//                     //     if (err) console.log(err);
//                     //   });
//                     // });
//                   });
//                 });
//               });
//             });
//           }
//           // const sql2 = `select symbol,date from daily where symbol = ? order by date desc limit 1 offset 1`;
//           // db.query(sql2, symbolSelect, (err, row) => {
//           //   if (err) console.log(err);
//           //   var queryDate = row[0].date;
//           //   const year = queryDate.getFullYear();
//           //   const month = queryDate.getMonth();
//           //   const date = queryDate.getDate();
//           //   const initialDate = year + "-" + (month + 1) + "-" + date;
//           //   console.log(row[0].symbol);
//           //   console.log(initialDate);
//           // });
//         });
//       });
//       // console.log(result[key].symbol);
//       // let sql3 = `select date, (close - lag(close, 1) over (order by date)) as value, ((close - lag(close, 1) over (order by date))/ lag(close, 1) over (order by date)*100) as percent from daily where symbol = ?;`;
//       // db.query(sql3, result[key].symbol, function (err, rows, fields) {
//       //   for (var i in rows) {
//       //     let date = rows[i].date;
//       //     const date_year = date.getFullYear();
//       //     const date_month = date.getMonth();
//       //     const date_date = date.getDate();
//       //     date = date_year + "-" + (date_month + 1) + "-" + date_date;
//       //     let value = rows[i].value;
//       //     let percent = rows[i].percent;
//       //     console.log(value);
//       //     sql = `update daily set change_percent = '${percent}', change_value = ${value} where symbol = ? and date = '${date}'`;
//       //     db.query(sql, symbol, function (err, rows, fields) {
//       //       if (err) console.log(err);
//       //     });
//       //   }
//       // });
//     });
//   });

//   // await console.log(close1);
// }
// test();

// const recentDatetimeSql = `select date(datetime) as date from intraday where symbol = "a" order by date(datetime) desc limit 1`;
// // const recentDateSql = `select * from daily where date = "2022-08-08";`;
// db.query(recentDatetimeSql, (err, result) => {
//   if (err) console.log(err);

//   var queryDate = result[0].date;
//   console.log(queryDate);
//   const year = queryDate.getFullYear();
//   const month = queryDate.getMonth();
//   const date = queryDate.getDate();

//   const initialDate = year + "-" + (month + 1) + "-" + date;
//   console.log(initialDate);

//   const remainSql = `select symbol from company_info where updatedAt_intraday < ?`;
//   db.query(remainSql, initialDate, (err, result) => {
//     if (result.length) {
//       insertController.insert_intraday_data();
//     }
//   });
// });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
console.log(__dirname);
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(process.env.PORT || 8001);
// const httpsServer = https.createServer(options, app);
// httpsServer.listen(443, "stock-king.co.kr");
// httpsServer.listen(443, "stock-king.co.kr");
// http.createServer(app).listen(8001);
module.exports = app;
// cron circular dependency 문제 해결하기 - daily, intraday 데이터 삽입
// stock path에서 company 분리해주기
