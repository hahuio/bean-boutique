document.addEventListener('DOMContentLoaded', function() {
    initSlideshow();
    initModal();
    initMobileMenu();
    initSearch();
    initCart();
    initEventForm();
    updateCartBadge();
});

function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    showSlide(0);
    setInterval(nextSlide, 5000);
}

function initModal() {
    const modal = document.getElementById('emailModal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('emailForm');
    
    const hasVisited = sessionStorage.getItem('hasVisited');
    
    if (!hasVisited) {
        setTimeout(() => {
            modal.style.display = 'block';
            sessionStorage.setItem('hasVisited', 'true');
        }, 2000);
    }
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
    
    form.onsubmit = function(e) {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        alert('Thank you for subscribing! Check your email for your 10% discount code.');
        modal.style.display = 'none';
    }
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const productCards = document.querySelectorAll('.product-card');
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        productCards.forEach(card => {
            const productName = card.getAttribute('data-name').toLowerCase();
            const productInfo = card.textContent.toLowerCase();
            
            if (productName.includes(searchTerm) || productInfo.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function initCart() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            
            addToCart(productName, productPrice);
            
            this.textContent = 'Added to Cart!';
            this.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.style.backgroundColor = '';
            }, 2000);
        });
    });
    
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
}

function addToCart(name, price) {
    let cart = getCart();
    
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateCartBadge();
}

function getCart() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const cart = getCart();
    const badges = document.querySelectorAll('.cart-badge');
    if (badges.length === 0) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
        } else {
            badge.textContent = '';
        }
    });
}

function displayCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }
    
    cartItemsContainer.style.display = 'block';
    emptyCart.style.display = 'none';
    cartSummary.style.display = 'block';
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="./img/cartItem.jpg" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${item.price} MMK</p>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <button class="remove-item" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateCartSummary();
}

function updateQuantity(index, change) {
    const cart = getCart();
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCart(cart);
    displayCart();
    updateCartBadge();
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
    updateCartBadge();
}

function updateCartSummary() {
    const cart = getCart();
    
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = `${subtotal} MMK`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `${shipping} MMK`;
    document.getElementById('tax').textContent = `${tax} MMK`;
    document.getElementById('total').textContent = `${total} MMK`;
}

window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

function initEventForm() {
    const form = document.getElementById('registrationForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const event = document.getElementById('event').value;
        const guests = document.getElementById('guests').value;
        
        const formMessage = document.getElementById('formMessage');
        
        const subject = encodeURIComponent('Event Registration - Bean Boutique');
        const body = encodeURIComponent(
            `Name: ${firstName} ${lastName}\n` +
            `Email: ${email}\n` +
            `Event: ${event}\n` +
            `Number of Guests: ${guests}`
        );
        
        window.location.href = `mailto:hello@beanboutique.com?subject=${subject}&body=${body}`;
        
        formMessage.textContent = 'Thank you for registering! Your email client will open to complete the registration.';
        formMessage.className = 'form-message success';
        
        form.reset();
        
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    });
}
