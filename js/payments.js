// Builder C — mock M-Pesa payment flow. Exposes reusable functions the
// Marketplace price cards call directly (with real values from React
// state), instead of the old approach of scraping button/card text.
import { deductInventory } from './storage.js';

const TX_KEY = 'kanairo_transactions';

function generateMpesaReceipt() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'KAN';
    for (let i = 0; i < 7; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

export function showSuccessNotification(message = 'Transaction complete') {
    let container = document.getElementById('mpesa-alert-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mpesa-alert-container';
        Object.assign(container.style, {
            position: 'fixed', top: '84px', right: '20px', zIndex: '999999',
            display: 'flex', flexDirection: 'column', gap: '10px',
        });
        document.body.appendChild(container);
    }

    const box = document.createElement('div');
    Object.assign(box.style, {
        background: '#0b180b', border: '1px solid rgba(34,197,94,.3)', borderLeft: '3px solid #22c55e',
        color: '#e2f0e2', fontFamily: "'Inter', sans-serif", padding: '14px 22px', borderRadius: '2px',
        boxShadow: '0 12px 24px rgba(0,0,0,0.4)', fontSize: '0.85rem', fontWeight: '600',
        opacity: '0', transform: 'translateY(-12px)', transition: 'all 0.3s ease', maxWidth: '320px',
    });
    box.textContent = message;
    container.appendChild(box);

    requestAnimationFrame(() => { box.style.opacity = '1'; box.style.transform = 'translateY(0)'; });
    setTimeout(() => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(-10px)';
        setTimeout(() => box.remove(), 300);
    }, 4500);
}

// Records the purchase and deducts it from the real kanairo_hotspots stock.
export function recordTransaction({ material, quantity, amount }) {
    const receipt = generateMpesaReceipt();
    const timestamp = new Date().toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' });
    const txn = { id: receipt, material, quantity, amount, date: timestamp };

    const history = JSON.parse(localStorage.getItem(TX_KEY)) || [];
    history.push(txn);
    localStorage.setItem(TX_KEY, JSON.stringify(history));

    deductInventory(material, quantity);
    return txn;
}

// M-Pesa PIN-entry modal, dark-themed to match the rest of the app.
export function openMpesaModal({ material, maxAvailable, pricePerKg, onConfirm }) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '999998',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
        background: '#0b180b', border: '1px solid rgba(34,197,94,.35)', borderRadius: '4px',
        padding: '36px 30px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        color: '#e2f0e2', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", margin: '20px',
    });

    const initialQty = Math.min(10, maxAvailable) || 1;

    box.innerHTML = `
        <h2 style="margin:0 0 8px;color:#22c55e;text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:1px;text-transform:uppercase;">M-Pesa Simulator</h2>
        <p style="font-size:0.85rem;text-align:center;color:#a0c0a0;margin:0 0 26px;line-height:1.5;">
            Paying <strong id="mp-cost" style="color:#e2f0e2;">KES ${(initialQty * pricePerKg).toLocaleString()}</strong> for <strong id="mp-qty-txt" style="color:#e2f0e2;">${initialQty}kg</strong> of ${material}.
        </p>
        <form id="mp-form">
            <div style="margin-bottom:18px;">
                <label style="display:block;font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:#5a7a5a;margin-bottom:8px;font-family:'JetBrains Mono',monospace;">Amount to Buy (kg)</label>
                <input type="number" id="mp-qty" value="${initialQty}" min="1" max="${maxAvailable}" required
                    style="width:100%;padding:11px;background:rgba(11,24,11,.6);border:1px solid rgba(34,197,94,.2);border-radius:2px;color:#e2f0e2;font-size:0.9rem;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:18px;">
                <label style="display:block;font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:#5a7a5a;margin-bottom:8px;font-family:'JetBrains Mono',monospace;">Phone Number</label>
                <input type="tel" id="mp-phone" placeholder="e.g. 0712345678" required pattern="[0-9]{10}"
                    style="width:100%;padding:11px;background:rgba(11,24,11,.6);border:1px solid rgba(34,197,94,.2);border-radius:2px;color:#e2f0e2;font-size:0.9rem;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:26px;">
                <label style="display:block;font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:#5a7a5a;margin-bottom:8px;font-family:'JetBrains Mono',monospace;">M-Pesa PIN</label>
                <input type="password" id="mp-pin" placeholder="4-digit PIN" required maxlength="4" pattern="[0-9]{4}"
                    style="width:100%;padding:11px;background:rgba(11,24,11,.6);border:1px solid rgba(34,197,94,.2);border-radius:2px;color:#e2f0e2;font-size:0.9rem;box-sizing:border-box;">
            </div>
            <div style="display:flex;gap:12px;">
                <button type="button" id="mp-cancel" style="flex:1;padding:12px;background:transparent;color:#e2f0e2;border:1px solid rgba(34,197,94,.2);border-radius:2px;cursor:pointer;font-weight:700;font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;font-family:'Barlow Condensed',sans-serif;">Cancel</button>
                <button type="submit" style="flex:1;padding:12px;background:#22c55e;color:#06120a;border:none;border-radius:2px;cursor:pointer;font-weight:800;font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;font-family:'Barlow Condensed',sans-serif;">Confirm PIN</button>
            </div>
        </form>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const form = box.querySelector('#mp-form');
    const qtyInput = box.querySelector('#mp-qty');
    const costEl = box.querySelector('#mp-cost');
    const qtyTxtEl = box.querySelector('#mp-qty-txt');

    qtyInput.addEventListener('input', () => {
        const v = Math.min(parseInt(qtyInput.value, 10) || 0, maxAvailable);
        qtyInput.value = v;
        costEl.textContent = `KES ${(v * pricePerKg).toLocaleString()}`;
        qtyTxtEl.textContent = `${v}kg`;
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const qty = parseInt(qtyInput.value, 10);
        overlay.remove();
        onConfirm(qty);
    });

    box.querySelector('#mp-cancel').addEventListener('click', () => overlay.remove());
}
