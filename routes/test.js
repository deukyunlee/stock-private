const db = require("../web");
const router = require("express").Router();
router.get("/t2", (req, res) => {
  db.connection.query("select * from test", (err, rows, fields) => {
    res.json(rows);
  });
  db.end();
});

module.exports = router;
