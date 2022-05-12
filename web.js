var createError = require("http-errors");
const mysql = require("mysql");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
var app = express();

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
    host: "http://teststock.cafe24app.com",
    basePath: "/",
    // servers: [
    //   {
    //     // url: "http://localhost:8001",
    //     url: "http://teststock.cafe24app.com",
    //   },
    // ],
  },
  apis: ["./api-doc/**/*.yaml"],
});

const db = mysql.createConnection({
  host: "teststock.cafe24app.com",
  user: "dufqkd1004",
  password: "capstone!!",
  database: "dufqkd1004",
  port: "3306",
  multipleStatements: true,
  // dateStrings: "date",
  //socketPath: socket_path,
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

// db.connect(function (error) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Connected!:)");
//   }
// });
module.exports = db;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/test2", (req, res) => {
  const sql = `select * from daily where symbol = 'aapl';`;
  db.query(sql, (err, rows, fields) => {
    res.json(rows);
  });
});

const stock_get = require("./src/routes/stockGetRouter");
const cap_get = require("./src/routes/capGetRouter");
const change_get = require("./src/routes/fluctationGetRouter");

app.use("/stock", stock_get);
app.use("/cap", cap_get);
app.use("/change", change_get);

app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

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
module.exports = app;
