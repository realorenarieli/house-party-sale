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

// Sample items - these will be loaded if localStorage is empty
const SAMPLE_ITEMS = [
  {
    id: 1,
    name: 'ספה תלת מושבית',
    description: 'ספה נוחה בצבע אפור, מושלמת לסלון. קצת שחיקה בפינות אבל עדיין נהדרת!',
    price: 800,
    category: 'furniture',
    condition: 'good',
    image: '',
    sold: false,
    interest: 0
  },
  {
    id: 2,
    name: 'טלוויזיה 42 אינץ\'',
    description: 'סמסונג LED, עובדת מעולה. כולל שלט.',
    price: 400,
    category: 'electronics',
    condition: 'good',
    image: '',
    sold: false,
    interest: 0
  },
  {
    id: 3,
    name: 'מיקסר קנווד',
    description: 'מיקסר מקצועי עם כל האביזרים. כמעט לא השתמשנו.',
    price: 350,
    category: 'kitchen',
    condition: 'likeNew',
    image: '',
    sold: false,
    interest: 0
  },
  {
    id: 4,
    name: 'אוסף ספרי עמוס עוז',
    description: '12 ספרים במצב מושלם. מהדורות ראשונות!',
    price: 200,
    category: 'books',
    condition: 'good',
    image: '',
    sold: false,
    interest: 0
  },
  {
    id: 5,
    name: 'שולחן אוכל + 6 כיסאות',
    description: 'עץ אלון מלא, מרהיב. יש כמה שריטות קטנות.',
    price: 1500,
    category: 'furniture',
    condition: 'good',
    image: '',
    sold: false,
    interest: 0
  },
  {
    id: 6,
    name: 'פלייסטיישן 4',
    description: 'כולל 2 שלטים ו-5 משחקים. עובד מצוין!',
    price: 600,
    category: 'electronics',
    condition: 'good',
    image: '',
    sold: false,
    interest: 0
  },
  {
    id: 7,
    name: 'סט סירים נירוסטה',
    description: 'סט 10 חלקים, איכותי מאוד. קצת סימני שימוש.',
    price: 250,
    category: 'kitchen',
    condition: 'fair',
    image: '',
    sold: false,
    interest: 0
  },
  {
    id: 8,
    name: 'אופניים לילדים',
    description: 'מידה 20, צבע כחול. מושלם לגילאי 6-9.',
    price: 150,
    category: 'toys',
    condition: 'good',
    image: '',
    sold: false,
    interest: 0
  },
  {
    id: 9,
    name: 'ארון בגדים 3 דלתות',
    description: 'ארון גדול עם מראה. צריך לפרק להעברה.',
    price: 500,
    category: 'furniture',
    condition: 'good',
    image: '',
    sold: false,
    interest: 0
  },
  {
    id: 10,
    name: 'מצעים וכריות',
    description: 'סט שלם למיטה זוגית + 4 כריות. נקי ומכובס.',
    price: 100,
    category: 'other',
    condition: 'good',
    image: '',
    sold: false,
    interest: 0
  }
];

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
