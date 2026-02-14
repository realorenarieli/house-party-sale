// House Party Sale - Main App
// Data source: Google Sheets

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1rNUlffPgabQZgvDiT9fxU3xcICWS_vc1z4gse2jpjyw/export?format=csv';

// State
let items = [];
let settings = {
  whatsappNumber: '972527251714',
  partyDate: '20.02.2026',
  partyTime: 'החל מ-15:00',
  partyAddress: 'רחוב ג׳ורג׳ אליוט, קומה 3 דירה 3, תל אביב'
};
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Initialize app - fetch data from Google Sheets
async function initApp() {
  try {
    const response = await fetch(SHEET_CSV_URL);
    const csvText = await response.text();
    items = parseCSV(csvText);

    renderFilters();
    renderItems();
    updatePartyInfo();
  } catch (error) {
    console.error('Error loading data:', error);
    items = [];
    renderFilters();
    renderItems();
    updatePartyInfo();
  }
}

// Parse CSV to array of objects
function parseCSV(csv) {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  // Get headers from first row
  const headers = parseCSVLine(lines[0]);

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    // Map to our item format
    // Sheet columns: id, Name, Description, Price, Category, Condition, Images, Sold
    const item = {
      id: parseInt(values[0]) || i,
      name: values[1] || '',
      description: values[2] || '',
      price: parseInt(values[3]) || 0,
      category: (values[4] || 'other').toLowerCase(),
      condition: (values[5] || 'good').toLowerCase(),
      images: parseImages(values[6]),
      sold: (values[7] || '').toUpperCase() === 'TRUE'
    };

    // Only include items that have a name (skip empty rows)
    if (item.name && item.name.trim() !== '') {
      result.push(item);
    }
  }

  return result;
}

// Parse a CSV line handling quoted values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Parse images from comma or newline separated string
function parseImages(imagesStr) {
  if (!imagesStr || imagesStr.trim() === '') return [];

  // Split by comma or newline
  return imagesStr
    .split(/[,\n]/)
    .map(url => url.trim())
    .filter(url => url !== '')
    .map(url => convertGoogleDriveUrl(url));
}

// Convert Google Drive sharing URL to direct image URL
function convertGoogleDriveUrl(url) {
  // Handle Google Drive file links
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Convert to: https://drive.google.com/uc?export=view&id=FILE_ID

  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  // Handle Google Drive open links
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }

  // Return as-is if not a Google Drive URL
  return url;
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
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
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
  const images = item.images || [];

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

  const message = encodeURIComponent(
    `היי! 👋\nאני מעוניין/ת בפריט מהמכירה:\n\n` +
    `📦 ${item.name}\n` +
    `💰 ${item.price} ₪\n\n` +
    `האם הוא עדיין זמין?`
  );

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}

// Utility: Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
