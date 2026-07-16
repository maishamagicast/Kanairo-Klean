
import { loadSiteData } from './data-loader.jsx';

const KEY = 'kanairo_hotspots';
const LOCAL_EVENT = 'kanairo:hotspots-changed';

export function getHotspots() {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveHotspots(hotspots) {
    localStorage.setItem(KEY, JSON.stringify(hotspots));
    
    window.dispatchEvent(new CustomEvent(LOCAL_EVENT));
}


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


export function aggregateInventory(hotspots) {
    const map = new Map();
    hotspots.forEach((hs) => hs.materials.forEach((m) => {
        map.set(m.name, (map.get(m.name) || 0) + m.quantity);
    }));
    return Array.from(map, ([name, quantity]) => ({ name, quantity }));
}


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


if (localStorage.getItem(KEY) === null) {
    loadSiteData().then((data) => {
        if (localStorage.getItem(KEY) === null && data.defaultHotspots) {
            saveHotspots(data.defaultHotspots);
        }
    });
}