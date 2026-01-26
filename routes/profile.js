const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const profile = require('../controllers/profile_controller');

router.get('/', middlewares_auth.ensure_authenticated, profile.show_profile);

router.post('/post/user_info', middlewares_auth.ensure_authenticated, profile.post_user_info);

router.get('/get/user_info', middlewares_auth.ensure_authenticated, profile.get_user_info);

router.post('/post/change_password', middlewares_auth.ensure_authenticated, profile.post_change_password);
router.post('/post/menu_option', middlewares_auth.ensure_authenticated, profile.post_menu_option);
router.post('/post/change_noti_popup_status', middlewares_auth.ensure_authenticated, profile.post_change_noti_popup_status);

module.exports = router;


