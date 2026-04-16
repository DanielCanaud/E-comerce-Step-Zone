let cart = getcartFromStorage();

function updateCartStorage(){
    saveCartToStorage(cart);
}
function getCartTotalItems(){
      return cart.reduce((total, item) => total + item.quantity, 0);
}
function addToCart(productId){
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem){
        existingItem.quantity += 1;
    }else{
    cart.push({
        id:productId,
        quantity:1
    });
    }
    updateCartStorage();
}
function renderCartCount(){
    const cartCountElement  = document.querySelector('.cart-count');

    if (!cartCountElement) return;

    cartCountElement.textContent = getCartTotalItems();
}