const cron = require("node-cron");
const insertController = require("../controllers/stockInsertController");
const update_daily = function () {
  cron.schedule("* * 9 * * *", () => {
    insertController.insert_daily_data();
  });
};
module.exports = {
  update_daily,
};
