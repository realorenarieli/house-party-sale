// House Party Sale - Admin

// State
let items = [];
let settings = {};
let isAuthenticated = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupPasswordProtection();
  populateCategoryDropdowns();
});

// Password Protection
function setupPasswordProtection() {
  const modal = document.getElementById('passwordModal');
  const input = document.getElementById('passwordInput');
  const submit = document.getElementById('passwordSubmit');

  // Check if already authenticated this session
  if (sessionStorage.getItem('adminAuth') === 'true') {
    authenticate();
    return;
  }

  submit.addEventListener('click', checkPassword);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
  });
}

function checkPassword() {
  const input = document.getElementById('passwordInput');
  // Simple password check - in production use proper auth
  if (input.value === 'sale2026') {
    sessionStorage.setItem('adminAuth', 'true');
    authenticate();
  } else {
    alert('סיסמה שגויה!');
    input.value = '';
    input.focus();
  }
}

async function authenticate() {
  isAuthenticated = true;
  document.getElementById('passwordModal').style.display = 'none';
  document.getElementById('adminContent').style.display = 'block';

  await loadData();
  populateSettingsForm();
  renderItemsTable();
  setupEventListeners();
  setupImageUploads();
  loadAnalytics();
}

// Load data from JSON file
async function loadData() {
  try {
    const response = await fetch('items.json?' + Date.now());
    const data = await response.json();
    items = data.items || [];
    settings = data.settings || {
      whatsappNumber: '972527251714',
      partyDate: '20.02.2026',
      partyTime: 'החל מ-15:00',
      partyAddress: 'רחוב ג׳ורג׳ אליוט, קומה 3 דירה 3, תל אביב'
    };
  } catch (error) {
    console.error('Error loading data:', error);
    items = [];
    settings = {
      whatsappNumber: '972527251714',
      partyDate: '20.02.2026',
      partyTime: 'החל מ-15:00',
      partyAddress: 'רחוב ג׳ורג׳ אליוט, קומה 3 דירה 3, תל אביב'
    };
  }
}

