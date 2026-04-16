document.addEventListener('DOMContentLoaded', () => {
  console.log('ui.js carregado');

  renderProducts();

  const cartButton = document.querySelector('.cart-button');
  const closeCartButton = document.getElementById('closeCartButton');
  const cartDrawer = document.getElementById('cartDrawer');

  if (cartButton && cartDrawer) {
    cartButton.addEventListener('click', () => {
      console.log('clicou no carrinho');
      cartDrawer.classList.add('is-open');
    });
  }

  if (closeCartButton && cartDrawer) {
    closeCartButton.addEventListener('click', () => {
      cartDrawer.classList.remove('is-open');
    });
  }
});