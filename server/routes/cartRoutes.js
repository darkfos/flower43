const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdminMiddleware = require('../middleware/isAdminMiddleware');

router.post('/add', cartController.addToCart);
router.post('/update', cartController.updateQuantity);
router.post('/remove', cartController.removeFromCart);
router.post('/buy/:cartId', authMiddleware, cartController.buyProductFromCart);
router.post('/clear', cartController.clearCart);
router.put('/update', authMiddleware, isAdminMiddleware, cartController.updateCartsFromAdmin);
router.get('/user/:userId', cartController.getCart);
router.get('/all', authMiddleware, isAdminMiddleware, cartController.allCartsToAdmin);

module.exports = router;