const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const data_search = require('../controllers/data_search_controller');

router.get('/', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["1"]), data_search.show_data_search);
router.get('/get/meter_data', middlewares_auth.ensure_authenticated, middlewares_auth.check_required_field(["MeterCode", "NodeCode", "start_date", "end_date"],"query"), data_search.get_meter_data);
router.get('/get/child_meter', middlewares_auth.ensure_authenticated, data_search.get_child_meter);
router.get('/get/field', middlewares_auth.ensure_authenticated, middlewares_auth.check_required_field(["MeterCode","NodeCode"],"query"), data_search.get_field);






module.exports = router;


