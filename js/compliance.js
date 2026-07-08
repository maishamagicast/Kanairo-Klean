// Builder D — Compliance page. Regulatory timeline and feature grid are
// static content (no interactivity), rendered from fetched data with plain
// DOM calls rather than React.
import { loadSiteData } from './data-loader.js';

function renderTimeline(items) {
    const root = document.getElementById('timeline-root');
    if (!root) return;
    items.forEach((item) => {
        const div = document.createElement('div');
        div.className = `timeline-item${item.done ? ' done' : ''}`;
        div.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-date">${item.date}${item.done ? '' : ' →'}</div>
            <h4>${item.title}</h4>
            <p>${item.body}</p>
        `;
        root.appendChild(div);
    });
}

function renderFeatures(features) {
    const root = document.getElementById('features-root');
    if (!root) return;
    features.forEach((f, i) => {
        const article = document.createElement('article');
        article.className = `feature-card k-card reveal d${(i % 3) + 1}`;
        article.innerHTML = `
            <span class="feature-check">✓</span>
            <h3>${f.title}</h3>
            <p>${f.body}</p>
        `;
        root.appendChild(article);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSiteData().then((data) => {
        renderTimeline(data.compliance.timeline);
        renderFeatures(data.compliance.features);
    });
});
