// Categories
const CATEGORIES = {
  furniture: { id: 'furniture', name: 'ריהוט', icon: '🪑' },
  electronics: { id: 'electronics', name: 'אלקטרוניקה', icon: '📺' },
  kitchen: { id: 'kitchen', name: 'כלי בית', icon: '🍳' },
  kitchenAppliances: { id: 'kitchenAppliances', name: 'מטבח', icon: '🍽️' },
  books: { id: 'books', name: 'ספרים', icon: '📚' },
  clothes: { id: 'clothes', name: 'ביגוד', icon: '👕' },
  toys: { id: 'toys', name: 'צעצועים', icon: '🎮' },
  plants: { id: 'plants', name: 'צמחים', icon: '🪴' },
  other: { id: 'other', name: 'שונות', icon: '📦' }
};

// Condition labels
const CONDITIONS = {
  new: 'חדש באריזה',
  likeNew: 'כמו חדש',
  good: 'מצב טוב',
  fair: 'מצב סביר'
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
