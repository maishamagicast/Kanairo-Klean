// Mock Data for Hotspots and Inventory
const defaultHotspots = [
    {
        name: 'Nairobi Central',
        materials: [
            { name: 'Plastic (PET)', quantity: 200 },
            { name: 'Paper', quantity: 100 },
            { name: 'E-Waste', quantity: 50 }
        ]
    },
    {
        name: 'Mombasa Port',
        materials: [
            { name: 'Plastic (HDPE)', quantity: 150 },
            { name: 'Paper', quantity: 80 },
            { name: 'Metal', quantity: 30 }
        ]
    },
    {
        name: 'Kisumu Market',
        materials: [
            { name: 'Plastic (PET)', quantity: 100 },
            { name: 'Paper', quantity: 50 },
            { name: 'Metal', quantity: 20 }
        ]
    }
];

// Load from localStorage or use defaults
let hotspots = [];
const storedHotspots = localStorage.getItem('kanairo_hotspots');
if (storedHotspots) {
    hotspots = JSON.parse(storedHotspots);
} else {
    hotspots = JSON.parse(JSON.stringify(defaultHotspots)); // deep copy
    localStorage.setItem('kanairo_hotspots', JSON.stringify(hotspots)); // FORCE SAVE
}

function saveHotspots() {
    localStorage.setItem('kanairo_hotspots', JSON.stringify(hotspots));
}

// Combine all hotspots to calculate total inventory
function getOverallInventory() {
    const inventoryMap = new Map();

    hotspots.forEach(hotspot => {
        hotspot.materials.forEach(mat => {
            if (inventoryMap.has(mat.name)) {
                inventoryMap.set(mat.name, inventoryMap.get(mat.name) + mat.quantity);
            } else {
                inventoryMap.set(mat.name, mat.quantity);
            }
        });
    });

    const overallInventory = [];
    inventoryMap.forEach((quantity, name) => {
        overallInventory.push({ name, quantity });
    });

    return overallInventory;
}

function getFormattedDateInventory() {
    const now = new Date();
    return now.toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' });
}

// Render Hotspots (marketplace.html)
function renderHotspots() {
    const container = document.querySelector('#hotspots');
    if (!container) return;

    const h2 = container.querySelector('h2') ? container.querySelector('h2').outerHTML : '<h2>Material Hotspots</h2>';
    container.innerHTML = h2;

    hotspots.forEach(hotspot => {
        const div = document.createElement('div');
        div.className = 'hotspot-card';
        
        let rowsHtml = '';
        hotspot.materials.forEach(mat => {
            rowsHtml += `
                <tr>
                    <td>${mat.name}</td>
                    <td>${mat.quantity} kg</td>
                </tr>
            `;
        });

        div.innerHTML = `
            <h3>${hotspot.name}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Available Quantity</th>
                    </tr>
                </thead>
                <tbody class="hotspot-data">
                    ${rowsHtml}
                </tbody>
            </table>
        `;
        container.appendChild(div);
    });
}

// Render Inventory Overview (dashboard.html)
function renderInventoryOverview() {
    const tbody = document.getElementById('inventory-table');
    if (!tbody) return;

    tbody.innerHTML = '';

    const overallInventory = getOverallInventory();
    let totalKg = 0;

    overallInventory.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${getFormattedDateInventory()}</td>
        `;
        tbody.appendChild(tr);
        totalKg += item.quantity;
    });

    const materialsCountEl = document.querySelector('.materials-count');
    if (materialsCountEl) {
        materialsCountEl.textContent = `${totalKg} kg`;
    }
}

function initInventoryForm() {
    const form = document.getElementById('inventory-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const hotspotName = document.getElementById('hotspot-select').value;
        const materialName = document.getElementById('material-select').value;
        const quantity = parseInt(document.getElementById('quantity-input').value, 10);
        
        // Find the hotspot
        let hotspot = hotspots.find(h => h.name === hotspotName);
        if (!hotspot) {
            hotspot = { name: hotspotName, materials: [] };
            hotspots.push(hotspot);
        }

        // Find or create the material in this hotspot
        let material = hotspot.materials.find(m => m.name === materialName);
        if (material) {
            material.quantity += quantity;
        } else {
            hotspot.materials.push({ name: materialName, quantity: quantity });
        }

        // Save and re-render
        saveHotspots();
        renderHotspots();
        renderInventoryOverview();
        
        // Reset form
        form.reset();

        // Prompt to save to inventory.js directly
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'inventory.js',
                types: [{
                    description: 'JavaScript File',
                    accept: {'text/javascript': ['.js']},
                }],
            });
            const writable = await handle.createWritable();
            
            let newContent = "";
            try {
                const scriptText = await fetch('js/inventory.js').then(res => res.text());
                const newHotspotsStr = "const defaultHotspots = " + JSON.stringify(hotspots, null, 4) + ";";
                newContent = scriptText.replace(/const defaultHotspots = \[[\s\S]*?\];/, newHotspotsStr);
            } catch(e) {
                alert("Cannot read original file due to browser security, but inventory was saved locally to browser.");
                return;
            }

            await writable.write(newContent);
            await writable.close();
            alert(`Successfully logged ${quantity} kg of ${materialName} at ${hotspotName} and saved to file!`);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
                alert(`Logged inventory locally, but failed to save file: ` + err.message);
            }
        }
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderHotspots();
    renderInventoryOverview();
    initInventoryForm();
});