// Populate category dropdowns
function populateCategoryDropdowns() {
  const selects = ['itemCategory', 'editCategory'];
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = Object.values(CATEGORIES).map(cat =>
      `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');
  });
}

// Populate settings form
function populateSettingsForm() {
  document.getElementById('settingWhatsapp').value = settings.whatsappNumber || '';
  document.getElementById('settingDate').value = settings.partyDate || '';
  document.getElementById('settingTime').value = settings.partyTime || '';
  document.getElementById('settingAddress').value = settings.partyAddress || '';
}

// Setup Event Listeners
function setupEventListeners() {
  // Settings form
  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    settings.whatsappNumber = document.getElementById('settingWhatsapp').value;
    settings.partyDate = document.getElementById('settingDate').value;
    settings.partyTime = document.getElementById('settingTime').value;
    settings.partyAddress = document.getElementById('settingAddress').value;
    alert('ההגדרות עודכנו! לחץ על "ייצא JSON" כדי לשמור.');
  });

  // Add item form
  document.getElementById('addItemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addItem();
  });

  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportData);

  // Copy JSON button
  document.getElementById('copyJsonBtn').addEventListener('click', copyJsonToClipboard);

  // Edit form
  document.getElementById('editItemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveEditedItem();
  });

  document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
}

// Add Item
function addItem() {
  const imagesJson = document.getElementById('itemImages').value;
  const images = imagesJson ? JSON.parse(imagesJson) : [];

  const newItem = {
    id: Date.now(),
    name: document.getElementById('itemName').value,
    description: document.getElementById('itemDescription').value,
    price: parseInt(document.getElementById('itemPrice').value),
    category: document.getElementById('itemCategory').value,
    condition: document.getElementById('itemCondition').value,
    images: images,
    sold: false
  };

  items.unshift(newItem);
  renderItemsTable();

  // Clear form
  document.getElementById('addItemForm').reset();
  document.getElementById('itemImages').value = '';
  document.getElementById('itemImagesPreview').innerHTML = '';
  alert('הפריט נוסף! לחץ על "ייצא JSON" או "העתק JSON" כדי לשמור.');
}

// Render Items Table
function renderItemsTable() {
  const tbody = document.getElementById('itemsTableBody');
  const countSpan = document.getElementById('itemCount');

  countSpan.textContent = items.length;

  tbody.innerHTML = items.map(item => {
    const category = CATEGORIES[item.category] || CATEGORIES.other;
    const condition = CONDITIONS[item.condition] || item.condition;
    const imageCount = (item.images || []).length;

    return `
      <tr class="${item.sold ? 'sold' : ''}">
        <td>${escapeHtml(item.name)}</td>
        <td>${category.icon} ${category.name}</td>
        <td>₪${item.price}</td>
        <td>${condition}</td>
        <td>${imageCount > 0 ? `📷 ${imageCount}` : '-'}</td>
        <td>${item.sold ? '✅ נמכר' : '❌'}</td>
        <td class="actions">
          <button class="btn btn-secondary" onclick="editItem(${item.id})">✏️</button>
          <button class="btn btn-secondary" onclick="toggleSold(${item.id})">${item.sold ? '↩️' : '✅'}</button>
          <button class="btn btn-danger" onclick="deleteItem(${item.id})">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Edit Item
function editItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  const images = item.images || [];

  document.getElementById('editItemId').value = id;
  document.getElementById('editName').value = item.name;
  document.getElementById('editDescription').value = item.description;
  document.getElementById('editPrice').value = item.price;
  document.getElementById('editCategory').value = item.category;
  document.getElementById('editCondition').value = item.condition;
  document.getElementById('editImages').value = JSON.stringify(images);
  document.getElementById('editImageFiles').value = '';
  showImagesPreview(images, 'editImagesPreview');

  document.getElementById('editModal').style.display = 'flex';
}

function saveEditedItem() {
  const id = parseInt(document.getElementById('editItemId').value);
  const item = items.find(i => i.id === id);
  if (!item) return;

  const imagesJson = document.getElementById('editImages').value;
  const images = imagesJson ? JSON.parse(imagesJson) : [];

  item.name = document.getElementById('editName').value;
  item.description = document.getElementById('editDescription').value;
  item.price = parseInt(document.getElementById('editPrice').value);
  item.category = document.getElementById('editCategory').value;
  item.condition = document.getElementById('editCondition').value;
  item.images = images;

  renderItemsTable();
  closeEditModal();
  alert('הפריט עודכן! לחץ על "ייצא JSON" או "העתק JSON" כדי לשמור.');
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

// Toggle Sold
function toggleSold(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  item.sold = !item.sold;
  renderItemsTable();
}

// Delete Item
function deleteItem(id) {
  if (!confirm('בטוח למחוק את הפריט?')) return;

  items = items.filter(i => i.id !== id);
  renderItemsTable();
}

// Generate export data
function generateExportData() {
  return {
    items: items,
    settings: settings,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}

// Export Data as file
function exportData() {
  const data = generateExportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `items.json`;
  a.click();

  URL.revokeObjectURL(url);
  alert('הקובץ הורד! שלח אותו כדי לעדכן את האתר.');
}

// Copy JSON to clipboard
function copyJsonToClipboard() {
  const data = generateExportData();
  const jsonString = JSON.stringify(data, null, 2);

  navigator.clipboard.writeText(jsonString).then(() => {
    alert('JSON הועתק! הדבק אותו בצ\'אט כדי לעדכן את האתר.');
  }).catch(err => {
    console.error('Error copying:', err);
    // Fallback: show in textarea
    const textarea = document.createElement('textarea');
    textarea.value = jsonString;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('JSON הועתק!');
  });
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Setup Image Uploads
function setupImageUploads() {
  document.getElementById('itemImageFiles').addEventListener('change', (e) => {
    handleMultipleImageUpload(e.target.files, 'itemImages', 'itemImagesPreview');
  });

  document.getElementById('editImageFiles').addEventListener('change', (e) => {
    handleMultipleImageUpload(e.target.files, 'editImages', 'editImagesPreview', true);
  });
}

// Handle multiple image uploads and convert to base64
function handleMultipleImageUpload(files, inputId, previewId, appendToExisting = false) {
  if (!files || files.length === 0) return;

  let existingImages = [];
  if (appendToExisting) {
    const existing = document.getElementById(inputId).value;
    if (existing) {
      try {
        existingImages = JSON.parse(existing);
      } catch (e) {
        existingImages = [];
      }
    }
  }

  if (existingImages.length + files.length > 5) {
    alert('מקסימום 5 תמונות לפריט!');
    return;
  }

  const promises = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.size > 500 * 1024) {
      alert(`התמונה "${file.name}" גדולה מדי! מקסימום 500KB`);
      continue;
    }

    promises.push(new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    }));
  }

  Promise.all(promises).then(newImages => {
    const allImages = [...existingImages, ...newImages].slice(0, 5);
    document.getElementById(inputId).value = JSON.stringify(allImages);
    showImagesPreview(allImages, previewId);
  });
}

