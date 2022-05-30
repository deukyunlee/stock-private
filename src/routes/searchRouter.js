const router = require("express").Router();
const controller = require("../controllers/searchController");
const validation = require("../funcs/validation");
const { validate } = require("../funcs/validationMiddleware");

router.get(
  "/:method/:keyword",
  validate(validation.search),
  controller.search_stock
);

module.exports = router;
