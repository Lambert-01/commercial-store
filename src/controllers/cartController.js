const Cart = require('../models/Cart');
const logger = require('../utils/logger');

exports.getCart = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] 🛒 GET /cart - Cart page requested`, {
    userId: req.session.user?._id,
    userEmail: req.session.user?.email,
    isAuthenticated: !!req.session.user,
    timestamp: new Date().toISOString()
  });

  try {
    // Check authentication
    if (!req.session.user) {
      logger.warn(`[${requestId}] ❌ Authentication failed - redirecting to login`, {
        reason: 'No user session found',
        redirectUrl: '/login',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.redirect('/login');
    }

    logger.info(`[${requestId}] 🔍 Fetching cart for user: ${req.session.user._id}`);

    const cart = await Cart.findOne({ user: req.session.user._id }).populate('items.product');

    if (!cart) {
      logger.info(`[${requestId}] 📭 No cart found for user - creating empty cart data`);
    } else {
      logger.info(`[${requestId}] ✅ Cart loaded successfully`, {
        itemCount: cart.items?.length || 0,
        totalItems: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      });
    }

    // Calculate total for display
    let total = 0;
    if (cart && cart.items) {
      total = cart.items.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity;
      }, 0);
    }

    logger.info(`[${requestId}] 🎯 Rendering cart page`, {
      hasCart: !!cart,
      itemCount: cart?.items?.length || 0,
      totalAmount: total,
      renderTime: Date.now() - startTime + 'ms'
    });

    res.render('pages/cart', {
      cart,
      total,
      requestId,
      title: 'Shopping Cart - Ecommerce Rwanda'
    });

  } catch (error) {
    logger.error(`[${requestId}] 💥 Cart page error`, {
      error: error.message,
      stack: error.stack,
      userId: req.session.user?._id,
      processingTime: Date.now() - startTime + 'ms'
    });

    res.status(500).render('pages/error', {
      title: 'Cart Error - Ecommerce Rwanda',
      message: 'Failed to load shopping cart',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500,
      requestId
    });
  }
};

exports.addToCart = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] ➕ POST /cart/add - Adding item to cart`, {
    userId: req.session.user?._id,
    userEmail: req.session.user?.email,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    // Validate authentication
    if (!req.session.user) {
      logger.warn(`[${requestId}] ❌ Authentication failed for add to cart`, {
        reason: 'No user session found',
        redirectUrl: '/login'
      });
      return res.redirect('/login');
    }

    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
      logger.warn(`[${requestId}] ⚠️ Missing required fields`, {
        productId: productId || 'MISSING',
        quantity: quantity || 'MISSING',
        redirectUrl: '/products'
      });
      return res.redirect('/products?error=missing-fields');
    }

    if (isNaN(quantity) || quantity < 1) {
      logger.warn(`[${requestId}] ⚠️ Invalid quantity`, {
        quantity,
        productId,
        redirectUrl: '/products'
      });
      return res.redirect(`/products?error=invalid-quantity`);
    }

    logger.info(`[${requestId}] 🔍 Processing cart addition`, {
      productId,
      quantity: parseInt(quantity),
      userId: req.session.user._id
    });

    let cart = await Cart.findOne({ user: req.session.user._id });

    if (!cart) {
      logger.info(`[${requestId}] 🛒 Creating new cart for user`);
      cart = new Cart({ user: req.session.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + parseInt(quantity);
      logger.info(`[${requestId}] 🔄 Updating existing item quantity`, {
        oldQuantity: cart.items[itemIndex].quantity,
        addedQuantity: parseInt(quantity),
        newQuantity
      });
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      logger.info(`[${requestId}] ➕ Adding new item to cart`, {
        productId,
        quantity: parseInt(quantity)
      });
      cart.items.push({ product: productId, quantity: parseInt(quantity) });
    }

    await cart.save();

    logger.info(`[${requestId}] ✅ Item added to cart successfully`, {
      cartId: cart._id,
      itemCount: cart.items.length,
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      redirectUrl: '/cart',
      processingTime: Date.now() - startTime + 'ms'
    });

    res.redirect('/cart');

  } catch (error) {
    logger.error(`[${requestId}] 💥 Add to cart error`, {
      error: error.message,
      stack: error.stack,
      userId: req.session.user?._id,
      productId: req.body?.productId,
      quantity: req.body?.quantity,
      processingTime: Date.now() - startTime + 'ms'
    });

    res.status(500).render('pages/error', {
      title: 'Cart Error - Ecommerce Rwanda',
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500,
      requestId
    });
  }
};

exports.removeFromCart = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  logger.info(`[${requestId}] ➖ POST /cart/remove - Removing item from cart`, {
    userId: req.session.user?._id,
    userEmail: req.session.user?.email,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    // Validate authentication
    if (!req.session.user) {
      logger.warn(`[${requestId}] ❌ Authentication failed for remove from cart`, {
        reason: 'No user session found',
        redirectUrl: '/login'
      });
      return res.redirect('/login');
    }

    const { productId } = req.body;

    // Validate input
    if (!productId) {
      logger.warn(`[${requestId}] ⚠️ Missing productId`, {
        productId: productId || 'MISSING',
        redirectUrl: '/cart'
      });
      return res.redirect('/cart?error=missing-product-id');
    }

    logger.info(`[${requestId}] 🔍 Finding cart for removal`, {
      userId: req.session.user._id,
      productId
    });

    const cart = await Cart.findOne({ user: req.session.user._id });

    if (!cart) {
      logger.warn(`[${requestId}] ⚠️ Cart not found for user`, {
        userId: req.session.user._id,
        redirectUrl: '/products'
      });
      return res.redirect('/products?error=cart-not-found');
    }

    const initialItemCount = cart.items.length;
    const itemToRemove = cart.items.find(item => item.product.toString() === productId);

    if (!itemToRemove) {
      logger.warn(`[${requestId}] ⚠️ Product not found in cart`, {
        productId,
        availableProducts: cart.items.map(item => item.product.toString()),
        redirectUrl: '/cart'
      });
      return res.redirect('/cart?error=product-not-in-cart');
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await cart.save();

    logger.info(`[${requestId}] ✅ Item removed from cart successfully`, {
      productId,
      removedQuantity: itemToRemove.quantity,
      itemsBefore: initialItemCount,
      itemsAfter: cart.items.length,
      redirectUrl: '/cart',
      processingTime: Date.now() - startTime + 'ms'
    });

    res.redirect('/cart');

  } catch (error) {
    logger.error(`[${requestId}] 💥 Remove from cart error`, {
      error: error.message,
      stack: error.stack,
      userId: req.session.user?._id,
      productId: req.body?.productId,
      processingTime: Date.now() - startTime + 'ms'
    });

    res.status(500).render('pages/error', {
      title: 'Cart Error - Ecommerce Rwanda',
      message: 'Failed to remove item from cart',
      error: process.env.NODE_ENV === 'development' ? error : {},
      status: 500,
      requestId
    });
  }
};