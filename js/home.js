// Builder A — Home page React islands: the price ticker, the live-rate
// cards grid, and the stakeholder tabs. No JSX — React.createElement only.
// The static sections (How It Works, Impact, Hotspots preview, waitlist
// form) live in js/home-static.js instead, so they don't have to wait on
// the React CDN scripts to load — see index.html for why that matters.
import { Dot, Ticker, mount } from './react-shared.js';
import { getMaterials, simulatePrices } from './market-data.js';
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
