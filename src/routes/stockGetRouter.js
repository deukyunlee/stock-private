const router = require("express").Router();
const controller = require("../controllers/stockGetController");
const controller2 = require("../controllers/companyInsertController");
const controller3 = require("../controllers/stockInsertController");
const validation = require("../funcs/validation");
const { validate } = require("../funcs/validationMiddleware");
router.get("/company/image", controller2.insert_img);
router.get("/company/full-data", controller.stock_company_fully_get);

router.get("/company/specific/:symbol", controller.stock_company_specific_get);

router.get(
  "/company/additional/:symbol",
  validate(validation.symbol),
  controller.stock_company_additional_get
);

router.get(
  "/daily/specific/full-data/:symbol",
  validate(validation.symbol),
  controller.stock_daily_fully_get
);

router.get(
  "/intraday/specific/full-data/:symbol",
  validate(validation.symbol),
  controller.stock_intraday_fully_get
);

router.get(
  "/daily/specific/interval/:symbol",
  validate(validation.symbol),
  controller.stock_daily_interval_get
);

router.get(
  "/company/specific/full-data/:symbol",
  validate(validation.symbol),
  controller.stock_company_fully_get
);

router.get(
  "/intraday/specific/for-daily/:symbol",
  validate(validation.symbol),
  controller.stock_intraday_daily_get
);

router.get(
  "/intraday/specific/for-weekly/:symbol",
  validate(validation.symbol),
  controller.stock_intraday_weekly_get
);

router.get(
  "/daily/specific/for-monthly/:symbol",
  validate(validation.symbol),
  controller.stock_daily_monthly_get
);

router.get(
  "/daily/specific/for-3monthly/:symbol",
  validate(validation.symbol),
  controller.stock_daily_monthly_3_get
);

router.get(
  "/daily/specific/for-yearly/:symbol",
  validate(validation.symbol),
  controller.stock_daily_yearly_get
);

router.get(
  "/daily/specific/for-5yearly/:symbol",
  validate(validation.symbol),
  controller.stock_daily_5yearly_get
);

// router.get(
//   "/kr/change/full-data/",
//   controller.stock_fluctation_kr_recent_fully_get
// );
// router.get(
//   "/kr/change/top100/",
//   controller.stock_fluctation_kr_recent_top100_get
// );

// for test
router.post("/daily/insert", controller3.insert_daily_data);
router.post("/intraday/insert", controller3.insert_intraday_data);
router.post("/daily", controller2.insert_company_cap);

module.exports = router;

// 라우터를 분리해줘야 할 필요 있음
