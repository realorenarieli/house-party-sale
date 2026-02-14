// House Party Sale - Main App
// Data source: Google Sheets

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1rNUlffPgabQZgvDiT9fxU3xcICWS_vc1z4gse2jpjyw/export?format=csv';

// Translations
const TRANSLATIONS = {
  he: {
    title: '🌟 לא נכנס במזוודה - המכירה הגדולה! 🌟',
    subtitle: 'הכל חייב ללכת! מחירים משוגעים!',
    promoTitle: '🎁 יש עוד המון פריטים שלא מופיעים כאן! 🎁',
    promoText: 'בואו ביום המכירה לגלות עוד אוצרות במחירים מטורפים!',
    askMore: '📸 רוצים עוד תמונות? מחפשים משהו ספציפי? שלחו הודעה ונשמח לעזור!',
    categoriesTitle: '★ קטגוריות ★',
    all: 'הכל',
    noItems: 'אין פריטים בקטגוריה זו',
    reserve: 'שריין עכשיו!',
    sold: 'נמכר',
    footerText: 'בואו לקנות! בואו להיפרד! בואו לנקות!',
    marquee: '💥 מחירים משוגעים! 💥 הכל חייב ללכת! 💥 הזדמנות אחרונה! 💥 מחירים משוגעים! 💥 הכל חייב ללכת! 💥 הזדמנות אחרונה! 💥',
    openMaps: '📍 פתח במפות',
    visitors: '👀 מבקרים:',
    whatsappMsg: 'היי! 👋\nאני מעוניין/ת בפריט מהמכירה:\n\n📦 {name}\n💰 {price} ₪\n\nהאם הוא עדיין זמין?',
    conditions: {
      'new': 'חדש',
      'like new': 'כמו חדש',
      'slightly used': 'משומש קלות',
      'used': 'משומש'
    },
    categories: {
      'furniture': 'ריהוט',
      'kitchen': 'מטבח',
      'electronic': 'אלקטרוניקה',
      'vintage': 'וינטג׳',
      'other': 'שונות'
    }
  },
  en: {
    title: '🌟 Moving Sale - Everything Must Go! 🌟',
    subtitle: 'Crazy prices! Everything must go!',
    promoTitle: '🎁 Many more items not shown here! 🎁',
    promoText: 'Come to the sale to discover more treasures at amazing prices!',
    askMore: '📸 Want more photos? Looking for something specific? Send us a message!',
    categoriesTitle: '★ Categories ★',
    all: 'All',
    noItems: 'No items in this category',
    reserve: 'Reserve Now!',
    sold: 'Sold',
    footerText: 'Come buy! Come say goodbye! Come clean out!',
    marquee: '💥 Crazy prices! 💥 Everything must go! 💥 Last chance! 💥 Crazy prices! 💥 Everything must go! 💥 Last chance! 💥',
    openMaps: '📍 Open in Maps',
    visitors: '👀 Visitors:',
    whatsappMsg: "Hi! 👋\nI'm interested in an item from the sale:\n\n📦 {name}\n💰 ₪{price}\n\nIs it still available?",
    conditions: {
      'new': 'New',
      'like new': 'Like New',
      'slightly used': 'Slightly Used',
      'used': 'Used'
    },
    categories: {
      'furniture': 'Furniture',
      'kitchen': 'Kitchen',
      'electronic': 'Electronics',
      'vintage': 'Vintage',
      'other': 'Other'
    }
  }
};

