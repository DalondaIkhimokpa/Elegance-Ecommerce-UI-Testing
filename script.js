// Global cart variable
let cart = [];

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage if available
    const savedCart = localStorage.getItem('eleganceCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            // Clean up any invalid items from the cart and verify image URLs
            cart = cart.filter(item => {
                // Ensure item has all required properties
                if (!item || !item.id || !item.image) return false;
                
                // Verify image URL is valid
                if (!item.image.startsWith('http')) {
                    // Try to find the correct image from the product data
                    const productElement = document.querySelector(`[data-id="${item.id}"]`);
                    if (productElement) {
                        item.image = productElement.getAttribute('data-image');
                    }
                }
                return true;
            });
            
            localStorage.setItem('eleganceCart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error parsing cart from localStorage:', error);
            // Reset cart if it's corrupted
            cart = [];
            localStorage.setItem('eleganceCart', JSON.stringify(cart));
        }
    }
    
    // Update cart counter on page load
    updateCartCounter();
    
    // Add event listeners to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image');
            
            addToCart(productId, productName, productPrice, productImage);
        });
    });
    
    // Setup Quick View buttons
    setupQuickViewButtons();
    
    // Setup Quick View Modal
    setupQuickViewModal();
    
    // Toggle mobile menu if it exists
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            if (menu) {
                menu.classList.toggle('hidden');
            }
        });
    }
    
    // Cart button functionality
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            showCart();
        });
    }

    // Add smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Newsletter form submission
    const newsletterInput = document.querySelector('.newsletter-input');
    const newsletterBtn = newsletterInput?.nextElementSibling;
    
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function() {
            const email = newsletterInput.value.trim();
            
            if (email && validateEmail(email)) {
                // In a real application, you would submit this to your backend
                showNotification('Thank you for subscribing!');
                newsletterInput.value = '';
            } else {
                alert('Please enter a valid email address');
            }
        });
    }

    // Add CSS for notification and cart counter
    const style = document.createElement('style');
    style.textContent = `
        .cart-count {
            width: 18px;
            height: 18px;
            font-size: 10px;
            position: absolute;
            top: -8px;
            right: -8px;
        }
        
        .notification {
            opacity: 1;
            transition: opacity 0.3s ease;
        }
        
        .modal {
            transition: opacity 0.3s ease;
        }
        
        .modal-content {
            transition: transform 0.3s ease;
        }
        
        .social-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s ease;
        }
        
        .footer-links li {
            margin-bottom: 0.5rem;
        }
        
        .fade-in {
            animation: fadeIn 1s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;

    document.head.appendChild(style);

    // Email validation helper
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});

// Add to Cart function
function addToCart(id, name, price, image, quantity = 1, size = null) {
    // Validate inputs
    if (!id || !name || isNaN(price)) {
        console.error('Invalid product data:', { id, name, price, image });
        return;
    }
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => 
        (size ? item.id === id && item.size === size : item.id === id)
    );
    
    if (existingProductIndex > -1) {
        // Product already in cart, increase quantity
        cart[existingProductIndex].quantity += quantity;
    } else {
        // Add new product to cart
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: quantity,
            size: size
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('eleganceCart', JSON.stringify(cart));
    
    // Update cart counter
    updateCartCounter();
    
    // Show confirmation message
    showNotification(`${name} added to cart!`);
}

// Update cart counter display
function updateCartCounter() {
    const cartCounterElement = document.getElementById('cart-counter');
    if (!cartCounterElement) {
        console.error('Cart counter element not found');
        return;
    }
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCounterElement.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCounterElement.classList.remove('hidden');
    } else {
        cartCounterElement.classList.add('hidden');
    }
}

// Show notification message
function showNotification(message) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded shadow-lg z-50';
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Quick View functionality
function setupQuickViewButtons() {
    // Product data - this would normally come from a database
    const productData = {
        '1': {
            name: 'Lightweight Denim Jacket',
            price: 49.99,
            image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'A lightweight denim jacket perfect for layering in all seasons. Features a classic design with button closure and multiple pockets.'
        },
        '2': {
            name: 'Classy Yellow Sweat Suit',
            price: 59.99,
            image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=840&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Comfortable and stylish 2-piece yellow sweat suit with halter top, perfect for casual outings or light workouts.'
        },
        '3': {
            name: 'Nike Purple and Yellow Shoes',
            price: 69.99,
            image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
            description: 'Stylish Nike low-top shoes in purple and yellow. Perfect for athletic activities or casual wear.'
        },
        '4': {
            name: 'Casual Summer Outfit',
            price: 45.99,
            image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=686&q=80',
            description: 'Comfortable summer outfit with stylish design, perfect for hot days and casual outings.'
        },
        '5': {
            name: 'Elegant White Flowy Dress',
            price: 49.99,
            image: 'https://images.unsplash.com/photo-1617551307538-c9cdb9d71289?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'A sophisticated white dress suitable for all occasions. Features a flowy design and elegant details.'
        },
        '6': {
            name: 'Premium Lipstick Set',
            price: 39.99,
            image: 'https://images.unsplash.com/photo-1616002411355-49593fd89721?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
            description: 'Set of premium long-lasting lipsticks in a variety of fashionable colors.'
        },
        '7': {
            name: 'Luxury Skincare Bundle',
            price: 29.99,
            image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Complete skincare routine for glowing skin, featuring high-quality natural ingredients.'
        },
        '8': {
            name: 'Signature Makeup Collection',
            price: 39.99,
            image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            description: 'Elegant makeup collection suitable for every occasion, with premium quality products.'
        },
        '9': {
            name: 'Chanel No. 5 Perfume',
            price: 99.99,
            image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1408&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'The iconic Chanel No. 5 fragrance known for its timeless elegance and sophisticated scent.'
        },
        '10': {
            name: 'Two Piece Outfit - Shorts and Sweater',
            price: 69.99,
            image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?q=80&w=1286&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Cute shorts and sweater combination, perfect for transitional weather and casual outings.'
        },
        '11': {
            name: 'Trendy Jewelry - 5pc Ring Set',
            price: 19.99,
            image: 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?q=80&w=1710&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Retro style 5-piece ring set to complement any outfit with vintage charm.'
        },
        '12': {
            name: 'Stylish HandBag',
            price: 44.99,
            image: 'https://images.unsplash.com/photo-1613482184847-44483b792eeb?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Versatile handbag suitable for all seasons with ample storage and fashionable design.'
        }
    };
    document.querySelectorAll('.quick-view-btn').forEach(button => {
    // Product data - add to existing productData object
    const productData = {
        '13': {
            name: 'Stylish Pink Pants',
            price: 44.99,
            image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Stylish Pink Pants suitable for all seasons.'
        },
        '14': {
            name: 'Flowy Gray Scarf',
            price: 19.99,
            image: 'https://images.unsplash.com/photo-1605212964492-1be1855003a3?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Lightweight scarf perfect for layering.'
        },
        '15': {
            name: 'High Heels',
            price: 59.99,
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Elegant high heels for special occasions.'
        },
        '16': {
            name: 'Chic Summer Hat',
            price: 29.99,
            image: 'https://images.unsplash.com/photo-1566851495291-00a1e8809137?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Stylish summer hat perfect for sunny days.'
        },
        '17': {
            name: 'Skinny Jeans',
            price: 24.99,
            image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Stylish skinny jeans for a modern look.'
        },
        '18': {
            name: 'White Boomer Jacket',
            price: 49.99,
            image: 'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'A stylish white boomer jacket for a chic look.'
        },
        '19': {
            name: 'White and Orange New Balance Shoes',
            price: 89.99,
            image: 'https://images.unsplash.com/photo-1465453869711-7e174808ace9?q=80&w=1752&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Stylish New Balance shoes in white and orange.'
        },
        '20': {
            name: 'Tan Low Cut Boots',
            price: 79.99,
            image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=1365&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Stylish low-cut boots perfect for casual wear.'
        },
        '21': {
            name: 'Long Red Velvet Dress',
            price: 99.99,
            image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1468&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Elegant long red velvet dress for special occasions.'
        },
        '22': {
            name: 'Baggy Blue Jeans',
            price: 39.99,
            image: 'https://images.unsplash.com/photo-1667586602976-732f9c4a3d76?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Stylish baggy blue jeans for a relaxed look.'
        }
    };
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product');
            openQuickViewModal(productId, productData);
        });
    });
}

function setupQuickViewModal() {
    // Get modal elements
    const modal = document.getElementById('quick-view-modal');
    if (!modal) {
        console.error('Quick view modal not found');
        return;
    }
    
    const closeModal = document.getElementById('close-modal');
    const modalImage = document.getElementById('modal-product-image');
    const modalName = document.getElementById('modal-product-name');
    const modalPrice = document.getElementById('modal-product-price');
    const modalDescription = document.getElementById('modal-product-description');
    const sizeSelect = document.getElementById('size');
    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const addToCartBtn = document.getElementById('modal-add-to-cart');
    
    // Close modal function
    function closeQuickViewModal() {
        modal.classList.add('opacity-0', 'invisible');
        document.body.style.overflow = ''; // Allow scrolling again
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Close modal when clicking close button
    if (closeModal) {
        closeModal.addEventListener('click', closeQuickViewModal);
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeQuickViewModal();
        }
    });

    
    // Quantity controls
    if (decreaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function() {
            let qty = parseInt(quantityInput.value);
            if (qty > 1) {
                quantityInput.value = qty - 1;
            }
        });
    }
    
    if (increaseBtn && quantityInput) {
        increaseBtn.addEventListener('click', function() {
            let qty = parseInt(quantityInput.value);
            quantityInput.value = qty + 1;
        });
    }
    
    // Add to cart from modal
    if (addToCartBtn && modalName && modalPrice && modalImage && quantityInput && sizeSelect) {
        addToCartBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = modalName.textContent;
            const price = parseFloat(modalPrice.textContent.replace('$', ''));
            const image = modalImage.src;
            const quantity = parseInt(quantityInput.value);
            const size = sizeSelect.value;
            
            if (!size) {
                alert('Please select a size');
                return;
            }
            
            addToCart(id, name, price, image, quantity, size);
            closeQuickViewModal();
        });
    }
}

// Open Quick View Modal with product info
function openQuickViewModal(productId, productData) {
    const product = productData[productId];
    if (!product) {
        console.error('Product data not found for ID:', productId);
        return;
    }
    
    // Set modal content
    const modal = document.getElementById('quick-view-modal');
    if (!modal) {
        console.error('Quick view modal element not found');
        return;
    }
    
    const modalImage = document.getElementById('modal-product-image');
    const modalName = document.getElementById('modal-product-name');
    const modalPrice = document.getElementById('modal-product-price');
    const modalDescription = document.getElementById('modal-product-description');
    const addToCartBtn = document.getElementById('modal-add-to-cart');
    
    if (modalImage) {
        modalImage.src = product.image;
        modalImage.alt = product.name;
    }
    
    if (modalName) modalName.textContent = product.name;
    if (modalPrice) modalPrice.textContent = `$${product.price.toFixed(2)}`;
    if (modalDescription) modalDescription.textContent = product.description;
    if (addToCartBtn) addToCartBtn.setAttribute('data-id', productId);
    
    // Reset quantity and size
    const quantityInput = document.getElementById('quantity');
    const sizeSelect = document.getElementById('size');
    
    if (quantityInput) quantityInput.value = 1;
    if (sizeSelect) sizeSelect.value = '';
    
    // Show modal with animation
    modal.style.display = 'flex';
    modal.classList.remove('invisible', 'opacity-0');
    document.querySelector('.modal-content')?.classList.remove('translate-y-10');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Helper function to clean up problematic cart items
function cleanupCart() {
    // Remove any items with null/undefined IDs
    cart = cart.filter(item => item && item.id);
    localStorage.setItem('eleganceCart', JSON.stringify(cart));
    updateCartCounter();
}

function removeFromCart(id, size = null) {
    if (!id) {
        console.error('Cannot remove item: No ID provided');
        return;
    }
    
    // Count items before removal
    const beforeCount = cart.length;
    
    try {
        if (size) {
            cart = cart.filter(item => !(item.id === id && item.size === size));
        } else {
            cart = cart.filter(item => item.id !== id);
        }
        
        // If nothing was removed and there should have been, try with stringified IDs
        if (beforeCount === cart.length) {
            if (size) {
                cart = cart.filter(item => !(String(item.id) === String(id) && item.size === size));
            } else {
                cart = cart.filter(item => String(item.id) !== String(id));
            }
        }
        
        localStorage.setItem('eleganceCart', JSON.stringify(cart));
        updateCartCounter();
    } catch (error) {
        console.error('Error removing item:', error);
        // If there was an error, try to clean up the cart
        cleanupCart();
    }
}

function decreaseQuantity(id, size = null) {
    const item = size 
        ? cart.find(item => item.id === id && item.size === size)
        : cart.find(item => item.id === id);
        
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
            localStorage.setItem('eleganceCart', JSON.stringify(cart));
        } else {
            removeFromCart(id, size);
            return;
        }
        updateCartCounter();
    }
}

function increaseQuantity(id, size = null) {
    const item = size 
        ? cart.find(item => item.id === id && item.size === size)
        : cart.find(item => item.id === id);
        
    if (item) {
        item.quantity += 1;
        localStorage.setItem('eleganceCart', JSON.stringify(cart));
        updateCartCounter();
    }
}

// Show cart contents
function showCart() {
    // Create cart modal if it doesn't exist
    let cartModal = document.getElementById('cart-modal');
    
    if (!cartModal) {
        cartModal = document.createElement('div');
        cartModal.id = 'cart-modal';
        cartModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        document.body.appendChild(cartModal);
    }
    
    // Calculate cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate cart content with better CSS for consistent image sizing
    cartModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Your Cart</h2>
                <button id="close-cart" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="divide-y">
    ${cart.length > 0 ? cart.map(item => `
        <div class="py-4 flex items-center">
            <div class="w-16 h-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                <img src="${item.image || ''}" alt="${item.name}" class="w-full h-full object-cover rounded">
            </div>
            <div class="ml-4 flex-grow">
                <h3 class="font-medium">${item.name}</h3>
                ${item.size ? `<p class="text-sm text-gray-500">Size: ${item.size}</p>` : ''}
                <div class="flex justify-between items-center mt-1">
                    <div class="flex items-center">
                        <button class="decrease-item px-2 bg-gray-100 rounded-l" data-id="${item.id}" ${item.size ? `data-size="${item.size}"` : ''}>-</button>
                        <span class="px-3 border-t border-b">${item.quantity}</span>
                        <button class="increase-item px-2 bg-gray-100 rounded-r" data-id="${item.id}" ${item.size ? `data-size="${item.size}"` : ''}>+</button>
                    </div>
                    <p class="font-bold">$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
            <button class="remove-item ml-4 text-gray-400 hover:text-red-500" data-id="${item.id}" ${item.size ? `data-size="${item.size}"` : ''}>
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('') : '<p class="py-4 text-center text-gray-500">Your cart is empty</p>'}
</div>
            
            ${cart.length > 0 ? `
                <div class="mt-6 pt-4 border-t">
                    <div class="flex justify-between font-bold text-lg mb-4">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button id="clear-cart" class="flex-grow bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded">
                            Clear Cart
                        </button>
                        <button id="checkout-btn" class="flex-grow-2 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Show cart modal
    cartModal.style.display = 'flex';
    
    // Add event listeners for cart actions
    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });
    }
    
    // Add clear cart button functionality
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            // Confirm before clearing
            if (confirm('Are you sure you want to clear your cart?')) {
                cart = [];
                localStorage.setItem('eleganceCart', JSON.stringify(cart));
                updateCartCounter();
                showCart(); // Refresh cart display
            }
        });
    }
    
    // Checkout button functionality
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            alert('Checkout functionality would go here!');
        });
    }
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            try {
                const itemId = this.getAttribute('data-id');
                const itemSize = this.getAttribute('data-size');
                
                if (!itemId) {
                    console.error('Missing item ID for remove action');
                    return;
                }
                
                removeFromCart(itemId, itemSize);
                showCart(); // Refresh cart display
            } catch (error) {
                console.error('Error removing item:', error);
                // Fallback: try to clear problematic items
                cleanupCart();
                showCart();
            }
        });
    });
    
    document.querySelectorAll('.decrease-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const itemSize = this.getAttribute('data-size');
            
            if (!itemId) {
                console.error('Missing item ID for decrease action');
                return;
            }
            
            decreaseQuantity(itemId, itemSize);
            showCart(); // Refresh cart display
        });
    });
    
    document.querySelectorAll('.increase-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const itemSize = this.getAttribute('data-size');
            
            if (!itemId) {
                console.error('Missing item ID for increase action');
                return;
            }
            
            increaseQuantity(itemId, itemSize);
            showCart(); // Refresh cart display
        });
    });
    
    // Close cart when clicking outside
    cartModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
}

// JavaScript for View All Products button
document.getElementById('view-all-btn').addEventListener('click', function() {
    const allProductsSection = document.getElementById('all-products');
    if (allProductsSection.classList.contains('hidden')) {
        allProductsSection.classList.remove('hidden');
        this.textContent = 'Hide Products';
    } else {
        allProductsSection.classList.add('hidden');
        this.textContent = 'View All Products';
    }
});
/// Load products from JSON and inject into HTML
fetch('products.json')
.then(response => response.json())
.then(products => {
  // --- ADD DUPLICATE FILTER HERE ---
  products = products.filter(
    (p, index, self) => index === self.findIndex(t => t.id === p.id)
  );

  const container = document.getElementById('products-container');
  container.innerHTML = ''; // Clear existing content

  products.forEach(product => {
    const html = `
      <div class="product-card">
        <div class="product-image-container">
          <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
        </div>
        <h3 class="font-bold text-lg mt-2">${product.name}</h3>
        <p class="text-gray-700 mb-2">$${product.price}</p>
        <button class="add-to-cart bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded w-full" 
            data-id="${product.id}"
            data-name="${product.name}" 
            data-price="${product.price}" 
            data-image="${product.image}">
            Add to Cart
        </button>
        <button class="quick-view-btn text-pink-600 hover:text-pink-700 mt-2 text-sm w-full" 
            data-product="${product.id}"
            data-image="${product.image}"
            data-name="${product.name}"
            data-price="${product.price}">
            Quick View
        </button>
      </div>
    `;
    container.innerHTML += html;
  });

  // After loading, re-attach event listeners
  attachCartListeners();
  attachQuickViewListeners();
});
// Functions to attach cart and quick view logic
function attachCartListeners() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      alert(`Added: ${button.dataset.name}`);
      // Add to your cart logic here...
    });
  });
}


function attachQuickViewListeners() {
  document.querySelectorAll('.quick-view-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productId = this.getAttribute('data-product');

      let product = null;

      if (window.productData && window.productData[productId]) {
        product = window.productData[productId];
      } else {
        const card = this.closest('.product-card');
        if (card) {
          const name = card.querySelector('h3')?.textContent || '';
          const price = parseFloat(card.querySelector('p')?.textContent.replace('$', '')) || 0;
          const image = card.querySelector('img')?.src || '';
          const description = 'Product description not available.';
          product = { name, price, image, description };
        }
      }

      if (product) {
        openQuickViewModal(productId, { [productId]: product });
      } else {
        alert('Product data not found.');
      }
    });
  });
}

// Attach listeners after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  attachCartListeners();
  attachQuickViewListeners();
});
// Add any additional JavaScript functionality here
// For example, you can add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Adjust for header height
                behavior: 'smooth'
            });
        }
    });
}
);
// Add any additional JavaScript functionality here
// For example, you can add smooth scrolling for navigation links   
