let toastTimeoutId = null;
let lastFetchedCep  = '';

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

function applyCardNumberMask(value) {
  const numbers = value.replace(/\D/g, '').slice(0, 16);
  return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function applyCardExpiryMask(value) {
  const numbers = value.replace(/\D/g, '').slice(0, 4);
  return numbers.replace(/^(\d{2})(\d)/, '$1/$2');
}

function applyCardCvvMask(value) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function setupInputMasks() {
  const cpfInput = document.getElementById('customerCpf');
  const cepInput = document.getElementById('customerCep');
  const phoneInput = document.getElementById('customerPhone');
  const stateInput = document.getElementById('customerState');
  const cardNumberInput = document.getElementById('cardNumber');
  const cardExpiryInput = document.getElementById('cardExpiry');
  const cardCvvInput = document.getElementById('cardCvv');

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

  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', event => {
      event.target.value = applyCardNumberMask(event.target.value);
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', event => {
      event.target.value = applyCardExpiryMask(event.target.value);
    });
  }

  if (cardCvvInput) {
    cardCvvInput.addEventListener('input', event => {
      event.target.value = applyCardCvvMask(event.target.value);
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

function isValidCardNumber(cardNumber) {
  const cardNumbers = getOnlyNumbers(cardNumber);
  return cardNumbers.length === 16;
}

function isValidCardName(cardName) {
  return cardName.trim().length >= 5;
}

function isValidCardExpiry(cardExpiry) {
  if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    return false;
  }

  const [month] = cardExpiry.split('/').map(Number);

  return month >= 1 && month <= 12;
}

function isValidCardCvv(cardCvv) {
  const cvvNumbers = getOnlyNumbers(cardCvv);
  return cvvNumbers.length === 3 || cvvNumbers.length === 4;
}

function updatePaymentDetails() {
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const pixFields = document.getElementById('pixFields');
  const cardFields = document.getElementById('cardFields');

  if (!paymentMethodSelect || !pixFields || !cardFields) return;

  const selectedMethod = paymentMethodSelect.value;

  pixFields.classList.add('is-hidden');
  cardFields.classList.add('is-hidden');

  if (selectedMethod === 'pix') {
    pixFields.classList.remove('is-hidden');
  }

  if (selectedMethod === 'credito' || selectedMethod === 'debito') {
    cardFields.classList.remove('is-hidden');
  }
}

function fillAddressFields(addressData) {
  const streetInput = document.getElementById('customerStreet');
  const districtInput = document.getElementById('customerDistrict');
  const cityInput = document.getElementById('customerCity');
  const stateInput = document.getElementById('customerState');
  const numberInput = document.getElementById('customerNumber');

  if (streetInput) {
    streetInput.value = addressData.logradouro || '';
  }

  if (districtInput) {
    districtInput.value = addressData.bairro || '';
  }

  if (cityInput) {
    cityInput.value = addressData.localidade || '';
  }

  if (stateInput) {
    stateInput.value = (addressData.uf || '').toUpperCase();
  }

  if (numberInput) {
    numberInput.focus();
  }
}

async function fetchAddressByCep(cep) {
  const cepNumbers = getOnlyNumbers(cep);

  if (cepNumbers.length !== 8) {
    return;
  }

  if (lastFetchedCep === cepNumbers) {
    return;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);

    if (!response.ok) {
      throw new Error('Erro na resposta da API');
    }

    const data = await response.json();

    if (data.erro) {
      showToast('CEP não encontrado.');
      return;
    }

    fillAddressFields(data);
    lastFetchedCep = cepNumbers;
    showToast('Endereço preenchido automaticamente.');
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    showToast('Não foi possível buscar o CEP.');
  }
}
function setupCepLookup() {
  const cepInput = document.getElementById('customerCep');

  if (!cepInput) return;

  cepInput.addEventListener('input', event => {
    const cepNumbers = getOnlyNumbers(event.target.value);

    if (cepNumbers.length < 8) {
      lastFetchedCep = '';
      return;
    }

    if (cepNumbers.length === 8) {
      fetchAddressByCep(event.target.value);
    }
  });

  cepInput.addEventListener('blur', event => {
    fetchAddressByCep(event.target.value);
  });
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
  const cardNumberInput = document.getElementById('cardNumber');
  const cardNameInput = document.getElementById('cardName');
  const cardExpiryInput = document.getElementById('cardExpiry');
  const cardCvvInput = document.getElementById('cardCvv');

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
    !paymentMethodSelect ||
    !cardNumberInput ||
    !cardNameInput ||
    !cardExpiryInput ||
    !cardCvvInput
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
  const cardNumber = cardNumberInput.value.trim();
  const cardName = cardNameInput.value.trim();
  const cardExpiry = cardExpiryInput.value.trim();
  const cardCvv = cardCvvInput.value.trim();

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
  } else if ((paymentMethod === 'credito' || paymentMethod === 'debito') && !cardNumber) {
    errorMessage = 'Preencha o número do cartão.';
    errorField = cardNumberInput;
  } else if ((paymentMethod === 'credito' || paymentMethod === 'debito') && !isValidCardNumber(cardNumber)) {
    errorMessage = 'Digite um número de cartão válido com 16 dígitos.';
    errorField = cardNumberInput;
  } else if ((paymentMethod === 'credito' || paymentMethod === 'debito') && !cardName) {
    errorMessage = 'Preencha o nome impresso no cartão.';
    errorField = cardNameInput;
  } else if ((paymentMethod === 'credito' || paymentMethod === 'debito') && !isValidCardName(cardName)) {
    errorMessage = 'Digite o nome do cartão como está impresso.';
    errorField = cardNameInput;
  } else if ((paymentMethod === 'credito' || paymentMethod === 'debito') && !cardExpiry) {
    errorMessage = 'Preencha a validade do cartão.';
    errorField = cardExpiryInput;
  } else if ((paymentMethod === 'credito' || paymentMethod === 'debito') && !isValidCardExpiry(cardExpiry)) {
    errorMessage = 'Digite uma validade válida no formato MM/AA.';
    errorField = cardExpiryInput;
  } else if ((paymentMethod === 'credito' || paymentMethod === 'debito') && !cardCvv) {
    errorMessage = 'Preencha o CVV do cartão.';
    errorField = cardCvvInput;
  } else if ((paymentMethod === 'credito' || paymentMethod === 'debito') && !isValidCardCvv(cardCvv)) {
    errorMessage = 'Digite um CVV válido com 3 ou 4 números.';
    errorField = cardCvvInput;
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
    cardData: paymentMethod === 'credito' || paymentMethod === 'debito'
      ? {
          cardNumber,
          cardName,
          cardExpiry,
          cardCvv
        }
      : null,
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
  updatePaymentDetails();
  setupCepLookup();

  if (!cart.length) {
    showToast('Seu carrinho está vazio.');
  }

  const checkoutForm = document.getElementById('checkoutForm');
  const paymentMethodSelect = document.getElementById('paymentMethod');

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }

  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', updatePaymentDetails);
  }
});