// Show multiple images preview
function showImagesPreview(images, previewId) {
  const preview = document.getElementById(previewId);
  if (images && images.length > 0) {
    preview.innerHTML = images.map((img, index) => `
      <div class="preview-image-wrapper">
        <img src="${img}" alt="preview ${index + 1}">
        <button type="button" class="remove-image-btn" onclick="removeImage('${previewId}', ${index})">✕</button>
      </div>
    `).join('');
  } else {
    preview.innerHTML = '<p style="color: var(--gray); font-size: 0.9rem;">אין תמונות</p>';
  }
}

// Remove image from preview
function removeImage(previewId, index) {
  const inputId = previewId.replace('Preview', '');
  const existing = document.getElementById(inputId).value;
  if (!existing) return;

  try {
    const images = JSON.parse(existing);
    images.splice(index, 1);
    document.getElementById(inputId).value = JSON.stringify(images);
    showImagesPreview(images, previewId);
  } catch (e) {
    console.error('Error removing image:', e);
  }
}

// ============ ANALYTICS ============

const COUNTER_NAMESPACE = 'house-party-sale';
const COUNTER_KEY = 'visitors';
const ANALYTICS_KEY = 'housePartySaleAnalytics';

async function loadAnalytics() {
  // Load visitor count from CountAPI
  try {
    const response = await fetch(`https://api.countapi.xyz/get/${COUNTER_NAMESPACE}/${COUNTER_KEY}`);
    const data = await response.json();
    document.getElementById('totalVisitors').textContent = data.value ? data.value.toLocaleString() : '0';
  } catch (error) {
    document.getElementById('totalVisitors').textContent = '-';
  }

  // Load local analytics
  const analytics = getAnalytics();
  renderAnalytics(analytics);
}

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

function renderAnalytics(analytics) {
  // Page views
  document.getElementById('pageViews').textContent = analytics.pageViews.toLocaleString();

  // Total item clicks
  const totalClicks = Object.values(analytics.itemClicks).reduce((a, b) => a + b, 0);
  document.getElementById('totalItemClicks').textContent = totalClicks.toLocaleString();

  // Preferred language
  const heLang = analytics.languageUsage.he || 0;
  const enLang = analytics.languageUsage.en || 0;
  if (heLang + enLang > 0) {
    document.getElementById('preferredLang').textContent = heLang >= enLang ? '🇮🇱 עברית' : '🇬🇧 English';
  }

  // Popular items
  renderPopularItems(analytics.itemClicks);

  // Popular categories
  renderPopularCategories(analytics.categoryClicks);
}

function renderPopularItems(itemClicks) {
  const container = document.getElementById('popularItems');
  const sorted = Object.entries(itemClicks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sorted.length === 0) {
    container.innerHTML = '<p style="color: var(--gray);">אין נתונים עדיין</p>';
    return;
  }

  container.innerHTML = sorted.map(([key, count]) => {
    const name = key.split('_').slice(1).join('_') || key;
    return `<div class="analytics-list-item">
      <span>${escapeHtml(name)}</span>
      <span><strong>${count}</strong> לחיצות</span>
    </div>`;
  }).join('');
}

function renderPopularCategories(categoryClicks) {
  const container = document.getElementById('popularCategories');
  const sorted = Object.entries(categoryClicks)
    .filter(([cat]) => cat !== 'all')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sorted.length === 0) {
    container.innerHTML = '<p style="color: var(--gray);">אין נתונים עדיין</p>';
    return;
  }

  const categoryNames = {
    'furniture': '🪑 ריהוט',
    'kitchen': '🍳 מטבח',
    'electronic': '📺 אלקטרוניקה',
    'vintage': '🏺 וינטג׳',
    'other': '📦 שונות',
    'all': 'הכל'
  };

  container.innerHTML = sorted.map(([cat, count]) => {
    const name = categoryNames[cat] || cat;
    return `<div class="analytics-list-item">
      <span>${name}</span>
      <span><strong>${count}</strong> צפיות</span>
    </div>`;
  }).join('');
}

function refreshAnalytics() {
  loadAnalytics();
}
