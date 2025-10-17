# 🛒 Ecommerce Rwanda - Production-Ready Multi-Vendor Marketplace

A full-featured, production-ready e-commerce platform designed specifically for the Rwandan market with multi-vendor support, mobile money integration, and comprehensive admin tools.

## 🌟 Features

### Core E-commerce Features
- ✅ **Multi-Vendor System** - Suppliers can register, add products, and manage their inventory
- ✅ **Customer Management** - User registration, authentication, and profile management
- ✅ **Product Catalog** - Advanced product management with categories, search, and filtering
- ✅ **Shopping Cart** - Persistent cart with real-time updates
- ✅ **Order Management** - Complete order lifecycle from placement to delivery
- ✅ **Admin Dashboard** - Comprehensive admin panel for platform management

### Rwandan Market Features 🇷🇼
- ✅ **Mobile Money Integration** - MTN Mobile Money and Airtel Money support
- ✅ **Local Payment Processing** - Seamless integration with Rwandan payment providers
- ✅ **Multi-language Support** - Kinyarwanda and English language options
- ✅ **Local Business Tools** - Supplier onboarding and verification system
- ✅ **SMS Notifications** - Order updates via SMS for better customer experience

### Security & Performance
- ✅ **Production-Ready Security** - Helmet, CSRF protection, rate limiting, input sanitization
- ✅ **Scalable Architecture** - Docker containerization, Redis caching, MongoDB clustering
- ✅ **Performance Optimization** - Compression, static asset optimization, database indexing
- ✅ **Monitoring & Logging** - Winston logging, health checks, error tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+ (optional, for caching)
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-rwanda
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB & Redis**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6
   docker run -d -p 6379:6379 --name redis redis:7-alpine

   # Or using local installations
   mongod
   redis-server
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Web App: http://localhost:3000
   - Health Check: http://localhost:3000/health

## 🏗️ Project Structure

```
ecommerce-rwanda/
├── 📁 src/
│   ├── 📁 config/           # Database configuration
│   ├── 📁 models/           # Mongoose schemas
│   ├── 📁 routes/           # Express routes
│   │   ├── 📁 api/         # API routes for mobile/SPA
│   │   └── 📁 webhooks/    # Payment webhook handlers
│   ├── 📁 controllers/      # Business logic controllers
│   ├── 📁 middlewares/      # Custom middleware
│   ├── 📁 services/         # External service integrations
│   └── 📁 utils/           # Helper functions
├── 📁 public/              # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   ├── images/            # Image assets
│   └── uploads/           # User uploaded files
├── 📁 views/              # EJS templates
│   ├── pages/             # Page templates
│   └── partials/          # Reusable components
├── 📁 tests/              # Test suites
├── 📁 scripts/            # Database seeds & utilities
├── 📁 logs/               # Application logs
└── 📄 server.js           # Application entry point
```

## 🔧 Configuration

### Environment Variables

```env
# Application Settings
NODE_ENV=production
PORT=3000
BASE_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce_rwanda
REDIS_URL=redis://localhost:6379

# Security
SESSION_SECRET=your_super_secret_session_key_here
JWT_SECRET=your_jwt_secret_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration (Optional)
SMS_API_URL=https://api.sms-provider.com/send
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=ECommerceRW

# Payment Integration
MTN_API_BASE_URL=https://api.mtn.com
MTN_API_KEY=your_mtn_api_key
AIRTEL_API_BASE_URL=https://api.airtel.com
AIRTEL_API_KEY=your_airtel_api_key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads
```

## 🚢 Deployment

### Using Docker Compose (Recommended)

1. **Configure environment**
   ```bash
   cp .env.example .env.production
   # Edit with your production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Scale the application**
   ```bash
   docker-compose up -d --scale app=3
   ```

### Using PM2 (Traditional Deployment)

1. **Production build**
   ```bash
   npm run build
   ```

2. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

3. **Enable PM2 monitoring**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 10
   ```

### Using Render/Vercel (Serverless)

1. **Connect your repository** to Render
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. **Add environment variables** in Render dashboard
4. **Deploy**

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test suite
npm test -- tests/unit/authController.test.js
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CSRF Protection** - Token-based CSRF prevention
- **Rate Limiting** - DDoS protection with express-rate-limit
- **Input Sanitization** - SQL injection and XSS prevention
- **Session Security** - Secure session management with MongoDB store
- **Password Hashing** - bcrypt with salt rounds
- **CORS Configuration** - Proper cross-origin resource sharing

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Product Endpoints
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Supplier/Admin only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Payment Endpoints
- `POST /api/payments/mobile-money` - Initiate mobile money payment
- `GET /api/payments/status/:id` - Check payment status

## 🔄 Webhook Endpoints

- `POST /webhook/mtn` - MTN Mobile Money webhooks
- `POST /webhook/airtel` - Airtel Money webhooks

## 📊 Monitoring

### Health Checks
- **Application Health**: `GET /health`
- **Database Status**: `GET /health/db`
- **External Services**: `GET /health/services`

### Logging
- **Application Logs**: `./logs/combined.log`
- **Error Logs**: `./logs/error.log`
- **Access Logs**: `./logs/access.log`

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB status
   docker ps | grep mongodb
   # Check logs
   docker logs ecommerce-rwanda-db
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis status
   docker ps | grep redis
   # Test connection
   redis-cli ping
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```

4. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   # Clean up Docker
   docker system prune -a
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@ecommercerwanda.com
- 💬 Slack: [Join our workspace]
- 📖 Documentation: [Link to docs]

## 🔄 Updates

Stay updated with our latest features and improvements:
- 🐛 Bug fixes and security patches
- ✨ New features for Rwandan market
- 🚀 Performance improvements
- 📱 Mobile app development

---

**Built with ❤️ for Rwanda's growing e-commerce ecosystem** 🇷🇼