const db = require("../../web.js");

module.exports.stock_daily_fully_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `SELECT * from daily where symbol = ? and change_percent is not null`;
  db.query(sql, symbol, function (err, rows, fields) {
    // res.json(rows);
    try {
      res.json(rows);
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports.stock_daily_interval_get = (req, res, next) => {
  const symbol = req.query.symbol;
  const period = req.query.period;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let interval = "";
  let date_notYear = "";
  let sql = "";

  if (req.query.interval > 0) interval = "/" + req.query.interval;

  if (period != "year") date_notYear = 'DATE_FORMAT(timestamp, "%y"), ';

  /* high: highest, low: lowest volume: sum other than that is as it is*/
  sql = `SELECT symbol, DATE_FORMAT(timestamp,'%Y-%m-%d') as date, open,
           max(high) as high, min(low) as low, close, sum(volume)
           FROM daily WHERE symbol = '${symbol}' AND timestamp BETWEEN '${startDate}' AND '${endDate}' GROUP BY ${date_notYear}
           FLOOR(${period}(timestamp)${interval}) ORDER BY date;`;

  /*select name, timestamp, open, max(high) as high, min(low) as low, close, sum(volume) as volume from daily where name = 'aapl' and timestamp between '2020-01-01' and '2022-01-01' group by date_format(timestamp, "%y"), FLOOR(month(timestamp)/1) order by timestamp;*/
  db.query(sql, function (err, rows, fields) {
    try {
      res.json(rows);
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports.stock_intraday_fully_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `SELECT * from intraday where symbol= ?`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};

// for daily - 5 mins interval
module.exports.stock_intraday_daily_get = (req, res, next) => {
  // return next(new Error("test error"));
  const symbol = req.params.symbol;
  const sql1 = `SELECT MAX(date(datetime)) as max_date from intraday where symbol = ?`;
  db.query(sql1, symbol, function (err, rows, fields) {
    const max_date = rows[0].max_date;
    const sql2 = `SELECT * from intraday where symbol ="${symbol}" and date(datetime)=?`;
    db.query(sql2, max_date, function (err, rows, fields) {
      res.json(rows);
    });
  });
};

//DAL는 종속적이지 않음
//BL, return만
// for weekly - 4 hrs interval
module.exports.stock_intraday_weekly_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const interval = 4;
  //const sql1 = `SELECT distinct date from daily where symbol = ? order by date desc limit 7`;
  const sql1 = `SELECT distinct date(datetime) as date from intraday where symbol = ? order by date(datetime) desc limit 7;`;
  db.query(sql1, symbol, function (err, rows, fields) {
    if (err) console.log(err);
    const start_date = rows[rows.length - 1].date;
    const end_date = rows[0].date;
    console.log(start_date);
    const st_year = start_date.getFullYear();
    const st_month = start_date.getMonth();
    const st_date = start_date.getDate();
    const start = st_year + "-" + (st_month + 1) + "-" + st_date;

    console.log(start);
    console.log(end_date);

    const en_year = end_date.getFullYear();
    const en_month = end_date.getMonth();
    const en_date = end_date.getDate();
    const end = en_year + "-" + (en_month + 1) + "-" + en_date;
    console.log(end);
    const sql2 = `select symbol, datetime, open, max(high) as high, min(low) as low, close, sum(volume) as volume from intraday where symbol = "${symbol}" and date(datetime) between "${start}" and "${end}" group by date(datetime),floor (hour(datetime)/${interval}) order by datetime;`;
    // const sql2 = `select symbol, date, open, max(high) as high, min(low) as low, close, sum(volume) as volume from daily where symbol = "${symbol}" and date between "${start_date}" and "${end_date}" group by floor (date/${interval}) order by date;`;
    // const sql2 = `SELECT * from intraday where symbol ="${symbol}" and date(datetime)=?`;
    //select symbol, extract(hour from datetime)/4 as hour, open, max(high) as high, min(low) as low, close, sum(volume) as volume from intraday where symbol = "aapl" and datetime between "2022-01-01" and "2022-04-01" group by date(datetime), hour order by datetime asc;
    //select symbol, datetime, open, max(high) as high, min(low) as low, close, sum(volume) as volume from intraday where symbol = "aapl" and date(datetime) between "2022-4-27" and "2022-5-5" group by floor (hour(datetime)/4) order by datetime;

    db.query(sql2, function (err, rows, fields) {
      if (err) console.log(err);
      res.json(rows);
    });
  });
};

// for monthly - 1 day interval
module.exports.stock_daily_monthly_get = (req, res, next) => {
  const symbol = req.params.symbol;
  // <<<<<<< HEAD
  //   const sql1 = `select symbol, date, open, high, low, close, volume from daily where symbol = "${symbol}" order by date limit 30;`;
  // =======
  const sql1 = `select symbol, DATE_FORMAT(date,'%Y-%m-%d') as date, open, high, low, close, volume from daily where symbol = "${symbol}" order by date limit 30;`;
  // >>>>>>> 6f861d46dc43318056a099e354f61002b30e5755
  db.query(sql1, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};

// for every 3months - 3 days interval
module.exports.stock_daily_monthly_3_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const interval = 3;
  const sql1 = `SELECT distinct date from daily where symbol = ? order by date desc limit 90`;
  db.query(sql1, symbol, function (err, rows, fields) {
    const start_date = rows[rows.length - 1].date;
    const end_date = rows[0].date;
    console.log(start_date);
    const st_year = start_date.getFullYear();
    const st_month = start_date.getMonth();
    const st_date = start_date.getDate();
    const start = st_year + "-" + (st_month + 1) + "-" + st_date;

    console.log(start);
    console.log(end_date);

    const en_year = end_date.getFullYear();
    const en_month = end_date.getMonth();
    const en_date = end_date.getDate();
    const end = en_year + "-" + (en_month + 1) + "-" + en_date;
    console.log(end);
    const sql2 = `select symbol, DATE_FORMAT(date,'%Y-%m-%d') as date, open, max(high) as high, min(low) as low, close, sum(volume) as volume from daily where symbol = "${symbol}" and date between "${start}" and "${end}" group by floor (date/${interval}) order by date;`;
    // const sql2 = `select symbol, date, open, max(high) as high, min(low) as low, close, sum(volume) as volume from daily where symbol = "${symbol}" and date between "${start_date}" and "${end_date}" group by floor (date/${interval}) order by date;`;
    // const sql2 = `SELECT * from intraday where symbol ="${symbol}" and date(datetime)=?`;
    //select symbol, extract(hour from datetime)/4 as hour, open, max(high) as high, min(low) as low, close, sum(volume) as volume from intraday where symbol = "aapl" and datetime between "2022-01-01" and "2022-04-01" group by date(datetime), hour order by datetime asc;
    db.query(sql2, function (err, rows, fields) {
      if (err) console.log(err);
      res.json(rows);
    });
  });
};

// for every year - 14 days interval
module.exports.stock_daily_yearly_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const interval = 14;
  const sql1 = `SELECT distinct date from daily where symbol = ? order by date desc limit 365`;
  db.query(sql1, symbol, function (err, rows, fields) {
    const start_date = rows[rows.length - 1].date;
    const end_date = rows[0].date;
    console.log(start_date);
    const st_year = start_date.getFullYear();
    const st_month = start_date.getMonth();
    const st_date = start_date.getDate();
    const start = st_year + "-" + (st_month + 1) + "-" + st_date;

    console.log(start);
    console.log(end_date);

    const en_year = end_date.getFullYear();
    const en_month = end_date.getMonth();
    const en_date = end_date.getDate();
    const end = en_year + "-" + (en_month + 1) + "-" + en_date;
    console.log(end);
    const sql2 = `select symbol, DATE_FORMAT(date,'%Y-%m-%d') as date, open, max(high) as high, min(low) as low, close, sum(volume) as volume from daily where symbol = "${symbol}" and date between "${start}" and "${end}" group by floor (date/${interval}) order by date;`;
    // const sql2 = `select symbol, date, open, max(high) as high, min(low) as low, close, sum(volume) as volume from daily where symbol = "${symbol}" and date between "${start_date}" and "${end_date}" group by floor (date/${interval}) order by date;`;
    // const sql2 = `SELECT * from intraday where symbol ="${symbol}" and date(datetime)=?`;
    //select symbol, extract(hour from datetime)/4 as hour, open, max(high) as high, min(low) as low, close, sum(volume) as volume from intraday where symbol = "aapl" and datetime between "2022-01-01" and "2022-04-01" group by date(datetime), hour order by datetime asc;
    db.query(sql2, function (err, rows, fields) {
      if (err) console.log(err);
      res.json(rows);
    });
  });
};

module.exports.stock_company_fully_get = (req, res, next) => {
  // const sql = `SELECT rank() over (order by cap DESC) as rank, symbol, name_en, name_kr,img from company_info natural join daily`;

  const sql = `SELECT symbol, name_en, name_kr,img from company_info`;
  db.query(sql, function (err, rows, fields) {
    res.json(rows);
  });
};

module.exports.stock_company_specific_get = (req, res, next) => {
  const symbol = req.params.symbol;
  const sql = `SELECT symbol, name_en, name_kr, desc_en,desc_kr,img,shareout from company_info where symbol = ?`;
  db.query(sql, symbol, function (err, rows, fields) {
    res.json(rows);
  });
};

// module.exports.stock_fluctation_en_recent_fully_get = (req, res, next) => {
//   const symbol = req.params.symbol;
//   const sql = `select d.change_percent as change_percent,d.change_value as change_value,d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" order by d.change_percent desc;`;
//   db.query(sql, symbol, function (err, rows, fields) {
//     res.json(rows);
//   });
// };

// module.exports.stock_fluctation_en_recent_top100_get = (req, res, next) => {
//   const symbol = req.params.symbol;
//   const sql = `select d.change_percent as change_percent,d.change_value as change_value,d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" order by d.change_percent desc limit 100;`;
//   db.query(sql, symbol, function (err, rows, fields) {
//     res.json(rows);
//   });
// };

// 시가총액 전체
// select d.symbol as symbol,c.name_en as name,d.cap from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = "2022-05-05" and d.cap is not null order by cap desc;

// 시가총액 TOP100
// select d.symbol as symbol,c.name_en as name,d.cap from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = "2022-05-05" and d.cap is not null order by cap desc limit 100;

// 시가총액 전체 (한글 ver) 5/6환율 1269원/$ 기준
// select d.symbol as symbol,c.name_kr as name,d.cap*1269 as cap from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = "2022-05-05" and d.cap is not null order by cap desc;

// 시가총액 TOP100 (한글 ver) 5/6환율 1269원/$ 기준
// select d.symbol as symbol,c.name_kr as name,d.cap*1269 as cap from daily as d inner join company_info as c on d.symbol = c.symbol where d.date = "2022-05-05" and d.cap is not null order by cap desc limit 100;

// 등락율 전체
// select d.change_percent as change_percent,d.change_value as change_value,d.symbol as symbol,c.name_en as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" order by d.change_percent desc;

// 등락율 top 100
// select d.change_percent as change_percent,d.change_value as change_value,d.symbol as symbol,c.name_en as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" order by d.change_percent desc limit 100;

// 등락율 전체 (한글 ver) 5/6환율 1269/$ 기준
// select d.change_percent as change_percent,d.change_value*1269 as change_value,d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" order by d.change_percent desc;

// 등락율 TOP100 (한글 ver) 5/6환율 1269/$ 기준
// select d.change_percent as change_percent,d.change_value*1269 as change_value,d.symbol as symbol,c.name_kr as name from daily as d inner join company_info as c on d.symbol=c.symbol where d.date = "2022-05-05" order by d.change_percent desc limit 100;
