const Joi = require("joi");

exports.symbol = Joi.object().keys({
  symbol: Joi.string().min(1).max(10).required(),
});

exports.search = Joi.object().keys({
  method: Joi.string().min(2).max(6).required(),
  keyword: Joi.string().min(1).max(10).required(),
});
