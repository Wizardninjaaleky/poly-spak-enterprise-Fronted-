const express = require('express');
const { body, param } = require('express-validator');
const recaptcha = require('express-recaptcha').RecaptchaV2;
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

// Initialize reCAPTCHA
const recaptchaInstance = new recaptcha(
  process.env.RECAPTCHA_SITE_KEY || 'your_site_key',
  process.env.RECAPTCHA_SECRET_KEY || 'your_secret_key'
);

// All payment routes require authentication
router.use(protect);

// User payment routes
router.post(
  '/submit',
  recaptchaInstance.middleware.verify,
  [
    body('orderId', 'Order ID is required').isMongoId(),
    body('amount', 'Amount is required').isFloat({ min: 0 }),
    body('phoneNumber', 'Phone number is required').isMobilePhone('any'),
    body('mpesaCode', 'M-Pesa code is required').not().isEmpty().isLength({ min: 10, max: 15 }),
  ],
  submitPayment
);

router.get('/order/:orderId', [
  param('orderId', 'Invalid order ID').isMongoId(),
], getOrderPayment);

router.get('/history', getPaymentHistory);

// Admin only routes
router.use(authorize('admin'));

router.put('/verify/:orderId', [
  param('orderId', 'Invalid order ID').isMongoId(),
  body('action', 'Action is required').isIn(['confirm', 'reject']),
  body('rejectionReason').optional().isString().isLength({ max: 500 }),
], verifyPayment);

router.get('/', getPayments);
router.get('/stats', getPaymentStats);

module.exports = router;
