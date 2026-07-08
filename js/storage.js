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

// Totals per material name, summed across every hotspot — shared by
// Dashboard (Material Mix / Inventory bars) and Marketplace (stock per
// price card).
export function aggregateInventory(hotspots) {
    const map = new Map();
    hotspots.forEach((hs) => hs.materials.forEach((m) => {
        map.set(m.name, (map.get(m.name) || 0) + m.quantity);
    }));
    return Array.from(map, ([name, quantity]) => ({ name, quantity }));
}

// Deducts a purchased quantity from the store, spread across whichever
// hotspots hold it (used by the Marketplace "Buy Now" flow).
export function deductInventory(materialName, quantity) {
    const hotspots = getHotspots();
    let remaining = quantity;
    for (const hs of hotspots) {
        for (const mat of hs.materials) {
            if (mat.name === materialName && mat.quantity > 0 && remaining > 0) {
                const take = Math.min(mat.quantity, remaining);
                mat.quantity -= take;
                remaining -= take;
            }
        }
    }
    saveHotspots(hotspots);
}
