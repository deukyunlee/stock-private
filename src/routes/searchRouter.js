const router = require("express").Router();
const controller = require("../controllers/searchController");

router.get("/:method/:keyword", controller.search_stock);

module.exports = router;
