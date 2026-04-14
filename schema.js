/**
 * schema.js — Salon data schema and default factory
 */

export function createEmptySalon() {
  return {
    name: '',
    title: '',
    rating: null,
    reviewCount: null,
    address: '',
    accessShort: '',
    accessFull: '',
    heroCatch: '',
    introText: '',
    messageTitle: '',
    messageText: '',
    homepageUrl: '',
    openingHours: '',
    closedDays: '',
    paymentMethods: '',
    seatCount: '',
    staffCount: '',
    parking: '',
    cutPrice: '',
    features: [],      // { title, text }
    atmosphere: [],    // string[]
    coupons: [],       // { type, categories[], price, title, conditions }
    staff: [],         // { name, specialty, catch, experience }
    stats: {
      firstVisitPrice: '',
      repeatVisitPrice: '',
      genderRatio: { female: null, male: null },
      ageRatio: []     // { label, value }
    }
  };
}
