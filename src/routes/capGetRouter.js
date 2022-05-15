const router = require("express").Router();
const controller = require("../controllers/capGetController");
router.get("/en/full-data/", controller.stock_cap_en_recent_fully_get);
router.get("/en/top100/", controller.stock_cap_en_recent_top100_get);
router.get("/kr/full-data/", controller.stock_cap_kr_recent_fully_get);
router.get("/kr/top100/", controller.stock_cap_kr_recent_top100_get);

module.exports = router;
