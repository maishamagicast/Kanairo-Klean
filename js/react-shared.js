// Shared React building blocks — foundation-owned.
// Components are plain functions returning React.createElement(...).
// Import from a page-specific script with:
//   import { Dot, Pill, mount } from './react-shared.js';

const h = window.React.createElement;

export function Dot({ off = false } = {}) {
    return h('span', { className: `ldot${off ? ' off' : ''}` });
}

export function Pill({ status }) {
    const cls = status === 'settled' ? 'pill-settled'
        : status === 'failed' ? 'pill-failed'
            : 'pill-pending';
    return h('span', { className: `pill ${cls}` }, status);
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
