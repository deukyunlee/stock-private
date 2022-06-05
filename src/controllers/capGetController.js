const db = require("../../web.js");

module.exports.stock_cap_en_recent_fully_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, d.symbol as symbol,c.name_kr as name,d.cap from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = (SELECT max(date) FROM daily where change_percent is not null) and d.cap is not null and d.change_percent is not null and c.img is not null order by cap desc;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
    //
  });
};

module.exports.stock_cap_en_recent_top100_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, d.symbol as symbol,c.name_kr as name,d.cap from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = (SELECT max(date) FROM daily where change_percent is not null) and d.cap is not null and d.change_percent is not null and c.img is not null order by cap desc limit 100;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};

module.exports.stock_cap_kr_recent_fully_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, d.symbol as symbol,c.name_kr as name,d.cap*1269 as cap from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = (SELECT max(date) FROM daily where change_percent is not null) and d.cap is not null and d.change_percent is not null and c.img is not null order by cap desc;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};

module.exports.stock_cap_kr_recent_top100_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, d.symbol as symbol,c.name_kr as name,d.cap*1269 as cap from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = "2022-05-05" and d.cap is not null and d.change_percent is not null and c.img is not null order by cap desc limit 100;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};
