function formatPrice(price) {
  const numericPrice = Number(price || 0);

  return numericPrice.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function getPaymentLabel(method) {
  const labels = {
    pix: 'Pix',
    credito: 'Cartão de Crédito',
    debito: 'Cartão de Débito'
  };

  return labels[method] || method || 'Não informado';
}

function getOrderTotal(order) {
  if (typeof order.total === 'number' && !Number.isNaN(order.total)) {
    return order.total;
  }

  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);

  return subtotal - discount;
}

document.addEventListener('DOMContentLoaded', () => {
  const order = getLastOrderFromStorage();

  if (!order) {
    window.location.href = 'index.html';
    return;
  }

  const orderIdElement = document.getElementById('orderId');
  const orderCustomerElement = document.getElementById('orderCustomer');
  const orderPaymentElement = document.getElementById('orderPayment');
  const orderTotalElement = document.getElementById('orderTotal');

  if (orderIdElement) {
    orderIdElement.textContent = order.id || 'Não disponível';
  }

  if (orderCustomerElement) {
    orderCustomerElement.textContent = order.customerName || 'Não informado';
  }

  if (orderPaymentElement) {
    orderPaymentElement.textContent = getPaymentLabel(order.paymentMethod);
  }

  if (orderTotalElement) {
    const total = getOrderTotal(order);
    orderTotalElement.textContent = formatPrice(total);
  }
});