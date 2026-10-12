// Menu data shared by the page renderer, the client cart and the order API
// (the server re-prices every order from this file — client prices are never trusted).

export const ingredients = {
  mayo: { sq: 'Majonezë', en: 'Mayonnaise', it: 'Maionese' },
  olives: { sq: 'Ullinj', en: 'Olives', it: 'Olive' },
  tomato: { sq: 'Domate', en: 'Tomato', it: 'Pomodoro' },
  chicken: { sq: 'Mish pule', en: 'Chicken', it: 'Pollo' },
  fries: { sq: 'Patate', en: 'Fries', it: 'Patatine' },
  gouda: { sq: 'Guda', en: 'Gouda', it: 'Gouda' },
  sujuk: { sq: 'Suxhuk', en: 'Sujuk sausage', it: 'Salsiccia sujuk' },
  chickenHam: { sq: 'Proshutë pule', en: 'Chicken ham', it: 'Prosciutto di pollo' },
  tzatziki: { sq: 'Xaxiq', en: 'Tzatziki', it: 'Tzatziki' },
  lettuce: { sq: 'Sallatë jeshile', en: 'Lettuce', it: 'Lattuga' },
  onion: { sq: 'Qepë', en: 'Onion', it: 'Cipolla' },
  pita: { sq: 'Pite', en: 'Pita', it: 'Pita' },
};

const garnish = ['fries', 'tzatziki', 'pita'];

