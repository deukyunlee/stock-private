const Joi = require("joi");

exports.symbol = Joi.object().keys({
  symbol: Joi.string().min(1).max(10).required(),
});
