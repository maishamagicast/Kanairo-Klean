// Shared kanairo_hotspots contract.
// Builder B (Dashboard) writes to this store from the "Log New Material"
// form; Builder C (Marketplace) and Builder A (Home) read from it for live
// rates/stock. Same shape js/inventory.js already uses:
//   [{ name: string, materials: [{ name: string, quantity: number }] }]

const KEY = 'kanairo_hotspots';
const LOCAL_EVENT = 'kanairo:hotspots-changed';

export function getHotspots() {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveHotspots(hotspots) {
    localStorage.setItem(KEY, JSON.stringify(hotspots));
    // The native "storage" event only fires in OTHER tabs/pages, not this
    // one — dispatch a local event too so same-page islands (e.g. the log
    // form and the Material Mix chart both on Dashboard) stay in sync.
    window.dispatchEvent(new CustomEvent(LOCAL_EVENT));
}

// Fires when this page OR another tab/page changes the store (e.g.
// Dashboard logging inventory while Marketplace is open elsewhere).
// Returns an unsubscribe function.
export function onHotspotsChange(callback) {
    const handler = (e) => {
        if (e.type === LOCAL_EVENT || e.key === KEY) callback(getHotspots());
    };
    window.addEventListener('storage', handler);
    window.addEventListener(LOCAL_EVENT, handler);
    return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(LOCAL_EVENT, handler);
    };
}
