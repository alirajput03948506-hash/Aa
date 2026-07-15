// RAJPUT Store - E-commerce Script
// EmailJS Setup - Replace with your credentials
// emailjs.init("YOUR_PUBLIC_KEY_HERE");  // <-- Put your EmailJS Public Key here

let products = [];
let cart = [];
let currentUser = null;
let isLoginMode = true;

// Load products from LocalStorage
function loadProducts() {
    const savedProducts = localStorage.getItem('rajputProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Default products
        products = [
            {
                id: 1,
                name: "Wireless Headphones",
                price: 79.99,
                image: "https://picsum.photos/id/60/300/200",
                category: "electronics",
                description: "Premium noise-cancelling wireless headphones"
            },
            {
                id: 2,
                name: "Leather Jacket",
                price: 129.99,
                image: "https://picsum.photos/id/201/300/200",
                category: "fashion",
                description: "Classic genuine leather jacket"
            },
            {
                id: 3,
                name: "Smart Watch",
                price: 199.99,
                image: "https://picsum.photos/id/180/300/200",
                category: "electronics",
                description: "Fitness tracking smartwatch"
            }
        ];
        saveProducts();
    }
    renderProducts();
}

// Save products to LocalStorage
function saveProducts() {
    localStorage.setItem('rajputProducts', JSON.stringify(products));
}

// Render products
function renderProducts(filteredProducts = products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${product.price}</p>
                <p>${product.description}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Search products
function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) {
        renderProducts();
        return;
    }
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
    );
    renderProducts(filtered);
}

// Filter by category
function filterCategory(category) {
    if (category === 'all') {
        renderProducts();
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// Add product (Admin)
function addProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('prod-name').value,
        price: parseFloat(document.getElementById('prod-price').value),
        image: document.getElementById('prod-image').value,
        category: document.getElementById('prod-category').value,
        description: document.getElementById('prod-desc').value
    };
    
    products.push(newProduct);
    saveProducts();
    renderProducts();
    hideAdminModal();
    
    alert('Product added successfully!');
}

// Clear all products
function clearProducts() {
    if (confirm('Clear ALL products?')) {
        products = [];
        saveProducts();
        renderProducts();
    }
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartCount();
    alert(`${product.name} added to cart!`);
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Show cart
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    renderCart();
    modal.style.display = 'block';
}

function hideCartModal() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Render cart items
function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                $${item.price} × ${item.quantity}
            </div>
            <div class="quantity-controls">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
                <button onclick="removeFromCart(${index})" style="margin-left:15px;color:red;">Remove</button>
            </div>
            <div>$${itemTotal.toFixed(2)}</div>
        `;
        container.appendChild(div);
    });
    
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Change quantity
function changeQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    renderCart();
    updateCartCount();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateCartCount();
}

// Checkout
function showCheckoutModal() {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }
    hideCartModal();
    document.getElementById('checkout-modal').style.display = 'block';
}

function hideCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function handleCheckout(e) {
    e.preventDefault();
    
    const orderDetails = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };
    
    // Send email via EmailJS
    sendOrderEmail(orderDetails);
    
    alert('Order placed successfully! Confirmation sent to your email.');
    
    // Clear cart
    cart = [];
    updateCartCount();
    hideCheckoutModal();
}

// Send order via EmailJS
function sendOrderEmail(order) {
    // Replace with your EmailJS Template ID and Service ID
    // Example:
    /*
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        to_email: "alirajput03948506@gmail.com",
        customer_name: order.name,
        customer_email: order.email,
        phone: order.phone,
        address: order.address,
        total: order.total,
        items: order.items.map(item => `${item.name} x${item.quantity} - $${(item.price*item.quantity).toFixed(2)}`).join("\n")
    }).then(() => {
        console.log("Order email sent");
    });
    */
    console.log("Order email would be sent here to alirajput03948506@gmail.com", order);
}

// Auth System
function showLoginModal() {
    document.getElementById('login-modal').style.display = 'block';
    resetAuthForm();
}

function hideLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('modal-title');
    const btn = document.getElementById('auth-btn');
    const toggleText = document.getElementById('toggle-text');
    
    if (isLoginMode) {
        title.textContent = 'Login';
        btn.textContent = 'Login';
        toggleText.textContent = "Don't have an account? Register";
    } else {
        title.textContent = 'Register';
        btn.textContent = 'Register';
        toggleText.textContent = "Already have an account? Login";
    }
}

function resetAuthForm() {
    document.getElementById('auth-form').reset();
    isLoginMode = true;
    document.getElementById('modal-title').textContent = 'Login';
    document.getElementById('auth-btn').textContent = 'Login';
    document.getElementById('toggle-text').textContent = "Don't have an account? Register";
}

function handleAuth(e) {
    e.preventDefault();
    
    const name = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    
    if (!isLoginMode) {
        // Register - send to EmailJS
        sendRegistrationEmail(name, email, phone, password);
        alert('Registration successful! Welcome to RAJPUT Store.');
    } else {
        alert('Login successful! Welcome back.');
    }
    
    currentUser = { name, email };
    hideLoginModal();
}

// Send registration email via EmailJS
function sendRegistrationEmail(name, email, phone, password) {
    // Replace placeholders with your EmailJS details
    /*
    emailjs.send("YOUR_SERVICE_ID", "YOUR_REGISTER_TEMPLATE_ID", {
        to_email: "alirajput03948506@gmail.com",
        full_name: name,
        user_email: email,
        phone: phone,
        // Note: Do NOT send raw password in production. Hash it.
    }).then(() => console.log("Registration email sent"));
    */
    console.log("Registration email would be sent to alirajput03948506@gmail.com", {name, email, phone});
}

// Admin modal
function showAdminModal() {
    document.getElementById('admin-modal').style.display = 'block';
}

function hideAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Keyboard escape support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        }
    });
});