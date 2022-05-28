const db = require("../../web.js");

module.exports.stock_realtime_desc_en_recent_top100_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, c.hit, d.close,if(d.change_percent>0,concat("+",ROUND(d.change_percent,1)),ROUND(d.change_percent,1)) as change_percent, if(d.change_value>0,concat("+",ROUND(d.change_value,2)),ROUND(d.change_value,2)) as change_value, d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = "2022-05-05" and d.cap is not null and d.change_percent is not null and c.img is not null order by c.hit desc limit 100;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};
module.exports.stock_realtime_desc_kr_recent_top100_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, c.hit, d.close*1269 as close,if(d.change_percent>0,concat("+",ROUND(d.change_percent,1)),ROUND(d.change_percent,1)) as change_percent, if(d.change_value>0,concat("+",ROUND(d.change_value*1269,2)),ROUND(d.change_value*1269,2)) as change_value, d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = "2022-05-05" and d.cap is not null and d.change_percent is not null and c.img is not null order by c.hit desc limit 100;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};

module.exports.stock_realtime_asc_en_recent_top100_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, c.hit, d.close,if(d.change_percent>0,concat("+",ROUND(d.change_percent,1)),ROUND(d.change_percent,1)) as change_percent, if(d.change_value>0,concat("+",ROUND(d.change_value,2)),ROUND(d.change_value,2)) as change_value, d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = "2022-05-05" and d.cap is not null and d.change_percent is not null and c.img is not null order by c.hit asc limit 100;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};

module.exports.stock_realtime_kr_asc_recent_top100_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, c.hit, d.close*1269 as close,if(d.change_percent>0,concat("+",ROUND(d.change_percent,1)),ROUND(d.change_percent,1)) as change_percent, if(d.change_value>0,concat("+",ROUND(d.change_value*1269,2)),ROUND(d.change_value*1269,2)) as change_value, d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = "2022-05-05" and d.cap is not null and d.change_percent is not null and c.img is not null order by c.hit asc limit 100;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};
