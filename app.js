// House Party Sale - Main App

// State
let items = [];
let settings = {};
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  loadSettings();
  renderFilters();
  renderItems();
  updatePartyInfo();
});

// Load items from localStorage or use sample data
function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    items = JSON.parse(stored);
  } else {
    items = [...SAMPLE_ITEMS];
    saveData();
  }
}

// Save items to localStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Load settings
function loadSettings() {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } else {
    settings = { ...DEFAULT_SETTINGS };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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

  const imageHtml = item.image
    ? `<img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.outerHTML='<div class=\\'item-image-placeholder\\'>${category.icon}</div>'">`
    : `<div class="item-image-placeholder">${category.icon}</div>`;

  return `
    <article class="item-card ${item.sold ? 'sold' : ''}">
      ${imageHtml}
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
      ${item.interest > 0 ? `<div class="interest-counter">👀 ${item.interest} מתעניינים</div>` : ''}
    </article>
  `;
}

// Reserve item - open WhatsApp
function reserveItem(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item || item.sold) return;

  // Increment interest counter
  item.interest = (item.interest || 0) + 1;
  saveData();
  renderItems();

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
