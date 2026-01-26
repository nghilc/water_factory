const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const api = require('../controllers/api_controller');
const jwt = require('jsonwebtoken');
const  TOKEN_SECRET = "mySecret";
const REFESH_TOKEN = "refreshMySecret";


router.post('/api/login', api.login);
router.post('/api/refreshToken', api.refreshToken);
router.get('/api/getMeasurementWaterMeter',middlewares_auth.verifyApiToken, api.getMeasurementWaterMeter);
router.get('/api/getOperationWaterMeter',middlewares_auth.verifyApiToken, api.getOperationWaterMeter);



module.exports = router;