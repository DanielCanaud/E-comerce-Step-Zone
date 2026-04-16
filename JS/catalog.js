console.log('catalog.js carregado');

function renderProducts() {
  console.log('renderProducts rodando');

  const productsGrid = document.getElementById('productsGrid');

  if (!productsGrid) {
    console.log('productsGrid não encontrado');
    return;
  }

  productsGrid.innerHTML = '<p>Nenhum produto cadastrado ainda.</p>';
}