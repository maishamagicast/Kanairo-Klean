// Market reference data — fetched from data/site-data.json, not hardcoded.
// Read by Home, Dashboard, and Marketplace islands. Live inventory
// (kanairo_hotspots) is layered on top of this via js/storage.js; this file
// is just the market-rate / hotspot-showcase side.
import { loadSiteData } from './data-loader.js';

export async function getMaterials() {
    const data = await loadSiteData();
    return data.materials;
}

export async function getHotspotShowcase() {
    const data = await loadSiteData();
    return data.hotspots;
}

export function simulatePrices(materials) {
    return materials.map((m) => {
        const delta = (Math.random() - 0.46) * (m.price * 0.025);
        const newPrice = Math.max(1, m.price + delta);
        return {
            ...m,
            price: parseFloat(newPrice.toFixed(1)),
            change: parseFloat((m.change + delta * 0.2).toFixed(1)),
            trend: delta >= 0 ? 'up' : 'down',
        };
    });
}
