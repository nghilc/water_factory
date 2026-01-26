const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const monitoring = require('../controllers/monitoring_controller.js');

router.get('/', middlewares_auth.ensure_authenticated, monitoring.show_monitoring);

// router.get('/get/meter_list', middlewares_auth.ensure_authenticated, monitoring.get_meter_list);
// router.get('/get/instant_meter', middlewares_auth.ensure_authenticated, monitoring.get_instant_meter);

// router.get('/get/meter_chart_data', middlewares_auth.ensure_authenticated, middlewares_auth.check_required_field(["MeterCode", "NodeCode", "start_date", "end_date"],"query"), monitoring.get_meter_chart_data);
// router.get('/get/child_meter', middlewares_auth.ensure_authenticated, monitoring.get_child_meter);

// router.post('/post/send_instant', middlewares_auth.ensure_authenticated, monitoring.send_instant);
router.get('/get/pages', middlewares_auth.ensure_authenticated, monitoring.get_pages);
router.get('/get/tong_quan', middlewares_auth.ensure_authenticated, monitoring.get_tong_quan);
router.get('/get/muc_nuoc', middlewares_auth.ensure_authenticated, monitoring.get_muc_nuoc);

router.get('/get/muc_nuoc_data', middlewares_auth.ensure_authenticated, monitoring.get_muc_nuoc_data);
router.get('/get/muc_nuoc_threshold_setting', middlewares_auth.ensure_authenticated, monitoring.get_muc_nuoc_threshold_setting);
router.post('/post/save_threshold', middlewares_auth.ensure_authenticated, monitoring.post_muc_nuoc_save_threshold);
router.get('/get/to_bom', middlewares_auth.ensure_authenticated, monitoring.get_to_bom);
router.get('/get/to_bom_data', middlewares_auth.ensure_authenticated, monitoring.get_to_bom_data);
router.get('/get/chi_so_moi_truong', middlewares_auth.ensure_authenticated, monitoring.get_chi_so_moi_truong);
router.get('/export_muc_nuoc_meter_data', middlewares_auth.ensure_authenticated, monitoring.export_muc_nuoc_meter_data);
router.get('/get/may_phat_dien_data', middlewares_auth.ensure_authenticated, monitoring.get_may_phat_dien_data);
router.get('/export_may_phat_dien', middlewares_auth.ensure_authenticated, monitoring.export_may_phat_dien);
// router.get('/', middlewares_auth.ensure_authenticated, monitoring.show_dashboard);
// router.get('/', middlewares_auth.ensure_authenticated, monitoring.show_dashboard);
// router.get('/', middlewares_auth.ensure_authenticated, monitoring.show_dashboard);
// router.get('/', middlewares_auth.ensure_authenticated, monitoring.show_dashboard);

module.exports = router;