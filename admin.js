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
  const newItem = {
    id: Date.now(),
    name: document.getElementById('itemName').value,
    description: document.getElementById('itemDescription').value,
    price: parseInt(document.getElementById('itemPrice').value),
    category: document.getElementById('itemCategory').value,
    condition: document.getElementById('itemCondition').value,
    image: document.getElementById('itemImage').value,
    sold: false,
    interest: 0
  };

  items.unshift(newItem);
  saveData();
  renderItemsTable();

  // Clear form
  document.getElementById('addItemForm').reset();
  document.getElementById('itemImage').value = '';
  document.getElementById('itemImagePreview').innerHTML = '';
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

  document.getElementById('editItemId').value = id;
  document.getElementById('editName').value = item.name;
  document.getElementById('editDescription').value = item.description;
  document.getElementById('editPrice').value = item.price;
  document.getElementById('editCategory').value = item.category;
  document.getElementById('editCondition').value = item.condition;
  document.getElementById('editImage').value = item.image || '';
  document.getElementById('editImageFile').value = '';
  showImagePreview(item.image, 'editImagePreview');

  document.getElementById('editModal').style.display = 'flex';
}

function saveEditedItem() {
  const id = parseInt(document.getElementById('editItemId').value);
  const item = items.find(i => i.id === id);
  if (!item) return;

  item.name = document.getElementById('editName').value;
  item.description = document.getElementById('editDescription').value;
  item.price = parseInt(document.getElementById('editPrice').value);
  item.category = document.getElementById('editCategory').value;
  item.condition = document.getElementById('editCondition').value;
  item.image = document.getElementById('editImage').value;

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
  // Add item image upload
  document.getElementById('itemImageFile').addEventListener('change', (e) => {
    handleImageUpload(e.target.files[0], 'itemImage', 'itemImagePreview');
  });

  // Edit item image upload
  document.getElementById('editImageFile').addEventListener('change', (e) => {
    handleImageUpload(e.target.files[0], 'editImage', 'editImagePreview');
  });
}

// Handle image upload and convert to base64
function handleImageUpload(file, inputId, previewId) {
  if (!file) return;

  // Check file size (max 500KB for base64)
  if (file.size > 500 * 1024) {
    alert('התמונה גדולה מדי! מקסימום 500KB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    document.getElementById(inputId).value = base64;
    document.getElementById(previewId).innerHTML = `<img src="${base64}" alt="preview" style="max-width: 200px; max-height: 150px; border-radius: 8px;">`;
  };
  reader.readAsDataURL(file);
}

// Show image preview
function showImagePreview(imageData, previewId) {
  const preview = document.getElementById(previewId);
  if (imageData) {
    preview.innerHTML = `<img src="${imageData}" alt="preview" style="max-width: 200px; max-height: 150px; border-radius: 8px;">`;
  } else {
    preview.innerHTML = '';
  }
}
