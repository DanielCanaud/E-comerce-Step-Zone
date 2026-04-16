function saveCartToStorage(cart) {
  localStorage.setItem('stepzone-cart', JSON.stringify(cart));
}

function getCartFromStorage() {
  const savedCart = localStorage.getItem('stepzone-cart');
  return savedCart ? JSON.parse(savedCart) : [];
}