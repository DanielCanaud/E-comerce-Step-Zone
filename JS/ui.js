  function showToast(message) {
    const toast = document.getElementById('toast');

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() =>{
      toast.classList.remove('show');
    }, 2000);
  }
  function updateCheckoutButtonState() {
  const checkoutButton = document.getElementById('checkoutButton');

  if (!checkoutButton) return;

  const isCartEmpty = cart.length === 0;

  if (isCartEmpty) {
    checkoutButton.classList.add('is-disabled');
    checkoutButton.setAttribute('aria-disabled', 'true');
  } else {
    checkoutButton.classList.remove('is-disabled');
    checkoutButton.removeAttribute('aria-disabled');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCartCount();
  renderCartItems();
  updateCheckoutButtonState();

  const cartButton = document.querySelector('.cart-button');
  const closeCartButton = document.getElementById('closeCartButton');
  const cartDrawer = document.getElementById('cartDrawer');
  const checkoutButton = document.getElementById('checkoutButton');

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
      updateCheckoutButtonState();

      showToast('produto adicionado ao carrinho')
    });
  });

  document.addEventListener('click', event => {
    const decreaseButton = event.target.closest('.decrease');
    const increaseButton = event.target.closest('.increase');
    const removeButton  = event.target.closest('.cart-item__remove');

    if (decreaseButton) {
      const productId = Number(decreaseButton.dataset.id);

      decreaseItemQuantity(productId);
      renderCartCount();
      renderCartItems();
      updateCheckoutButtonState();
    }

    if (increaseButton) {
      const productId = Number(increaseButton.dataset.id);

      increaseItemQuantity(productId);
      renderCartCount();
      renderCartItems();
      updateCheckoutButtonState();
    }
    if (removeButton){
      const productId = Number(removeButton.dataset.id);

      removeItemFromCart(productId);
      renderCartCount();
      renderCartItems();
      updateCheckoutButtonState();

    }
  });
    if (checkoutButton){
      checkoutButton.addEventListener('click', event => {
        if (cart.length === 0){
          event.preventDefault();
          showToast('Adicione produtos antes de ir ao checkout');
        }
      });
    }
});