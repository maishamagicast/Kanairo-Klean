// Shared React building blocks — foundation-owned.
// Components are plain functions returning React.createElement(...).
// Import from a page-specific script with:
//   import { Dot, Pill, Ticker, mount } from './react-shared.js';
import { MATERIALS, simulatePrices } from './market-data.js';

const h = window.React.createElement;
const { useState, useEffect } = window.React;

export function Dot({ off = false } = {}) {
    return h('span', { className: `ldot${off ? ' off' : ''}` });
}

export function Pill({ status }) {
    const cls = status === 'settled' ? 'pill-settled'
        : status === 'failed' ? 'pill-failed'
            : 'pill-pending';
    return h('span', { className: `pill ${cls}` }, status);
}

// The scrolling price ticker — used on Home and reused as-is on Marketplace.
export function Ticker() {
    const [prices, setPrices] = useState(MATERIALS);

    useEffect(() => {
        const iv = setInterval(() => setPrices((p) => simulatePrices(p)), 2800);
        return () => clearInterval(iv);
    }, []);

    const items = [...prices, ...prices, ...prices];

    return h('div', { className: 'ticker-wrap' },
        h('div', { className: 'ticker-track' },
            items.map((m, i) => h('span', { className: 'tick-item', key: i },
                h('span', { className: 'tick-id' }, m.id),
                h('span', { className: 'tick-price' }, m.price.toFixed(1)),
                h('span', { className: 'tick-unit' }, m.unit),
                h('span', { className: `tick-change ${m.trend}` },
                    `${m.trend === 'up' ? '▲' : '▼'} ${Math.abs(m.change).toFixed(1)}`),
                h('span', { className: 'tick-divider' })
            ))
        )
    );
}

// Mounts a component into #containerId with ReactDOM.createRoot, so each
// builder doesn't repeat the same three lines of boilerplate per island.
export function mount(Component, containerId, props = {}) {
    const el = document.getElementById(containerId);
    if (!el) return null;
    const root = window.ReactDOM.createRoot(el);
    root.render(h(Component, props));
    return root;
}
