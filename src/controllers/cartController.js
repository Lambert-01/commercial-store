const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.session.user._id }).populate('items.product');
    res.render('pages/cart', { cart });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.session.user._id });
    if (!cart) {
      cart = new Cart({ user: req.session.user._id, items: [] });
    }
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({ product: productId, quantity: parseInt(quantity) });
    }
    await cart.save();
    res.redirect('/cart');
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.session.user._id });
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    res.redirect('/cart');
  } catch (error) {
    res.status(500).send('Server error');
  }
};