'use strict';

const PRODUCTS = window.PRODUCTS || [];

const STORAGE_KEYS = {
  cart: 'cloudexify-project-2-cart',
  theme: 'cloudexify-project-2-theme',
  discount: 'cloudexify-project-2-discount',
  dropTarget: 'cloudexify-project-2-drop-target'
};

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const productGrid = qs('#productGrid');
const emptyState = qs('#emptyState');
const searchInput = qs('#searchInput');
const categoryFilter = qs('#categoryFilter');
const ratingFilter = qs('#ratingFilter');
const priceFilter = qs('#priceFilter');
const priceValue = qs('#priceValue');
const sortFilter = qs('#sortFilter');
const resetFiltersButton = qs('#resetFilters');
const emptyResetButton = qs('#emptyReset');
const resultCount = qs('#resultCount');
const countdownEl = qs('#countdown');
const cartItemsEl = qs('#cartItems');
const cartCountEl = qs('#cartCount');
const cartSubtotalEl = qs('#cartSubtotal');
const discountAmountEl = qs('#discountAmount');
const cartTotalEl = qs('#cartTotal');
const clearCartButton = qs('#clearCart');
const checkoutButton = qs('#checkoutButton');
const discountCodeInput = qs('#discountCode');
const applyDiscountButton = qs('#applyDiscount');
const checkoutForm = qs('#checkoutForm');
const orderSuccess = qs('#orderSuccess');
const themeToggle = qs('#themeToggle');
const yearEl = qs('#year');
const totalProductsEl = qs('#totalProducts');
const totalStockEl = qs('#totalStock');
const toastEl = qs('#appToast');
const toastMessage = qs('#toastMessage');

const modalEl = qs('#productModal');
const modalTitle = qs('#modalTitle');
const modalImage = qs('#modalImage');
const modalCategory = qs('#modalCategory');
const modalDesc = qs('#modalDesc');
const modalTags = qs('#modalTags');
const modalPrice = qs('#modalPrice');
const modalStock = qs('#modalStock');
const modalAddToCart = qs('#modalAddToCart');

let currentFilteredProducts = [...PRODUCTS];
let activeModalProductId = null;
let toastInstance = null;

function formatPrice(value) {
  return `Rs ${Number(value).toLocaleString('en-PK')}`;
}

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCart() {
  return readJSON(STORAGE_KEYS.cart, []);
}

function saveCart(cart) {
  const cleanedCart = cart
    .filter((item) => item.qty > 0 && PRODUCTS.some((product) => product.id === item.id))
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      return {
        id: item.id,
        qty: Math.min(item.qty, product.stock)
      };
    });

  writeJSON(STORAGE_KEYS.cart, cleanedCart);
}

function getCartQuantity(productId) {
  const item = getCart().find((cartItem) => cartItem.id === productId);
  return item ? item.qty : 0;
}

function getAvailableStock(product) {
  return Math.max(product.stock - getCartQuantity(product.id), 0);
}

function getCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);

  const discountCode = localStorage.getItem(STORAGE_KEYS.discount) || '';
  const discountRate = discountCode === 'DROP10' ? 0.1 : 0;
  const discount = Math.round(subtotal * discountRate);
  const total = Math.max(subtotal - discount, 0);

  return { subtotal, discount, total, discountCode };
}

function showToast(message) {
  if (!toastEl || !toastMessage || !window.bootstrap) return;

  toastMessage.textContent = message;
  toastInstance = toastInstance || new bootstrap.Toast(toastEl, { delay: 2200 });
  toastInstance.show();
}

function getStockClass(stock) {
  if (stock === 0) return 'text-danger';
  if (stock <= 3) return 'text-warning';
  return 'text-success';
}

function getStockLabel(product) {
  const available = getAvailableStock(product);
  if (available === 0) return 'Sold Out';
  if (available <= 3) return `Only ${available} left`;
  return `${available} pairs available`;
}

function getRibbon(product, available, soldOut) {
  if (soldOut) return '<span class="product-ribbon ribbon-soldout">Sold Out</span>';
  if (available <= 3) return '<span class="product-ribbon ribbon-low">Low Stock</span>';
  if (product.rating >= 4.8) return '<span class="product-ribbon ribbon-best">Bestseller</span>';
  return '';
}

