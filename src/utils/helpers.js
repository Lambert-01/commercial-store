// Helper functions
const formatCurrency = (amount) => {
  return `$${amount.toFixed(2)}`;
};

const generateToken = () => {
  return Math.random().toString(36).substr(2);
};

module.exports = {
  formatCurrency,
  generateToken,
};