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
          'supplier@localmarket.rw',
          'supplier@artisancrafts.rw',
          'customer2@customer.rw'
        ]
      }
    });
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    console.log('✅ Cleared existing test data');

    // Create test users
    console.log('👥 Creating enhanced test users...');
    const users = [
      {
        name: 'System Administrator',
        email: 'admin@ecommerce.rw',
        password: 'admin123',
        role: 'admin',
        phone: '+250788000000',
        verified: true,
        avatar: '/images/avatars/admin.jpg'
      },
      {
        name: 'Kigali Coffee Co.',
        email: 'supplier@kigalicoffee.rw',
        password: 'supplier123',
        role: 'supplier',
        phone: '+250788111111',
        storeName: 'Kigali Coffee Co.',
        storeDescription: 'Premium Rwandan coffee beans and ground coffee from local farmers',
        businessCategory: 'food-beverage',
        verified: true,
        avatar: '/images/avatars/coffee-supplier.jpg',
        location: 'Kigali, Rwanda',
        rating: 4.8,
        totalProducts: 15
      },
      {
        name: 'Rwandan Fashion Hub',
        email: 'supplier@rwandanfashion.rw',
        password: 'supplier123',
        role: 'supplier',
        phone: '+250788222222',
        storeName: 'Rwandan Fashion Hub',
        storeDescription: 'Traditional and modern Rwandan clothing and accessories',
        businessCategory: 'fashion-clothing',
        verified: true,
        avatar: '/images/avatars/fashion-supplier.jpg',
        location: 'Musanze, Rwanda',
        rating: 4.9,
        totalProducts: 12
      },
      {
        name: 'Local Market Store',
        email: 'supplier@localmarket.rw',
        password: 'supplier123',
        role: 'supplier',
        phone: '+250788333333',
        storeName: 'Local Market Store',
        storeDescription: 'Fresh local produce, honey, and traditional goods',
        businessCategory: 'agriculture',
        verified: true,
        avatar: '/images/avatars/market-supplier.jpg',
        location: 'Huye, Rwanda',
        rating: 4.7,
        totalProducts: 20
      },
      {
        name: 'Artisan Crafts Rwanda',
        email: 'supplier@artisancrafts.rw',
        password: 'supplier123',
        role: 'supplier',
        phone: '+250788555555',
        storeName: 'Artisan Crafts Rwanda',
        storeDescription: 'Handcrafted traditional Rwandan baskets, pottery, and artwork',
        businessCategory: 'crafts-art',
        verified: true,
        avatar: '/images/avatars/crafts-supplier.jpg',
        location: 'Gisenyi, Rwanda',
        rating: 4.6,
        totalProducts: 8
      },
      {
        name: 'Happy Customer',
        email: 'customer@customer.rw',
        password: 'customer123',
        role: 'customer',
        phone: '+250788444444',
        nationality: 'rwandan',
        city: 'Kigali',
        country: 'Rwanda',
        avatar: '/images/avatars/customer.jpg'
      },
      {
        name: 'Jean Pierre',
        email: 'customer2@customer.rw',
        password: 'customer123',
        role: 'customer',
        phone: '+250788666666',
        nationality: 'rwandan',
        city: 'Butare',
        country: 'Rwanda',
        avatar: '/images/avatars/customer2.jpg'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Get supplier IDs for product creation
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const coffeeSupplier = createdUsers.find(u => u.email === 'supplier@kigalicoffee.rw');
    const fashionSupplier = createdUsers.find(u => u.email === 'supplier@rwandanfashion.rw');
    const marketSupplier = createdUsers.find(u => u.email === 'supplier@localmarket.rw');
    const craftsSupplier = createdUsers.find(u => u.email === 'supplier@artisancrafts.rw');
    const customerUser = createdUsers.find(u => u.email === 'customer@customer.rw');
    const customerUser2 = createdUsers.find(u => u.email === 'customer2@customer.rw');

    // Create products
    console.log('📦 Creating enhanced test products...');
    const products = [
      // Coffee supplier products
      {
        name: 'Premium Rwandan Coffee Beans',
        description: 'High-quality arabica coffee beans grown in the hills of Rwanda. Rich flavor with notes of chocolate and citrus. Sourced directly from local farmers.',
        price: 15000,
        stock: 50,
        supplier: coffeeSupplier._id,
        approved: true,
        category: 'coffee',
        images: ['/images/products/coffee-beans-1.jpg', '/images/products/coffee-beans-2.jpg'],
        rating: 4.8,
        reviewCount: 24,
        weight: '1kg',
        origin: 'Nyungwe Forest, Rwanda',
        featured: true,
        tags: ['premium', 'organic', 'single-origin']
      },
      {
        name: 'Ground Coffee - Medium Roast',
        description: 'Freshly ground Rwandan coffee with a perfect medium roast. Ideal for drip coffee makers and French press. Roasted in small batches.',
        price: 12000,
        stock: 30,
        supplier: coffeeSupplier._id,
        approved: true,
        category: 'coffee',
        images: ['/images/products/ground-coffee-1.jpg'],
        rating: 4.6,
        reviewCount: 18,
        weight: '500g',
        origin: 'Lake Kivu Region, Rwanda',
        featured: false,
        tags: ['ground', 'medium-roast', 'fresh']
      },
      {
        name: 'Coffee Gift Set',
        description: 'Beautiful gift set with 3 varieties of Rwandan coffee. Perfect for coffee lovers. Includes tasting notes and brewing guide.',
        price: 45000,
        stock: 15,
        supplier: coffeeSupplier._id,
        approved: true,
        category: 'coffee',
        images: ['/images/products/coffee-gift-set-1.jpg'],
        rating: 4.9,
        reviewCount: 12,
        weight: '3 x 250g',
        origin: 'Multiple Regions, Rwanda',
        featured: true,
        tags: ['gift', 'variety-pack', 'premium']
      },

      // Fashion supplier products
      {
        name: 'Traditional Rwandan Dress',
        description: 'Beautiful handmade traditional dress with authentic Rwandan patterns and fabrics. Made by local artisans using traditional techniques.',
        price: 75000,
        stock: 8,
        supplier: fashionSupplier._id,
        approved: true,
        category: 'fashion',
        images: ['/images/products/traditional-dress-1.jpg', '/images/products/traditional-dress-2.jpg'],
        rating: 4.7,
        reviewCount: 15,
        size: 'M',
        material: 'Cotton Kitenge',
        origin: 'Kigali, Rwanda',
        featured: true,
        tags: ['traditional', 'handmade', 'authentic']
      },
      {
        name: 'Men\'s Kitenge Shirt',
        description: 'Stylish men\'s shirt made from traditional kitenge fabric with modern cut. Perfect blend of tradition and contemporary fashion.',
        price: 35000,
        stock: 12,
        supplier: fashionSupplier._id,
        approved: true,
        category: 'fashion',
        images: ['/images/products/kitenge-shirt-1.jpg'],
        rating: 4.5,
        reviewCount: 22,
        size: 'L',
        material: 'Cotton Kitenge',
        origin: 'Musanze, Rwanda',
        featured: false,
        tags: ['mens', 'kitenge', 'modern']
      },
      {
        name: 'Rwandan Beaded Necklace',
        description: 'Handcrafted beaded necklace using traditional Rwandan beadwork techniques. Each piece tells a unique cultural story.',
        price: 25000,
        stock: 20,
        supplier: fashionSupplier._id,
        approved: true,
        category: 'fashion',
        images: ['/images/products/beaded-necklace-1.jpg'],
        rating: 4.8,
        reviewCount: 31,
        material: 'Glass beads, traditional fibers',
        origin: 'Local Artisans, Rwanda',
        featured: false,
        tags: ['jewelry', 'handcrafted', 'traditional']
      },

      // Market supplier products
      {
        name: 'Fresh Bananas (Bunch)',
        description: 'Fresh, organic bananas grown locally in Rwanda. Sweet and nutritious. Harvested from family-owned farms.',
        price: 2000,
        stock: 100,
        supplier: marketSupplier._id,
        approved: true,
        category: 'food',
        images: ['/images/products/bananas-1.jpg'],
        rating: 4.4,
        reviewCount: 45,
        weight: '1 bunch (approx 1.5kg)',
        origin: 'Southern Province, Rwanda',
        featured: false,
        tags: ['fresh', 'organic', 'local']
      },
      {
        name: 'Organic Honey (500g)',
        description: 'Pure, organic honey harvested from Rwandan beehives. Natural sweetness with floral notes from local wildflowers.',
        price: 8000,
        stock: 25,
        supplier: marketSupplier._id,
        approved: true,
        category: 'food',
        images: ['/images/products/honey-1.jpg'],
        rating: 4.9,
        reviewCount: 38,
        weight: '500g',
        origin: 'Nyungwe Forest, Rwanda',
        featured: true,
        tags: ['organic', 'pure', 'natural']
      },
      {
        name: 'Rwandan Tea Leaves',
        description: 'Premium tea leaves grown in the high altitude regions of Rwanda. Delicate flavor with hints of the Rwandan landscape.',
        price: 6000,
        stock: 40,
        supplier: marketSupplier._id,
        approved: true,
        category: 'food',
        images: ['/images/products/tea-leaves-1.jpg'],
        rating: 4.6,
        reviewCount: 29,
        weight: '250g',
        origin: 'Gisovu, Rwanda',
        featured: false,
        tags: ['tea', 'premium', 'high-altitude']
      },

      // Crafts supplier products
      {
        name: 'Handwoven Basket',
        description: 'Traditional Rwandan handwoven basket made by local artisans. Perfect for storage and home decoration.',
        price: 15000,
        stock: 10,
        supplier: craftsSupplier._id,
        approved: true,
        category: 'crafts',
        images: ['/images/products/woven-basket-1.jpg', '/images/products/woven-basket-2.jpg'],
        rating: 4.7,
        reviewCount: 16,
        material: 'Natural fibers, sisal',
        origin: 'Gitarama, Rwanda',
        featured: true,
        tags: ['handwoven', 'traditional', 'artisanal']
      },
      {
        name: 'Rwandan Pottery Vase',
        description: 'Beautiful ceramic vase handmade by Rwandan potters. Each piece is unique with traditional patterns.',
        price: 25000,
        stock: 6,
        supplier: craftsSupplier._id,
        approved: true,
        category: 'crafts',
        images: ['/images/products/pottery-vase-1.jpg'],
        rating: 4.8,
        reviewCount: 11,
        material: 'Clay, traditional glaze',
        origin: 'Local Artisans, Rwanda',
        featured: false,
        tags: ['pottery', 'ceramic', 'unique']
      },
      {
        name: 'Wooden Carving Set',
        description: 'Set of traditional Rwandan wooden carvings depicting local wildlife and cultural symbols.',
        price: 35000,
        stock: 4,
        supplier: craftsSupplier._id,
        approved: true,
        category: 'crafts',
        images: ['/images/products/wooden-carvings-1.jpg'],
        rating: 4.9,
        reviewCount: 8,
        material: 'Sustainable wood',
        origin: 'Butare, Rwanda',
        featured: true,
        tags: ['wooden', 'carvings', 'cultural']
      },

      // Additional diverse products
      {
        name: 'Spiced Tea Mix',
        description: 'Traditional Rwandan spiced tea blend with local herbs and spices. A warm, comforting beverage.',
        price: 5000,
        stock: 35,
        supplier: marketSupplier._id,
        approved: true,
        category: 'food',
        images: ['/images/products/spiced-tea-1.jpg'],
        rating: 4.5,
        reviewCount: 27,
        weight: '200g',
        origin: 'Traditional Recipe, Rwanda',
        featured: false,
        tags: ['spiced', 'traditional', 'herbal']
      },
      {
        name: 'Modern Kitenge Dress',
        description: 'Contemporary take on traditional kitenge fabric. Modern cut with traditional patterns for the fashion-forward.',
        price: 55000,
        stock: 14,
        supplier: fashionSupplier._id,
        approved: true,
        category: 'fashion',
        images: ['/images/products/modern-kitenge-1.jpg'],
        rating: 4.6,
        reviewCount: 19,
        size: 'S',
        material: 'Cotton Kitenge',
        origin: 'Kigali Design, Rwanda',
        featured: false,
        tags: ['modern', 'kitenge', 'fashion']
      },
      {
        name: 'Coffee Tasting Set',
        description: 'Sample pack featuring different Rwandan coffee regions. Perfect for discovering your favorite roast.',
        price: 25000,
        stock: 22,
        supplier: coffeeSupplier._id,
        approved: true,
        category: 'coffee',
        images: ['/images/products/tasting-set-1.jpg'],
        rating: 4.7,
        reviewCount: 33,
        weight: '4 x 125g',
        origin: 'Multiple Regions, Rwanda',
        featured: true,
        tags: ['tasting', 'variety', 'educational']
      },

      // Pending approval products
      {
        name: 'Artisan Wall Hanging',
        description: 'Large decorative wall hanging made from traditional Rwandan textiles and beads.',
        price: 45000,
        stock: 3,
        supplier: craftsSupplier._id,
        approved: false,
        category: 'crafts',
        images: ['/images/products/wall-hanging-1.jpg'],
        rating: 0,
        reviewCount: 0,
        material: 'Mixed textiles',
        origin: 'Local Artisans, Rwanda',
        featured: false,
        tags: ['decorative', 'textile', 'large']
      },
      {
        name: 'Premium Avocado Oil',
        description: 'Cold-pressed avocado oil from Rwandan avocados. Rich in healthy fats and nutrients.',
        price: 12000,
        stock: 18,
        supplier: marketSupplier._id,
        approved: false,
        category: 'food',
        images: ['/images/products/avocado-oil-1.jpg'],
        rating: 0,
        reviewCount: 0,
        weight: '250ml',
        origin: 'Eastern Province, Rwanda',
        featured: false,
        tags: ['oil', 'healthy', 'cold-pressed']
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);
    console.log(`   📦 ${createdProducts.filter(p => p.approved).length} approved products`);
    console.log(`   ⏳ ${createdProducts.filter(p => !p.approved).length} pending approval`);

    // Create some test orders
    console.log('🛒 Creating enhanced test orders...');
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
          address: 'KG 123 St, Kiyovu',
          city: 'Kigali',
          country: 'Rwanda',
          postalCode: '00000'
        },
        orderDate: new Date('2024-01-15'),
        deliveredDate: new Date('2024-01-18'),
        trackingNumber: 'RW2024001'
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
          address: 'KG 123 St, Kiyovu',
          city: 'Kigali',
          country: 'Rwanda',
          postalCode: '00000'
        },
        orderDate: new Date('2024-01-20'),
        shippedDate: new Date('2024-01-22'),
        trackingNumber: 'RW2024002'
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
          address: 'KG 123 St, Kiyovu',
          city: 'Kigali',
          country: 'Rwanda',
          postalCode: '00000'
        },
        orderDate: new Date('2024-01-25'),
        trackingNumber: 'RW2024003'
      },
      {
        customer: customerUser2._id,
        items: [
          {
            product: createdProducts.find(p => p.name === 'Handwoven Basket')._id,
            quantity: 1,
            price: 15000
          },
          {
            product: createdProducts.find(p => p.name === 'Rwandan Beaded Necklace')._id,
            quantity: 1,
            price: 25000
          }
        ],
        total: 40000,
        status: 'pending',
        shippingAddress: {
          address: 'BT 456 Ave, Nyamirambo',
          city: 'Butare',
          country: 'Rwanda',
          postalCode: '00001'
        },
        orderDate: new Date('2024-01-24'),
        trackingNumber: 'RW2024004'
      },
      {
        customer: customerUser2._id,
        items: [
          {
            product: createdProducts.find(p => p.name === 'Coffee Gift Set')._id,
            quantity: 1,
            price: 45000
          }
        ],
        total: 45000,
        status: 'delivered',
        shippingAddress: {
          address: 'BT 456 Ave, Nyamirambo',
          city: 'Butare',
          country: 'Rwanda',
          postalCode: '00001'
        },
        orderDate: new Date('2024-01-10'),
        deliveredDate: new Date('2024-01-13'),
        trackingNumber: 'RW2024005'
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${createdOrders.length} test orders`);

    // Create sample carts for customers
    console.log('🛒 Creating enhanced sample carts...');
    const sampleCart1 = new Cart({
      user: customerUser._id,
      items: [
        {
          product: createdProducts.find(p => p.name === 'Rwandan Tea Leaves')._id,
          quantity: 2,
          addedAt: new Date('2024-01-25')
        },
        {
          product: createdProducts.find(p => p.name === 'Men\'s Kitenge Shirt')._id,
          quantity: 1,
          addedAt: new Date('2024-01-24')
        }
      ],
      updatedAt: new Date()
    });

    const sampleCart2 = new Cart({
      user: customerUser2._id,
      items: [
        {
          product: createdProducts.find(p => p.name === 'Premium Rwandan Coffee Beans')._id,
          quantity: 1,
          addedAt: new Date('2024-01-25')
        },
        {
          product: createdProducts.find(p => p.name === 'Handwoven Basket')._id,
          quantity: 1,
          addedAt: new Date('2024-01-25')
        }
      ],
      updatedAt: new Date()
    });

    await sampleCart1.save();
    await sampleCart2.save();
    console.log('✅ Created 2 sample carts with multiple items');

    // Display enhanced summary
    console.log('\n🎯 Enhanced Database Seeding Complete!');
    console.log('\n👥 Test Users Created:');
    createdUsers.forEach(user => {
      console.log(`   • ${user.name} (${user.role}) - ${user.email}`);
      if (user.storeName) {
        console.log(`     📍 ${user.storeName} - ${user.location || 'Location TBD'}`);
        console.log(`     ⭐ Rating: ${user.rating || 'Not rated'} | Products: ${user.totalProducts || 0}`);
      }
    });

    console.log('\n📦 Products Created by Category:');
    const categories = {};
    createdProducts.filter(p => p.approved).forEach(product => {
      const category = product.category || 'uncategorized';
      if (!categories[category]) categories[category] = [];
      categories[category].push(product);
    });

    Object.keys(categories).forEach(category => {
      console.log(`\n   🏷️ ${category.toUpperCase()}:`);
      categories[category].forEach(product => {
        const supplier = createdUsers.find(u => u._id.toString() === product.supplier.toString());
        console.log(`     • ${product.name}`);
        console.log(`       💰 ${product.price} RWF | ⭐ ${product.rating} (${product.reviewCount} reviews) | 📦 ${product.stock} in stock`);
        console.log(`       🏪 ${supplier?.storeName} | ${product.featured ? '🌟 Featured' : ''}`);
      });
    });

    console.log('\n⏳ Products Pending Approval:');
    createdProducts.filter(p => !p.approved).forEach(product => {
      const supplier = createdUsers.find(u => u._id.toString() === product.supplier.toString());
      console.log(`   • ${product.name} - ${product.price} RWF (${supplier?.name})`);
    });

    console.log('\n🛒 Orders Created:');
    createdOrders.forEach(order => {
      const customer = createdUsers.find(u => u._id.toString() === order.customer.toString());
      console.log(`   • Order #${order.trackingNumber || order._id.toString().substr(-8)} - ${order.total} RWF (${order.status})`);
      console.log(`     👤 ${customer?.name} | 📅 ${order.orderDate ? order.orderDate.toISOString().split('T')[0] : 'Date TBD'}`);
    });

    console.log('\n📊 Database Statistics:');
    console.log(`   • Total Users: ${createdUsers.length}`);
    console.log(`   • Total Products: ${createdProducts.length}`);
    console.log(`   • Approved Products: ${createdProducts.filter(p => p.approved).length}`);
    console.log(`   • Pending Products: ${createdProducts.filter(p => !p.approved).length}`);
    console.log(`   • Total Orders: ${createdOrders.length}`);
    console.log(`   • Active Carts: 2`);

    console.log('\n🚀 Ready for Enhanced Testing!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@ecommerce.rw / admin123');
    console.log('   Supplier (Coffee): supplier@kigalicoffee.rw / supplier123');
    console.log('   Supplier (Fashion): supplier@rwandanfashion.rw / supplier123');
    console.log('   Supplier (Market): supplier@localmarket.rw / supplier123');
    console.log('   Supplier (Crafts): supplier@artisancrafts.rw / supplier123');
    console.log('   Customer 1: customer@customer.rw / customer123');
    console.log('   Customer 2: customer2@customer.rw / customer123');

    console.log('\n🔗 Quick Access URLs:');
    console.log('   • Customer Dashboard: http://localhost:3000');
    console.log('   • Enhanced Products: http://localhost:3000/products');
    console.log('   • Cart: http://localhost:3000/cart');
    console.log('   • Product Details: http://localhost:3000/product/[id]');
    console.log('   • Supplier Store: http://localhost:3000/products/supplier/[id]');
    console.log('   • Supplier Dashboard: http://localhost:3000/supplier/dashboard');
    console.log('   • Admin Portal: http://localhost:3000/admin-portal');

    console.log('\n✨ Enhanced Features Ready for Testing:');
    console.log('   • Advanced filtering and search');
    console.log('   • Modern product cards with ratings');
    console.log('   • Wishlist and recently viewed');
    console.log('   • Responsive design');
    console.log('   • Rich product data');

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