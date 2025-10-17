const nodemailer = require('nodemailer');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Notification Service for Email and SMS
 * Supports email notifications and SMS via local providers
 */
class NotificationService {
  constructor() {
    this.emailTransporter = this.setupEmailTransporter();
    this.smsApiUrl = process.env.SMS_API_URL;
    this.smsApiKey = process.env.SMS_API_KEY;
  }

  /**
   * Setup email transporter
   */
  setupEmailTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Send order confirmation email
   * @param {Object} orderData - Order information
   * @param {Object} customerData - Customer information
   */
  async sendOrderConfirmation(orderData, customerData) {
    try {
      const emailTemplate = this.generateOrderConfirmationTemplate(orderData, customerData);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerData.email,
        subject: `Order Confirmation - #${orderData.orderNumber}`,
        html: emailTemplate,
      };

      await this.emailTransporter.sendMail(mailOptions);

      logger.info(`Order confirmation email sent to ${customerData.email} for order ${orderData.orderNumber}`);

      return {
        success: true,
        message: 'Order confirmation email sent successfully'
      };

    } catch (error) {
      logger.error(`Failed to send order confirmation email: ${error.message}`, {
        orderId: orderData._id,
        customerEmail: customerData.email
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send order status update email
   * @param {Object} orderData - Order information
   * @param {Object} customerData - Customer information
   * @param {string} status - New order status
   */
  async sendOrderStatusUpdate(orderData, customerData, status) {
    try {
      const emailTemplate = this.generateOrderStatusTemplate(orderData, customerData, status);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerData.email,
        subject: `Order Update - #${orderData.orderNumber}`,
        html: emailTemplate,
      };

      await this.emailTransporter.sendMail(mailOptions);

      logger.info(`Order status update email sent to ${customerData.email} for order ${orderData.orderNumber}`);

      return {
        success: true,
        message: 'Order status update email sent successfully'
      };

    } catch (error) {
      logger.error(`Failed to send order status update email: ${error.message}`, {
        orderId: orderData._id,
        customerEmail: customerData.email,
        status: status
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send supplier product approval email
   * @param {Object} productData - Product information
   * @param {Object} supplierData - Supplier information
   */
  async sendProductApprovalNotification(productData, supplierData) {
    try {
      const emailTemplate = this.generateProductApprovalTemplate(productData, supplierData);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: supplierData.email,
        subject: `Product ${productData.approved ? 'Approved' : 'Rejected'} - ${productData.name}`,
        html: emailTemplate,
      };

      await this.emailTransporter.sendMail(mailOptions);

      logger.info(`Product approval notification sent to ${supplierData.email} for product ${productData.name}`);

      return {
        success: true,
        message: 'Product approval notification sent successfully'
      };

    } catch (error) {
      logger.error(`Failed to send product approval notification: ${error.message}`, {
        productId: productData._id,
        supplierEmail: supplierData.email
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send SMS notification (for order updates, delivery notifications)
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - SMS message content
   */
  async sendSMS(phoneNumber, message) {
    try {
      if (!this.smsApiUrl || !this.smsApiKey) {
        logger.warn('SMS API not configured, skipping SMS notification');
        return {
          success: false,
          error: 'SMS API not configured'
        };
      }

      const response = await axios.post(
        this.smsApiUrl,
        {
          to: this.formatPhoneNumber(phoneNumber),
          message: message,
          from: process.env.SMS_SENDER_ID || 'ECommerceRW'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.smsApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`SMS sent to ${phoneNumber}: ${message.substring(0, 50)}...`);

      return {
        success: true,
        messageId: response.data.messageId,
        message: 'SMS sent successfully'
      };

    } catch (error) {
      logger.error(`Failed to send SMS: ${error.message}`, {
        phoneNumber: phoneNumber,
        messageLength: message.length
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate order confirmation email template
   */
  generateOrderConfirmationTemplate(orderData, customerData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f8f9fa; padding: 20px; }
          .order-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${customerData.name},</p>
            <p>Thank you for your order! Your order has been successfully placed and is being processed.</p>

            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${orderData.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ${orderData.total} RWF</p>
              <p><strong>Status:</strong> ${orderData.status}</p>
            </div>

            <p>You will receive another email notification once your order status changes.</p>
            <p>If you have any questions, please contact our customer support.</p>

            <p>Best regards,<br>Ecommerce Rwanda Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2023 Ecommerce Rwanda. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate order status update email template
   */
  generateOrderStatusTemplate(orderData, customerData, status) {
    const statusMessages = {
      'shipped': 'Your order has been shipped and is on its way to you.',
      'delivered': 'Your order has been delivered successfully.',
      'cancelled': 'Your order has been cancelled as per your request.',
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f8f9fa; padding: 20px; }
          .status { font-size: 18px; font-weight: bold; color: #007bff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          <div class="content">
            <p>Dear ${customerData.name},</p>
            <p><span class="status">Your order status has been updated to: ${status.toUpperCase()}</span></p>
            <p>${statusMessages[status] || 'Your order status has been updated.'}</p>

            <p><strong>Order Number:</strong> #${orderData.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>

            <p>Thank you for shopping with us!</p>
            <p>Best regards,<br>Ecommerce Rwanda Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate product approval email template
   */
  generateProductApprovalTemplate(productData, supplierData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Product ${productData.approved ? 'Approved' : 'Rejected'}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${productData.approved ? '#28a745' : '#dc3545'}; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f8f9fa; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Product ${productData.approved ? 'Approved' : 'Rejected'}</h1>
          </div>
          <div class="content">
            <p>Dear ${supplierData.name},</p>
            <p>Your product "<strong>${productData.name}</strong>" has been ${productData.approved ? 'approved' : 'rejected'} by our admin team.</p>

            ${productData.approved ?
              '<p>Congratulations! Your product is now live and available for customers to purchase.</p>' :
              '<p>Please review our product guidelines and make necessary changes before resubmitting.</p>'
            }

            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>Ecommerce Rwanda Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format phone number for SMS
   * @param {string} phoneNumber - Raw phone number
   */
  formatPhoneNumber(phoneNumber) {
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Add country code if not present
    if (cleaned.length === 9) {
      cleaned = `250${cleaned}`;
    }

    return cleaned;
  }
}

module.exports = new NotificationService();