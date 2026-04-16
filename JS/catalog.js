function formatPrice(price) {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function getCategoryLabel(category) {
  const labels = {
    tenis: 'Tênis',
    oculos: 'Óculos',
    relogios: 'Relógios'
  };

  return labels[category] || category;
}

function createProductCard(product) {
  return `
    <article class="product-card">
      <img 
        src="${product.image}" 
        alt="${product.name}" 
        class="product-card__image"
      />

      <div class="product-card__content">
        <span class="product-card__category">${getCategoryLabel(product.category)}</span>
        <h3 class="product-card__title">${product.name}</h3>
        <p class="product-card__description">${product.description}</p>

        <div class="product-card__footer">
          <strong class="product-card__price">${formatPrice(product.price)}</strong>
          <button 
            type="button" 
            class="btn btn--primary product-card__button"
            data-product-id="${product.id}"
          >
            Adicionar
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts(productList = products) {
  const productsGrid = document.getElementById('productsGrid');

  if (!productsGrid) return;

  if (!productList.length) {
    productsGrid.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }

  productsGrid.innerHTML = productList
    .map(createProductCard)
    .join('');
}