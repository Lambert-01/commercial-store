const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Cart = require('../src/models/Cart');
require('dotenv').config();

/**
 * Comprehensive Database Seeding Script
 * Creates realistic test data for Ecommerce Rwanda platform
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_rwanda');
    console.log('✅ Connected to MongoDB for comprehensive seeding');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️ Clearing existing test data...');
    await User.deleteMany({
      email: {
        $in: [
          'admin@ecommerce.rw',
          'supplier@kigalicoffee.rw',
          'customer@customer.rw',
          'supplier@rwandanfashion.rw',
          'supplier@localmarket.rw'
        ]
      }
    });
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    console.log('✅ Cleared existing test data');

    // Create test users
    console.log('👥 Creating test users...');
    const users = [
      {
        name: 'Admin User',
        email: 'admin@ecommerce.rw',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Kigali Coffee Co.',
        email: 'supplier@kigalicoffee.rw',
        password: 'supplier123',
        role: 'supplier'
      },
      {
        name: 'Rwandan Fashion Hub',
        email: 'supplier@rwandanfashion.rw',
        password: 'supplier123',
        role: 'supplier'
      },
      {
        name: 'Local Market Store',
        email: 'supplier@localmarket.rw',
        password: 'supplier123',
        role: 'supplier'
      },
      {
        name: 'Happy Customer',
        email: 'customer@customer.rw',
        password: 'customer123',
        role: 'customer'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Get supplier IDs for product creation
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const coffeeSupplier = createdUsers.find(u => u.email === 'supplier@kigalicoffee.rw');
    const fashionSupplier = createdUsers.find(u => u.email === 'supplier@rwandanfashion.rw');
    const marketSupplier = createdUsers.find(u => u.email === 'supplier@localmarket.rw');
    const customerUser = createdUsers.find(u => u.role === 'customer');

    // Create products
    console.log('📦 Creating test products...');
    const products = [
      // Coffee supplier products
      {
        name: 'Premium Rwandan Coffee Beans',
        description: 'High-quality arabica coffee beans grown in the hills of Rwanda. Rich flavor with notes of chocolate and citrus.',
        price: 15000,
        stock: 50,
        supplier: coffeeSupplier._id,
        approved: true,
        image: '/images/products/coffee-beans.jpg'
      },
      {
        name: 'Ground Coffee - Medium Roast',
        description: 'Freshly ground Rwandan coffee with a perfect medium roast. Ideal for drip coffee makers and French press.',
        price: 12000,
        stock: 30,
        supplier: coffeeSupplier._id,
        approved: true,
        image: '/images/products/ground-coffee.jpg'
      },
      {
        name: 'Coffee Gift Set',
        description: 'Beautiful gift set with 3 varieties of Rwandan coffee. Perfect for coffee lovers.',
        price: 45000,
        stock: 15,
        supplier: coffeeSupplier._id,
        approved: true,
        image: '/images/products/coffee-gift-set.jpg'
      },

      // Fashion supplier products
      {
        name: 'Traditional Rwandan Dress',
        description: 'Beautiful handmade traditional dress with authentic Rwandan patterns and fabrics.',
        price: 75000,
        stock: 8,
        supplier: fashionSupplier._id,
        approved: true,
        image: '/images/products/traditional-dress.jpg'
      },
      {
        name: 'Men\'s Kitenge Shirt',
        description: 'Stylish men\'s shirt made from traditional kitenge fabric with modern cut.',
        price: 35000,
        stock: 12,
        supplier: fashionSupplier._id,
        approved: true,
        image: '/images/products/kitenge-shirt.jpg'
      },
      {
        name: 'Rwandan Beaded Necklace',
        description: 'Handcrafted beaded necklace using traditional Rwandan beadwork techniques.',
        price: 25000,
        stock: 20,
        supplier: fashionSupplier._id,
        approved: true,
        image: '/images/products/beaded-necklace.jpg'
      },

      // Market supplier products
      {
        name: 'Fresh Bananas (Bunch)',
        description: 'Fresh, organic bananas grown locally in Rwanda. Sweet and nutritious.',
        price: 2000,
        stock: 100,
        supplier: marketSupplier._id,
        approved: true,
        image: '/images/products/bananas.jpg'
      },
      {
        name: 'Organic Honey (500g)',
        description: 'Pure, organic honey harvested from Rwandan beehives. Natural sweetness.',
        price: 8000,
        stock: 25,
        supplier: marketSupplier._id,
        approved: true,
        image: '/images/products/honey.jpg'
      },
      {
        name: 'Rwandan Tea Leaves',
        description: 'Premium tea leaves grown in the high altitude regions of Rwanda.',
        price: 6000,
        stock: 40,
        supplier: marketSupplier._id,
        approved: true,
        image: '/images/products/tea-leaves.jpg'
      },

      // Pending approval products
      {
        name: 'Handwoven Basket',
        description: 'Traditional Rwandan handwoven basket made by local artisans.',
        price: 15000,
        stock: 10,
        supplier: coffeeSupplier._id,
        approved: false, // Pending approval
        image: '/images/products/woven-basket.jpg'
      },
      {
        name: 'Spiced Tea Mix',
        description: 'Traditional Rwandan spiced tea blend with local herbs and spices.',
        price: 5000,
        stock: 35,
        supplier: marketSupplier._id,
        approved: false, // Pending approval
        image: '/images/products/spiced-tea.jpg'
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);
    console.log(`   📦 ${createdProducts.filter(p => p.approved).length} approved products`);
    console.log(`   ⏳ ${createdProducts.filter(p => !p.approved).length} pending approval`);

    // Create some test orders
    console.log('🛒 Creating test orders...');
    const sampleOrders = [
      {
        customer: customerUser._id,
        items: [
          {
            product: createdProducts.find(p => p.name === 'Premium Rwandan Coffee Beans')._id,
            quantity: 2,
            price: 15000
          },
          {
            product: createdProducts.find(p => p.name === 'Fresh Bananas (Bunch)')._id,
            quantity: 3,
            price: 2000
          }
        ],
        total: 36000,
        status: 'delivered',
        shippingAddress: {
          address: 'KG 123 St',
          city: 'Kigali',
          country: 'Rwanda'
        }
      },
      {
        customer: customerUser._id,
        items: [
          {
            product: createdProducts.find(p => p.name === 'Traditional Rwandan Dress')._id,
            quantity: 1,
            price: 75000
          }
        ],
        total: 75000,
        status: 'shipped',
        shippingAddress: {
          address: 'KG 123 St',
          city: 'Kigali',
          country: 'Rwanda'
        }
      },
      {
        customer: customerUser._id,
        items: [
          {
            product: createdProducts.find(p => p.name === 'Organic Honey (500g)')._id,
            quantity: 2,
            price: 8000
          }
        ],
        total: 16000,
        status: 'pending',
        shippingAddress: {
          address: 'KG 123 St',
          city: 'Kigali',
          country: 'Rwanda'
        }
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${createdOrders.length} test orders`);

    // Create a sample cart for the customer
    console.log('🛒 Creating sample cart...');
    const sampleCart = new Cart({
      user: customerUser._id,
      items: [
        {
          product: createdProducts.find(p => p.name === 'Rwandan Tea Leaves')._id,
          quantity: 2
        },
        {
          product: createdProducts.find(p => p.name === 'Men\'s Kitenge Shirt')._id,
          quantity: 1
        }
      ]
    });

    await sampleCart.save();
    console.log('✅ Created sample cart with 2 items');

    // Display summary
    console.log('\n🎯 Database Seeding Complete!');
    console.log('\n👥 Test Users Created:');
    createdUsers.forEach(user => {
      console.log(`   • ${user.name} (${user.role}) - ${user.email}`);
    });

    console.log('\n📦 Products Created:');
    createdProducts.filter(p => p.approved).forEach(product => {
      const supplier = createdUsers.find(u => u._id.toString() === product.supplier.toString());
      console.log(`   • ${product.name} - ${product.price} RWF (${supplier?.name})`);
    });

    console.log('\n⏳ Pending Approval:');
    createdProducts.filter(p => !p.approved).forEach(product => {
      const supplier = createdUsers.find(u => u._id.toString() === product.supplier.toString());
      console.log(`   • ${product.name} - ${product.price} RWF (${supplier?.name})`);
    });

    console.log('\n🛒 Orders Created:');
    createdOrders.forEach(order => {
      console.log(`   • Order #${order._id.toString().substr(-8)} - ${order.total} RWF (${order.status})`);
    });

    console.log('\n🚀 Ready for Testing!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@ecommerce.rw / admin123');
    console.log('   Supplier (Coffee): supplier@kigalicoffee.rw / supplier123');
    console.log('   Supplier (Fashion): supplier@rwandanfashion.rw / supplier123');
    console.log('   Supplier (Market): supplier@localmarket.rw / supplier123');
    console.log('   Customer: customer@customer.rw / customer123');

    console.log('\n🔗 Quick Access URLs:');
    console.log('   • Customer Dashboard: http://localhost:3000');
    console.log('   • Products: http://localhost:3000/products');
    console.log('   • Cart: http://localhost:3000/cart');
    console.log('   • Supplier Dashboard: http://localhost:3000/supplier/dashboard');
    console.log('   • Admin Portal: http://localhost:3000/admin-portal');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n🎉 Comprehensive database seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Failed to seed database:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;