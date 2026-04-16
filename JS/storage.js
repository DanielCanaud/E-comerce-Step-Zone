function saveCartToStorage(cart){
    localStorage.setItem('stepzone-cart', JSON.stringify(cart));
}
function getcartFromStorage() {
    const savecart = localStorage.getItem('stepzone-cart');
    return savecart ? JSON.parse(savecart): [];
}   