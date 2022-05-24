const router = require("express").Router();
const controller = require("../controllers/companyInsertController");
router.post("/info", controller.insert_company_info);

module.exports = router;
