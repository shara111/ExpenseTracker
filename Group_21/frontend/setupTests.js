import "@testing-library/jest-dom";

// Polyfill localStorage/sessionStorage for tests if not present
const createStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (i) => Object.keys(store)[i] || null,
    get length() {
      return Object.keys(store).length;
    },
  };
};

if (typeof window !== "undefined") {
  if (!("localStorage" in window) || !window.localStorage) {
    Object.defineProperty(window, "localStorage", {
      value: createStorageMock(),
      configurable: true,
      writable: true,
    });
  }
  if (!("sessionStorage" in window) || !window.sessionStorage) {
    Object.defineProperty(window, "sessionStorage", {
      value: createStorageMock(),
      configurable: true,
      writable: true,
    });
  }

  // Ensure globalThis has the same references for tests that access global localStorage
  if (typeof globalThis !== "undefined") {
    globalThis.localStorage = window.localStorage;

    globalThis.sessionStorage = window.sessionStorage;
  }

  // Mock ResizeObserver used by libraries like recharts
  if (typeof window.ResizeObserver === "undefined") {
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.ResizeObserver = ResizeObserver;
    if (typeof globalThis !== "undefined") {
      globalThis.ResizeObserver = ResizeObserver;
    }
  }
}
