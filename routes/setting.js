const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const setting = require('../controllers/setting_controller');

router.get('/', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["8"]), setting.show_setting);
router.get('/get/meter_info', middlewares_auth.ensure_authenticated, setting.get_meter_info);
router.post('/post/save_meter_info', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.post_save_meter_info);
router.post('/post/save_alert_config', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.post_save_alert_config);

router.post('/post/save_alert_voltage', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.save_alert_voltage);
router.post('/post/save_multiplier_first_index', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.save_multiplier_first_index);
router.post('/post/save_compen_value_conver_value', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.save_compen_value_conver_value);
router.post('/post/save_pressuer_config', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.save_pressure_config);
router.post('/post/save_setting_conversion', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.save_setting_conversion);
router.post('/post/save_water_output', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.save_water_output);
router.post('/post/save_threshold_terminal_index', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.save_threshold_terminal_index);


router.post('/post/collection_channel_device', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.collection_channel_device);

router.post('/post/delete_meter_acc', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.delete_meter_acc);
router.get('/get/log_user', middlewares_auth.ensure_authenticated, setting.get_log_user);
router.get('/get/delete_meter_data', middlewares_auth.ensure_authenticated, setting.get_delete_meter_data);
router.post('/post/delete_OP_data', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.post_delete_OP_data);

router.post('/post/save_meter_cycle', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, setting.post_save_meter_cycle);


module.exports = router;

