const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

/**
 * Demo Users Creation Script
 * Creates sample users for testing the Ecommerce Rwanda platform
 */
async function createDemoUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_rwanda');
    console.log('✅ Connected to MongoDB for demo user creation');

    // Clear existing demo users first
    await User.deleteMany({
      email: {
        $in: [
          'demo@customer.com',
          'demo@supplier.com',
          'demo@admin.com'
        ]
      }
    });
    console.log('🗑️ Cleared existing demo users');

    // Create demo users
    const demoUsers = [
      {
        name: 'Demo Customer',
        email: 'demo@customer.com',
        password: 'demo123', // Will be hashed by pre-save hook
        role: 'customer'
      },
      {
        name: 'Demo Supplier',
        email: 'demo@supplier.com',
        password: 'demo123',
        role: 'supplier'
      },
      {
        name: 'Demo Admin',
        email: 'demo@admin.com',
        password: 'demo123',
        role: 'admin'
      }
    ];

    // Insert demo users
    const createdUsers = await User.insertMany(demoUsers);
    console.log('✅ Demo users created successfully:');
    createdUsers.forEach(user => {
      console.log(`   👤 ${user.name} (${user.role}) - ${user.email}`);
    });

    console.log('\n🎯 Demo Login Credentials:');
    console.log('   Email: demo@customer.com | Password: demo123 | Role: Customer');
    console.log('   Email: demo@supplier.com | Password: demo123 | Role: Supplier');
    console.log('   Email: demo@admin.com    | Password: demo123 | Role: Admin');

    console.log('\n🚀 Quick Access URLs:');
    console.log('   Customer Dashboard: http://localhost:3000 (after login)');
    console.log('   Supplier Dashboard: http://localhost:3000/supplier/dashboard (after login)');
    console.log('   Admin Portal: http://localhost:3000/admin-portal (after login)');
    console.log('   Cart: http://localhost:3000/cart (after login)');

  } catch (error) {
    console.error('❌ Error creating demo users:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  createDemoUsers()
    .then(() => {
      console.log('🎉 Demo users setup complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to create demo users:', error);
      process.exit(1);
    });
}

module.exports = createDemoUsers;