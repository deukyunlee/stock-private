const router = require("express").Router();
const controller = require("../controllers/companyInsertController");
router.post("/info", controller.insert_company_info);
router.post("/test", controller.insert_cap_info);
router.post("/test2", controller.insert_rank_info);
module.exports = router;
