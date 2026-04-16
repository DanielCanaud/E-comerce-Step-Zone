let cart = getCartFromStorage();

function getProductById(productId) {
  console.log('buscando produto por id:', productId);
  console.log('products:', products);

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
  console.log('produto recebido:', productId);
  console.log('cart antes:', JSON.stringify(cart));

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  console.log('cart depois:', JSON.stringify(cart));

  updateCartStorage();
}

function renderCartCount() {
  const cartCountElement = document.querySelector('.cart-count');

  if (!cartCountElement) return;

  cartCountElement.textContent = getCartTotalItems();
}

function renderCartItems() {
  console.log('renderCartItems rodou');
  console.log('cart atual:', JSON.stringify(cart));

  const cartItemsContainer = document.getElementById('cartItems');
  const cartSubtotalElement = document.getElementById('cartSubtotal');

  console.log('cartItemsContainer:', cartItemsContainer);
  console.log('cartSubtotalElement:', cartSubtotalElement);

  if (!cartItemsContainer || !cartSubtotalElement) return;

  if (!cart.length) {
    console.log('caiu no estado vazio');
    cartItemsContainer.innerHTML = '<p class="empty-message">Seu carrinho está vazio.</p>';
    cartSubtotalElement.textContent = formatCartPrice(0);
    return;
  }

  const cartMarkup = cart
    .map(item => {
      console.log('item do carrinho:', item);

      const product = getProductById(item.id);
      console.log('produto encontrado:', product);

      if (!product) return '';

      const itemSubtotal = product.price * item.quantity;

      return `
        <article class="cart-item">
          <img src="${product.image}" alt="${product.name}" class="cart-item__image" />
          <div class="cart-item__content">
            <h4 class="cart-item__title">${product.name}</h4>
            <p class="cart-item__price">Preço: ${formatCartPrice(product.price)}</p>
            <p class="cart-item__quantity">Quantidade: ${item.quantity}</p>
            <p class="cart-item__subtotal">Subtotal: ${formatCartPrice(itemSubtotal)}</p>
          </div>
        </article>
      `;
    })
    .join('');

  console.log('markup gerado:', cartMarkup);

  cartItemsContainer.innerHTML = cartMarkup || '<p class="empty-message">Nenhum item válido encontrado.</p>';
  cartSubtotalElement.textContent = formatCartPrice(getCartSubtotal());
}