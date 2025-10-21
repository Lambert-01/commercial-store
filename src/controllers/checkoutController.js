const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mobileMoneyService = require('../services/mobileMoneyService');

class CheckoutController {
  // GET checkout page
  async getCheckout(req, res) {
    try {
      const userId = req.session.user._id;

      // Get user's cart
      const cart = await Cart.findOne({ user: userId }).populate('items.product');

      if (!cart || cart.items.length === 0) {
        return res.redirect('/cart');
      }

      // Calculate total
      const total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      res.render('pages/checkout', {
        title: 'Checkout - Ecommerce Rwanda',
        cart: cart,
        total: total,
        requestId: `checkout_${Date.now()}`
      });
    } catch (error) {
      console.error('Checkout page error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to load checkout page',
        error: error
      });
    }
  }

  // POST process checkout
  async processCheckout(req, res) {
    try {
      const userId = req.session.user._id;
      const { shippingAddress, phoneNumber, paymentMethod, notes } = req.body;

      // Get user's cart
      const cart = await Cart.findOne({ user: userId }).populate('items.product');

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }

      // Validate stock availability
      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.product.name}`
          });
        }
      }

      // Calculate total
      const total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      // Create order
      const order = new Order({
        customer: userId,
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: total,
        shippingAddress: shippingAddress,
        phoneNumber: phoneNumber,
        paymentMethod: paymentMethod,
        notes: notes || '',
        status: 'pending'
      });

      await order.save();

      // Initiate mobile money payment
      const paymentResult = await mobileMoneyService.initiatePayment({
        orderId: order._id,
        amount: total,
        phoneNumber: phoneNumber,
        description: `Payment for order #${order._id.toString().slice(-8)}`
      });

      if (paymentResult.success) {
        // Update order with payment reference
        order.paymentReference = paymentResult.reference;
        await order.save();

        // Clear cart
        await Cart.findOneAndDelete({ user: userId });

        // Redirect to payment pending page
        res.redirect(`/checkout/payment-pending/${order._id}?ref=${paymentResult.reference}`);
      } else {
        // Payment initiation failed
        order.status = 'failed';
        await order.save();

        res.status(400).render('pages/error', {
          title: 'Payment Error',
          message: 'Failed to initiate payment. Please try again.',
          error: { message: paymentResult.message }
        });
      }

    } catch (error) {
      console.error('Process checkout error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to process checkout',
        error: error
      });
    }
  }

  // GET payment pending page
  async getPaymentPending(req, res) {
    try {
      const { orderId } = req.params;
      const { ref } = req.query;

      const order = await Order.findById(orderId).populate('items.product');

      if (!order) {
        return res.status(404).render('pages/404');
      }

      // Verify payment reference matches
      if (order.paymentReference !== ref) {
        return res.status(400).render('pages/error', {
          title: 'Error',
          message: 'Invalid payment reference'
        });
      }

      res.render('pages/payment-pending', {
        title: 'Payment Pending - Ecommerce Rwanda',
        order: order,
        paymentResult: {
          provider: order.paymentMethod === 'mobile-money' ? 'Mobile Money' : 'Unknown',
          reference: ref
        }
      });
    } catch (error) {
      console.error('Payment pending page error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to load payment page',
        error: error
      });
    }
  }

  // POST handle payment webhook
  async handlePaymentWebhook(req, res) {
    try {
      const { provider } = req.params;
      const webhookData = req.body;

      console.log(`Payment webhook received from ${provider}:`, webhookData);

      // Process webhook based on provider
      const result = await mobileMoneyService.processWebhook(provider, webhookData);

      if (result.success) {
        // Update order status
        await Order.findByIdAndUpdate(result.orderId, {
          status: 'paid',
          paidAt: new Date()
        });

        console.log(`Order ${result.orderId} marked as paid`);
      }

      res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      console.error('Payment webhook error:', error);
      res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
  }
}

module.exports = new CheckoutController();