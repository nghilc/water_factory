const express = require('express');
const router = express.Router();
const middlewares_auth = require('../middlewares/auth');
const dma = require('../controllers/dma_controller');

router.get('/DMA_manage', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["2"]), dma.show_dma_manage);
router.get('/DMA_loss', middlewares_auth.ensure_authenticated, middlewares_auth.access_menu(["3"]), dma.show_dma_loss);

router.get('/get/DMA_loss_data', middlewares_auth.ensure_authenticated, dma.get_DMA_loss_data);

router.get('/get/DMA_list', middlewares_auth.ensure_authenticated, dma.get_DMA_list);
router.get('/get/uncheck_meter_list', middlewares_auth.ensure_authenticated, dma.get_uncheck_meter_list);
router.post('/post/save_add_dma', middlewares_auth.ensure_authenticated, dma.post_save_add_dma);
router.get('/get/dma_info', middlewares_auth.ensure_authenticated, dma.get_dma_info);
router.post('/post/save_edit_dma', middlewares_auth.ensure_authenticated, dma.post_save_edit_dma);
// router.get('/get/DMA_loss_data', middlewares_auth.ensure_authenticated, dma.show_dma_loss);
// router.get('/get/DMA_loss_data', middlewares_auth.ensure_authenticated, dma.show_dma_loss);
// router.get('/get/DMA_loss_data', middlewares_auth.ensure_authenticated, dma.show_dma_loss);
// router.get('/get/DMA_loss_data', middlewares_auth.ensure_authenticated, dma.show_dma_loss);
// router.get('/get/DMA_loss_data', middlewares_auth.ensure_authenticated, dma.show_dma_loss);
// router.get('/get/DMA_loss_data', middlewares_auth.ensure_authenticated, dma.show_dma_loss);
// router.get('/get/DMA_loss_data', middlewares_auth.ensure_authenticated, dma.show_dma_loss);




module.exports = router;