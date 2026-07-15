// Builder C — Marketplace: material tabs, price panel + chart, price cards
// (with search + real stock + Buy Now), order book, live trade feed.
// No JSX. Material/price data is fetched via js/market-data.js; the order
// book and price-history chart are generated algorithmically from whatever
// price is currently selected (simulation logic, not content).
import { Dot, Ticker, mount } from './react-shared.js';
import { getMaterials, simulatePrices } from './market-data.js';
import { getHotspots, onHotspotsChange, aggregateInventory } from './storage.js';
import { openMpesaModal, recordTransaction, showSuccessNotification } from './payments.js';

const h = window.React.createElement;
const { useState, useEffect, useRef } = window.React;

function buildPriceHistory(basePrice) {
    return Array.from({ length: 24 }, (_, i) => ({
        h: `${String(i).padStart(2, '0')}:00`,
        v: Math.max(0.5, basePrice + Math.sin(i * 0.4) * basePrice * 0.06 + Math.random() * basePrice * 0.02),
    }));
}

function buildOrderBook(price) {
    const askOffsets = [0.3, 0.6, 0.9, 1.3, 1.7];
    const bidOffsets = [0.3, 0.6, 0.9, 1.3, 1.7];
    const askSizes = [940, 730, 1120, 460, 1890];
    const bidSizes = [1240, 880, 1560, 620, 2100];

    const asks = askOffsets.map((d, i) => {
        const p = +(price + d).toFixed(1);
        return { price: p, size: askSizes[i], total: Math.round(p * askSizes[i]) };
    });
    const bids = bidOffsets.map((d, i) => {
        const p = Math.max(0.1, +(price - d).toFixed(1));
        return { price: p, size: bidSizes[i], total: Math.round(p * bidSizes[i]) };
    });
    const maxTotal = Math.max(...asks.map((a) => a.total), ...bids.map((b) => b.total));
    return { asks, bids, spread: askOffsets[0] + bidOffsets[0], maxTotal };
}

function pad(n) { return String(n).padStart(2, '0'); }

