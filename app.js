// House Party Sale - Main App

// State
let items = [];
let settings = {};
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Initialize app - fetch data from JSON file
async function initApp() {
  try {
    const response = await fetch('items.json?' + Date.now()); // Cache bust
    const data = await response.json();

    items = data.items || [];
    settings = data.settings || DEFAULT_SETTINGS;

    renderFilters();
    renderItems();
    updatePartyInfo();
  } catch (error) {
    console.error('Error loading data:', error);
    // Fallback to defaults
    items = [];
    settings = DEFAULT_SETTINGS;
    renderFilters();
    renderItems();
    updatePartyInfo();
  }
}

// Update party info in header and footer
function updatePartyInfo() {
  const partyInfo = document.getElementById('partyInfo');
  const footerAddress = document.getElementById('footerAddress');

  if (partyInfo) {
    partyInfo.textContent = `${settings.partyDate} | ${settings.partyTime}`;
  }
  if (footerAddress) {
    footerAddress.textContent = settings.partyAddress;
  }
}

// Render filter buttons
function renderFilters() {
  const container = document.getElementById('filterButtons');
  if (!container) return;

  let html = `<button class="filter-btn active" data-category="all">הכל</button>`;

  Object.values(CATEGORIES).forEach(cat => {
    html += `<button class="filter-btn" data-category="${cat.id}">${cat.icon} ${cat.name}</button>`;
  });

  container.innerHTML = html;

  // Add click handlers
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter items
      currentFilter = btn.dataset.category;
      renderItems();
    });
  });
}

// Render items
function renderItems() {
  const grid = document.getElementById('itemsGrid');
  const emptyState = document.getElementById('emptyState');
  if (!grid) return;

  // Filter items
  const filteredItems = currentFilter === 'all'
    ? items
    : items.filter(item => item.category === currentFilter);

  // Sort: available items first, then sold
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.sold && !b.sold) return 1;
    if (!a.sold && b.sold) return -1;
    return 0;
  });

  if (sortedItems.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  grid.innerHTML = sortedItems.map(item => renderItemCard(item)).join('');

  // Add reserve button handlers
  grid.querySelectorAll('.reserve-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const itemId = parseInt(btn.dataset.itemId);
      reserveItem(itemId);
    });
  });
}

// Render single item card
function renderItemCard(item) {
  const category = CATEGORIES[item.category] || CATEGORIES.other;
  const condition = CONDITIONS[item.condition] || item.condition;

  // Handle both new images array and legacy single image
  const images = item.images || (item.image ? [item.image] : []);

  let galleryHtml;
  if (images.length > 0) {
    galleryHtml = `
      <div class="item-gallery" data-item-id="${item.id}">
        <div class="gallery-images">
          ${images.map((img, index) => `
            <img src="${img}" alt="${item.name}" class="gallery-image ${index === 0 ? 'active' : ''}" data-index="${index}" onerror="this.style.display='none'">
          `).join('')}
        </div>
        ${images.length > 1 ? `
          <button class="gallery-nav gallery-prev" onclick="navigateGallery(${item.id}, -1)">‹</button>
          <button class="gallery-nav gallery-next" onclick="navigateGallery(${item.id}, 1)">›</button>
          <div class="gallery-dots">
            ${images.map((_, index) => `<span class="gallery-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${item.id}, ${index})"></span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  } else {
    galleryHtml = `<div class="item-image-placeholder">${category.icon}</div>`;
  }

  return `
    <article class="item-card ${item.sold ? 'sold' : ''}">
      ${galleryHtml}
      <div class="item-content">
        <span class="item-category">${category.icon} ${category.name}</span>
        <h3 class="item-name">${escapeHtml(item.name)}</h3>
        <p class="item-description">${escapeHtml(item.description)}</p>
        <p class="item-condition">${condition}</p>
        <div class="item-price">${item.price}</div>
      </div>
      <button class="reserve-btn" data-item-id="${item.id}" ${item.sold ? 'disabled' : ''}>
        ${item.sold ? 'נמכר' : 'שריין עכשיו!'}
      </button>
    </article>
  `;
}

// Gallery navigation
function navigateGallery(itemId, direction) {
  const gallery = document.querySelector(`.item-gallery[data-item-id="${itemId}"]`);
  if (!gallery) return;

  const images = gallery.querySelectorAll('.gallery-image');
  const dots = gallery.querySelectorAll('.gallery-dot');
  const activeImage = gallery.querySelector('.gallery-image.active');
  const currentIndex = parseInt(activeImage.dataset.index);

  let newIndex = currentIndex + direction;
  if (newIndex < 0) newIndex = images.length - 1;
  if (newIndex >= images.length) newIndex = 0;

  images.forEach(img => img.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  images[newIndex].classList.add('active');
  if (dots[newIndex]) dots[newIndex].classList.add('active');
}

function goToSlide(itemId, index) {
  const gallery = document.querySelector(`.item-gallery[data-item-id="${itemId}"]`);
  if (!gallery) return;

  const images = gallery.querySelectorAll('.gallery-image');
  const dots = gallery.querySelectorAll('.gallery-dot');

  images.forEach(img => img.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  images[index].classList.add('active');
  if (dots[index]) dots[index].classList.add('active');
}

// Reserve item - open WhatsApp
function reserveItem(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item || item.sold) return;

  // Create WhatsApp message
  const message = encodeURIComponent(
    `היי! 👋\nאני מעוניין/ת בפריט מהמכירה:\n\n` +
    `📦 ${item.name}\n` +
    `💰 ${item.price} ₪\n\n` +
    `האם הוא עדיין זמין?`
  );

  // Open WhatsApp
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
