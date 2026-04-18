let toastTimeoutId = null;
let lastFetchedCep = '';

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

  if (!checkoutItems || !checkoutSubtotal || !checkoutDiscount || !checkoutTotal) return;

  if (!cart.length) {
    checkoutItems.innerHTML = '<p class="empty-message">Seu carrinho está vazio.</p>';
    checkoutSubtotal.textContent = formatCheckoutPrice(0);
    checkoutDiscount.textContent = formatCheckoutPrice(0);
    checkoutTotal.textContent = formatCheckoutPrice(0);
    return;
  }

  checkoutItems.innerHTML = cart.map(item => {
    const product = getProductById(item.id);
    if (!product) return '';

    const itemSubtotal = product.price * item.quantity;

    return `
      <article class="checkout-item">
        <img src="${product.image}" class="checkout-item__image" />
        <div class="checkout-item__content">
          <h3>${product.name}</h3>
          <p>Qtd: ${item.quantity}</p>
          <p>${formatCheckoutPrice(product.price)}</p>
          <p>${formatCheckoutPrice(itemSubtotal)}</p>
        </div>
      </article>
    `;
  }).join('');

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

function getOnlyNumbers(value) {
  return value.replace(/\D/g, '');
}

/* ================= MASKS ================= */

function applyCpfMask(v) {
  return v.replace(/\D/g, '')
    .slice(0,11)
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/,'$1.$2.$3')
    .replace(/\.(\d{3})(\d)/,'.$1-$2');
}

function applyCepMask(v) {
  return v.replace(/\D/g,'')
    .slice(0,8)
    .replace(/(\d{5})(\d)/,'$1-$2');
}

function applyPhoneMask(v) {
  const n = v.replace(/\D/g,'').slice(0,11);
  return n.length <= 10
    ? n.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2')
    : n.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2');
}

function applyCardNumberMask(v){
  return v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ');
}

function applyCardExpiryMask(v){
  return v.replace(/\D/g,'').slice(0,4).replace(/(\d{2})(\d)/,'$1/$2');
}

function applyCardCvvMask(v){
  return v.replace(/\D/g,'').slice(0,4);
}

function setupInputMasks(){
  const cpf = document.getElementById('customerCpf');
  const cep = document.getElementById('customerCep');
  const phone = document.getElementById('customerPhone');
  const state = document.getElementById('customerState');
  const cardNumber = document.getElementById('cardNumber');
  const expiry = document.getElementById('cardExpiry');
  const cvv = document.getElementById('cardCvv');

  if(cpf) cpf.addEventListener('input', e => e.target.value = applyCpfMask(e.target.value));
  if(cep) cep.addEventListener('input', e => e.target.value = applyCepMask(e.target.value));
  if(phone) phone.addEventListener('input', e => e.target.value = applyPhoneMask(e.target.value));
  if(state) state.addEventListener('input', e => e.target.value = e.target.value.replace(/[^a-z]/gi,'').toUpperCase());
  if(cardNumber) cardNumber.addEventListener('input', e => e.target.value = applyCardNumberMask(e.target.value));
  if(expiry) expiry.addEventListener('input', e => e.target.value = applyCardExpiryMask(e.target.value));
  if(cvv) cvv.addEventListener('input', e => e.target.value = applyCardCvvMask(e.target.value));
}

/* ================= CEP ================= */

function fillAddressFields(data){
  document.getElementById('customerStreet').value = data.logradouro || '';
  document.getElementById('customerDistrict').value = data.bairro || '';
  document.getElementById('customerCity').value = data.localidade || '';
  document.getElementById('customerState').value = data.uf || '';
  document.getElementById('customerNumber').focus();
}

async function fetchAddressByCep(cep){
  const c = getOnlyNumbers(cep);
  if(c.length !== 8 || c === lastFetchedCep) return;

  try{
    const res = await fetch(`https://viacep.com.br/ws/${c}/json/`);
    const data = await res.json();

    if(data.erro){
      showToast('CEP não encontrado');
      return;
    }

    fillAddressFields(data);
    lastFetchedCep = c;
  }catch{
    showToast('Erro ao buscar CEP');
  }
}

function setupCepLookup(){
  const cep = document.getElementById('customerCep');

  if(!cep) return;

  cep.addEventListener('input', e=>{
    const n = getOnlyNumbers(e.target.value);
    if(n.length === 8) fetchAddressByCep(e.target.value);
  });

  cep.addEventListener('blur', e=>{
    fetchAddressByCep(e.target.value);
  });
}

/* ================= PAGAMENTO ================= */

function updatePaymentDetails(){
  const method = document.getElementById('paymentMethod').value;
  document.getElementById('pixFields').classList.add('is-hidden');
  document.getElementById('cardFields').classList.add('is-hidden');

  if(method === 'pix'){
    document.getElementById('pixFields').classList.remove('is-hidden');
  }

  if(method === 'credito' || method === 'debito'){
    document.getElementById('cardFields').classList.remove('is-hidden');
  }
}

/* ================= LOADING ================= */

function setSubmitButtonLoading(state){
  const btn = document.querySelector('#checkoutForm button[type="submit"]');
  if(!btn) return;

  if(state){
    btn.classList.add('is-loading');
    btn.disabled = true;
    btn.textContent = 'Processando...';
  }else{
    btn.classList.remove('is-loading');
    btn.disabled = false;
    btn.textContent = 'Finalizar compra';
  }
}

/* ================= SUBMIT ================= */

function handleCheckoutSubmit(e){
  e.preventDefault();

  const btn = document.querySelector('#checkoutForm button[type="submit"]');
  if(btn && btn.disabled) return;

  const name = document.getElementById('customerName').value.trim();
  const payment = document.getElementById('paymentMethod').value;

  if(!name){
    showToast('Digite seu nome');
    return;
  }

  if(!payment){
    showToast('Escolha pagamento');
    return;
  }

  try{
    setSubmitButtonLoading(true);

    const subtotal = getCheckoutSubtotal();
    const discount = getCheckoutDiscount(subtotal);
    const total = subtotal - discount;

    const order = {
      id: generateOrderId(),
      customerName: name,
      paymentMethod: payment,
      items: cart,
      subtotal,
      discount,
      total,
      createdAt: new Date().toISOString()
    };

    saveOrderToStorage(order);
    clearCartStorage();

    showToast('Compra finalizada!');

    setTimeout(()=>{
      window.location.href = 'success.html';
    },1000);

  }catch{
    setSubmitButtonLoading(false);
    showToast('Erro ao finalizar compra');
  }
}

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded',()=>{
  renderCheckoutSummary();
  setupInputMasks();
  setupCepLookup();
  updatePaymentDetails();

  const form = document.getElementById('checkoutForm');
  const payment = document.getElementById('paymentMethod');

  if(form){
    form.addEventListener('submit', handleCheckoutSubmit);
  }

  if(payment){
    payment.addEventListener('change', updatePaymentDetails);
  }
});