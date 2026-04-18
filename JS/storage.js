function saveCartToStorage(cart) {
  localStorage.setItem('stepzone-cart', JSON.stringify(cart));
}

function getCartFromStorage() {
  const savedCart = localStorage.getItem('stepzone-cart');
  return savedCart ? JSON.parse(savedCart) : [];
}
function saveOrderToStorage(order){
  localStorage.setItem('stepzone-last-order', JSON.stringify(order));
}
function getLastOrderFromStorage(){
  const order = localStorage.getItem('stepzone-last-order');
  return order ? JSON.parse(order) : null;
}
function clearCartStorage(){
  localStorage.removeItem('stepzone-cart');
}