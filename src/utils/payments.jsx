
import { deductInventory } from './storage.jsx';

const TX_KEY = 'kanairo_transactions';

function generateMpesaReceipt() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'KAN';
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


export function showSuccessNotification(message = 'Transaction complete') {
    let container = document.getElementById('mpesa-alert-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mpesa-alert-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '84px',
            right: '20px',
            zIndex: '999999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        });
        document.body.appendChild(container);
    }

    const box = document.createElement('div');
    Object.assign(box.style, {
        background: '#0b180b',
        border: '1px solid rgba(34,197,94,.3)',
        borderLeft: '3px solid #22c55e',
        color: '#e2f0e2',
        fontFamily: "'Inter', sans-serif",
        padding: '14px 22px',
        borderRadius: '2px',
        boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
        fontSize: '0.85rem',
        fontWeight: '600',
        opacity: '0',
        transform: 'translateY(-12px)',
        transition: 'all 0.3s ease',
        maxWidth: '320px',
    });
    box.textContent = message;
    container.appendChild(box);

    requestAnimationFrame(() => {
        box.style.opacity = '1';
        box.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(-10px)';
        setTimeout(() => box.remove(), 300);
    }, 4500);
}


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