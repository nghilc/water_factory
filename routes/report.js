const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const report = require('../controllers/report_controller');

router.get('/meter_list', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["5"]), report.show_report_meter_list);
router.get('/meter_rate', middlewares_auth.ensure_authenticated, report.show_report_meter_rate);
router.get('/meter_alert', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["7"]), report.show_report_meter_alert);
router.get('/meter_data', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["6"]), report.show_report_meter_data);
router.get('/meter_pressure', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["10"]), report.show_report_meter_pressure);
router.get('/meter_terminal_index', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["11"]), report.show_report_meter_terminal_index);
router.post('/export_meter_terminal_index', middlewares_auth.ensure_authenticated, report.export_meter_terminal_index);


router.post('/get/meter_rate_data', middlewares_auth.ensure_authenticated, report.get_meter_rate_data);

router.post('/export_meter_rate', middlewares_auth.ensure_authenticated, report.export_meter_rate);

router.post('/get/meter_list_data', middlewares_auth.ensure_authenticated, report.get_meter_list_data);

router.post('/export_meter_list', middlewares_auth.ensure_authenticated, report.export_meter_list);

router.post('/get/meter_pressure_data', middlewares_auth.ensure_authenticated, report.get_meter_pressure_data);
router.post('/export_meter_pressure_data', middlewares_auth.ensure_authenticated, report.export_meter_pressure_data);




router.post('/get/meter_terminal_index_data', middlewares_auth.ensure_authenticated, report.get_meter_terminal_index_data);

router.get('/get/meter_data', middlewares_auth.ensure_authenticated, report.get_meter_data);

router.get('/export_meter_data', middlewares_auth.ensure_authenticated, report.export_meter_data);

router.get('/get/alert_data', middlewares_auth.ensure_authenticated, report.get_alert_data);

router.get('/export_meter_alert', middlewares_auth.ensure_authenticated, report.export_meter_alert);
router.get('/export_field_meter_data', middlewares_auth.ensure_authenticated, report.export_field_meter_data);







module.exports = router;

