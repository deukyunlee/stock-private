const db = require("../../web.js");

module.exports.stock_fluctation_desc_recent_fully_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, d.close,if(d.change_percent>0,concat("+",ROUND(d.change_percent,1)),ROUND(d.change_percent,1)) as change_percent, if(d.change_value>0,concat("+",ROUND(d.change_value*1269,2)),ROUND(d.change_value*1269,2)) as change_value,d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" and img is not null and change_percent is not null and d.symbol != "MRO" order by d.change_percent desc;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};

module.exports.stock_fluctation_asc_recent_fully_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, d.close,if(d.change_percent>0,concat("+",ROUND(d.change_percent,1)),ROUND(d.change_percent,1)) as change_percent, if(d.change_value>0,concat("+",ROUND(d.change_value*1269,2)),ROUND(d.change_value*1269,2)) as change_value,d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" and img is not null and change_percent is not null and d.symbol != "MRO" order by d.change_percent asc;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
    //
  });
};

module.exports.stock_fluctation_desc_recent_top100_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, d.close,if(d.change_percent>0,concat("+",ROUND(d.change_percent,1)),ROUND(d.change_percent,1)) as change_percent, if(d.change_value>0,concat("+",ROUND(d.change_value*1269,2)),ROUND(d.change_value*1269,2)) as change_value,d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" and img is not null and change_percent is not null and d.symbol != "MRO" order by d.change_percent desc limit 100;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};

module.exports.stock_fluctation_asc_recent_top100_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `select c.img as img, d.close,if(d.change_percent>0,concat("+",ROUND(d.change_percent,1)),ROUND(d.change_percent,1)) as change_percent, if(d.change_value>0,concat("+",ROUND(d.change_value*1269,2)),ROUND(d.change_value*1269,2)) as change_value,d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" and img is not null and change_percent is not null and d.symbol != "MRO" order by d.change_percent asc limit 100;`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};
