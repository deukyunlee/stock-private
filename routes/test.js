const db = require("../web");
const router = require("express").Router();
router.get("/", (req, res, next) => {
  const sql = `SELECT * from daily`;
  try {
    db.query(sql, (err, rows, fields) => {
      res.json(rows);
    });
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
