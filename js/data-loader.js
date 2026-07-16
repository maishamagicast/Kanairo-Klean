// Every page's content — prices, hotspots, KPIs, team bios, timeline,
// feature lists — lives in data/site-data.json and is fetched once here.
// All islands on a page share the same in-flight/resolved request instead
// of each fetching their own copy.
let pending = null;

export function loadSiteData() {
    if (!pending) {
        pending = fetch('data/site-data.json').then((res) => {
            if (!res.ok) throw new Error(`Failed to load site data: ${res.status}`);
            return res.json();
        });
    }
    return pending;
}
