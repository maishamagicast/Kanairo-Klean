// Shared market reference data — read by Home, Dashboard, and Marketplace
// islands. Live inventory (kanairo_hotspots) is layered on top of this via
// js/storage.js; this file is just the market-rate side.

export const MATERIALS = [
    { id: 'PET', name: 'PET Plastic', price: 28.5, unit: 'KES/kg', change: 2.3, trend: 'up' },
    { id: 'HDPE', name: 'HDPE Plastic', price: 35.0, unit: 'KES/kg', change: -0.8, trend: 'down' },
    { id: 'EWASTE', name: 'E-Waste', price: 120.0, unit: 'KES/kg', change: 5.1, trend: 'up' },
    { id: 'PAPER', name: 'Cardboard', price: 12.0, unit: 'KES/kg', change: 0.5, trend: 'up' },
    { id: 'ALU', name: 'Aluminium', price: 85.0, unit: 'KES/kg', change: -1.2, trend: 'down' },
    { id: 'GLASS', name: 'Clear Glass', price: 8.5, unit: 'KES/kg', change: 0.2, trend: 'up' },
];

export const HOTSPOTS = [
    { name: 'Dandora', material: 'Mixed Plastic', activity: 94, stock: 2840, active: true },
    { name: 'Gikomba', material: 'Textile & Paper', activity: 78, stock: 1920, active: true },
    { name: 'Industrial Area', material: 'E-Waste', activity: 87, stock: 640, active: true },
    { name: 'Kibera', material: 'PET Bottles', activity: 65, stock: 1100, active: false },
    { name: 'Westlands', material: 'HDPE', activity: 52, stock: 740, active: false },
    { name: 'Eastleigh', material: 'Aluminium', activity: 71, stock: 430, active: true },
    { name: 'Karen', material: 'Clear Glass', activity: 41, stock: 290, active: false },
    { name: 'Ruiru', material: 'Cardboard', activity: 83, stock: 3200, active: true },
];

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
