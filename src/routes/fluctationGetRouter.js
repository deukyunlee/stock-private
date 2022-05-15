const router = require("express").Router();
const controller = require("../controllers/fluctationGetController");

router.get(
  "/full-data/desc",
  controller.stock_fluctation_desc_recent_fully_get
);
router.get("/top100/desc", controller.stock_fluctation_desc_recent_top100_get);
router.get("/full-data/asc", controller.stock_fluctation_asc_recent_fully_get);
router.get("/top100/asc", controller.stock_fluctation_asc_recent_top100_get);

module.exports = router;
