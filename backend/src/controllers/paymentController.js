const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');
const { verifyPayment, getPaymentDetails, getAllPayments, getPaymentStats } = require('../services/mpesaService');

// @desc    Submit payment for verification
// @route   POST /api/payments/submit
// @access  Private
exports.submitPayment = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { orderId, transactionCode } = req.body;

  try {
    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to submit payment for this order',
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    // Update order with transaction code
    order.mpesaCode = transactionCode;
    order.paymentStatus = 'awaiting'; // Awaiting verification
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment submitted for verification. You will receive a confirmation email once verified.',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get payment details for user's order
// @route   GET /api/payments/order/:orderId
// @access  Private
exports.getOrderPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this payment',
      });
    }

    const payment = await getPaymentDetails(req.params.orderId);

    res.status(200).json({
      success: true,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          mpesaCode: order.mpesaCode,
        },
        payment,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .select('orderNumber totalAmount paymentStatus paymentMethod mpesaCode createdAt')
      .sort({ createdAt: -1 });

    const payments = await Payment.find({ userId: req.user.id })
      .populate('orderId', 'orderNumber totalAmount')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        orders,
        payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Verify payment (Admin only)
// @route   POST /api/payments/verify/:orderId
// @access  Private/Admin
exports.verifyPayment = async (req, res) => {
  const { transactionCode } = req.body;

  try {
    const result = await verifyPayment(req.params.orderId, transactionCode, req.user.id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all payments (Admin only)
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = async (req, res) => {
  try {
    const filters = {
      verified: req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const payments = await getAllPayments(filters);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get payment statistics (Admin only)
// @route   GET /api/payments/stats
// @access  Private/Admin
exports.getPaymentStats = async (req, res) => {
  try {
    const stats = await getPaymentStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


