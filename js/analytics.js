// Builder B — Dashboard analytics islands: KPIs, charts, hub map, activity
// feed, transactions table. No JSX.
import { Dot, Pill, mount } from './react-shared.js';
import { getHotspots, onHotspotsChange } from './storage.js';
import { MATERIALS, simulatePrices } from './market-data.js';

const h = window.React.createElement;
const { useState, useEffect } = window.React;

function SidebarRates() {
    const [prices, setPrices] = useState(MATERIALS.slice(0, 4));

    useEffect(() => {
        const iv = setInterval(() => setPrices((p) => simulatePrices(p)), 2800);
        return () => clearInterval(iv);
    }, []);

    return h('div', null, prices.map((m) => h('div', { className: 'sidebar-rate-row', key: m.id },
        h('span', { className: 'sidebar-rate-id' }, m.id),
        h('div', { className: 'sidebar-rate-price' },
            h('span', null, m.price.toFixed(1)),
            h('span', { className: `arrow ${m.trend}` }, m.trend === 'up' ? '▲' : '▼')
        )
    )));
}

function KPIRow() {
    const [hotspots, setHotspots] = useState(getHotspots());
    useEffect(() => onHotspotsChange(setHotspots), []);

    const totalKg = hotspots.reduce((s, hs) => s + hs.materials.reduce((s2, m) => s2 + m.quantity, 0), 0);
    const activeHubs = hotspots.length;

    const kpis = [
        { label: "Today's Revenue", value: 'KES 89,400', change: '+18.4%', pos: true, spark: [42, 51, 38, 67, 72, 58, 89] },
        { label: 'Weight Collected', value: `${totalKg.toLocaleString()} kg`, change: '+24.1%', pos: true, spark: [62, 79, 51, 94, 100, 86, 100] },
        { label: 'Transactions', value: '113', change: '+19.1%', pos: true, spark: [48, 61, 39, 82, 94, 71, 100] },
        { label: 'Active Hubs', value: `${activeHubs} / 8`, change: activeHubs < 8 ? `${8 - activeHubs} offline` : 'all online', pos: activeHubs >= 6, spark: [8, 8, 7, 8, 8, 6, 5] },
    ];

    return h('div', { className: 'kpi-row' }, kpis.map((k, i) => h('div', { className: 'kpi-card', key: i },
        h('div', { className: 'kpi-label' }, h(Dot), k.label),
        h('div', { className: 'kpi-value' }, k.value),
        h('div', { className: `kpi-change ${k.pos ? 'pos' : 'neg'}` }, `${k.pos ? '▲' : '–'} ${k.change}`),
        h('div', { className: 'kpi-spark' }, k.spark.map((v, j) => h('span', {
            key: j,
            className: j === k.spark.length - 1 ? 'end' : '',
            style: { height: `${(v / Math.max(...k.spark)) * 100}%` },
        })))
    )));
}

const ACTIVITY = [
    { icon: '⚖', title: 'Dandora Hub weighed 340 kg PET', meta: '2 min ago', amt: 'KES 9,690' },
    { icon: '💳', title: 'M-Pesa settled — James Otieno', meta: '5 min ago', amt: 'KES 353' },
    { icon: '📦', title: 'Ruiru Depot listed 1,200 kg Cardboard', meta: '12 min ago', amt: 'KES 14,400' },
    { icon: '🔄', title: 'Industrial Area sold 41 kg E-Waste', meta: '18 min ago', amt: 'KES 4,920' },
    { icon: '💳', title: 'M-Pesa settled — Amina Wanjiku', meta: '24 min ago', amt: 'KES 870' },
    { icon: '⚖', title: 'Gikomba Yard weighed 210 kg Paper', meta: '31 min ago', amt: 'KES 2,520' },
];

function ActivityFeed() {
    return h('div', null, ACTIVITY.map((a, i) => h('div', { className: 'activity-row', key: i },
        h('div', { className: 'activity-icon' }, a.icon),
        h('div', { className: 'activity-body' },
            h('div', { className: 'activity-title' }, a.title),
            h('div', { className: 'activity-meta' }, a.meta)
        ),
        h('div', { className: 'activity-amt' }, a.amt)
    )));
}

const TRANSACTIONS = [
    { id: 'TXN-4821', mat: 'PET Plastic', hub: 'Dandora Hub', wt: '340 kg', amt: 9690, status: 'settled' },
    { id: 'TXN-4820', mat: 'E-Waste', hub: 'Industrial', wt: '41 kg', amt: 4920, status: 'settled' },
    { id: 'TXN-4819', mat: 'Cardboard', hub: 'Ruiru Depot', wt: '1,200 kg', amt: 14400, status: 'pending' },
    { id: 'TXN-4818', mat: 'HDPE', hub: 'Gikomba Yard', wt: '210 kg', amt: 7350, status: 'settled' },
    { id: 'TXN-4817', mat: 'Aluminium', hub: 'Eastleigh Hub', wt: '89 kg', amt: 7565, status: 'settled' },
    { id: 'TXN-4816', mat: 'Clear Glass', hub: 'Karen Point', wt: '140 kg', amt: 1190, status: 'pending' },
];

