// src/components/DashboardInventory.jsx
import React, { useState, useEffect } from 'react';
import { getHotspots, saveHotspots, onHotspotsChange, aggregateInventory } from '../utils/storage.jsx';
import { getMaterials, getHotspotShowcase } from '../utils/marketData.jxs';

const MATERIAL_COLORS = {
    'PET Plastic': '#22c55e',
    'HDPE Plastic': '#16a34a',
    'E-Waste': '#5a7a5a',
    'Cardboard': '#4ade80',
    'Aluminium': '#86efac',
    'Clear Glass': '#3f6b46',
};

export function MaterialMix() {
    const [hotspots, setHotspots] = useState(getHotspots());
    
    useEffect(() => onHotspotsChange(setHotspots), []);

    const inv = aggregateInventory(hotspots);
    const total = inv.reduce((s, i) => s + i.quantity, 0) || 1;
    let cursor = 0;

    const stops = inv.map((i) => {
        const pct = (i.quantity / total) * 100;
        const color = MATERIAL_COLORS[i.name] || '#5a7a5a';
        const seg = `${color} ${cursor}% ${cursor + pct}%`;
        cursor += pct;
        return seg;
    });

    const donutStyle = { 
        background: inv.length ? `conic-gradient(${stops.join(',')})` : 'rgba(34,197,94,.08)' 
    };

    return (
        <div className="mix-wrap">
            <div className="mix-donut" style={donutStyle} />
            <div className="mix-legend">
                {inv.length === 0 ? (
                    <p style={{ fontSize: '0.78rem', color: 'var(--outline)' }}>
                        No inventory logged yet.
                    </p>
                ) : (
                    inv.map((i) => (
                        <div className="mix-legend-row" key={i.name}>
                            <span 
                                className="mix-legend-dot" 
                                style={{ background: MATERIAL_COLORS[i.name] || '#5a7a5a' }} 
                            />
                            <span>{i.name}</span>
                            <span>{Math.round((i.quantity / total) * 100)}%</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function InventoryBars() {
    const [hotspots, setHotspots] = useState(getHotspots());
    
    useEffect(() => onHotspotsChange(setHotspots), []);

    const inv = aggregateInventory(hotspots);
    const max = Math.max(1, ...inv.map((i) => i.quantity));

    return (
        <div className="inv-bars">
            {inv.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: 'var(--outline)' }}>
                    Log a material below to see it here.
                </p>
            ) : (
                inv.map((i) => (
                    <div className="inv-bar-row" key={i.name}>
                        <span className="inv-bar-mat">{i.name}</span>
                        <div className="inv-bar-track">
                            <span style={{ width: `${Math.round((i.quantity / max) * 100)}%` }} />
                        </div>
                        <span className="inv-bar-qty">{i.quantity.toLocaleString()} kg</span>
                    </div>
                ))
            )}
        </div>
    );
}

export function LogMaterialForm() {
    const [hotspotNames, setHotspotNames] = useState([]);
    const [materialNames, setMaterialNames] = useState([]);
    const [hotspot, setHotspot] = useState('');
    const [material, setMaterial] = useState('');
    const [qty, setQty] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        let alive = true;
        getHotspotShowcase().then((hs) => { 
            if (alive) setHotspotNames(hs.map((h) => h.name)); 
        });
        getMaterials().then((m) => { 
            if (alive) setMaterialNames(m.map((x) => x.name)); 
        });
        return () => { alive = false; };
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        const quantity = parseInt(qty, 10);
        if (!hotspot || !material || !quantity) return;

        const hotspots = getHotspots();
        let hs = hotspots.find((x) => x.name === hotspot);
        if (!hs) { 
            hs = { name: hotspot, materials: [] }; 
            hotspots.push(hs); 
        }
        const mat = hs.materials.find((m) => m.name === material);
        if (mat) {
            mat.quantity += quantity; 
        } else {
            hs.materials.push({ name: material, quantity });
        }

        saveHotspots(hotspots);
        setStatus(`Logged ${quantity} kg of ${material} at ${hotspot}.`);
        setHotspot('');
        setMaterial('');
        setQty('');
    }

    return (
        <div>
            <form className="dash-form" onSubmit={handleSubmit}>
                <div className="dash-form-field">
                    <label htmlFor="hotspot-select">Hotspot</label>
                    <input
                        id="hotspot-select"
                        type="text"
                        aria-label="Hotspot list input"
                        list="hotspot-list"
                        required
                        placeholder="Type or select…"
                        value={hotspot}
                        onChange={(e) => setHotspot(e.target.value)}
                    />
                    <datalist id="hotspot-list">
                        {hotspotNames.map((n) => <option key={n} value={n} />)}
                    </datalist>
                </div>
                
                <div className="dash-form-field">
                    <label htmlFor="material-select">Material</label>
                    <input
                        id="material-select"
                        type="text"
                        aria-label="Material list input"
                        list="material-list"
                        required
                        placeholder="Type or select…"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                    />
                    <datalist id="material-list">
                        {materialNames.map((n) => <option key={n} value={n} />)}
                    </datalist>
                </div>

                <div className="dash-form-field">
                    <label htmlFor="quantity-input">Quantity (kg)</label>
                    <input
                        id="quantity-input"
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 250"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn">Log Inventory</button>
            </form>
            {status && <p className="dash-form-status">{status}</p>}
        </div>
    );
}