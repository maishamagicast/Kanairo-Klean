// Builder A — Home page static sections: How It Works, Impact numbers,
// Hotspots preview, and the waitlist form. None of this needs React, so it
// lives in its own file, loaded and executed *before* the React CDN
// scripts in index.html — this content renders immediately instead of
// waiting on react.development.js / react-dom.development.js to download.
import { loadSiteData } from './data-loader.js';
import { getHotspotShowcase } from './market-data.js';

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
