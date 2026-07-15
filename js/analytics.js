// Builder B — Dashboard analytics islands: KPIs, charts, hub map, activity
// feed, transactions table. No JSX. All content comes from
// data/site-data.json via js/data-loader.js; only the live inventory
// numbers (Weight Collected, Active Hubs) are computed from the real
// kanairo_hotspots store.
import { Dot, Pill, mount } from './react-shared.js';
import { getHotspots, onHotspotsChange } from './storage.js';
import { getMaterials, simulatePrices } from './market-data.js';
import { loadSiteData } from './data-loader.js';

const h = window.React.createElement;
const { useState, useEffect } = window.React;

function SidebarRates() {
    const [prices, setPrices] = useState([]);

    useEffect(() => {
        let alive = true;
        getMaterials().then((m) => { if (alive) setPrices(m.slice(0, 4)); });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        const iv = setInterval(() => setPrices((p) => (p.length ? simulatePrices(p) : p)), 2800);
        return () => clearInterval(iv);
    }, []);

    if (prices.length === 0) return null;

    return h('div', null, prices.map((m) => h('div', { className: 'sidebar-rate-row', key: m.id },
        h('span', { className: 'sidebar-rate-id' }, m.id),
        h('div', { className: 'sidebar-rate-price' },
            h('span', null, m.price.toFixed(1)),
            h('span', { className: `arrow ${m.trend}` }, m.trend === 'up' ? '▲' : '▼')
        )
    )));
}

function KPIRow() {
    const [kpiTemplate, setKpiTemplate] = useState(null);
    const [hotspots, setHotspots] = useState(getHotspots());

    useEffect(() => {
        let alive = true;
        loadSiteData().then((data) => { if (alive) setKpiTemplate(data.dashboard.kpis); });
        return () => { alive = false; };
    }, []);

    useEffect(() => onHotspotsChange(setHotspots), []);

    if (!kpiTemplate) return null;

    const totalKg = hotspots.reduce((s, hs) => s + hs.materials.reduce((s2, m) => s2 + m.quantity, 0), 0);
    const activeHubs = hotspots.length;
    const computed = { totalKg: `${totalKg.toLocaleString()} kg`, activeHubs: `${activeHubs} / 8` };

    const kpis = kpiTemplate.map((k) => {
        if (k.valueKey === 'activeHubs') {
            return { ...k, value: computed.activeHubs, change: activeHubs < 8 ? `${8 - activeHubs} offline` : 'all online', pos: activeHubs >= 6 };
        }
        if (k.valueKey) return { ...k, value: computed[k.valueKey] };
        return k;
    });

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

function ActivityFeed() {
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        let alive = true;
        loadSiteData().then((data) => { if (alive) setActivity(data.dashboard.activity); });
        return () => { alive = false; };
    }, []);

    return h('div', null, activity.map((a, i) => h('div', { className: 'activity-row', key: i },
        h('div', { className: 'activity-icon' }, a.icon),
        h('div', { className: 'activity-body' },
            h('div', { className: 'activity-title' }, a.title),
            h('div', { className: 'activity-meta' }, a.meta)
        ),
        h('div', { className: 'activity-amt' }, a.amt)
    )));
}

function TransactionsTable() {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        let alive = true;
        loadSiteData().then((data) => { if (alive) setTransactions(data.dashboard.transactions); });
        return () => { alive = false; };
    }, []);

    if (transactions.length === 0) return null;

    return h('div', null,
        h('div', { className: 'txn-head-row' }, ['TXN ID', 'Material', 'Hub', 'Weight', 'Amount', 'Status'].map((t) => h('span', { key: t }, t))),
        transactions.map((t) => h('div', { className: 'txn-row', key: t.id },
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

// Hub map — plain DOM, no React needed for static pin positions. Left as
// hardcoded data (not fetched) — these are fixed layout coordinates, not
// content.
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
function initCharts(weekly) {
    if (!window.Chart) return;
    const tickStyle = { color: '#5a7a5a', font: { family: 'JetBrains Mono', size: 9 } };

    const revenueCtx = document.getElementById('revenue-chart');
    if (revenueCtx) {
        new window.Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: weekly.map((w) => w.day),
                datasets: [{ data: weekly.map((w) => w.revenue), backgroundColor: '#22c55e', borderRadius: 2, maxBarThickness: 36 }],
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
                labels: weekly.map((w) => w.day),
                datasets: [{
                    data: weekly.map((w) => w.weight),
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
    loadSiteData().then((data) => {
        initCharts(data.dashboard.weekly);
    });
});