function buildProductCard(product) {
  const available = getAvailableStock(product);
  const soldOut = available === 0;

  return `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4">
      <article class="card product-card h-100" data-product-id="${product.id}">
        ${getRibbon(product, available, soldOut)}
        <button class="image-button" type="button" data-action="view" data-id="${product.id}" aria-label="View ${product.name} details">
          <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy" />
        </button>
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <span class="badge rounded-pill category-badge">${product.category}</span>
            <span class="rating">★ ${product.rating}</span>
          </div>
          <h3 class="card-title h6 mb-2">${product.name}</h3>
          <p class="card-text small text-muted-custom flex-grow-1">${product.description}</p>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <strong class="price">${formatPrice(product.price)}</strong>
            <span class="stock small fw-bold ${getStockClass(available)}">${getStockLabel(product)}</span>
          </div>
          <div class="d-grid gap-2">
            <button class="btn btn-gradient btn-sm" type="button" data-action="add" data-id="${product.id}" ${soldOut ? 'disabled' : ''}>
              ${soldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button class="btn btn-outline-light btn-sm" type="button" data-action="view" data-id="${product.id}">View Details</button>
          </div>
        </div>
      </article>
    </div>
  `;
}

let cardObserver = null;

function revealProductCards() {
  if (!('IntersectionObserver' in window)) {
    qsa('.product-card').forEach((card) => card.classList.add('is-visible'));
    return;
  }

  cardObserver?.disconnect();
  cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  qsa('.product-card').forEach((card) => cardObserver.observe(card));
}

function renderProducts(list) {
  if (!productGrid || !emptyState) return;

  productGrid.innerHTML = list.map(buildProductCard).join('');
  emptyState.classList.toggle('d-none', list.length !== 0);

  if (resultCount) {
    resultCount.textContent = `Showing ${list.length} of ${PRODUCTS.length} products`;
  }

  updateDropStats();
  revealProductCards();
}

function populateCategoryFilter() {
  if (!categoryFilter) return;

  const categories = [...new Set(PRODUCTS.map((product) => product.category))].sort();
  categoryFilter.innerHTML = `
    <option value="all">All</option>
    ${categories.map((category) => `<option value="${category}">${category}</option>`).join('')}
  `;
}

