// Google Maps TypeScript definitions
// This ensures TypeScript recognizes the global google object

declare global {
  interface Window {
    google: typeof google;
  }
}

export {};
