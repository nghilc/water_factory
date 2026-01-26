const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const terminal_index = require('../controllers/terminal_index_controller');

router.get('/', middlewares_auth.ensure_authenticated, terminal_index.show_terminal_index);
router.get('/get/meter_data', middlewares_auth.ensure_authenticated, terminal_index.get_meter_data);
router.get('/get/meter_data/today_and_yesterday', middlewares_auth.ensure_authenticated, terminal_index.get_meter_data_today_and_yesterday);
router.get('/get/meter_data/this_month_and_last_month', middlewares_auth.ensure_authenticated, terminal_index.get_meter_data_this_month_and_last_month);
router.get('/get/meter_data/this_year_and_last_year', middlewares_auth.ensure_authenticated, terminal_index.get_meter_data_this_year_and_last_year);

router.get('/get/meter_data/hour_of_day', middlewares_auth.ensure_authenticated, terminal_index.get_meter_data_hour_of_day);
router.get('/get/meter_data/day_of_month', middlewares_auth.ensure_authenticated, terminal_index.get_meter_data_day_of_month);
router.get('/get/meter_data/month_of_year', middlewares_auth.ensure_authenticated, terminal_index.get_meter_data_month_of_year);

router.post('/post/insert_daily_terminal_index', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, terminal_index.post_insert_daily_terminal_index);


module.exports = router;