function getSearchableText(product) {
  return `${product.name} ${product.category} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
}

function applyFilters() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const category = categoryFilter ? categoryFilter.value : 'all';
  const minRating = ratingFilter ? Number(ratingFilter.value) : 0;
  const maxPrice = priceFilter ? Number(priceFilter.value) : Infinity;
  const sortValue = sortFilter ? sortFilter.value : 'featured';

  if (priceValue && Number.isFinite(maxPrice)) {
    priceValue.textContent = formatPrice(maxPrice);
  }

  let filtered = PRODUCTS.filter((product) => {
    const matchesSearch = getSearchableText(product).includes(query);
    const matchesCategory = category === 'all' || product.category === category;
    const matchesRating = product.rating >= minRating;
    const matchesPrice = product.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesRating && matchesPrice;
  });

  if (sortValue === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortValue === 'rating-high') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortValue === 'stock-low') {
    filtered.sort((a, b) => getAvailableStock(a) - getAvailableStock(b));
  }

  currentFilteredProducts = filtered;
  renderProducts(currentFilteredProducts);
}

function resetFilters() {
  if (searchInput) searchInput.value = '';
  if (categoryFilter) categoryFilter.value = 'all';
  if (ratingFilter) ratingFilter.value = '0';
  if (sortFilter) sortFilter.value = 'featured';
  if (priceFilter) priceFilter.value = priceFilter.max;
  applyFilters();
}

function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const available = getAvailableStock(product);
  if (available <= 0) {
    showToast(`${product.name} is sold out.`);
    return;
  }

  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart(cart);
  renderCart();
  applyFilters();
  refreshModalStock();
  showToast(`${product.name} added to cart.`);
}

function updateCartItem(productId, nextQty) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);
  if (!existingItem) return;

  existingItem.qty = Math.max(0, Math.min(nextQty, product.stock));
  saveCart(cart);
  renderCart();
  applyFilters();
  refreshModalStock();
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
  applyFilters();
  refreshModalStock();
  showToast('Item removed from cart.');
}

function clearCart() {
  localStorage.removeItem(STORAGE_KEYS.cart);
  localStorage.removeItem(STORAGE_KEYS.discount);
  if (discountCodeInput) discountCodeInput.value = '';
  renderCart();
  applyFilters();
  refreshModalStock();
  showToast('Cart cleared.');
}

function renderCart() {
  if (!cartItemsEl) return;

  const cart = getCart();
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const { subtotal, discount, total, discountCode } = getCartTotals();

  if (cartCountEl) cartCountEl.textContent = itemCount;
  if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);
  if (discountAmountEl) discountAmountEl.textContent = `- ${formatPrice(discount)}`;
  if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);
  if (discountCodeInput) discountCodeInput.value = discountCode;
  if (checkoutButton) checkoutButton.disabled = cart.length === 0;
  if (clearCartButton) clearCartButton.disabled = cart.length === 0;

  if (!cart.length) {
    cartItemsEl.innerHTML = `
      <div class="empty-cart text-center py-5">
        <div class="empty-cart-icon">🛒</div>
        <h6>Your cart is empty</h6>
        <p class="text-muted-custom small mb-0">Add limited sneakers before they sell out.</p>
      </div>
    `;
    return;
  }

  cartItemsEl.innerHTML = cart
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) return '';

      const remaining = getAvailableStock(product);
      const canIncrease = item.qty < product.stock;

      return `
        <div class="cart-item" data-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" />
          <div class="cart-item-body">
            <div class="d-flex justify-content-between gap-2">
              <strong>${product.name}</strong>
              <button class="btn btn-sm btn-link text-danger p-0" type="button" data-cart-action="remove" data-id="${product.id}">Remove</button>
            </div>
            <p class="small text-muted-custom mb-2">${formatPrice(product.price)} · ${remaining} left after cart</p>
            <div class="d-flex justify-content-between align-items-center gap-2">
              <div class="quantity-control">
                <button type="button" data-cart-action="decrease" data-id="${product.id}" aria-label="Decrease ${product.name} quantity">−</button>
                <span>${item.qty}</span>
                <button type="button" data-cart-action="increase" data-id="${product.id}" aria-label="Increase ${product.name} quantity" ${canIncrease ? '' : 'disabled'}>+</button>
              </div>
              <strong>${formatPrice(product.price * item.qty)}</strong>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  updateDropStats();
}

function openProductModal(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product || !modalEl) return;

  activeModalProductId = productId;

  const available = getAvailableStock(product);
  const soldOut = available === 0;

  if (modalTitle) modalTitle.textContent = product.name;
  if (modalImage) {
    modalImage.src = product.image;
    modalImage.alt = product.name;
  }
  if (modalCategory) modalCategory.textContent = product.category;
  if (modalDesc) modalDesc.textContent = product.description;
  if (modalPrice) modalPrice.textContent = formatPrice(product.price);
  if (modalStock) {
    modalStock.textContent = getStockLabel(product);
    modalStock.className = `mb-3 fw-bold ${getStockClass(available)}`;
  }
  if (modalTags) {
    modalTags.innerHTML = product.tags.map((tag) => `<span class="tag-pill">${tag}</span>`).join('');
  }
  if (modalAddToCart) {
    modalAddToCart.dataset.id = String(product.id);
    modalAddToCart.disabled = soldOut;
    modalAddToCart.textContent = soldOut ? 'Sold Out' : 'Add to Cart';
  }

  new bootstrap.Modal(modalEl).show();
}

function refreshModalStock() {
  if (!activeModalProductId || !modalStock || !modalAddToCart) return;

  const product = PRODUCTS.find((p) => p.id === activeModalProductId);
  if (!product) return;

  const available = getAvailableStock(product);
  modalStock.textContent = getStockLabel(product);
  modalStock.className = `mb-3 fw-bold ${getStockClass(available)}`;
  modalAddToCart.disabled = available === 0;
  modalAddToCart.textContent = available === 0 ? 'Sold Out' : 'Add to Cart';
}

function updateDropStats() {
  if (totalProductsEl) totalProductsEl.textContent = PRODUCTS.length;
  if (totalStockEl) {
    const availableTotal = PRODUCTS.reduce((sum, product) => sum + getAvailableStock(product), 0);
    totalStockEl.textContent = availableTotal;
  }
}

