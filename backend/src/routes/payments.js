const express = require('express');
const { body } = require('express-validator');
const {
  submitPayment,
  getOrderPayment,
  getPaymentHistory,
  verifyPayment,
  getPayments,
  getPaymentStats,
} = require('../controllers/paymentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All payment routes require authentication
router.use(protect);

// User payment routes
router.post(
  '/submit',
  [
    body('orderId', 'Order ID is required').isMongoId(),
    body('transactionCode', 'Transaction code is required').not().isEmpty(),
  ],
  submitPayment
);

router.get('/order/:orderId', getOrderPayment);
router.get('/history', getPaymentHistory);



// Admin only routes
router.use(authorize('admin'));

router.post('/verify/:orderId', [
  body('transactionCode', 'Transaction code is required').not().isEmpty(),
], verifyPayment);

router.get('/', getPayments);
router.get('/stats', getPaymentStats);

module.exports = router;
