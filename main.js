// ENHANCED SYNC FUNCTION (add after your existing syncProducts())
async function syncCategories() {
  const response = await fetch('products/products.json');
  const products = await response.json();

  // 1. Get all unique categories from JSON
  const categories = [...new Set(products.map(p => p.category))];
  
  // 2. Update category navigation (if element exists)
  const categoryNav = document.getElementById('category-nav');
  if (categoryNav) {
    categoryNav.innerHTML = categories.map(category => `
      <a href="#${category.toLowerCase()}" 
         class="text-gray-700 hover:text-pink-600 transition">
        ${category}
      </a>
    `).join('');
  }

  // 3. Auto-group products by category (optional)
  const productsContainer = document.getElementById('products-container');
  if (productsContainer) {
    productsContainer.innerHTML = categories.map(category => `
      <section id="${category.toLowerCase()}" class="mb-16">
        <h2 class="text-2xl font-bold mb-6">${category}</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          ${products.filter(p => p.category === category).map(product => `
            <div class="product-card">
              <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover">
              <h3 class="font-medium mt-2">${product.name}</h3>
              <p class="text-pink-600">$${product.price.toFixed(2)}</p>
              <!-- Your existing buttons will auto-sync via syncProducts() -->
              <button class="quick-view-btn" 
                      data-id="${product.id}"
                      data-image="${product.image}"
                      data-name="${product.name}"
                      data-price="${product.price}">
                Quick View
              </button>
              <button class="add-to-cart mt-2"
                      data-id="${product.id}"
                      data-name="${product.name}"
                      data-price="${product.price}"
                      data-image="${product.image}">
                Add to Cart
              </button>
            </div>
          `).join('')}
        </div>
      </section>
    `).join('');
  }
}

// Initialize both functions
document.addEventListener('DOMContentLoaded', () => {
  syncProducts(); // Your existing sync
  syncCategories(); // New category handler
});
  
async function loadCategoryPreviews() {
  const response = await fetch('products/products.json');
  const products = await response.json();
  
  const container = document.getElementById('category-previews-container');
  if (!container) return;

  // Get first 3 products from each category
  const categories = [...new Set(products.map(p => p.category))];
  container.innerHTML = categories.map(category => {
    const categoryProducts = products
      .filter(p => p.category === category)
      .slice(0, 3); // Only show 3 products per category
    
    return `
      <div class="category-preview mb-16" id="preview-${category.toLowerCase()}">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">${category}</h3>
          <a href="products.html#${category.toLowerCase()}" 
             class="text-pink-600 hover:text-pink-700 text-sm">
            View All ${category} →
          </a>
        </div>
        <div class="grid grid-cols-3 gap-6">
          ${categoryProducts.map(product => `
            <div class="product-preview">
              <img src="${product.image}" alt="${product.name}" 
                   class="w-full h-64 object-cover rounded-lg">
              <h4 class="font-medium mt-2">${product.name}</h4>
              <p class="text-pink-600">$${product.price.toFixed(2)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', loadCategoryPreviews);
  