const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
  }],
  createdAt: { type: Date, default: Date.now },
});

// Virtual for total price
cartSchema.virtual('total').get(function() {
  return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
});

module.exports = mongoose.model('Cart', cartSchema);