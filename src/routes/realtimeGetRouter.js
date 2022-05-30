const router = require("express").Router();
const controller = require("../controllers/realtimeGetController");
const validation = require("../funcs/validation");
const { validate } = require("../funcs/validationMiddleware");

router.get("/en/desc", controller.stock_realtime_desc_en_recent_top100_get);
router.get("/kr/desc", controller.stock_realtime_desc_kr_recent_top100_get);
// router.get("/en/asc", controller.stock_realtime_asc_en_recent_top100_get);
// router.get("/kr/asc", controller.stock_realtime_kr_asc_recent_top100_get);

module.exports = router;
