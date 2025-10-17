const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mobileMoneyService = require('../services/mobileMoneyService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.session.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.render('pages/order-history', {
      orders,
      title: 'Order History - Ecommerce Rwanda'
    });
  } catch (error) {
    logger.error('Error fetching order history:', error);
    res.status(500).render('pages/error', {
      message: 'Failed to load order history',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.session.user._id
    }).populate('items.product');

    if (!order) {
      return res.status(404).render('pages/404');
    }

    res.render('pages/order-details', {
      order,
      title: `Order #${order._id} - Ecommerce Rwanda`
    });
  } catch (error) {
    logger.error('Error fetching order details:', error);
    res.status(500).render('pages/error', {
      message: 'Failed to load order details',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500
    });
  }
};

exports.processCheckout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.session.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).render('pages/cart', {
        error: 'Your cart is empty',
        cart: null
      });
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).render('pages/cart', {
          error: `Insufficient stock for ${item.product.name}`,
          cart
        });
      }
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Create order
    const order = new Order({
      customer: req.session.user._id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      total,
      shippingAddress,
      status: 'pending'
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await Cart.findByIdAndDelete(cart._id);

    // Process payment if mobile money
    if (paymentMethod === 'mobile-money') {
      const paymentResult = await mobileMoneyService.processMTNPayment({
        phoneNumber: req.session.user.phone || req.body.phoneNumber,
        amount: total,
        reference: order._id.toString(),
        callbackUrl: `${process.env.BASE_URL}/webhook/mtn`
      });

      if (paymentResult.success) {
        order.paymentReference = paymentResult.transactionId;
        order.status = 'payment_pending';
        await order.save();

        // Send notifications
        await notificationService.sendOrderConfirmation(order, req.session.user);

        return res.render('pages/payment-pending', {
          order,
          paymentResult,
          title: 'Payment Pending - Ecommerce Rwanda'
        });
      }
    }

    // Send order confirmation email
    await notificationService.sendOrderConfirmation(order, req.session.user);

    res.render('pages/order-confirmation', {
      order,
      title: 'Order Confirmed - Ecommerce Rwanda'
    });

  } catch (error) {
    logger.error('Error processing checkout:', error);
    res.status(500).render('pages/error', {
      message: 'Failed to process checkout',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500
    });
  }
};

exports.getSupplierOrders = async (req, res) => {
  try {
    // Get products by this supplier
    const supplierProducts = await Product.find({ supplier: req.session.user._id }).select('_id');

    // Get orders containing supplier's products
    const orders = await Order.find({
      'items.product': { $in: supplierProducts }
    })
    .populate('items.product')
    .populate('customer', 'name email')
    .sort({ createdAt: -1 });

    res.render('pages/supplier-orders', {
      orders,
      title: 'My Orders - Supplier Dashboard'
    });
  } catch (error) {
    logger.error('Error fetching supplier orders:', error);
    res.status(500).render('pages/error', {
      message: 'Failed to load orders',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send status update notification
    await notificationService.sendOrderStatusUpdate(order, order.customer, status);

    res.json({ success: true, order });
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};