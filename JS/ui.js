document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCartCount();

  const cartButton = document.querySelector('.cart-button');
  const closeCartButton = document.getElementById('closeCartButton');
  const cartDrawer = document.getElementById('cartDrawer');

  if (cartButton && cartDrawer) {
    cartButton.addEventListener('click', () => {
      cartDrawer.classList.add('is-open');
    });
  }

  if (closeCartButton && cartDrawer) {
    closeCartButton.addEventListener('click', () => {
      cartDrawer.classList.remove('is-open');
    });
  }

  
  const addToCartButtons = document.querySelectorAll('.product-card__button');

  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.productId);

      console.log('clicou no produto', productId);

      addToCart(productId);
      renderCartCount();
    });
  });
});