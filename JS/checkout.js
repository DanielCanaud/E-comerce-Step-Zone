function showToast(message) {
  const toast = document.getElementById('toast');

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function formatCheckoutPrice(price) {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function getCheckoutSubtotal() {
  return cart.reduce((total, item) => {
    const product = getProductById(item.id);

    if (!product) return total;

    return total + product.price * item.quantity;
  }, 0);
}

function getCheckoutDiscount(subtotal) {
  return subtotal >= 600 ? subtotal * 0.1 : 0;
}

function renderCheckoutSummary() {
  const checkoutItems = document.getElementById('checkoutItems');
  const checkoutSubtotal = document.getElementById('checkoutSubtotal');
  const checkoutDiscount = document.getElementById('checkoutDiscount');
  const checkoutTotal = document.getElementById('checkoutTotal');

  if (!checkoutItems || !checkoutSubtotal || !checkoutDiscount || !checkoutTotal) {
    return;
  }

  if (!cart.length) {
    checkoutItems.innerHTML = '<p class="empty-message">Seu carrinho está vazio.</p>';
    checkoutSubtotal.textContent = formatCheckoutPrice(0);
    checkoutDiscount.textContent = formatCheckoutPrice(0);
    checkoutTotal.textContent = formatCheckoutPrice(0);
    return;
  }

  checkoutItems.innerHTML = cart
    .map(item => {
      const product = getProductById(item.id);

      if (!product) return '';

      const itemSubtotal = product.price * item.quantity;

      return `
        <article class="checkout-item">
          <img src="${product.image}" alt="${product.name}" class="checkout-item__image" />

          <div class="checkout-item__content">
            <h3 class="checkout-item__title">${product.name}</h3>
            <p class="checkout-item__meta">Quantidade: ${item.quantity}</p>
            <p class="checkout-item__meta">Preço unitário: ${formatCheckoutPrice(product.price)}</p>
            <p class="checkout-item__meta">Subtotal do item: ${formatCheckoutPrice(itemSubtotal)}</p>
          </div>
        </article>
      `;
    })
    .join('');

  const subtotal = getCheckoutSubtotal();
  const discount = getCheckoutDiscount(subtotal);
  const total = subtotal - discount;

  checkoutSubtotal.textContent = formatCheckoutPrice(subtotal);
  checkoutDiscount.textContent = formatCheckoutPrice(discount);
  checkoutTotal.textContent = formatCheckoutPrice(total);
}

function generateOrderId() {
  return 'SZ-' + Date.now();
}

function handleCheckoutSubmit(event) {
  event.preventDefault();

  const customerNameInput = document.getElementById('customerName');
  const paymentMethodSelect = document.getElementById('paymentMethod');

  if (!customerNameInput || !paymentMethodSelect) return;

  const customerName = customerNameInput.value.trim();
  const paymentMethod = paymentMethodSelect.value;

  if (!cart.length) {
    showToast('Seu carrinho está vazio.');
    return;
  }

  if (!customerName) {
    showToast('Preencha seu nome completo.');
    customerNameInput.focus();
    return;
  }

  if (!paymentMethod) {
    showToast('Selecione um método de pagamento.');
    paymentMethodSelect.focus();
    return;
  }

  const subtotal = getCheckoutSubtotal();
  const discount = getCheckoutDiscount(subtotal);
  const total = subtotal - discount;

  const order = {
    id: generateOrderId(),
    customerName,
    paymentMethod,
    items: cart,
    subtotal,
    discount,
    total,
    createdAt: new Date().toISOString()
  };

  saveOrderToStorage(order);
  clearCartStorage();

  showToast('Compra finalizada com sucesso!');

  setTimeout(() => {
    window.location.href = 'success.html';
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();

  if (!cart.length) {
    showToast('Seu carrinho está vazio.');
  }

  const checkoutForm = document.getElementById('checkoutForm');

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
});