export const categories = [
  {
    id: 'fastfood',
    icon: 'sandwich',
    name: { sq: 'Fast Food', en: 'Fast Food', it: 'Fast Food' },
    blurb: {
      sq: 'Sanduiçë, sufllaqe dhe skepasti — me patate brenda, ashtu siç duhet.',
      en: 'Sandwiches, gyros & skepasti — fries tucked inside, the Albanian way.',
      it: 'Panini, gyros e skepasti — con le patatine dentro, alla maniera albanese.',
    },
    items: [
      {
        id: 'chicken-sandwich',
        price: 300,
        name: { sq: 'Sanduiç Pule', en: 'Chicken Sandwich', it: 'Panino al Pollo' },
        ingredients: ['mayo', 'olives', 'tomato', 'chicken', 'fries', 'gouda'],
      },
      {
        id: 'spicy-sandwich',
        price: 300,
        spicy: true,
        name: { sq: 'Sanduiç Pikant', en: 'Spicy Sandwich', it: 'Panino Piccante' },
        ingredients: ['mayo', 'olives', 'tomato', 'sujuk', 'fries', 'gouda'],
      },
      {
        id: 'chicken-arabic',
        price: 300,
        name: { sq: 'Arabe Pule', en: 'Chicken Arabic', it: 'Arabo al Pollo' },
        ingredients: ['mayo', 'tomato', 'fries', 'chicken', 'gouda'],
      },
      {
        id: 'chicken-ham-arabic',
        price: 300,
        name: { sq: 'Arabe Proshutë Pule', en: 'Arabic Chicken Ham', it: 'Arabo con Prosciutto di Pollo' },
        ingredients: ['mayo', 'tomato', 'fries', 'chickenHam', 'gouda'],
      },
      {
        id: 'chicken-gyro',
        price: 300,
        name: { sq: 'Sufllaqe Pule', en: 'Chicken Gyro Wrap', it: 'Gyros di Pollo' },
        ingredients: ['tzatziki', 'tomato', 'lettuce', 'onion', 'chicken', 'fries'],
      },
      {
        id: 'chicken-skepasti',
        price: 700,
        name: { sq: 'Skepasti Pule', en: 'Chicken Skepasti', it: 'Skepasti di Pollo' },
        ingredients: ['mayo', 'tomato', 'lettuce', 'chicken', 'gouda', 'fries'],
      },
      {
        id: 'sausage-skepasti',
        price: 650,
        name: { sq: 'Skepasti Suxhuk', en: 'Sausage Skepasti', it: 'Skepasti con Salsiccia' },
        ingredients: ['mayo', 'lettuce', 'tomato', 'sujuk', 'gouda', 'fries'],
      },
      {
        id: 'chicken-calzone',
        price: 550,
        name: { sq: 'Kalzone Pule', en: 'Chicken Calzone', it: 'Calzone al Pollo' },
        ingredients: ['fries', 'chicken', 'sujuk', 'tomato', 'gouda'],
      },
    ],
  },
  {
    id: 'grill',
    icon: 'flame',
    available: false, // grill closed for now: shown as unavailable, can't be ordered. Delete this line to reopen.
    name: { sq: 'Mish & Zgarë', en: 'Meat & Grill', it: 'Carne & Griglia' },
    blurb: {
      sq: 'Direkt nga zgara, me patate, xaxiq dhe pite.',
      en: 'Straight off the grill, served with fries, tzatziki & pita.',
      it: 'Direttamente dalla griglia, con patatine, tzatziki e pita.',
    },
    items: [
      {
        id: 'lamb',
        price: 2200,
        name: { sq: 'Mish Qingji', en: 'Lamb', it: 'Agnello' },
        portion: { sq: '1 kg', en: '1 kg', it: '1 kg' },
        ingredients: [],
      },
      {
        id: 'chicken-fillet',
        price: 900,
        name: { sq: 'Fileto Pule me Garniturë', en: 'Chicken Fillet with Garnish', it: 'Filetto di Pollo con Contorno' },
        ingredients: garnish,
      },
      {
        id: 'grilled-chicken',
        price: 1100,
        name: { sq: 'Pulë Zgare me Patate', en: 'Grilled Chicken with Potatoes', it: 'Pollo alla Griglia con Patate' },
        ingredients: [],
      },
      {
        id: 'chicken-thighs',
        price: 850,
        name: { sq: 'Kofsha Pule me Garniturë', en: 'Chicken Thighs with Garnish', it: 'Cosce di Pollo con Contorno' },
        ingredients: garnish,
      },
      {
        id: 'shish-kebab',
        price: 150,
        name: { sq: 'Shishqebab', en: 'Shish Kebab', it: 'Shish Kebab' },
        portion: { sq: '1 copë', en: '1 piece', it: '1 pezzo' },
        ingredients: [],
      },
      {
        id: 'shish-kebab-garnish',
        price: 900,
        name: { sq: 'Shishqebab me Garniturë', en: 'Shish Kebab with Garnish', it: 'Shish Kebab con Contorno' },
        portion: { sq: '3 copë', en: '3 pieces', it: '3 pezzi' },
        ingredients: garnish,
      },
      {
        id: 'meatballs',
        price: 800,
        name: { sq: 'Qofte me Garniturë', en: 'Meatballs with Garnish', it: 'Polpette con Contorno' },
        portion: { sq: '6 copë', en: '6 pieces', it: '6 pezzi' },
        ingredients: garnish,
      },
    ],
  },
  {
    id: 'meze',
    icon: 'bowl',
    name: { sq: 'Meze', en: 'Sides & Meze', it: 'Contorni & Meze' },
    blurb: {
      sq: 'Shoqëruesit e përsosur për çdo pjatë.',
      en: 'The perfect sides for every plate.',
      it: 'Il contorno perfetto per ogni piatto.',
    },
    items: [
      {
        id: 'tzatziki',
        price: 300,
        name: { sq: 'Xaxiq Racion', en: 'Tzatziki (portion)', it: 'Tzatziki (porzione)' },
        ingredients: [],
      },
      {
        id: 'potatoes',
        price: 250,
        name: { sq: 'Patate Racion', en: 'Potatoes (portion)', it: 'Patate (porzione)' },
        ingredients: [],
      },
    ],
  },
  {
    id: 'drinks',
    icon: 'glass',
    name: { sq: 'Sallata & Pije', en: 'Salads & Drinks', it: 'Insalate & Bevande' },
    blurb: {
      sq: 'Sallata të freskëta, pije të ftohta, kafe dhe birrë.',
      en: 'Fresh salads, cold drinks, coffee & beer.',
      it: 'Insalate fresche, bibite fredde, caffè e birra.',
    },
    items: [
      {
        id: 'salad-olives',
        price: 450,
        name: { sq: 'Sallatë me Ullinj', en: 'Salad with Olives', it: 'Insalata con Olive' },
        ingredients: ['olives', 'onion'],
      },
      {
        id: 'salad',
        price: 300,
        name: { sq: 'Sallatë', en: 'Salad', it: 'Insalata' },
        ingredients: [],
      },
      {
        id: 'water',
        price: 60,
        name: { sq: 'Ujë', en: 'Water', it: 'Acqua' },
        ingredients: [],
      },
      {
        id: 'coffee-drinks',
        priceRange: [70, 250],
        name: { sq: 'Kafe & Pije të Tjera', en: 'Coffee & Other Drinks', it: 'Caffè e Altre Bevande' },
        note: { sq: 'sipas zgjedhjes', en: 'depending on choice', it: 'a seconda della scelta' },
        ingredients: [],
      },
      {
        id: 'beer',
        priceOptions: [100, 150],
        name: { sq: 'Birrë', en: 'Beer', it: 'Birra' },
        note: { sq: 'sipas madhësisë', en: 'by size', it: 'in base al formato' },
        ingredients: [],
      },
    ],
  },
];

// Flat lookup of everything that can be added to an online order (fixed-price items in available categories).
export const orderableItems = Object.fromEntries(
  categories.filter((c) => c.available !== false).flatMap((c) =>
    c.items.filter((i) => typeof i.price === 'number').map((i) => [i.id, { price: i.price, name: i.name, category: c.id }]),
  ),
);
