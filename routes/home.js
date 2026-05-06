const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const home = require('../controllers/home_controller');

router.get('/', middlewares_auth.ensure_authenticated, home.show_home);





module.exports = router;