function getOrCreateDropTarget() {
  const savedTarget = localStorage.getItem(STORAGE_KEYS.dropTarget);
  const now = new Date();

  if (savedTarget && new Date(savedTarget) > now) {
    return savedTarget;
  }

  const target = new Date(now);
  target.setDate(target.getDate() + 1);
  target.setHours(18, 0, 0, 0);

  localStorage.setItem(STORAGE_KEYS.dropTarget, target.toISOString());
  return target.toISOString();
}

function startCountdown() {
  if (!countdownEl) return;

  const targetDate = getOrCreateDropTarget();

  function updateCountdown() {
    const diff = new Date(targetDate) - new Date();

    if (diff <= 0) {
      countdownEl.textContent = 'DROP LIVE';
      clearInterval(timer);
      return;
    }

    const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    countdownEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
}

function applyDiscountCode() {
  if (!discountCodeInput) return;

  const code = discountCodeInput.value.trim().toUpperCase();

  if (!code) {
    localStorage.removeItem(STORAGE_KEYS.discount);
    showToast('Discount code cleared.');
  } else if (code === 'DROP10') {
    localStorage.setItem(STORAGE_KEYS.discount, 'DROP10');
    showToast('DROP10 applied. 10% discount added.');
  } else {
    localStorage.removeItem(STORAGE_KEYS.discount);
    discountCodeInput.value = '';
    showToast('Invalid code. Try DROP10.');
  }

  renderCart();
}

function initCheckoutForm() {
  if (!checkoutForm) return;

  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!getCart().length) {
      showToast('Your cart is empty.');
      return;
    }

    if (!checkoutForm.checkValidity()) {
      checkoutForm.classList.add('was-validated');
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.cart);
    localStorage.removeItem(STORAGE_KEYS.discount);
    checkoutForm.reset();
    checkoutForm.classList.remove('was-validated');
    if (orderSuccess) orderSuccess.classList.remove('d-none');

    renderCart();
    applyFilters();
    showToast('Order placed successfully.');
  });
}

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeToggle) themeToggle.textContent = savedTheme === 'dark' ? '☾' : '☀';

  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEYS.theme, next);
    themeToggle.textContent = next === 'dark' ? '☾' : '☀';
  });
}

function initEvents() {
  ['input', 'change'].forEach((eventName) => {
    searchInput?.addEventListener(eventName, applyFilters);
    categoryFilter?.addEventListener(eventName, applyFilters);
    ratingFilter?.addEventListener(eventName, applyFilters);
    priceFilter?.addEventListener(eventName, applyFilters);
    sortFilter?.addEventListener(eventName, applyFilters);
  });

  resetFiltersButton?.addEventListener('click', resetFilters);
  emptyResetButton?.addEventListener('click', resetFilters);
  clearCartButton?.addEventListener('click', clearCart);
  applyDiscountButton?.addEventListener('click', applyDiscountCode);

  discountCodeInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyDiscountCode();
    }
  });

  productGrid?.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;

    const id = Number(actionButton.dataset.id);
    const action = actionButton.dataset.action;

    if (action === 'add') addToCart(id);
    if (action === 'view') openProductModal(id);
  });

  cartItemsEl?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.cartAction;
    const item = getCart().find((cartItem) => cartItem.id === id);

    if (action === 'remove') removeFromCart(id);
    if (action === 'increase' && item) updateCartItem(id, item.qty + 1);
    if (action === 'decrease' && item) updateCartItem(id, item.qty - 1);
  });

  modalAddToCart?.addEventListener('click', () => {
    const id = Number(modalAddToCart.dataset.id);
    addToCart(id);
  });

  window.addEventListener('storage', (event) => {
  if ([STORAGE_KEYS.cart, STORAGE_KEYS.discount].includes(event.key)) {
    renderCart();
    applyFilters();
  }

  if (event.key === STORAGE_KEYS.theme) {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) themeToggle.textContent = savedTheme === 'dark' ? '☾' : '☀';
  }
});
}

function initNavbarScroll() {
  const nav = qs('.glass-nav');
  if (!nav) return;

  const updateNavState = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });
}

function initApp() {
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  populateCategoryFilter();
  initTheme();
  initEvents();
  initCheckoutForm();
  initNavbarScroll();
  startCountdown();
  renderCart();
  applyFilters();
}

initApp();