// Builder D — About page. Mission stats and team bios are static content
// (no interactivity), so they're rendered from fetched data with plain DOM
// calls rather than React.
import { loadSiteData } from './data-loader.js';

function renderMissionStats(stats) {
    const root = document.getElementById('mission-stats-root');
    if (!root) return;
    stats.forEach((s, i) => {
        const article = document.createElement('article');
        article.className = `impact-blk reveal d${i + 1}`;
        article.innerHTML = `<span class="impact-val">${s.value}</span><p>${s.label}</p>`;
        root.appendChild(article);
    });
}

function renderTeam(team) {
    const root = document.getElementById('team-root');
    if (!root) return;
    team.forEach((member, i) => {
        const article = document.createElement('article');
        article.className = `team-card k-card reveal d${i + 1}`;
        article.innerHTML = `
            <div class="team-avatar">${member.initials}</div>
            <h3>${member.name}</h3>
            <p class="team-role">${member.role}</p>
            <p class="team-bio">${member.bio}</p>
        `;
        root.appendChild(article);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSiteData().then((data) => {
        renderMissionStats(data.about.missionStats);
        renderTeam(data.about.team);
    });
});
