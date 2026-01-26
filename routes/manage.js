const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const manage = require('../controllers/manage_controller');

router.get('/', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, manage.show_manage);
router.get('/get/user_list', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, manage.get_user_list);
router.post('/change/user_role', middlewares_auth.ensure_authenticated, middlewares_auth.check_required_field(["acc_id","role"],"body"), middlewares_auth.is_admin, manage.change_user_role);
router.post('/change/user_status', middlewares_auth.ensure_authenticated, middlewares_auth.check_required_field(["user_id","status"],"body"), middlewares_auth.is_admin, manage.change_user_status);
router.post('/change/user_allow_req_api', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, manage.change_user_allow_req_api);

router.post('/delete/user', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, manage.delete_user);

router.get('/get/set_role_meter_list', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin,  manage.get_set_role_meter_list);


router.post('/post/set_role', middlewares_auth.ensure_authenticated, middlewares_auth.check_required_field(["user_id", "arr_meter"], "body"), middlewares_auth.is_admin,  manage.post_set_role);
router.post('/register_admin', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin,  manage.register_admin);
router.get('/get/danhsachdonvi', middlewares_auth.ensure_authenticated,  manage.get_danhsachdonvi);
router.get('/get/danhsachnhom', middlewares_auth.ensure_authenticated, manage.get_danhsachnhom);

router.post('/post/themdonvi', middlewares_auth.ensure_authenticated, manage.post_themdonvi);
router.post('/post/themnhom', middlewares_auth.ensure_authenticated, manage.post_themnhom);

// router.post('/delete/donvi', middlewares_auth.ensure_authenticated, middlewares_auth.is_admin, middlewares_auth.check_required_field(["donvi_id"],"body"),manage.delete_donvi);
router.post('/delete/nhom', middlewares_auth.ensure_authenticated, manage.delete_nhom);

router.post('/post/suatendonvi', middlewares_auth.ensure_authenticated,  middlewares_auth.check_required_field(["ten_donvi"],"body"),manage.post_suatendonvi);
router.post('/post/suatennhom', middlewares_auth.ensure_authenticated, manage.post_suatennhom);

router.post('/post/save_manage_danhsachthietbi', middlewares_auth.ensure_authenticated, manage.post_save_manage_danhsachthietbi);

router.get('/get/danhsachtram', middlewares_auth.ensure_authenticated,  manage.get_danhsachtram);
router.get('/get/danhsach_dvql', middlewares_auth.ensure_authenticated,  manage.get_danhsach_dvql);
router.get('/get/danhsachthietbi', middlewares_auth.ensure_authenticated, manage.get_danhsachthietbi);


router.get('/get/resign_meter_list', middlewares_auth.ensure_authenticated,  manage.get_resign_meter_list);


router.post('/post/doi_donvi', middlewares_auth.ensure_authenticated,  middlewares_auth.check_required_field(["MeterCode","NodeCode", "donvi_id"],"body"),manage.post_doi_donvi);




router.get('/get/set_role_dvql', middlewares_auth.ensure_authenticated,  manage.get_set_role_dvql);

module.exports = router;


