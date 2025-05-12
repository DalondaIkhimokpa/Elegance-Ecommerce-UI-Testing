document.addEventListener('DOMContentLoaded', () => {
  const currentCart = JSON.parse(localStorage.getItem('eleganceCart')) || [];
  const cartContainer = document.getElementById('cart-container');

  if (currentCart.length === 0) {
    cartContainer.innerHTML = '<p class="text-gray-500">Your cart is empty.</p>';
    return;
  }

  currentCart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'flex items-center border-b pb-4 mb-4';
    cartItem.innerHTML = `
      <img src="${item.image}" 
           alt="${item.name}"
           class="w-24 h-24 object-cover rounded-lg mr-4"
           onerror="this.src='https://via.placeholder.com/100'">
      <div class="flex-grow">
        <h3 class="font-bold">${item.name}</h3>
        <p class="text-gray-600">$${item.price.toFixed(2)}</p>
        <p class="text-sm text-gray-500">Qty: ${item.quantity}</p>
      </div>
    `;
    cartContainer.appendChild(cartItem);
  });
});