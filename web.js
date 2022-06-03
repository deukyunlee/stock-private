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
const fs = require("fs");
var moment = require("moment");

require("moment-timezone");
moment.tz.setDefault("Asia/Seoul");

console.log(moment().format("YYYY-MM-DD HH:mm:ss"));
const options = {
  key: fs.readFileSync(
    "/home/hosting_users/dufqkd1004/apps/dufqkd1004_teststock/certificates/private.key"
  ),
  cert: fs.readFileSync(
    "/home/hosting_users/dufqkd1004/apps/dufqkd1004_teststock/certificates/certificate.crt"
  ),
  ca: fs.readFileSync(
    "/home/hosting_users/dufqkd1004/apps/dufqkd1004_teststock/certificates/ca_bundle.crt"
  ),
};
// const options = {
//   key: fs.readFileSync("./certificates/private.key"),
//   cert: fs.readFileSync("./certificates/certificate.crt"),
// };
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: {
    openapi: "3.0.2",
    info: {
      title: "stockKing API 명세",
      version: "1.0",
    },
    // host: "http://teststock.cafe24app.com",
    // basePath: "/",
    servers: [
      {
        // url: "http://localhost:8001",
        // url: "http://teststock.cafe24app.com",
        url: "https://www.stock-king.co.kr",
      },
    ],
  },
  // apis: ["./api-doc/**/*.yaml"],
  apis: [
    "/home/hosting_users/dufqkd1004/apps/dufqkd1004_teststock/api-doc/**/*.yaml",
  ],
});

const db = mysql.createConnection({
  host: "teststock.cafe24app.com",
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
app.use("/", function () {
  console.log("this");
});
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
cron.schedule("0 0 10 * * *", async function () {
  insertController.insert_daily_data();
});

cron.schedule("0 0 21 * * *", async function () {
  insertController.insert_intraday_data();
});
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

// app.listen(process.env.PORT || 8001);
const httpsServer = https.createServer(options, app);
httpsServer.listen(8001, "stock-king.co.kr");

module.exports = app;
// cron circular dependency 문제 해결하기 - daily, intraday 데이터 삽입
// stock path에서 company 분리해주기
