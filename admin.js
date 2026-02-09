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

  // Load settings to get password
  loadSettings();

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
  if (input.value === settings.adminPassword) {
    sessionStorage.setItem('adminAuth', 'true');
    authenticate();
  } else {
    alert('סיסמה שגויה!');
    input.value = '';
    input.focus();
  }
}

function authenticate() {
  isAuthenticated = true;
  document.getElementById('passwordModal').style.display = 'none';
  document.getElementById('adminContent').style.display = 'block';

  loadData();
  loadSettings();
  populateSettingsForm();
  renderItemsTable();
  setupEventListeners();
  setupImageUploads();
}

// Load/Save Data
function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    items = JSON.parse(stored);
  } else {
    items = [...SAMPLE_ITEMS];
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadSettings() {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } else {
    settings = { ...DEFAULT_SETTINGS };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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
    saveSettings();
    alert('ההגדרות נשמרו! ✅');
  });

  // Add item form
  document.getElementById('addItemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addItem();
  });

  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportData);

  // Import button
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', importData);

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', resetData);

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
    sold: false,
    interest: 0
  };

  items.unshift(newItem);
  saveData();
  renderItemsTable();

  // Clear form
  document.getElementById('addItemForm').reset();
  document.getElementById('itemImages').value = '';
  document.getElementById('itemImagesPreview').innerHTML = '';
  alert('הפריט נוסף בהצלחה! ✅');
}

// Render Items Table
function renderItemsTable() {
  const tbody = document.getElementById('itemsTableBody');
  const countSpan = document.getElementById('itemCount');

  countSpan.textContent = items.length;

  tbody.innerHTML = items.map(item => {
    const category = CATEGORIES[item.category] || CATEGORIES.other;
    const condition = CONDITIONS[item.condition] || item.condition;

    return `
      <tr class="${item.sold ? 'sold' : ''}">
        <td>${escapeHtml(item.name)}</td>
        <td>${category.icon} ${category.name}</td>
        <td>₪${item.price}</td>
        <td>${condition}</td>
        <td>${item.sold ? '✅ נמכר' : '❌'}</td>
        <td>${item.interest || 0}</td>
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

  // Handle legacy items with single image
  const images = item.images || (item.image ? [item.image] : []);

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
  delete item.image; // Remove legacy field

  saveData();
  renderItemsTable();
  closeEditModal();
  alert('הפריט עודכן! ✅');
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

// Toggle Sold
function toggleSold(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  item.sold = !item.sold;
  saveData();
  renderItemsTable();
}

// Delete Item
function deleteItem(id) {
  if (!confirm('בטוח למחוק את הפריט?')) return;

  items = items.filter(i => i.id !== id);
  saveData();
  renderItemsTable();
}

// Export Data
function exportData() {
  const data = {
    items: items,
    settings: settings,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `house-party-sale-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// Import Data
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);

      if (data.items) {
        items = data.items;
        saveData();
      }

      if (data.settings) {
        settings = { ...settings, ...data.settings };
        saveSettings();
        populateSettingsForm();
      }

      renderItemsTable();
      alert('הנתונים יובאו בהצלחה! ✅');
    } catch (err) {
      alert('שגיאה בקריאת הקובץ. וודא שזהו קובץ JSON תקין.');
    }
  };

  reader.readAsText(file);
  e.target.value = '';
}

// Reset Data
function resetData() {
  if (!confirm('בטוח לאפס את כל הנתונים לברירת המחדל? כל הפריטים הקיימים יימחקו!')) return;
  if (!confirm('אתה בטוח? פעולה זו אינה ניתנת לביטול!')) return;

  items = [...SAMPLE_ITEMS];
  saveData();
  settings = { ...DEFAULT_SETTINGS };
  saveSettings();
  populateSettingsForm();
  renderItemsTable();
  alert('הנתונים אופסו! ✅');
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Setup Image Uploads
function setupImageUploads() {
  // Add item images upload
  document.getElementById('itemImageFiles').addEventListener('change', (e) => {
    handleMultipleImageUpload(e.target.files, 'itemImages', 'itemImagesPreview');
  });

  // Edit item images upload
  document.getElementById('editImageFiles').addEventListener('change', (e) => {
    handleMultipleImageUpload(e.target.files, 'editImages', 'editImagesPreview', true);
  });
}

// Handle multiple image uploads and convert to base64
function handleMultipleImageUpload(files, inputId, previewId, appendToExisting = false) {
  if (!files || files.length === 0) return;

  // Get existing images if appending
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

  // Check total count
  if (existingImages.length + files.length > 5) {
    alert('מקסימום 5 תמונות לפריט!');
    return;
  }

  const promises = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Check file size (max 500KB for base64)
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
