const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const data_alert = require('../controllers/alert_controller');

router.get('/', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["4"]), data_alert.show_alert);
router.get('/get/alert_data', middlewares_auth.ensure_authenticated, middlewares_auth.check_required_field(["MeterCode", "NodeCode", "start_date", "end_date"],"query"), data_alert.get_alert_data);

router.post('/post/send-notification', data_alert.send_notification);




module.exports = router;


