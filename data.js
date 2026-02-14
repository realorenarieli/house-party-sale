// Categories (matching Google Sheet values)
const CATEGORIES = {
  'furniture': { id: 'furniture', name: 'ריהוט', icon: '🪑' },
  'kitchen': { id: 'kitchen', name: 'מטבח', icon: '🍳' },
  'electronic': { id: 'electronic', name: 'אלקטרוניקה', icon: '📺' },
  'vintage': { id: 'vintage', name: 'וינטג׳', icon: '🏺' },
  'other': { id: 'other', name: 'שונות', icon: '📦' }
};

// Condition labels (matching Google Sheet values)
const CONDITIONS = {
  'new': 'חדש',
  'like new': 'כמו חדש',
  'slightly used': 'משומש קלות',
  'used': 'משומש'
};

// Items for sale - add items via admin panel and export to update this array
const SAMPLE_ITEMS = [];

// Storage keys
const STORAGE_KEY = 'housePartySaleItems';
const SETTINGS_KEY = 'housePartySaleSettings';

// Default settings
const DEFAULT_SETTINGS = {
  whatsappNumber: '972527251714',
  partyDate: '20.02.2026',
  partyTime: 'החל מ-15:00',
  partyAddress: 'רחוב ג׳ורג׳ אליוט, קומה 3 דירה 3, תל אביב',
  adminPassword: 'sale2026'
};
