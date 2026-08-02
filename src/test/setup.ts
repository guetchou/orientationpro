import '@testing-library/jest-dom'

// Mock des API du navigateur pour les tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock des notifications
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    permission: 'default',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  },
});

// Mock du service worker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: vi.fn().mockResolvedValue({}),
    ready: Promise.resolve({}),
    controller: null,
  },
});

// Mock de l'orientation de l'écran
Object.defineProperty(screen, 'orientation', {
  writable: true,
  value: {
    type: 'portrait-primary',
    angle: 0,
    lock: vi.fn(),
    unlock: vi.fn(),
  },
});

// Mock des événements tactiles
Object.defineProperty(window, 'ontouchstart', {
  writable: true,
  value: {},
});

// Mock de la géolocalisation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
});

// Mock de la connexion réseau
Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  },
});

// Polyfills requis par Radix UI (ex. Select) dans jsdom, qui n'implémente pas
// l'API Pointer Events ni scrollIntoView.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