// State
let items = [];
let settings = {
  whatsappNumber: '972527251714',
  partyDate: '20.02.2026',
  partyTime: 'From 12:00 / החל מ-12:00',
  partyAddress: 'George Eliot St, Floor 3 Apt 3, Tel Aviv'
};
let currentFilter = 'all';
let currentLang = localStorage.getItem('lang') || 'he';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupLanguageSelector();
  applyLanguage(currentLang);
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
  // Convert to thumbnail URL which is more reliable

  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    // Use thumbnail method - more reliable than uc?export
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }

  // Handle Google Drive open links
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) {
    const fileId = openMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
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

  const t = TRANSLATIONS[currentLang];
  let html = `<button class="filter-btn active" data-category="all">${t.all}</button>`;

  Object.values(CATEGORIES).forEach(cat => {
    const categoryName = t.categories[cat.id] || cat.name;
    html += `<button class="filter-btn" data-category="${cat.id}">${cat.icon} ${categoryName}</button>`;
  });

  container.innerHTML = html;

  // Add click handlers
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.category;
      trackCategoryClick(currentFilter);
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
  const condition = getConditionLabel(item.condition);
  const images = item.images || [];
  const t = TRANSLATIONS[currentLang];
  const categoryName = t.categories[item.category] || category.name;

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
        <span class="item-category">${category.icon} ${categoryName}</span>
        <h3 class="item-name">${escapeHtml(item.name)}</h3>
        <p class="item-description">${escapeHtml(item.description)}</p>
        <p class="item-condition">${condition}</p>
        <div class="item-price">${item.price}</div>
      </div>
      <button class="reserve-btn" data-item-id="${item.id}" ${item.sold ? 'disabled' : ''}>
        ${item.sold ? t.sold : t.reserve}
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

  // Track this item click
  trackItemClick(itemId, item.name);

  const t = TRANSLATIONS[currentLang];
  const messageTemplate = t.whatsappMsg;
  const message = encodeURIComponent(
    messageTemplate
      .replace('{name}', item.name)
      .replace('{price}', item.price)
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

// Language functions
function setupLanguageSelector() {
  const selector = document.getElementById('langSelector');
  if (selector) {
    selector.value = currentLang;
    selector.addEventListener('change', (e) => {
      currentLang = e.target.value;
      localStorage.setItem('lang', currentLang);
      applyLanguage(currentLang);
      renderItems(); // Re-render items with new language
    });
  }
}

function applyLanguage(lang) {
  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'he';

  // Update document direction
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

  // Update text content
  const updates = {
    'mainTitle': t.title,
    'subtitle': t.subtitle,
    'promoTitle': t.promoTitle,
    'promoText': t.promoText,
    'askMore': t.askMore,
    'filtersTitle': t.categoriesTitle,
    'emptyStateText': t.noItems,
    'footerText': t.footerText,
    'marqueeText': t.marquee,
    'openMaps': t.openMaps,
    'visitorCountLabel': t.visitors
  };

  for (const [id, text] of Object.entries(updates)) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Update filter buttons
  renderFilters();
}

function getTranslation(key) {
  return TRANSLATIONS[currentLang][key] || key;
}

function getConditionLabel(condition) {
  const conditions = TRANSLATIONS[currentLang].conditions;
  return conditions[condition.toLowerCase()] || condition;
}

// ============ VISITOR COUNTER & ANALYTICS ============

const COUNTER_NAMESPACE = 'house-party-sale';
const COUNTER_KEY = 'visitors';
const ANALYTICS_KEY = 'housePartySaleAnalytics';

// Initialize visitor counter
async function initVisitorCounter() {
  try {
    // Check if this is a new session
    const hasVisited = sessionStorage.getItem('counted');

    if (!hasVisited) {
      // Increment counter for new visitor
      const response = await fetch(`https://api.countapi.xyz/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`);
      const data = await response.json();
      document.getElementById('visitorCount').textContent = data.value.toLocaleString();
      sessionStorage.setItem('counted', 'true');

      // Track analytics
      trackPageView();
    } else {
      // Just get current count without incrementing
      const response = await fetch(`https://api.countapi.xyz/get/${COUNTER_NAMESPACE}/${COUNTER_KEY}`);
      const data = await response.json();
      document.getElementById('visitorCount').textContent = data.value.toLocaleString();
    }
  } catch (error) {
    console.error('Counter error:', error);
    document.getElementById('visitorCount').textContent = '✨';
  }
}

// Analytics tracking
function getAnalytics() {
  try {
    return JSON.parse(localStorage.getItem(ANALYTICS_KEY)) || createEmptyAnalytics();
  } catch {
    return createEmptyAnalytics();
  }
}

function createEmptyAnalytics() {
  return {
    pageViews: 0,
    uniqueVisitors: [],
    itemClicks: {},
    categoryClicks: {},
    languageUsage: { he: 0, en: 0 },
    dailyViews: {},
    lastUpdated: null
  };
}

function saveAnalytics(analytics) {
  analytics.lastUpdated = new Date().toISOString();
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
}

function getVisitorId() {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
}

function trackPageView() {
  const analytics = getAnalytics();
  const visitorId = getVisitorId();
  const today = new Date().toISOString().split('T')[0];

  analytics.pageViews++;

  if (!analytics.uniqueVisitors.includes(visitorId)) {
    analytics.uniqueVisitors.push(visitorId);
  }

  analytics.dailyViews[today] = (analytics.dailyViews[today] || 0) + 1;
  analytics.languageUsage[currentLang] = (analytics.languageUsage[currentLang] || 0) + 1;

  saveAnalytics(analytics);
}

function trackItemClick(itemId, itemName) {
  const analytics = getAnalytics();
  const key = `${itemId}_${itemName}`;
  analytics.itemClicks[key] = (analytics.itemClicks[key] || 0) + 1;
  saveAnalytics(analytics);
}

function trackCategoryClick(category) {
  const analytics = getAnalytics();
  analytics.categoryClicks[category] = (analytics.categoryClicks[category] || 0) + 1;
  saveAnalytics(analytics);
}

// Start visitor counter on page load
document.addEventListener('DOMContentLoaded', () => {
  initVisitorCounter();
});
