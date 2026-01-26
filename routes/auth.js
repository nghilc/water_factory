const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth.js');
const auth_controller = require('../controllers/auth_controller');



router.get('/', middlewares_auth.forward_authenticated_login, (req, res) => {
    res.redirect('/login');
  });

// Đường dẫn đăng nhập
router.get('/login', middlewares_auth.forward_authenticated_login, auth_controller.showLogin);
router.get('/get/lang', auth_controller.get_lang);
router.post('/login', auth_controller.login);

// đăng xuất
router.get('/logout',auth_controller.logout);



router.get('/forgot_password', auth_controller.show_forgot_password);

router.post('/forgot_password', auth_controller.post_forgot_password);
router.get('/reset-password', auth_controller.get_reset_password);
router.post('/reset-password', auth_controller.post_reset_password);






module.exports = router;