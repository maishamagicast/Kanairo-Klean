// Base prices mapping
const basePrices = {
    'Plastic (PET)': 50,
    'Plastic (HDPE)': 55,
    'Paper': 30,
    'Metal': 100,
    'E-Waste': 500
};

// Generate materials dynamically from hotspots in localStorage
function generateMaterialsFromInventory() {
    let currentHotspots = [];
    const stored = localStorage.getItem('kanairo_hotspots');
    if (stored) {
        currentHotspots = JSON.parse(stored);
    } else {
        // Fallback hardcoded if everything fails
        currentHotspots = [
            { name: 'Nairobi Central', materials: [{ name: 'Plastic (PET)', quantity: 200 }, { name: 'Paper', quantity: 100 }, { name: 'E-Waste', quantity: 50 }] },
            { name: 'Mombasa Port', materials: [{ name: 'Plastic (HDPE)', quantity: 150 }, { name: 'Paper', quantity: 80 }, { name: 'Metal', quantity: 30 }] },
            { name: 'Kisumu Market', materials: [{ name: 'Plastic (PET)', quantity: 100 }, { name: 'Paper', quantity: 50 }, { name: 'Metal', quantity: 20 }] }
        ];
    }

    const newMaterials = [];
    let idCounter = 1;

    currentHotspots.forEach(hotspot => {
        hotspot.materials.forEach(mat => {
            const bp = basePrices[mat.name] || 50; 
            newMaterials.push({
                id: idCounter++,
                name: mat.name,
                available: mat.quantity,
                basePrice: bp,
                currentPrice: bp, 
                status: mat.quantity > 50 ? 'In Stock' : 'Low Stock',
                location: hotspot.name
            });
        });
    });

    return newMaterials;
}

let materials = [];
let filteredMaterials = [];

function getFormattedDateMarket() {
    const now = new Date();
    return now.toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' });
}

// 1. Price Discovery Module
function updateMarketRates() {
    const ratesBody = document.querySelector('#market-rates tbody');
    if (!ratesBody) return;

    materials.forEach(mat => {
        const fluctuation = (Math.random() - 0.5) * 0.1; // +/- 5%
        mat.currentPrice = Math.round(mat.basePrice * (1 + fluctuation));
    });

    ratesBody.innerHTML = '';
    
    // Group by material name to show unique market rates
    const uniqueMaterials = [...new Map(materials.map(item => [item.name, item])).values()];

    uniqueMaterials.forEach(mat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${mat.name}</td>
            <td>${mat.currentPrice}</td>
            <td>${getFormattedDateMarket()}</td>
        `;
        ratesBody.appendChild(tr);
    });
}

// 2. Dynamic Material Listings
function renderMaterials() {
    const container = document.querySelector('#market-list');
    if (!container) return;

    const h2 = container.querySelector('h2') ? container.querySelector('h2').outerHTML : '<h2>Available Materials</h2>';
    container.innerHTML = h2;

    if (filteredMaterials.length === 0) {
        container.innerHTML += '<p>No materials found matching your search.</p>';
        return;
    }

    filteredMaterials.forEach(mat => {
        const div = document.createElement('div');
        div.className = 'material-card';
        div.innerHTML = `
            <h3>${mat.name}</h3>
            <p>Available: ${mat.available} kg</p>
            <p>Price: ${mat.currentPrice} KES/kg</p>
            <p>Status: ${mat.status}</p>
            <p>location: ${mat.location}</p>
            <button>Buy Now</button>
        `;
        container.appendChild(div);
    });
}

// 3. Search Functionality
function initSearch() {
    const searchForm = document.querySelector('#market-search form');
    const searchInput = document.querySelector('#market-search input');

    if (!searchForm || !searchInput) return;

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterMaterials(searchInput.value);
    });

    searchInput.addEventListener('input', (e) => {
        filterMaterials(e.target.value);
    });
}

function filterMaterials(query) {
    const lowerQuery = query.toLowerCase();
    filteredMaterials = materials.filter(mat => {
        return mat.name.toLowerCase().includes(lowerQuery) ||
               mat.location.toLowerCase().includes(lowerQuery) ||
               mat.status.toLowerCase().includes(lowerQuery);
    });
    renderMaterials();
}

// Sync Database dynamically
function syncData() {
    // Generate fresh materials from DB
    materials = generateMaterialsFromInventory();
    
    // Re-apply the current search filter
    const searchInput = document.querySelector('#market-search input');
    if (searchInput && searchInput.value) {
        filterMaterials(searchInput.value);
    } else {
        filteredMaterials = [...materials];
    }
    
    // Update rates and UI
    updateMarketRates();
    renderMaterials();
}

// Listen for storage changes so updates in Dashboard tab sync immediately to Marketplace tab
window.addEventListener('storage', (e) => {
    if (e.key === 'kanairo_hotspots') {
        syncData();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    syncData(); // Initial load
    initSearch();
    setInterval(syncData, 5000); // Poll every 5s for price fluctuation
});