function TransactionsTable() {
    return h('div', null,
        h('div', { className: 'txn-head-row' }, ['TXN ID', 'Material', 'Hub', 'Weight', 'Amount', 'Status'].map((t) => h('span', { key: t }, t))),
        TRANSACTIONS.map((t) => h('div', { className: 'txn-row', key: t.id },
            h('span', { className: 'txn-id' }, t.id),
            h('span', { className: 'txn-mat' }, t.mat),
            h('span', { className: 'txn-hub' }, t.hub),
            h('span', { className: 'txn-wt' }, t.wt),
            h('span', { className: 'txn-amt' }, `KES ${t.amt.toLocaleString()}`),
            h(Pill, { status: t.status })
        ))
    );
}

mount(SidebarRates, 'sidebar-rates-root');
mount(KPIRow, 'kpi-root');
mount(ActivityFeed, 'activity-feed-root');
mount(TransactionsTable, 'transactions-root');

// Hub map — plain DOM, no React needed for static pin positions
const MAP_PINS = [
    { name: 'Dandora', x: 72, y: 48, active: true },
    { name: 'Gikomba', x: 55, y: 52, active: true },
    { name: 'Industrial', x: 60, y: 55, active: true },
    { name: 'Kibera', x: 45, y: 60, active: false },
    { name: 'Eastleigh', x: 65, y: 44, active: true },
    { name: 'Ruiru', x: 78, y: 25, active: true },
    { name: 'Westlands', x: 35, y: 38, active: false },
    { name: 'Karen', x: 30, y: 70, active: false },
];

function renderHubMap() {
    const container = document.getElementById('hub-map');
    if (!container) return;
    MAP_PINS.forEach((pin) => {
        const el = document.createElement('div');
        el.className = `hub-pin${pin.active ? '' : ' off'}`;
        el.style.left = pin.x + '%';
        el.style.top = pin.y + '%';
        el.title = pin.name;
        el.innerHTML = '<span class="hub-pin-dot"></span><span class="hub-pin-label"></span>';
        el.querySelector('.hub-pin-label').textContent = pin.name;
        container.appendChild(el);
    });
}

// Weekly charts — Chart.js, imperative (no React needed for a canvas)
const WEEKLY = [
    { day: 'Mon', revenue: 42000, weight: 1240 },
    { day: 'Tue', revenue: 51000, weight: 1580 },
    { day: 'Wed', revenue: 38000, weight: 1020 },
    { day: 'Thu', revenue: 67000, weight: 1890 },
    { day: 'Fri', revenue: 72000, weight: 2010 },
    { day: 'Sat', revenue: 58000, weight: 1720 },
    { day: 'Sun', revenue: 89000, weight: 2640 },
];

function initCharts() {
    if (!window.Chart) return;
    const tickStyle = { color: '#5a7a5a', font: { family: 'JetBrains Mono', size: 9 } };

    const revenueCtx = document.getElementById('revenue-chart');
    if (revenueCtx) {
        new window.Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: WEEKLY.map((w) => w.day),
                datasets: [{ data: WEEKLY.map((w) => w.revenue), backgroundColor: '#22c55e', borderRadius: 2, maxBarThickness: 36 }],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `KES ${c.parsed.y.toLocaleString()}` } } },
                scales: {
                    x: { grid: { display: false }, ticks: tickStyle },
                    y: { grid: { color: 'rgba(34,197,94,.06)' }, ticks: { ...tickStyle, callback: (v) => `${v / 1000}K` } },
                },
            },
        });
    }

    const weightCtx = document.getElementById('weight-chart');
    if (weightCtx) {
        new window.Chart(weightCtx, {
            type: 'line',
            data: {
                labels: WEEKLY.map((w) => w.day),
                datasets: [{
                    data: WEEKLY.map((w) => w.weight),
                    borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,.15)',
                    fill: true, tension: 0.35, pointRadius: 0, borderWidth: 1.5,
                }],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.parsed.y.toLocaleString()} kg` } } },
                scales: {
                    x: { grid: { display: false }, ticks: tickStyle },
                    y: { grid: { color: 'rgba(34,197,94,.06)' }, ticks: tickStyle },
                },
            },
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderHubMap();
    initCharts();
});
