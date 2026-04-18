let toastTimeoutId = null;

function showToast(message) {
  const toast = document.getElementById('toast');

  if (!toast) return;

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toast.classList.remove('show');

  requestAnimationFrame(() => {
    toast.textContent = message;
    toast.classList.add('show');

    toastTimeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  });
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

function applyCpfMask(value) {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  return numbers
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function applyCepMask(value) {
  const numbers = value.replace(/\D/g, '').slice(0, 8);

  return numbers.replace(/^(\d{5})(\d)/, '$1-$2');
}

function applyPhoneMask(value) {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return numbers
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function setupInputMasks() {
  const cpfInput = document.getElementById('customerCpf');
  const cepInput = document.getElementById('customerCep');
  const phoneInput = document.getElementById('customerPhone');
  const stateInput = document.getElementById('customerState');

  if (cpfInput) {
    cpfInput.addEventListener('input', event => {
      event.target.value = applyCpfMask(event.target.value);
    });
  }

  if (cepInput) {
    cepInput.addEventListener('input', event => {
      event.target.value = applyCepMask(event.target.value);
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', event => {
      event.target.value = applyPhoneMask(event.target.value);
    });
  }

  if (stateInput) {
    stateInput.addEventListener('input', event => {
      event.target.value = event.target.value
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 2)
        .toUpperCase();
    });
  }
}

function getOnlyNumbers(value) {
  return value.replace(/\D/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const phoneNumbers = getOnlyNumbers(phone);
  return phoneNumbers.length === 10 || phoneNumbers.length === 11;
}

function isValidCpf(cpf) {
  const cpfNumbers = getOnlyNumbers(cpf);
  return cpfNumbers.length === 11;
}

function isValidCep(cep) {
  const cepNumbers = getOnlyNumbers(cep);
  return cepNumbers.length === 8;
}

function isValidState(state) {
  return /^[A-Za-z]{2}$/.test(state);
}

function handleCheckoutSubmit(event) {
  event.preventDefault();

  const customerNameInput = document.getElementById('customerName');
  const customerEmailInput = document.getElementById('customerEmail');
  const customerPhoneInput = document.getElementById('customerPhone');
  const customerCpfInput = document.getElementById('customerCpf');
  const customerCepInput = document.getElementById('customerCep');
  const customerStreetInput = document.getElementById('customerStreet');
  const customerNumberInput = document.getElementById('customerNumber');
  const customerComplementInput = document.getElementById('customerComplement');
  const customerDistrictInput = document.getElementById('customerDistrict');
  const customerCityInput = document.getElementById('customerCity');
  const customerStateInput = document.getElementById('customerState');
  const paymentMethodSelect = document.getElementById('paymentMethod');

  if (
    !customerNameInput ||
    !customerEmailInput ||
    !customerPhoneInput ||
    !customerCpfInput ||
    !customerCepInput ||
    !customerStreetInput ||
    !customerNumberInput ||
    !customerComplementInput ||
    !customerDistrictInput ||
    !customerCityInput ||
    !customerStateInput ||
    !paymentMethodSelect
  ) {
    return;
  }

  const customerName = customerNameInput.value.trim();
  const customerEmail = customerEmailInput.value.trim();
  const customerPhone = customerPhoneInput.value.trim();
  const customerCpf = customerCpfInput.value.trim();
  const customerCep = customerCepInput.value.trim();
  const customerStreet = customerStreetInput.value.trim();
  const customerNumber = customerNumberInput.value.trim();
  const customerComplement = customerComplementInput.value.trim();
  const customerDistrict = customerDistrictInput.value.trim();
  const customerCity = customerCityInput.value.trim();
  const customerState = customerStateInput.value.trim();
  const paymentMethod = paymentMethodSelect.value;

  let errorMessage = '';
  let errorField = null;

  if (!cart.length) {
    errorMessage = 'Seu carrinho está vazio.';
  } else if (!customerName) {
    errorMessage = 'Preencha seu nome completo.';
    errorField = customerNameInput;
  } else if (customerName.length < 3) {
    errorMessage = 'Digite um nome válido.';
    errorField = customerNameInput;
  } else if (!customerEmail) {
    errorMessage = 'Preencha seu e-mail.';
    errorField = customerEmailInput;
  } else if (!isValidEmail(customerEmail)) {
    errorMessage = 'Digite um e-mail válido.';
    errorField = customerEmailInput;
  } else if (!customerPhone) {
    errorMessage = 'Preencha seu telefone.';
    errorField = customerPhoneInput;
  } else if (!isValidPhone(customerPhone)) {
    errorMessage = 'Digite um telefone válido com DDD.';
    errorField = customerPhoneInput;
  } else if (!customerCpf) {
    errorMessage = 'Preencha seu CPF.';
    errorField = customerCpfInput;
  } else if (!isValidCpf(customerCpf)) {
    errorMessage = 'Digite um CPF válido com 11 números.';
    errorField = customerCpfInput;
  } else if (!customerCep) {
    errorMessage = 'Preencha seu CEP.';
    errorField = customerCepInput;
  } else if (!isValidCep(customerCep)) {
    errorMessage = 'Digite um CEP válido.';
    errorField = customerCepInput;
  } else if (!customerStreet) {
    errorMessage = 'Preencha a rua.';
    errorField = customerStreetInput;
  } else if (!customerNumber) {
    errorMessage = 'Preencha o número do endereço.';
    errorField = customerNumberInput;
  } else if (!customerDistrict) {
    errorMessage = 'Preencha o bairro.';
    errorField = customerDistrictInput;
  } else if (!customerCity) {
    errorMessage = 'Preencha a cidade.';
    errorField = customerCityInput;
  } else if (!customerState) {
    errorMessage = 'Preencha o estado.';
    errorField = customerStateInput;
  } else if (!isValidState(customerState)) {
    errorMessage = 'Digite a sigla do estado com 2 letras.';
    errorField = customerStateInput;
  } else if (!paymentMethod) {
    errorMessage = 'Selecione um método de pagamento.';
    errorField = paymentMethodSelect;
  }

  if (errorMessage) {
    showToast(errorMessage);

    if (errorField) {
      errorField.focus();
    }

    return;
  }

  const subtotal = getCheckoutSubtotal();
  const discount = getCheckoutDiscount(subtotal);
  const total = subtotal - discount;

  const order = {
    id: generateOrderId(),
    customerName,
    customerEmail,
    customerPhone,
    customerCpf,
    customerCep,
    customerStreet,
    customerNumber,
    customerComplement,
    customerDistrict,
    customerCity,
    customerState,
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
  setupInputMasks();

  if (!cart.length) {
    showToast('Seu carrinho está vazio.');
  }

  const checkoutForm = document.getElementById('checkoutForm');

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
});