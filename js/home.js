// Builder A — Home page React islands: the price ticker, the live-rate
// cards grid, and the stakeholder tabs. No JSX — React.createElement only.
import { Dot, Ticker, mount } from './react-shared.js';
import { MATERIALS, simulatePrices } from './market-data.js';

const h = window.React.createElement;
const { useState, useEffect } = window.React;

function RateCards() {
    const [prices, setPrices] = useState(MATERIALS);

    useEffect(() => {
        const iv = setInterval(() => setPrices((p) => simulatePrices(p)), 2800);
        return () => clearInterval(iv);
    }, []);

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

const STAKEHOLDER_TABS = {
    collector: {
        label: 'Collector',
        headline: 'Know your worth\nbefore you sell.',
        body: "Access live market rates from any feature phone. No middlemen, no arbitrary prices. Your materials, your price — direct to verified Micro-Hubs.",
        stats: [{ v: '+30%', l: 'avg. earnings' }, { v: '30s', l: 'M-Pesa payout' }, { v: '0', l: 'broker fees' }],
        rows: [['14:32', 'PET Plastic', '12.4 kg', 'KES 353'], ['13:18', 'HDPE', '8.2 kg', 'KES 287'], ['11:45', 'Aluminium', '3.1 kg', 'KES 264'], ['09:20', 'Cardboard', '22 kg', 'KES 264']],
    },
    aggregator: {
        label: 'Micro-Hub',
        headline: 'Be the digital node\nfor your neighbourhood.',
        body: 'Aggregate materials from hundreds of collectors. Manage live inventory, post buy offers, and connect directly with industrial recyclers.',
        stats: [{ v: '500+', l: 'collectors/hub' }, { v: '100%', l: 'traceability' }, { v: 'EPR', l: 'compliance' }],
        rows: [['14:45', 'PET — 124 kg (3)', 'Dandora', 'KES 3,534'], ['13:00', 'E-WASTE — 41 kg', 'Industrial', 'KES 4,920'], ['11:30', 'ALU — 89 kg (7)', 'Eastleigh', 'KES 7,565'], ['09:00', 'HDPE — 210 kg (12)', 'Gikomba', 'KES 7,350']],
    },
    recycler: {
        label: 'Recycler',
        headline: 'Predictable supply.\nZero supply shocks.',
        body: 'Browse verified inventory across the city. Lock in material contracts before collection day. Full chain-of-custody for EPR compliance.',
        stats: [{ v: '100%', l: 'traceability' }, { v: '48h', l: 'supply forecast' }, { v: '2026', l: 'EPR built-in' }],
        rows: [['Active', 'PET Contract', '2,400 kg/wk', 'KES 68,400'], ['Active', 'HDPE Contract', '1,100 kg/wk', 'KES 38,500'], ['Pending', 'E-Waste Bid', '500 kg/wk', 'KES 60,000'], ['Closed', 'ALU Contract', '800 kg/wk', 'KES 68,000']],
    },
};

function StakeholderTabs() {
    const [active, setActive] = useState('collector');
    const tab = STAKEHOLDER_TABS[active];

    return h('div', null,
        h('div', { className: 'stake-tabs' },
            Object.keys(STAKEHOLDER_TABS).map((key) => h('button', {
                key,
                type: 'button',
                className: `stake-tab${active === key ? ' on' : ''}`,
                onClick: () => setActive(key),
            }, STAKEHOLDER_TABS[key].label))
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

// Plain-JS bits that don't need React
document.addEventListener('DOMContentLoaded', () => {
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
