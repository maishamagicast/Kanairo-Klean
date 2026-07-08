// Builder A — Home page. Ticker, rate cards, and stakeholder tabs are React
// islands; How It Works / Impact / Hotspots preview are static content
// rendered from fetched data with plain DOM calls (no state, no React
// needed). No JSX anywhere.
import { Dot, Ticker, mount } from './react-shared.js';
import { getMaterials, simulatePrices, getHotspotShowcase } from './market-data.js';
import { loadSiteData } from './data-loader.js';

const h = window.React.createElement;
const { useState, useEffect } = window.React;

function RateCards() {
    const [prices, setPrices] = useState([]);

    useEffect(() => {
        let alive = true;
        getMaterials().then((m) => { if (alive) setPrices(m); });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        const iv = setInterval(() => setPrices((p) => (p.length ? simulatePrices(p) : p)), 2800);
        return () => clearInterval(iv);
    }, []);

    if (prices.length === 0) return null;

    return h('div', { className: 'rates-grid' },
        prices.map((m) => h('div', { className: 'rate-card', key: m.id },
            h('div', { className: 'rate-card-head' },
                h('div', null,
                    h('span', { className: 'rate-card-id' }, m.id),
                    h('span', { className: 'rate-card-name' }, m.name)
                ),
                h('span', { className: `rate-card-change ${m.trend}` },
                    `${m.trend === 'up' ? '+' : ''}${m.change.toFixed(1)}`)
            ),
            h('div', { className: 'rate-card-price' },
                h('span', { className: 'value' }, m.price.toFixed(1)),
                h('span', { className: 'unit' }, m.unit)
            ),
            h('div', { className: `rate-card-track ${m.trend}` },
                h('span', { style: { width: `${Math.min(100, (m.price / 150) * 100).toFixed(0)}%` } })
            )
        ))
    );
}

function StakeholderTabs() {
    const [tabs, setTabs] = useState(null);
    const [active, setActive] = useState('collector');

    useEffect(() => {
        let alive = true;
        loadSiteData().then((data) => { if (alive) setTabs(data.home.stakeholderTabs); });
        return () => { alive = false; };
    }, []);

    if (!tabs) return null;
    const tab = tabs[active];

    return h('div', null,
        h('div', { className: 'stake-tabs' },
            Object.keys(tabs).map((key) => h('button', {
                key,
                type: 'button',
                className: `stake-tab${active === key ? ' on' : ''}`,
                onClick: () => setActive(key),
            }, tabs[key].label))
        ),
        h('div', { className: 'stake-body' },
            h('div', null,
                h('h3', { className: 'stake-headline' }, tab.headline),
                h('p', { className: 'stake-copy' }, tab.body),
                h('div', { className: 'stake-stats' },
                    tab.stats.map((s, i) => h('div', { className: 'stake-stat', key: i },
                        h('span', { className: 'v' }, s.v),
                        h('span', { className: 'l' }, s.l)
                    ))
                )
            ),
            h('div', { className: 'stake-panel' },
                h('div', { className: 'stake-panel-head' },
                    h('span', null, 'Recent Activity'),
                    h(Dot)
                ),
                tab.rows.map((row, i) => h('div', { className: 'stake-row', key: i },
                    h('span', null, row[0]), h('span', null, row[1]), h('span', null, row[2]), h('span', null, row[3])
                ))
            )
        )
    );
}

mount(Ticker, 'ticker-root');
mount(RateCards, 'rates-root');
mount(StakeholderTabs, 'stakeholder-tabs-root');

// --- Static sections rendered from fetched data, plain DOM (no React) ---

function renderHowItWorks(steps) {
    const root = document.getElementById('how-it-works-root');
    if (!root) return;
    steps.forEach((step, i) => {
        const article = document.createElement('article');
        article.className = `step reveal d${i + 1}`;
        article.innerHTML = `
            <div class="step-num">${step.num}</div>
            <div class="step-icon">${step.icon}</div>
            <h3>${step.title}</h3>
            <p>${step.body}</p>
        `;
        root.appendChild(article);
    });
}

function renderImpact(stats) {
    const root = document.getElementById('impact-root');
    if (!root) return;
    stats.forEach((stat, i) => {
        const article = document.createElement('article');
        article.className = `impact-blk reveal d${i + 1}`;
        article.innerHTML = `
            <span class="impact-val">${stat.value}</span>
            <p>${stat.label}</p>
        `;
        root.appendChild(article);
    });
}

function renderHotspotsPreview(hotspots) {
    const root = document.getElementById('hotspots-preview-root');
    if (!root) return;
    hotspots.forEach((hs, i) => {
        const article = document.createElement('article');
        article.className = `hotspot-tile k-card reveal d${(i % 4) + 1}`;
        article.innerHTML = `
            <div class="hotspot-tile-head"><span>${hs.name}</span><span class="ldot${hs.active ? '' : ' off'}"></span></div>
            <p class="hotspot-tile-mat">${hs.material}</p>
            <div class="hotspot-tile-row"><span>Activity</span><span class="hotspot-tile-pct">${hs.activity}%</span></div>
            <div class="hotspot-bar"><span style="width:${hs.activity}%"></span></div>
            <div class="hotspot-tile-row"><span>In Stock</span><span>${hs.stock.toLocaleString()} kg</span></div>
        `;
        root.appendChild(article);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSiteData().then((data) => {
        renderHowItWorks(data.home.howItWorks);
        renderImpact(data.home.impact);
    });
    getHotspotShowcase().then(renderHotspotsPreview);

    const waitlistForm = document.getElementById('waitlist-form');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('waitlist-email');
            alert(`You're on the list! We'll reach out at ${email.value} before the Q1 2026 launch.`);
            waitlistForm.reset();
        });
    }

    const joinBtn = document.getElementById('join-waitlist-hero');
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
