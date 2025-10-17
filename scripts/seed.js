const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Create admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin',
    });
    await admin.save();

    // Create sample supplier
    const supplier = new User({
      name: 'Supplier',
      email: 'supplier@ecommerce.com',
      password: 'supplier123',
      role: 'supplier',
    });
    await supplier.save();

    // Create sample products
    const products = [
      {
        name: 'Sample Product 1',
        description: 'This is a sample product',
        price: 10.99,
        stock: 100,
        supplier: supplier._id,
        approved: true,
      },
      {
        name: 'Sample Product 2',
        description: 'Another sample product',
        price: 15.99,
        stock: 50,
        supplier: supplier._id,
        approved: true,
      },
    ];

    await Product.insertMany(products);

    console.log('Data seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();