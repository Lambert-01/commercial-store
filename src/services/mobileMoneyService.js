const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Mobile Money Payment Service for Rwanda
 * Supports MTN Mobile Money and Airtel Money
 */
class MobileMoneyService {
  constructor() {
    this.mtnBaseUrl = process.env.MTN_API_BASE_URL || 'https://api.mtn.com';
    this.airtelBaseUrl = process.env.AIRTEL_API_BASE_URL || 'https://api.airtel.com';
    this.mtnApiKey = process.env.MTN_API_KEY;
    this.airtelApiKey = process.env.AIRTEL_API_KEY;
  }

  /**
   * Process MTN Mobile Money payment
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.phoneNumber - Customer's phone number
   * @param {number} paymentData.amount - Amount to charge
   * @param {string} paymentData.reference - Payment reference
   * @param {string} paymentData.callbackUrl - Callback URL for payment status
   */
  async processMTNPayment(paymentData) {
    try {
      const {
        phoneNumber,
        amount,
        reference,
        callbackUrl
      } = paymentData;

      const payload = {
        phoneNumber: this.formatPhoneNumber(phoneNumber, 'MTN'),
        amount: amount,
        reference: reference,
        callbackUrl: callbackUrl,
        currency: 'RWF'
      };

      const response = await axios.post(
        `${this.mtnBaseUrl}/collection/v1_0/requesttopay`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.mtnApiKey}`,
            'Content-Type': 'application/json',
            'X-Reference-Id': reference,
          },
        }
      );

      logger.info(`MTN payment initiated: ${reference} - ${amount} RWF`);

      return {
        success: true,
        transactionId: response.data.transactionId || reference,
        status: 'pending',
        provider: 'MTN',
        message: 'Payment request sent to customer phone'
      };

    } catch (error) {
      logger.error(`MTN payment failed: ${error.message}`, {
        phoneNumber: paymentData.phoneNumber,
        amount: paymentData.amount,
        reference: paymentData.reference
      });

      return {
        success: false,
        error: error.message,
        provider: 'MTN'
      };
    }
  }

  /**
   * Process Airtel Money payment
   * @param {Object} paymentData - Payment information
   */
  async processAirtelPayment(paymentData) {
    try {
      const {
        phoneNumber,
        amount,
        reference,
        callbackUrl
      } = paymentData;

      const payload = {
        phoneNumber: this.formatPhoneNumber(phoneNumber, 'AIRTEL'),
        amount: amount,
        reference: reference,
        callbackUrl: callbackUrl,
        currency: 'RWF'
      };

      const response = await axios.post(
        `${this.airtelBaseUrl}/payment/v1/merchant/pay`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.airtelApiKey}`,
            'Content-Type': 'application/json',
            'X-Reference-Id': reference,
          },
        }
      );

      logger.info(`Airtel payment initiated: ${reference} - ${amount} RWF`);

      return {
        success: true,
        transactionId: response.data.transactionId || reference,
        status: 'pending',
        provider: 'AIRTEL',
        message: 'Payment request sent to customer phone'
      };

    } catch (error) {
      logger.error(`Airtel payment failed: ${error.message}`, {
        phoneNumber: paymentData.phoneNumber,
        amount: paymentData.amount,
        reference: paymentData.reference
      });

      return {
        success: false,
        error: error.message,
        provider: 'AIRTEL'
      };
    }
  }

  /**
   * Check payment status
   * @param {string} transactionId - Transaction ID
   * @param {string} provider - Provider name (MTN or AIRTEL)
   */
  async checkPaymentStatus(transactionId, provider) {
    try {
      const baseUrl = provider === 'MTN' ? this.mtnBaseUrl : this.airtelBaseUrl;
      const apiKey = provider === 'MTN' ? this.mtnApiKey : this.airtelApiKey;

      const response = await axios.get(
        `${baseUrl}/payment/v1/status/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        status: response.data.status,
        provider: provider,
        transactionId: transactionId
      };

    } catch (error) {
      logger.error(`Payment status check failed: ${error.message}`, {
        transactionId,
        provider
      });

      return {
        success: false,
        error: error.message,
        provider: provider
      };
    }
  }

  /**
   * Format phone number for specific provider
   * @param {string} phoneNumber - Raw phone number
   * @param {string} provider - Provider name
   */
  formatPhoneNumber(phoneNumber, provider) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Add country code if not present
    if (cleaned.length === 9) {
      cleaned = `250${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('250')) {
      // Already has country code
    } else {
      throw new Error('Invalid phone number format');
    }

    return cleaned;
  }

  /**
   * Validate phone number for Rwandan networks
   * @param {string} phoneNumber - Phone number to validate
   */
  validatePhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Check if it's a valid Rwandan number
    if (cleaned.length === 9) {
      // Local format - add country code for validation
      const withCountryCode = `250${cleaned}`;
      return this.isValidRwandanNumber(withCountryCode);
    } else if (cleaned.length === 12) {
      return this.isValidRwandanNumber(cleaned);
    }

    return false;
  }

  /**
   * Check if number belongs to valid Rwandan network
   * @param {string} phoneNumber - Full phone number with country code
   */
  isValidRwandanNumber(phoneNumber) {
    // Rwandan mobile number prefixes
    const mtnPrefixes = ['788', '789', '782', '783'];
    const airtelPrefixes = ['728', '729', '738', '739'];

    const prefix = phoneNumber.substring(3, 6); // Extract prefix after country code

    return mtnPrefixes.includes(prefix) || airtelPrefixes.includes(prefix);
  }

  /**
   * Get available payment methods for phone number
   * @param {string} phoneNumber - Customer phone number
   */
  getAvailableProviders(phoneNumber) {
    const providers = [];

    if (this.validatePhoneNumber(phoneNumber)) {
      const cleaned = phoneNumber.replace(/\D/g, '');
      const prefix = cleaned.length === 9 ? cleaned.substring(0, 3) : cleaned.substring(3, 6);

      // MTN prefixes
      if (['788', '789', '782', '783'].includes(prefix)) {
        providers.push('MTN');
      }

      // Airtel prefixes
      if (['728', '729', '738', '739'].includes(prefix)) {
        providers.push('AIRTEL');
      }
    }

    return providers;
  }

  /**
   * Initiate payment (unified method)
   * @param {Object} paymentData - Payment information
   */
  async initiatePayment(paymentData) {
    try {
      const { phoneNumber, amount, orderId, description } = paymentData;

      // Determine provider based on phone number
      const availableProviders = this.getAvailableProviders(phoneNumber);

      if (availableProviders.length === 0) {
        return {
          success: false,
          message: 'Phone number not supported by any mobile money provider'
        };
      }

      // Use the first available provider (can be enhanced to let user choose)
      const provider = availableProviders[0];

      // Generate reference
      const reference = `ECR${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

      // Prepare payment data
      const paymentPayload = {
        phoneNumber,
        amount,
        reference,
        callbackUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/checkout/webhook/${provider.toLowerCase()}`,
        description: description || `Payment for order ${orderId}`
      };

      // Process payment with selected provider
      let result;
      if (provider === 'MTN') {
        result = await this.processMTNPayment(paymentPayload);
      } else if (provider === 'AIRTEL') {
        result = await this.processAirtelPayment(paymentPayload);
      } else {
        return {
          success: false,
          message: 'Unsupported provider'
        };
      }

      return {
        success: result.success,
        reference: reference,
        transactionId: result.transactionId,
        provider: provider,
        message: result.message,
        error: result.error
      };

    } catch (error) {
      logger.error(`Payment initiation failed: ${error.message}`, {
        phoneNumber: paymentData.phoneNumber,
        amount: paymentData.amount,
        orderId: paymentData.orderId
      });

      return {
        success: false,
        message: 'Payment initiation failed',
        error: error.message
      };
    }
  }

  /**
   * Process payment webhook
   * @param {string} provider - Provider name
   * @param {Object} webhookData - Webhook data from provider
   */
  async processWebhook(provider, webhookData) {
    try {
      logger.info(`Processing ${provider} webhook:`, webhookData);

      // Extract relevant information from webhook
      const reference = webhookData.reference || webhookData.transactionId;
      const status = webhookData.status || webhookData.paymentStatus;
      const amount = webhookData.amount;

      // Find order by payment reference
      const Order = require('../models/Order');
      const order = await Order.findOne({ paymentReference: reference });

      if (!order) {
        logger.error(`Order not found for reference: ${reference}`);
        return {
          success: false,
          message: 'Order not found'
        };
      }

      // Update order based on payment status
      let orderStatus = 'pending';
      if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAID') {
        orderStatus = 'paid';
        order.paidAt = new Date();
      } else if (status === 'FAILED' || status === 'CANCELLED') {
        orderStatus = 'failed';
      }

      order.status = orderStatus;
      await order.save();

      logger.info(`Order ${order._id} updated via webhook: ${orderStatus}`);

      return {
        success: true,
        orderId: order._id,
        status: orderStatus,
        message: `Order updated to ${orderStatus}`
      };

    } catch (error) {
      logger.error(`Webhook processing failed: ${error.message}`, {
        provider,
        webhookData
      });

      return {
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      };
    }
  }

  /**
   * Calculate transaction fees
   * @param {number} amount - Transaction amount
   * @param {string} provider - Provider name
   */
  calculateFees(amount, provider) {
    // Basic fee structure (can be customized based on actual rates)
    const baseFee = 0; // No base fee for mobile money in Rwanda
    const percentageFee = 0.02; // 2% fee

    const fee = Math.round(amount * percentageFee);
    const total = amount + fee;

    return {
      amount: amount,
      fee: fee,
      total: total,
      provider: provider
    };
  }
}

module.exports = new MobileMoneyService();