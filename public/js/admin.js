// Admin panel JS
document.addEventListener('DOMContentLoaded', function() {
  // Admin dashboard interactions
  const approveButtons = document.querySelectorAll('.approve-product');
  approveButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.dataset.productId;
      // Approve product logic here
      console.log('Approved product:', productId);
    });
  });

  const rejectButtons = document.querySelectorAll('.reject-product');
  rejectButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.dataset.productId;
      // Reject product logic here
      console.log('Rejected product:', productId);
    });
  });

  // Toggle admin menu
  const menuToggle = document.querySelector('.admin-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      const menu = document.querySelector('.admin-nav');
      menu.classList.toggle('hidden');
    });
  }
});