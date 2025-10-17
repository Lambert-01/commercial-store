// Global JS for cart and UI interactions
document.addEventListener('DOMContentLoaded', function() {
  // Cart functionality
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.dataset.productId;
      // Add to cart logic here
      console.log('Added product to cart:', productId);
    });
  });

  // UI interactions
  const toggleButtons = document.querySelectorAll('.toggle');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const target = document.querySelector(this.dataset.target);
      if (target) {
        target.classList.toggle('hidden');
      }
    });
  });
});