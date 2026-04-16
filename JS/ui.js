document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCartCount();
  renderCartItems();

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

      addToCart(productId);
      renderCartCount();
      renderCartItems();
    });
  });

  document.addEventListener('click', event => {
    const decreaseButton = event.target.closest('.decrease');
    const increaseButton = event.target.closest('.increase');

    if (decreaseButton) {
      const productId = Number(decreaseButton.dataset.id);

      decreaseItemQuantity(productId);
      renderCartCount();
      renderCartItems();
    }

    if (increaseButton) {
      const productId = Number(increaseButton.dataset.id);

      increaseItemQuantity(productId);
      renderCartCount();
      renderCartItems();
    }
  });
});