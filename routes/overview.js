const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const overview_controller = require('../controllers/overview_controller.js');

router.get('/', middlewares_auth.ensure_authenticated, overview_controller.show_overview);
router.get('/get/danhsachthietbi', middlewares_auth.ensure_authenticated, overview_controller.get_danhsachthietbi);
router.get('/get/danhsachnhamay', middlewares_auth.ensure_authenticated, overview_controller.get_danhsachnhamay);

router.get('/get/dulieunhamay', middlewares_auth.ensure_authenticated, overview_controller.get_dulieunhamay);
router.get('/get/du_lieu_nuoc', middlewares_auth.ensure_authenticated, overview_controller.get_du_lieu_nuoc);
router.get('/export_nuoc_tho', middlewares_auth.ensure_authenticated, overview_controller.export_nuoc_tho);
router.get('/export_nuoc_sach', middlewares_auth.ensure_authenticated, overview_controller.export_nuoc_sach);
router.get('/get/standards', middlewares_auth.ensure_authenticated, overview_controller.get_standards);
router.post('/post/save_standards', middlewares_auth.ensure_authenticated, overview_controller.post_save_standards);
// router.get('/', middlewares_auth.ensure_authenticated, overview_controller.show_overview);
// router.get('/', middlewares_auth.ensure_authenticated, overview_controller.show_overview);

// router.get('/get/meter_data', middlewares_auth.ensure_authenticated, overview_controller.get_meter_data);
// router.get('/get/meter_list_tram', middlewares_auth.ensure_authenticated, middlewares_auth.check_required_field(["tram_id"],"query"), overview_controller.get_meter_list_tram);
// router.post('/post/read_instant', middlewares_auth.ensure_authenticated, overview_controller.post_read_instant);
// router.post('/post/save_meter_info', middlewares_auth.ensure_authenticated, overview_controller.post_save_meter_info);

// router.get('/get/group_info', middlewares_auth.ensure_authenticated, overview_controller.get_group_info);
// router.post('/post/save_group_info', middlewares_auth.ensure_authenticated, overview_controller.post_save_group_info);
// router.get('/', middlewares_auth.ensure_authenticated, overview_controller.show_dashboard);

module.exports = router;