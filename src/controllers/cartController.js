const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartController {
  // GET cart page
  async getCart(req, res) {
    try {
      const userId = req.session.user._id;

      // Get user's cart with populated product data
      const cart = await Cart.findOne({ user: userId }).populate('items.product');

      if (!cart || cart.items.length === 0) {
        return res.render('pages/cart', {
          title: 'Shopping Cart - Ecommerce Rwanda',
          cart: null,
          total: 0,
          requestId: `cart_${Date.now()}`
        });
      }

      // Calculate total
      const total = cart.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      res.render('pages/cart', {
        title: 'Shopping Cart - Ecommerce Rwanda',
        cart: cart,
        total: total,
        requestId: `cart_${Date.now()}`
      });
    } catch (error) {
      console.error('Cart page error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to load cart',
        error: error
      });
    }
  }

  // POST add to cart
  async addToCart(req, res) {
    try {
      const userId = req.session.user._id;
      const { productId, quantity = 1 } = req.body;

      // Validate product exists and is available
      const product = await Product.findById(productId);
      if (!product || !product.approved) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }

      // Get or create cart
      let cart = await Cart.findOne({ user: userId });

      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      // Check if product already in cart
      const existingItem = cart.items.find(item => item.product.toString() === productId);

      if (existingItem) {
        // Update quantity
        existingItem.quantity += parseInt(quantity);
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity: parseInt(quantity)
        });
      }

      await cart.save();

      res.json({
        success: true,
        message: 'Product added to cart',
        cartItemCount: cart.items.length
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ success: false, message: 'Failed to add to cart' });
    }
  }

  // POST remove from cart
  async removeFromCart(req, res) {
    try {
      const userId = req.session.user._id;
      const { productId } = req.body;

      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      // Remove item from cart
      cart.items = cart.items.filter(item => item.product.toString() !== productId);

      await cart.save();

      res.redirect('/cart');
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).render('pages/error', {
        title: 'Error',
        message: 'Failed to remove from cart',
        error: error
      });
    }
  }

  // POST update cart item quantity
  async updateQuantity(req, res) {
    try {
      const userId = req.session.user._id;
      const { productId, quantity } = req.body;

      if (quantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
      }

      const cart = await Cart.findOne({ user: userId }).populate('items.product');

      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      const item = cart.items.find(item => item.product._id.toString() === productId);

      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found in cart' });
      }

      // Check stock availability
      if (quantity > item.product.stock) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }

      item.quantity = quantity;
      await cart.save();

      // Calculate new total
      const total = cart.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      res.json({
        success: true,
        message: 'Quantity updated',
        total: total,
        itemCount: cart.items.length
      });
    } catch (error) {
      console.error('Update quantity error:', error);
      res.status(500).json({ success: false, message: 'Failed to update quantity' });
    }
  }
}

module.exports = new CartController();