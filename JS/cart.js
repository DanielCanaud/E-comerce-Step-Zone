let cart = getCartFromStorage();

function getProductById(productId) {
  return products.find(product => product.id === productId);
}

function formatCartPrice(price) {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function updateCartStorage() {
  saveCartToStorage(cart);
}

function getCartTotalItems() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
  return cart.reduce((total, item) => {
    const product = getProductById(item.id);

    if (!product) return total;

    return total + product.price * item.quantity;
  }, 0);
}

function addToCart(productId) {
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  updateCartStorage();
}

function increaseItemQuantity(productId) {
  const item = cart.find(item => item.id === productId);

  if (!item) return;

  item.quantity += 1;
  updateCartStorage();
}

function decreaseItemQuantity(productId) {
  const itemIndex = cart.findIndex(item => item.id === productId);

  if (itemIndex === -1) return;

  if (cart[itemIndex].quantity > 1) {
    cart[itemIndex].quantity -= 1;
  } else {
    cart.splice(itemIndex, 1);
  }

  updateCartStorage();
}
function removeItemFromCart(productId){
  cart = cart.filter(item => item.id !== productId);
  updateCartStorage();
}

function renderCartCount() {
  const cartCountElement = document.querySelector('.cart-count');

  if (!cartCountElement) return;

  cartCountElement.textContent = getCartTotalItems();
}

function renderCartItems() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartSubtotalElement = document.getElementById('cartSubtotal');

  if (!cartItemsContainer || !cartSubtotalElement) return;

  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p class="empty-message">Seu carrinho está vazio.</p>';
    cartSubtotalElement.textContent = formatCartPrice(0);
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map(item => {
      const product = getProductById(item.id);

      if (!product) return '';

      const itemSubtotal = product.price * item.quantity;

      return `
        <article class="cart-item">
          <img src="${product.image}" alt="${product.name}" class="cart-item__image" />

          <div class="cart-item__content">
            <h4 class="cart-item__title">${product.name}</h4>
            <p class="cart-item__price">Preço: ${formatCartPrice(product.price)}</p>

            <div class="cart-item__controls">
              <button class="cart-item__btn decrease" data-id="${item.id}">−</button>
              <span class="cart-item__quantity">${item.quantity}</span>
              <button class="cart-item__btn increase" data-id="${item.id}">+</button>
            </div>

            <p class="cart-item__subtotal">Subtotal: ${formatCartPrice(itemSubtotal)}</p>

              <button class="cart-item__remove" data-id="${item.id}">
                  🗑️
              </button>
          </div>
        </article>
      `;
    })
    .join('');

  cartSubtotalElement.textContent = formatCartPrice(getCartSubtotal());
}