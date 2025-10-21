const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'supplier', 'admin'], default: 'customer' },

  // Contact Information
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: 'Rwanda' },

  // Customer-specific fields
  nationality: { type: String, default: '' },
  dateOfBirth: { type: Date },

  // Supplier-specific fields
  storeName: { type: String, default: '' },
  storeDescription: { type: String, default: '' },
  businessCategory: { type: String, default: '' },
  businessId: { type: String, default: '' },

  // Account status
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  verified: { type: Boolean, default: false },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);