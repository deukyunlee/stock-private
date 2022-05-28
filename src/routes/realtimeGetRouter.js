const router = require("express").Router();
const controller = require("../controllers/realtimeGetController");

router.get("/en/desc", controller.stock_realtime_desc_en_recent_top100_get);
router.get("/kr/desc", controller.stock_realtime_desc_kr_recent_top100_get);
// router.get("/en/asc", controller.stock_realtime_asc_en_recent_top100_get);
// router.get("/kr/asc", controller.stock_realtime_kr_asc_recent_top100_get);

module.exports = router;
