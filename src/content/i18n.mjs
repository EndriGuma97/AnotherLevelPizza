import { categories, ingredients } from './menu.mjs';
import { googleRating, mentions } from './reviews.mjs';

export const LANGS = ['sq', 'en', 'it'];
export const DEFAULT_LANG = 'sq';

export const LANG_META = {
  // `group` = thousands separator. Set explicitly because some browsers ship without Albanian number data.
  sq: { code: 'sq', label: 'AL', name: 'Shqip', path: '/', locale: 'sq-AL', ogLocale: 'sq_AL', group: ' ' },
  en: { code: 'en', label: 'EN', name: 'English', path: '/en/', locale: 'en-GB', ogLocale: 'en_GB', group: ',' },
  it: { code: 'it', label: 'IT', name: 'Italiano', path: '/it/', locale: 'it-IT', ogLocale: 'it_IT', group: '.' },
};

// UI copy. Every key has all three languages side by side so translations stay in sync.
export const ui = {
  // ---- SEO ----
  'meta.title': {
    sq: 'Another Level Sarandë | Piceria më e mirë & Ushqim i shpejtë',
    en: 'Another Level Saranda | Best Pizza & Fast Food in Saranda',
    it: 'Another Level Saranda | Migliore Pizzeria a Saranda',
  },
  'meta.description': {
    sq: 'Piceria më e mirë në Sarandë: sufllaqe, sanduiçë, skepasti, kalzone dhe mish në zgarë. Ushqim i shpejtë dhe porosi ushqimi online — merre vetë ose me dërgesë.',
    en: 'Best pizza and fast food in Saranda, Albania — gyros, skepasti, calzone & grilled meats made to order. Order online for pickup or delivery, steps from the seafront.',
    it: 'Dove mangiare a Saranda? Pizzeria e fast food con gyros, skepasti, calzone e carne alla griglia. Cibo da asporto e consegna: ordina online in pochi secondi.',
  },
  'meta.ogAlt': {
    sq: 'Tarraca e Another Level në Sarandë në mbrëmje',
    en: 'The Another Level terrace in Saranda at night',
    it: 'La terrazza di Another Level a Saranda di sera',
  },

  // ---- Accessibility ----
  'a11y.skip': { sq: 'Kalo te përmbajtja', en: 'Skip to content', it: 'Vai al contenuto' },
  'a11y.home': { sq: 'Another Level — kreu', en: 'Another Level — home', it: 'Another Level — home' },
  'a11y.increase': { sq: 'Shto një', en: 'Add one', it: 'Aggiungi uno' },
  'a11y.decrease': { sq: 'Hiq një', en: 'Remove one', it: 'Togli uno' },
  'a11y.close': { sq: 'Mbyll', en: 'Close', it: 'Chiudi' },
  'a11y.primaryNav': { sq: 'Navigimi kryesor', en: 'Main navigation', it: 'Navigazione principale' },
  'a11y.menuCategories': { sq: 'Kategoritë e menusë', en: 'Menu categories', it: 'Categorie del menu' },
  'a11y.quickActions': { sq: 'Veprime të shpejta', en: 'Quick actions', it: 'Azioni rapide' },

  // ---- Navigation ----
  'nav.menu': { sq: 'Menuja', en: 'Menu', it: 'Menu' },
  'nav.about': { sq: 'Ambienti', en: 'About', it: 'Il locale' },
  'nav.order': { sq: 'Porosit', en: 'Order', it: 'Ordina' },
  'nav.visit': { sq: 'Na gjeni', en: 'Visit', it: 'Dove siamo' },
  'nav.openMenu': { sq: 'Hap menunë', en: 'Open menu', it: 'Apri il menu' },
  'nav.closeMenu': { sq: 'Mbyll menunë', en: 'Close menu', it: 'Chiudi il menu' },
  'nav.language': { sq: 'Ndrysho gjuhën', en: 'Change language', it: 'Cambia lingua' },

  // ---- Hero ----
  'hero.eyebrow': { sq: 'Piceri & Fast Food në Sarandë', en: 'Pizzeria & Fast Food in Saranda', it: 'Pizzeria & Fast Food a Saranda' },
  'hero.title1': { sq: 'Shijo', en: 'Taste the', it: 'Gusta il' },
  'hero.title2': { sq: 'nivelin tjetër.', en: 'next level.', it: 'prossimo livello.' },
  'hero.subtitle': {
    sq: 'Sufllaqe, skepasti, kalzone dhe mish në zgarë — të përgatitura në çast me përbërës të freskët, vetëm pak hapa nga bregdeti i Sarandës.',
    en: 'Gyros, skepasti, calzone and grilled meats — made to order with fresh ingredients, just a few steps from the Saranda seafront.',
    it: 'Gyros, skepasti, calzone e carne alla griglia — preparati al momento con ingredienti freschi, a pochi passi dal lungomare di Saranda.',
  },
  'hero.ctaMenu': { sq: 'Shiko menunë', en: 'View menu', it: 'Vedi il menu' },
  'hero.ctaOrder': { sq: 'Porosit tani', en: 'Order now', it: 'Ordina ora' },
  'hero.service': { sq: 'Në lokal · Me vete · Dërgesë', en: 'Dine-in · Takeaway · Delivery', it: 'Al tavolo · Da asporto · Consegna' },
  'img.hero': {
    sq: 'Tarraca prej druri e Another Level me tavolina dhe drita në mbrëmje',
    en: 'Another Level’s wooden terrace with tables under warm evening lights',
    it: 'La terrazza in legno di Another Level con tavoli sotto le luci serali',
  },

  // ---- Opening status ----
  'status.open': { sq: 'Hapur tani', en: 'Open now', it: 'Aperto ora' },
  'status.closed': { sq: 'Mbyllur tani', en: 'Closed now', it: 'Chiuso ora' },
  'status.closesAt': { sq: 'mbyll në {time}', en: 'closes at {time}', it: 'chiude alle {time}' },
  'status.opensAt': { sq: 'hap në {time}', en: 'opens at {time}', it: 'apre alle {time}' },

  // ---- About ----
  'about.eyebrow': { sq: 'Ambienti', en: 'The place', it: 'Il locale' },
  'about.title': { sq: 'Ambient modern. Shije e vërtetë.', en: 'Modern space. Honest flavour.', it: 'Ambiente moderno. Sapore autentico.' },
  'about.body': {
    sq: 'Dru i ngrohtë, mure në jeshile ulliri dhe një tarracë e ndriçuar butë — Another Level është vendi ku Saranda vjen për të ngrënë mirë, pa komplikime. Çdo porosi përgatitet në çast: mish nga zgara, patate krokante, xaxiq shtëpie dhe pite e ngrohtë.',
    en: 'Warm wood, olive-green walls and a softly lit terrace — Another Level is where Saranda comes to eat well, without the fuss. Every order is made fresh: meat off the grill, crispy fries, house tzatziki and warm pita.',
    it: 'Legno caldo, pareti verde oliva e una terrazza dalla luce soffusa — Another Level è il posto dove Saranda viene a mangiare bene, senza complicazioni. Ogni ordine è preparato al momento: carne alla griglia, patatine croccanti, tzatziki della casa e pita calda.',
  },
  'about.f1.title': { sq: 'Të freskëta çdo ditë', en: 'Fresh every day', it: 'Freschi ogni giorno' },
  'about.f1.text': {
    sq: 'Perime, salca dhe xaxiq të përgatitura çdo ditë.',
    en: 'Vegetables, sauces and tzatziki prepared daily.',
    it: 'Verdure, salse e tzatziki preparati ogni giorno.',
  },
  'about.f2.title': { sq: 'Gatuar në çast', en: 'Made to order', it: 'Preparato al momento' },
  'about.f2.text': {
    sq: 'Çdo pjatë përgatitet sapo e porosisni.',
    en: 'Every plate is cooked the moment you order.',
    it: 'Ogni piatto viene cucinato appena ordini.',
  },
  'about.f3.title': { sq: 'Tarracë me atmosferë', en: 'A terrace with a vibe', it: 'Una terrazza con atmosfera' },
  'about.f3.text': {
    sq: 'Uluni jashtë në mbrëmjet e ngrohta të Sarandës, pak hapa nga deti.',
    en: 'Sit outside on warm Saranda evenings, steps from the sea.',
    it: 'Siediti all’aperto nelle calde serate di Saranda, a due passi dal mare.',
  },
  'about.hoursBadge': { sq: 'Hapur çdo ditë', en: 'Open every day', it: 'Aperti tutti i giorni' },
  'img.heroPizza': {
    sq: 'Pica që piqet në furrë me dru, me flakë në sfond',
    en: 'Pizza baking in a wood-fired oven with flames behind it',
    it: 'Pizza che cuoce nel forno a legna con le fiamme sullo sfondo',
  },
  'img.about': {
    sq: 'Tarraca e Another Level me tavolina druri, mur të bardhë dhe dritë rrethore',
    en: 'Another Level’s terrace with oak tables, white walls and a round wall light',
    it: 'La terrazza di Another Level con tavoli in rovere, pareti bianche e lampada circolare',
  },

  // ---- Menu ----
  'menu.eyebrow': { sq: 'Menuja', en: 'The menu', it: 'Il menu' },
  'menu.title': { sq: 'Çfarë të shijosh sot?', en: 'What are you craving?', it: 'Di cosa hai voglia?' },
  'menu.subtitle': {
    sq: 'Çmimet janë në Lekë. Shtyp + për të shtuar pjata në porosinë tënde.',
    en: 'Prices in Albanian Lekë (ALL). Tap + to add dishes to your order.',
    it: 'Prezzi in Lek albanesi (ALL). Tocca + per aggiungere i piatti al tuo ordine.',
  },
  'menu.pizza.title': { sq: 'Pica nga furra jonë', en: 'Pizza from our oven', it: 'Pizza dal nostro forno' },
  'menu.pizza.text': {
    sq: 'Margarita, pica e shtëpisë “Another”, pica me salçiçe e më shumë. Pyetni për zgjedhjen e ditës.',
    en: 'Margherita, our house “Another” pizza, sausage pizza and more. Ask us for today’s selection.',
    it: 'Margherita, la nostra pizza della casa “Another”, pizza con salsiccia e altro. Chiedici la selezione del giorno.',
  },
  'menu.pizza.cta': { sq: 'Pyet në WhatsApp', en: 'Ask on WhatsApp', it: 'Chiedi su WhatsApp' },
  'menu.add': { sq: 'Shto', en: 'Add', it: 'Aggiungi' },
  'menu.spicy': { sq: 'Pikant', en: 'Spicy', it: 'Piccante' },
  'menu.inStore': { sq: 'Pyetni në lokal', en: 'Ask in store', it: 'Chiedi al locale' },
  'menu.currency': { sq: 'Lekë', en: 'Lekë', it: 'Lekë' },

  // ---- Reviews ----
  'reviews.eyebrow': { sq: 'Vlerësimet', en: 'Reviews', it: 'Recensioni' },
  'reviews.title': { sq: 'Të dashur nga klientët.', en: 'Loved by our guests.', it: 'Amati dai nostri clienti.' },
  'reviews.subtitle': {
    sq: 'Vlerësimi ynë në Google Maps — nga banorët e Sarandës dhe nga turistët që na vizitojnë.',
    en: 'Our rating on Google Maps — from Saranda locals and the travellers who visit us.',
    it: 'La nostra valutazione su Google Maps — da chi vive a Saranda e dai viaggiatori che ci visitano.',
  },
  'reviews.count': { sq: '{count} vlerësime në Google', en: '{count} reviews on Google', it: '{count} recensioni su Google' },
  'reviews.score': { sq: '{rating}', en: '{rating}', it: '{rating}' },
  'reviews.outOf': { sq: 'nga 5', en: 'out of 5', it: 'su 5' },
  'reviews.ratingLabel': { sq: 'Vlerësimi {rating} nga 5', en: 'Rated {rating} out of 5', it: 'Valutazione {rating} su 5' },
  'reviews.mentionsTitle': { sq: 'Çfarë përmendin më shumë klientët', en: 'What guests mention most', it: 'Cosa citano di più i clienti' },
  'reviews.mentionUnit': { sq: 'vlerësime', en: 'reviews', it: 'recensioni' },
  'reviews.cta': { sq: 'Lexo vlerësimet në Google', en: 'Read the reviews on Google', it: 'Leggi le recensioni su Google' },
  'reviews.source': { sq: 'Vlerësim në Google', en: 'Google review', it: 'Recensione Google' },
  'reviews.hero': {
    sq: '{rating} në Google · {count} vlerësime',
    en: '{rating} on Google · {count} reviews',
    it: '{rating} su Google · {count} recensioni',
  },

  // ---- Order ----
  'order.eyebrow': { sq: 'Porosi online', en: 'Order online', it: 'Ordine online' },
  'order.title': { sq: 'Porosit në pak sekonda.', en: 'Order in seconds.', it: 'Ordina in pochi secondi.' },
  'order.subtitle': {
    sq: 'Zgjidh nga menuja ose shkruaj çfarë dëshiron. Do t’ju telefonojmë menjëherë për ta konfirmuar.',
    en: 'Pick from the menu or just tell us what you’d like. We’ll call you right back to confirm.',
    it: 'Scegli dal menu o scrivici cosa desideri. Ti richiamiamo subito per confermare.',
  },
  'order.step1': { sq: 'Zgjidh pjatat', en: 'Choose your dishes', it: 'Scegli i piatti' },
  'order.step2': { sq: 'Dërgo porosinë', en: 'Send your order', it: 'Invia l’ordine' },
  'order.step3': { sq: 'Të telefonojmë për konfirmim', en: 'We call you to confirm', it: 'Ti chiamiamo per confermare' },
  'order.talk': { sq: 'Preferoni të flisni?', en: 'Prefer to talk?', it: 'Preferisci parlare?' },
  'order.call': { sq: 'Telefononi', en: 'Call us', it: 'Chiamaci' },
  'order.whatsapp': { sq: 'WhatsApp', en: 'WhatsApp', it: 'WhatsApp' },
  'order.wolt': { sq: 'Porosit në Wolt', en: 'Order on Wolt', it: 'Ordina su Wolt' },
  'order.cartTitle': { sq: 'Porosia juaj', en: 'Your order', it: 'Il tuo ordine' },
  'order.cartEmpty': {
    sq: 'Ende asgjë. Shtyp + te menuja për të shtuar pjata.',
    en: 'Nothing here yet. Tap + on the menu to add dishes.',
    it: 'Ancora niente. Tocca + nel menu per aggiungere i piatti.',
  },
  'order.browse': { sq: 'Shiko menunë', en: 'Browse the menu', it: 'Sfoglia il menu' },
  'order.total': { sq: 'Totali', en: 'Total', it: 'Totale' },
  'order.clear': { sq: 'Pastro', en: 'Clear', it: 'Svuota' },
  'order.item1': { sq: '1 artikull', en: '1 item', it: '1 articolo' },
  'order.itemN': { sq: '{n} artikuj', en: '{n} items', it: '{n} articoli' },
  'order.typeLabel': { sq: 'Mënyra e marrjes', en: 'Order type', it: 'Tipo di ordine' },
  'order.pickup': { sq: 'Marr vetë', en: 'Pickup', it: 'Ritiro' },
  'order.delivery': { sq: 'Dërgesë', en: 'Delivery', it: 'Consegna' },
  'order.name': { sq: 'Emri', en: 'Name', it: 'Nome' },
  'order.namePh': { sq: 'Emri dhe mbiemri', en: 'Your full name', it: 'Nome e cognome' },
  'order.phone': { sq: 'Numri i telefonit', en: 'Phone number', it: 'Numero di telefono' },
  'order.phonePh': { sq: 'p.sh. 069 123 4567', en: 'e.g. +44 7700 900123', it: 'es. +39 333 123 4567' },
  'order.address': { sq: 'Adresa e dërgesës', en: 'Delivery address', it: 'Indirizzo di consegna' },
  'order.addressPh': {
    sq: 'Rruga, hoteli ose apartamenti, nr. i dhomës…',
    en: 'Street, hotel or apartment, room number…',
    it: 'Via, hotel o appartamento, numero di camera…',
  },
  'order.details': { sq: 'Detajet e porosisë', en: 'Order details', it: 'Dettagli dell’ordine' },
  'order.detailsPh': {
    sq: 'p.sh. 2 sufllaqe pule pa qepë, 1 patate racion…',
    en: 'e.g. 2 chicken gyros without onion, 1 portion of fries…',
    it: 'es. 2 gyros di pollo senza cipolla, 1 porzione di patatine…',
  },
  'order.detailsHint': {
    sq: 'Opsionale nëse keni zgjedhur nga menuja.',
    en: 'Optional if you picked dishes from the menu.',
    it: 'Facoltativo se hai scelto i piatti dal menu.',
  },
  'order.optional': { sq: 'opsionale', en: 'optional', it: 'facoltativo' },
  'order.submit': { sq: 'Dërgo porosinë', en: 'Send order', it: 'Invia ordine' },
  'order.sending': { sq: 'Duke dërguar…', en: 'Sending…', it: 'Invio in corso…' },
  'order.privacy': {
    sq: 'Të dhënat tuaja përdoren vetëm për të përpunuar këtë porosi.',
    en: 'We only use your details to handle this order.',
    it: 'Usiamo i tuoi dati solo per gestire questo ordine.',
  },
  'order.added': { sq: 'u shtua në porosi', en: 'added to your order', it: 'aggiunto all’ordine' },

  // ---- Validation & toasts ----
  'err.name': { sq: 'Shkruani emrin tuaj.', en: 'Please enter your name.', it: 'Inserisci il tuo nome.' },
  'err.phone': {
    sq: 'Shkruani një numër telefoni të vlefshëm.',
    en: 'Please enter a valid phone number.',
    it: 'Inserisci un numero di telefono valido.',
  },
  'err.details': {
    sq: 'Shtoni pjata nga menuja ose shkruani porosinë.',
    en: 'Add dishes from the menu or describe your order.',
    it: 'Aggiungi piatti dal menu o descrivi il tuo ordine.',
  },
  'err.address': {
    sq: 'Shkruani adresën për dërgesën.',
    en: 'Please enter a delivery address.',
    it: 'Inserisci l’indirizzo di consegna.',
  },
  'toast.success': {
    sq: 'Faleminderit! Porosia u dërgua — do t’ju telefonojmë së shpejti.',
    en: 'Thank you! Your order is in — we’ll call you shortly to confirm.',
    it: 'Grazie! Ordine ricevuto — ti chiameremo a breve per confermare.',
  },
  'toast.error': {
    sq: 'Porosia nuk u dërgua. Provoni përsëri ose na telefononi.',
    en: 'We couldn’t send your order. Please try again or call us.',
    it: 'Non siamo riusciti a inviare l’ordine. Riprova o chiamaci.',
  },
  'toast.rate': {
    sq: 'Shumë tentativa. Prisni pak ose na telefononi.',
    en: 'Too many attempts. Please wait a moment or call us.',
    it: 'Troppi tentativi. Attendi un momento o chiamaci.',
  },
  'toast.invalid': { sq: 'Kontrolloni fushat e shënuara.', en: 'Please check the highlighted fields.', it: 'Controlla i campi evidenziati.' },

  // ---- Visit ----
  'visit.eyebrow': { sq: 'Na gjeni', en: 'Find us', it: 'Dove siamo' },
  'visit.title': { sq: 'Pak hapa nga deti.', en: 'Steps from the sea.', it: 'A due passi dal mare.' },
  'visit.subtitle': {
    sq: 'Në zemër të Sarandës — ejani për një vakt të shpejtë ose uluni në tarracë me miqtë.',
    en: 'In the heart of Saranda — drop in for a quick bite or settle in on the terrace with friends.',
    it: 'Nel cuore di Saranda — passa per uno spuntino veloce o accomodati in terrazza con gli amici.',
  },
  'visit.address': { sq: 'Adresa', en: 'Address', it: 'Indirizzo' },
  'visit.country': { sq: 'Shqipëri', en: 'Albania', it: 'Albania' },
  'visit.directions': { sq: 'Merr udhëzimet', en: 'Get directions', it: 'Indicazioni' },
  'visit.hours': { sq: 'Orari', en: 'Opening hours', it: 'Orari' },
  'visit.everyday': { sq: 'Çdo ditë', en: 'Every day', it: 'Tutti i giorni' },
  'visit.contact': { sq: 'Kontakt', en: 'Contact', it: 'Contatti' },
  'visit.follow': { sq: 'Na ndiqni', en: 'Follow us', it: 'Seguici' },
  'visit.showMap': { sq: 'Shfaq hartën', en: 'Show map', it: 'Mostra la mappa' },
  'visit.openMaps': { sq: 'Hap në Google Maps', en: 'Open in Google Maps', it: 'Apri in Google Maps' },
  'visit.mapTitle': { sq: 'Harta e Another Level në Sarandë', en: 'Map of Another Level in Saranda', it: 'Mappa di Another Level a Saranda' },
  'visit.mapNote': {
    sq: 'Harta ngarkohet nga Google vetëm kur e hapni.',
    en: 'The map loads from Google only when you open it.',
    it: 'La mappa viene caricata da Google solo quando la apri.',
  },

  // ---- Footer ----
  'footer.tagline': {
    sq: 'Piceri & fast food në Sarandë, Shqipëri.',
    en: 'Pizzeria & fast food in Saranda, Albania.',
    it: 'Pizzeria e fast food a Saranda, Albania.',
  },
  'footer.explore': { sq: 'Eksploro', en: 'Explore', it: 'Esplora' },
  'footer.rights': { sq: 'Të gjitha të drejtat e rezervuara.', en: 'All rights reserved.', it: 'Tutti i diritti riservati.' },
  'footer.top': { sq: 'Kthehu lart', en: 'Back to top', it: 'Torna su' },

  // ---- Mobile bottom bar ----
  'bar.call': { sq: 'Telefono', en: 'Call', it: 'Chiama' },
  'bar.whatsapp': { sq: 'WhatsApp', en: 'WhatsApp', it: 'WhatsApp' },
  'bar.order': { sq: 'Porosit', en: 'Order', it: 'Ordina' },

  // ---- Language hint (shown in the *suggested* language) ----
  'hint.offer': {
    sq: 'Kjo faqe është edhe në shqip.',
    en: 'This page is also available in English.',
    it: 'Questa pagina è disponibile anche in italiano.',
  },
  'hint.switch': { sq: 'Kalo në shqip', en: 'Switch to English', it: 'Passa all’italiano' },

  // ---- WhatsApp prefill ----
  'wa.text': {
    sq: 'Përshëndetje Another Level! Dua të bëj një porosi:',
    en: 'Hi Another Level! I’d like to place an order:',
    it: 'Ciao Another Level! Vorrei fare un ordine:',
  },
  'wa.pizza': {
    sq: 'Përshëndetje! Çfarë picash keni sot?',
    en: 'Hi! Which pizzas do you have today?',
    it: 'Ciao! Quali pizze avete oggi?',
  },
};

// Flattens UI copy + menu copy into one { key: string } dictionary per language.
export function dictFor(lang) {
  const out = {};
  const rating = lang === 'en' ? String(googleRating.value) : String(googleRating.value).replace('.', ',');
  for (const [key, values] of Object.entries(ui)) {
    out[key] = values[lang].replaceAll('{rating}', rating).replaceAll('{count}', String(googleRating.count));
  }
  for (const m of mentions) out[`mention.${m.id}`] = m.label[lang];
  for (const [id, values] of Object.entries(ingredients)) out[`ing.${id}`] = values[lang];
  for (const cat of categories) {
    out[`cat.${cat.id}.name`] = cat.name[lang];
    out[`cat.${cat.id}.blurb`] = cat.blurb[lang];
    for (const item of cat.items) {
      out[`item.${item.id}.name`] = item.name[lang];
      // Tourists see the original Albanian name too, so they can point at it on the board.
      out[`item.${item.id}.sub`] = lang === 'sq' ? '' : item.name.sq;
      if (item.portion) out[`item.${item.id}.portion`] = item.portion[lang];
      if (item.note) out[`item.${item.id}.note`] = item.note[lang];
    }
  }
  return out;
}

export function formatPrice(lang, value) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, LANG_META[lang].group);
}
