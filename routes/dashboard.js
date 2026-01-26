const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const dashboard_controller = require('../controllers/dashboard_controller');

router.get('/', middlewares_auth.ensure_authenticated, dashboard_controller.show_dashboard);
router.get('/get/map_data', middlewares_auth.forward_authenticated, dashboard_controller.get_map_data);
router.get('/get/general_status', middlewares_auth.ensure_authenticated, dashboard_controller.get_general_status);
router.post('/post/save_add_meter', middlewares_auth.ensure_authenticated, dashboard_controller.post_save_add_meter);
// router.get('/', middlewares_auth.ensure_authenticated, dashboard_controller.show_dashboard);
// router.get('/', middlewares_auth.ensure_authenticated, dashboard_controller.show_dashboard);
// router.get('/', middlewares_auth.ensure_authenticated, dashboard_controller.show_dashboard);
// router.get('/', middlewares_auth.ensure_authenticated, dashboard_controller.show_dashboard);
router.post('/post/map_setting', middlewares_auth.ensure_authenticated, dashboard_controller.post_map_setting);

module.exports = router;