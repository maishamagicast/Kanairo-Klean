// Shared kanairo_hotspots contract.
// Builder B (Dashboard) writes to this store from the "Log New Material"
// form; Builder C (Marketplace) and Builder A (Home) read from it for live
// rates/stock. Same shape js/inventory.js already uses:
//   [{ name: string, materials: [{ name: string, quantity: number }] }]

const KEY = 'kanairo_hotspots';

export function getHotspots() {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveHotspots(hotspots) {
    localStorage.setItem(KEY, JSON.stringify(hotspots));
}

// Fires when another tab/page changes the store (e.g. Dashboard logging
// inventory while Marketplace is open). Returns an unsubscribe function.
export function onHotspotsChange(callback) {
    const handler = (e) => {
        if (e.key === KEY) callback(getHotspots());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
}
