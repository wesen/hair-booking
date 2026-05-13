// lib/targets.js — Target registry for Fringe intake screens
// Loaded by verbs and scripts; single source of truth for page metadata.

const MOBILE_SCREENS = [
  { page: 'service',  path: '/standalone/mobile/01-service.html',  selector: '[data-screen-label="01 · Service"]',  label: '01 · Service' },
  { page: 'color',    path: '/standalone/mobile/02-color.html',    selector: '[data-screen-label="02 · Color"]',    label: '02 · Color' },
  { page: 'length',   path: '/standalone/mobile/03-length.html',   selector: '[data-screen-label="03 · Length"]',   label: '03 · Length' },
  { page: 'photos',   path: '/standalone/mobile/04-photos.html',   selector: '[data-screen-label="04 · Photos"]',   label: '04 · Photos' },
  { page: 'history',  path: '/standalone/mobile/05-history.html',  selector: '[data-screen-label="05 · History"]',  label: '05 · History' },
  { page: 'budget',   path: '/standalone/mobile/06-budget.html',   selector: '[data-screen-label="06 · Budget"]',   label: '06 · Budget' },
  { page: 'estimate', path: '/standalone/mobile/07-estimate.html', selector: '[data-screen-label="07 · Estimate"]', label: '07 · Estimate' },
  { page: 'booking',  path: '/standalone/mobile/08-booking.html',  selector: '[data-screen-label="08 · Booking"]',  label: '08 · Booking' },
  { page: 'confirm',  path: '/standalone/mobile/09-confirm.html',  selector: '[data-screen-label="09 · Confirm"]',  label: '09 · Confirm' },
];

const DESKTOP_SCREENS = [
  { page: 'estimate-butter', path: '/standalone/desktop/07-estimate-butter.html', selector: '[data-screen-label="07 · Estimate — Butter"]', label: '07 · Estimate — Butter' },
  { page: 'booking-sage',    path: '/standalone/desktop/08-booking-sage.html',    selector: '[data-screen-label="08 · Booking — Sage"]',  label: '08 · Booking — Sage' },
  { page: 'confirm-butter',  path: '/standalone/desktop/09-confirm-butter.html',  selector: '[data-screen-label="09 · Confirm — Butter"]', label: '09 · Confirm — Butter' },
];

const DEFAULTS = {
  prototypeBase: 'http://localhost:7071',
  mobileViewport: { width: 390, height: 844 },
  desktopViewport: { width: 1440, height: 900 },
  waitMs: 2000,
  threshold: 30,
};

module.exports = {
  MOBILE_SCREENS,
  DESKTOP_SCREENS,
  ALL_SCREENS: [...MOBILE_SCREENS, ...DESKTOP_SCREENS],
  DEFAULTS,
  findPage: (name) => [...MOBILE_SCREENS, ...DESKTOP_SCREENS].find(t => t.page === name),
  mobileTargets: () => MOBILE_SCREENS,
  desktopTargets: () => DESKTOP_SCREENS,
};
