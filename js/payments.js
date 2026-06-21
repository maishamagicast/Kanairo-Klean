(function () {
    // 1. Initialize data arrays if missing
    if (!localStorage.getItem('kanairo_transactions')) {
        localStorage.setItem('kanairo_transactions', JSON.stringify([]));
    }

    function generateMpesaReceipt() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'KAN';
        for (let i = 0; i < 7; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // 2. Simple Toast Notification Displaying "Transaction Complete"
    function showSuccessNotification() {
        let alertContainer = document.getElementById('mpesa-alert-container');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.id = 'mpesa-alert-container';
            Object.assign(alertContainer.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: '999999'
            });
            document.body.appendChild(alertContainer);
        }

        const alertBox = document.createElement('div');
        Object.assign(alertBox.style, {
            background: '#00e676',
            color: '#ffffff',
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            padding: '16px 28px',
            borderRadius: '6px',
            boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
            fontSize: '1rem',
            fontWeight: '600',
            opacity: '0',
            transform: 'translateY(-20px)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });

        alertBox.textContent = "Transaction Complete";
        alertContainer.appendChild(alertBox);

        setTimeout(() => {
            alertBox.style.opacity = '1';
            alertBox.style.transform = 'translateY(0)';
        }, 50);

        setTimeout(() => {
            alertBox.style.opacity = '0';
            alertBox.style.transform = 'translateY(-10px)';
            setTimeout(() => alertBox.remove(), 300);
        }, 5000);
    }

    // 3. Update stock levels inside your hotspots database array
    function updateInventoryStorage(materialName, quantityDeducted) {
        try {
            const stored = localStorage.getItem('kanairo_hotspots');
            if (!stored) return;
            
            let hotspots = JSON.parse(stored);
            let totalDeducted = 0;

            for (let hotspot of hotspots) {
                for (let mat of hotspot.materials) {
                    if (mat.name === materialName && mat.quantity > 0) {
                        const toSubtract = Math.min(mat.quantity, quantityDeducted - totalDeducted);
                        mat.quantity -= toSubtract;
                        totalDeducted += toSubtract;
                        if (totalDeducted >= quantityDeducted) break;
                    }
                }
                if (totalDeducted >= quantityDeducted) break;
            }

            localStorage.setItem('kanairo_hotspots', JSON.stringify(hotspots));
        } catch (e) {
            console.error("Failed adjusting quantities", e);
        }
    }

    // 4. Force total stock and dashboard aggregate elements to recalculate
    function recalculateDashboardTotals() {
        const countEl = document.querySelector('.materials-count');
        const txCountEl = document.querySelector('.transactions');
        const revenueEl = document.querySelector('.revenue');

        try {
            const stored = localStorage.getItem('kanairo_hotspots');
            if (stored && countEl) {
                const hotspots = JSON.parse(stored);
                let newTotalWeight = 0;
                hotspots.forEach(h => h.materials.forEach(m => newTotalWeight += (m.quantity || 0)));
                countEl.textContent = `${newTotalWeight} kg`;
            }

            const savedTxns = JSON.parse(localStorage.getItem('kanairo_transactions')) || [];
            if (txCountEl) txCountEl.textContent = savedTxns.length;

            if (revenueEl) {
                let currentRevenue = 0;
                savedTxns.forEach(t => currentRevenue += t.amount);
                revenueEl.textContent = `KES ${currentRevenue.toLocaleString('en-KE')}`;
            }
        } catch (e) {
            console.error(e);
        }
    }

    function appendTransactionToTable(txn) {
        const tbody = document.getElementById('transactions-table');
        if (!tbody) return;

        if (tbody.children.length === 3 && tbody.innerHTML.includes('TXN12345')) {
            tbody.innerHTML = '';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${txn.id}</strong></td>
            <td><span style="color: #00e676">Buy</span> - ${txn.material}</td>
            <td>${txn.quantity} kg</td>
            <td>KES ${txn.amount.toLocaleString('en-KE')}</td>
            <td>${txn.date}</td>
        `;
        tbody.insertBefore(tr, tbody.firstChild);
    }

    function finalizeTransaction(material, quantity, pricePerKg) {
        const totalCost = quantity * pricePerKg;
        const receipt = generateMpesaReceipt();
        const timestamp = new Date().toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' });

        const txnRecord = {
            id: receipt,
            type: 'Buy',
            material: material,
            quantity: quantity,
            amount: totalCost,
            date: timestamp
        };

        const history = JSON.parse(localStorage.getItem('kanairo_transactions')) || [];
        history.push(txnRecord);
        localStorage.setItem('kanairo_transactions', JSON.stringify(history));

        updateInventoryStorage(material, quantity);
        showSuccessNotification();
        recalculateDashboardTotals();
        appendTransactionToTable(txnRecord);

        localStorage.setItem('kanairo_tx_tick', receipt);
    }

    // 5. Spawn the Modal matching your Exact Image Design Layout
    function spawnMpesaPromptModal(materialName, maxAvailable, pricePerKg, onConfirmCallback) {
        const modalOverlay = document.createElement('div');
        Object.assign(modalOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '999998',
            fontFamily: "sans-serif"
        });

        const modalBox = document.createElement('div');
        Object.assign(modalBox.style, {
            background: '#1e1e1e',
            border: '2px solid #00e676',
            borderRadius: '16px',
            padding: '35px 30px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            color: '#ffffff',
            boxSizing: 'border-box'
        });

        // Use 10kg as a starting value or max stock if it's lower
        const initialQty = Math.min(10, maxAvailable);

        modalBox.innerHTML = `
            <h2 id="mpesa-title" style="margin-top:0; color:#00e676; text-align:center; font-size:1.6rem; font-weight:bold; letter-spacing:1px; margin-bottom:10px;">M-PESA SIMULATOR</h2>
            <p id="mpesa-subtext" style="font-size:1rem; text-align:center; color:#b3b3b3; margin-bottom:30px; line-height:1.4;">
                Paying <strong id="dynamic-cost-txt" style="color:#fff;">KES ${(initialQty * pricePerKg).toLocaleString()}</strong> for <strong id="dynamic-qty-txt" style="color:#fff;">${initialQty}kg</strong> of ${materialName}.
            </p>
            <form id="mpesa-sim-form">
                <div style="margin-bottom: 20px;">
                    <label style="display:block; font-size:0.8rem; letter-spacing:1px; text-transform:uppercase; color:#8c8c8c; margin-bottom:8px; font-weight:600;">Amount to Buy (kg)</label>
                    <input type="number" id="mpesa-qty" value="${initialQty}" min="1" max="${maxAvailable}" required style="width:100%; padding:12px; background:#2d2d2d; border:1px solid #3d3d3d; border-radius:6px; color:#fff; font-size:1rem; box-sizing:border-box;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display:block; font-size:0.8rem; letter-spacing:1px; text-transform:uppercase; color:#8c8c8c; margin-bottom:8px; font-weight:600;">Phone Number</label>
                    <input type="tel" id="mpesa-phone" placeholder="e.g. 0712345678" required pattern="[0-9]{10}" style="width:100%; padding:12px; background:#2d2d2d; border:1px solid #3d3d3d; border-radius:6px; color:#fff; font-size:1rem; box-sizing:border-box;">
                </div>
                
                <div style="margin-bottom: 30px;">
                    <label style="display:block; font-size:0.8rem; letter-spacing:1px; text-transform:uppercase; color:#8c8c8c; margin-bottom:8px; font-weight:600;">M-PESA PIN</label>
                    <input type="password" id="mpesa-pin" placeholder="Enter 4-digit PIN" required maxlength="4" pattern="[0-9]{4}" style="width:100%; padding:12px; background:#2d2d2d; border:1px solid #3d3d3d; border-radius:6px; color:#fff; font-size:1rem; box-sizing:border-box;">
                </div>

                <div style="display:flex; gap:15px;">
                    <button type="button" id="mpesa-cancel-btn" style="flex:1; padding:14px; background:#333333; color:#ffffff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.9rem; text-transform:uppercase; letter-spacing:1px;">Cancel</button>
                    <button type="submit" style="flex:1; padding:14px; background:#00e676; color:#000000; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.9rem; text-transform:uppercase; letter-spacing:1px;">Confirm PIN</button>
                </div>
            </form>
        `;

        modalOverlay.appendChild(modalBox);
        document.body.appendChild(modalOverlay);

        const form = modalBox.querySelector('#mpesa-sim-form');
        const qtyInput = modalBox.querySelector('#mpesa-qty');
        const costTxt = modalBox.querySelector('#dynamic-cost-txt');
        const qtyTxt = modalBox.querySelector('#dynamic-qty-txt');

        // Dynamic Subheader String Updater Link
        qtyInput.addEventListener('input', () => {
            let currentVal = parseInt(qtyInput.value, 10) || 0;
            if (currentVal > maxAvailable) {
                currentVal = maxAvailable;
                qtyInput.value = maxAvailable;
            }
            costTxt.textContent = `KES ${(currentVal * pricePerKg).toLocaleString()}`;
            qtyTxt.textContent = `${currentVal}kg`;
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const finalSelectedQty = parseInt(qtyInput.value, 10);
            modalOverlay.remove();
            onConfirmCallback(finalSelectedQty);
        });

        modalBox.querySelector('#mpesa-cancel-btn').addEventListener('click', () => {
            modalOverlay.remove();
        });
    }

    // 6. Marketplace Interception Event Delegation Block
    document.addEventListener('click', (e) => {
        if (e.target && e.target.tagName === 'BUTTON' && e.target.textContent === 'Buy Now') {
            const card = e.target.closest('.material-card');
            if (!card) return;

            const matName = card.querySelector('h3').textContent;
            const availableText = card.querySelector('p:nth-of-type(1)').textContent;
            const priceText = card.querySelector('p:nth-of-type(2)').textContent;
            
            const maxAvailable = parseInt(availableText.replace(/[^0-9]/g, ''), 10) || 0;
            const unitPrice = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 50;

            if (maxAvailable <= 0) {
                alert("Material out of stock.");
                return;
            }

            spawnMpesaPromptModal(matName, maxAvailable, unitPrice, (chosenKgs) => {
                finalizeTransaction(matName, chosenKgs, unitPrice);
            });
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        recalculateDashboardTotals();
        try {
            const savedTxns = JSON.parse(localStorage.getItem('kanairo_transactions')) || [];
            savedTxns.slice().reverse().forEach(appendTransactionToTable);
        } catch (e) {}

        window.addEventListener('storage', (e) => {
            if (e.key === 'kanairo_tx_tick' || e.key === 'kanairo_hotspots') {
                recalculateDashboardTotals();
                const history = JSON.parse(localStorage.getItem('kanairo_transactions')) || [];
                if (history.length > 0 && e.key === 'kanairo_tx_tick') {
                    appendTransactionToTable(history[history.length - 1]);
                }
            }
        });
    });
})();