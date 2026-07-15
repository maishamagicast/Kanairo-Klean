// Builder B — Dashboard inventory islands: Material Mix, Current Inventory
// bars, and the Log New Material form. All read/write the real
// kanairo_hotspots store via js/storage.js — no JSX.
import { mount } from './react-shared.js';
import { getHotspots, saveHotspots, onHotspotsChange, aggregateInventory } from './storage.js';
import { getMaterials, getHotspotShowcase } from './market-data.js';

const h = window.React.createElement;
const { useState, useEffect } = window.React;

// Colors are a display concern, not content, so this stays a local map —
// the actual material *names* come from data/site-data.json (via
// getMaterials()) so Marketplace stock lookups and Dashboard logging always
// refer to the same list.
const MATERIAL_COLORS = {
    'PET Plastic': '#22c55e',
    'HDPE Plastic': '#16a34a',
    'E-Waste': '#5a7a5a',
    'Cardboard': '#4ade80',
    'Aluminium': '#86efac',
    'Clear Glass': '#3f6b46',
};

function MaterialMix() {
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
    const donutStyle = { background: inv.length ? `conic-gradient(${stops.join(',')})` : 'rgba(34,197,94,.08)' };

    return h('div', { className: 'mix-wrap' },
        h('div', { className: 'mix-donut', style: donutStyle }),
        h('div', { className: 'mix-legend' },
            inv.length === 0
                ? h('p', { style: { fontSize: '0.78rem', color: 'var(--outline)' } }, 'No inventory logged yet.')
                : inv.map((i) => h('div', { className: 'mix-legend-row', key: i.name },
                    h('span', { className: 'mix-legend-dot', style: { background: MATERIAL_COLORS[i.name] || '#5a7a5a' } }),
                    h('span', null, i.name),
                    h('span', null, `${Math.round((i.quantity / total) * 100)}%`)
                ))
        )
    );
}

function InventoryBars() {
    const [hotspots, setHotspots] = useState(getHotspots());
    useEffect(() => onHotspotsChange(setHotspots), []);

    const inv = aggregateInventory(hotspots);
    const max = Math.max(1, ...inv.map((i) => i.quantity));

    return h('div', { className: 'inv-bars' },
        inv.length === 0
            ? h('p', { style: { fontSize: '0.78rem', color: 'var(--outline)' } }, 'Log a material below to see it here.')
            : inv.map((i) => h('div', { className: 'inv-bar-row', key: i.name },
                h('span', { className: 'inv-bar-mat' }, i.name),
                h('div', { className: 'inv-bar-track' }, h('span', { style: { width: `${Math.round((i.quantity / max) * 100)}%` } })),
                h('span', { className: 'inv-bar-qty' }, `${i.quantity.toLocaleString()} kg`)
            ))
    );
}

function LogMaterialForm() {
    const [hotspotNames, setHotspotNames] = useState([]);
    const [materialNames, setMaterialNames] = useState([]);
    const [hotspot, setHotspot] = useState('');
    const [material, setMaterial] = useState('');
    const [qty, setQty] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        let alive = true;
        getHotspotShowcase().then((hs) => { if (alive) setHotspotNames(hs.map((h) => h.name)); });
        getMaterials().then((m) => { if (alive) setMaterialNames(m.map((x) => x.name)); });
        return () => { alive = false; };
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        const quantity = parseInt(qty, 10);
        if (!hotspot || !material || !quantity) return;

        const hotspots = getHotspots();
        let hs = hotspots.find((x) => x.name === hotspot);
        if (!hs) { hs = { name: hotspot, materials: [] }; hotspots.push(hs); }
        const mat = hs.materials.find((m) => m.name === material);
        if (mat) mat.quantity += quantity; else hs.materials.push({ name: material, quantity });

        saveHotspots(hotspots);
        setStatus(`Logged ${quantity} kg of ${material} at ${hotspot}.`);
        setHotspot('');
        setMaterial('');
        setQty('');
    }

    return h('div', null,
        h('form', { className: 'dash-form', onSubmit: handleSubmit },
            h('div', { className: 'dash-form-field' },
                h('label', { htmlFor: 'hotspot-select' }, 'Hotspot'),
                h('input', {
                    id: 'hotspot-select', type: 'text', list: 'hotspot-list', required: true,
                    placeholder: 'Type or select…', value: hotspot,
                    onChange: (e) => setHotspot(e.target.value),
                }),
                h('datalist', { id: 'hotspot-list' }, hotspotNames.map((n) => h('option', { key: n, value: n })))
            ),
            h('div', { className: 'dash-form-field' },
                h('label', { htmlFor: 'material-select' }, 'Material'),
                h('input', {
                    id: 'material-select', type: 'text', list: 'material-list', required: true,
                    placeholder: 'Type or select…', value: material,
                    onChange: (e) => setMaterial(e.target.value),
                }),
                h('datalist', { id: 'material-list' }, materialNames.map((n) => h('option', { key: n, value: n })))
            ),
            h('div', { className: 'dash-form-field' },
                h('label', { htmlFor: 'quantity-input' }, 'Quantity (kg)'),
                h('input', {
                    id: 'quantity-input', type: 'number', min: 1, required: true,
                    placeholder: 'e.g. 250', value: qty,
                    onChange: (e) => setQty(e.target.value),
                })
            ),
            h('button', { type: 'submit', className: 'btn' }, 'Log Inventory')
        ),
        status && h('p', { className: 'dash-form-status' }, status)
    );
}

mount(MaterialMix, 'material-mix-root');
mount(InventoryBars, 'inventory-bars-root');
mount(LogMaterialForm, 'inventory-form-root');
