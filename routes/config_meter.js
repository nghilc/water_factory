const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const config_meter = require('../controllers/config_meter_controller');

router.get('/', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, middlewares_auth.access_menu(["9"]), config_meter.show_config_meter);
router.get('/get/meter_info', middlewares_auth.ensure_authenticated, config_meter.get_meter_info);
router.post('/post/config_freq', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, config_meter.post_config_freq);
router.post('/post/config_reset_and_save', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, config_meter.post_config_reset_and_save);
router.post('/post/config_meter', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, config_meter.post_config_meter);
router.post('/post/config_pressure', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, config_meter.post_config_pressure);
router.post('/post/config_alert_terminal_index', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, config_meter.post_config_alert_terminal_index);
router.post('/post/config_alert_flow_rate', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, config_meter.post_config_alert_flow_rate);
router.post('/post/config_alert_pin', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, config_meter.post_config_alert_pin);

module.exports = router;

