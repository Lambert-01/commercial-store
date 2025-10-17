const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);