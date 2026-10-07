// Business facts — single source of truth for the page, JSON-LD and the order e-mails.
export const site = {
  name: 'Another Level',
  legalName: 'Pizzeri Fast Food Another Level',
  phone: '+355697649035',
  phoneDisplay: '+355 69 764 9035',
  whatsapp: '355697649035',
  address: {
    locality: 'Sarandë',
    region: 'Vlorë',
    regionCode: 'AL-12',
    postalCode: '9702',
    country: 'AL',
    plusCode: 'V2G3+MM',
  },
  geo: { lat: 39.8766471, lng: 20.0041593 },
  mapsUrl: 'https://maps.app.goo.gl/ggRdf2WediYTasjy5',
  mapsEmbed: 'https://maps.google.com/maps?q=39.8766471,20.0041593&z=17&hl=en&output=embed',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=39.8766471%2C20.0041593',
  instagram: 'https://www.instagram.com/pizzeri_fastfood_another_level/',
  facebook: 'https://www.facebook.com/profile.php?id=100071159112562',
  wolt: 'https://wolt.com/en/alb/sarande/restaurant/another-level-pizza',
  // Open every day; closing time is after midnight.
  hours: { opens: '11:00', closes: '01:30' },
  timezone: 'Europe/Tirane',
};