function MarketplaceApp() {
    const [prices, setPrices] = useState([]);
    const [selected, setSelected] = useState(null);
    const [hotspots, setHotspots] = useState(getHotspots());
    const [query, setQuery] = useState('');
    const [trades, setTrades] = useState([]);
    const chartInstance = useRef(null);

    useEffect(() => {
        let alive = true;
        getMaterials().then((m) => {
            if (!alive) return;
            setPrices(m);
            setSelected(m[0].id);
        });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        const iv = setInterval(() => setPrices((p) => (p.length ? simulatePrices(p) : p)), 2800);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => onHotspotsChange(setHotspots), []);

    useEffect(() => {
        if (prices.length === 0) return;
        const iv = setInterval(() => {
            const m = prices[Math.floor(Math.random() * prices.length)];
            const wt = (Math.random() * 200 + 20).toFixed(0);
            const now = new Date();
            const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            setTrades((prev) => [{ time, mat: m.id, wt: `${wt} kg`, side: Math.random() > 0.5 ? 'buy' : 'sell' }, ...prev.slice(0, 17)]);
        }, 2500);
        return () => clearInterval(iv);
    }, [prices]);

    useEffect(() => {
        if (!window.Chart || !selected || prices.length === 0) return;
        const ctx = document.getElementById('mkt-price-chart');
        if (!ctx) return;
        const selMat = prices.find((m) => m.id === selected) || prices[0];
        const history = buildPriceHistory(selMat.price);
        if (chartInstance.current) chartInstance.current.destroy();
        chartInstance.current = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map((pt) => pt.h),
                datasets: [{
                    data: history.map((pt) => +pt.v.toFixed(1)),
                    borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,.15)',
                    fill: true, tension: 0.35, pointRadius: 0, borderWidth: 1.5,
                }],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#5a7a5a', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 8 } },
                    y: { grid: { color: 'rgba(34,197,94,.06)' }, ticks: { color: '#5a7a5a', font: { family: 'JetBrains Mono', size: 9 } } },
                },
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    if (prices.length === 0 || !selected) return null;

    const selMat = prices.find((m) => m.id === selected) || prices[0];
    const inv = aggregateInventory(hotspots);
    const stockFor = (name) => inv.find((i) => i.name === name)?.quantity || 0;
    const filtered = prices.filter((m) => (m.id + m.name).toLowerCase().includes(query.toLowerCase()));

    function buyNow(m) {
        const stock = stockFor(m.name);
        if (stock <= 0) return;
        openMpesaModal({
            material: m.name, maxAvailable: stock, pricePerKg: m.price,
            onConfirm: (qty) => {
                const txn = recordTransaction({ material: m.name, quantity: qty, amount: Math.round(qty * m.price) });
                showSuccessNotification(`Bought ${qty}kg ${m.name} — receipt ${txn.id}`);
            },
        });
    }

    const book = buildOrderBook(selMat.price);

    return h('div', null,
        h('div', { className: 'mkt-tabs-row' }, prices.map((m) => h('button', {
            key: m.id, type: 'button',
            className: `k-tab${selected === m.id ? ' on' : ''}`,
            onClick: () => setSelected(m.id),
        }, m.id))),

        h('div', { className: 'mkt-grid' },
            h('div', null,
                h('div', { className: 'dash-card mkt-hero-card', style: { marginBottom: '24px' } },
                    h('div', { className: 'mkt-hero-top' },
                        h('div', null,
                            h('div', { className: 'mkt-hero-id' }, `${selMat.id} — ${selMat.name}`),
                            h('div', { className: 'mkt-hero-price' },
                                h('span', { className: 'value' }, selMat.price.toFixed(1)),
                                h('span', { className: 'unit' }, selMat.unit)
                            )
                        ),
                        h('span', { className: `mkt-hero-change ${selMat.trend}` },
                            `${selMat.trend === 'up' ? '+' : ''}${selMat.change.toFixed(1)} KES`)
                    ),
                    h('div', { className: 'chart-wrap' }, h('canvas', { id: 'mkt-price-chart' }))
                ),

                h('div', { className: 'mkt-search' },
                    h('input', {
                        type: 'text', placeholder: 'Search materials…',
                        value: query, onChange: (e) => setQuery(e.target.value),
                    })
                ),

                h('div', { className: 'price-cards-grid' }, filtered.map((m) => {
                    const stock = stockFor(m.name);
                    return h('div', {
                        className: `price-card${selected === m.id ? ' selected' : ''}`, key: m.id,
                        onClick: () => setSelected(m.id),
                    },
                        h('div', { className: 'price-card-top' },
                            h('span', { className: 'price-card-id' }, m.id),
                            h('span', { className: `price-card-change ${m.trend}` },
                                `${m.trend === 'up' ? '▲' : '▼'} ${Math.abs(m.change).toFixed(1)}`)
                        ),
                        h('div', { className: 'price-card-value' }, m.price.toFixed(1)),
                        h('div', { className: 'price-card-name' }, m.name),
                        h('div', { className: 'price-card-stock' }, h('span', null, 'Stock'), h('span', null, `${stock.toLocaleString()} kg`)),
                        h('button', {
                            className: 'price-card-buy', type: 'button', disabled: stock <= 0,
                            onClick: (e) => { e.stopPropagation(); buyNow(m); },
                        }, stock <= 0 ? 'Out of Stock' : 'Buy Now')
                    );
                }))
            ),

            h('div', null,
                h('div', { className: 'dash-card', style: { marginBottom: '2px' } },
                    h('div', { className: 'dash-card-head' }, h('h3', null, `Order Book — ${selMat.id}`)),
                    h('div', { className: 'ob-head-row' }, h('span', null, 'Price'), h('span', null, 'Size (kg)'), h('span', null, 'Total')),
                    book.asks.slice().reverse().map((r, i) => h('div', { className: 'ob-row ask', key: `a${i}` },
                        h('span', { className: 'depth', style: { width: `${(r.total / book.maxTotal) * 100}%` } }),
                        h('span', { className: 'ob-price down' }, r.price.toFixed(1)),
                        h('span', { className: 'ob-size' }, r.size.toLocaleString()),
                        h('span', { className: 'ob-total' }, r.total.toLocaleString())
                    )),
                    h('div', { className: 'ob-spread' }, h('span', null, 'SPREAD'), h('span', null, `${book.spread.toFixed(1)} KES`)),
                    book.bids.map((r, i) => h('div', { className: 'ob-row bid', key: `b${i}` },
                        h('span', { className: 'depth', style: { width: `${(r.total / book.maxTotal) * 100}%` } }),
                        h('span', { className: 'ob-price up' }, r.price.toFixed(1)),
                        h('span', { className: 'ob-size' }, r.size.toLocaleString()),
                        h('span', { className: 'ob-total' }, r.total.toLocaleString())
                    ))
                ),

                h('div', { className: 'dash-card' },
                    h('div', { className: 'dash-card-head' }, h('h3', null, 'Live Trades'), h(Dot)),
                    h('div', { className: 'trade-feed-wrap' },
                        trades.length === 0
                            ? h('div', { className: 'trade-empty' }, 'Waiting for trades…')
                            : trades.map((t, i) => h('div', { className: 'trade-row', key: i },
                                h('span', { className: 'trade-time' }, t.time),
                                h('span', { className: `trade-side ${t.side}` }, `${t.side.toUpperCase()} ${t.mat}`),
                                h('span', { className: 'trade-wt' }, t.wt)
                            ))
                    )
                )
            )
        )
    );
}

mount(Ticker, 'ticker-root');
mount(MarketplaceApp, 'marketplace-app-root');
