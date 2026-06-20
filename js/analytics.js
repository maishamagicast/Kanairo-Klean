(function () {
    const MAX_HISTORY_POINTS = 15;
    let priceChart = null;

    // Fixed base prices mirroring your locked marketplace data
    const basePrices = {
        'Plastic (PET)': 50,
        'Plastic (HDPE)': 55,
        'Paper': 30,
        'Metal': 100,
        'E-Waste': 500
    };

    let simulatedLivePrices = { ...basePrices };

    const priceHistoryData = {
        labels: [],
        'Plastic (PET)': [],
        'Plastic (HDPE)': [],
        'Paper': [],
        'Metal': [],
        'E-Waste': []
    };

    const materialColors = {
        'Plastic (PET)': { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.05)' },
        'Plastic (HDPE)': { border: '#10b981', bg: 'rgba(16, 185, 129, 0.05)' },
        'Paper': { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)' },
        'Metal': { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)' },
        'E-Waste': { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.05)' }
    };

    function loadChartLibrary(callback) {
        if (window.Chart) {
            callback();
            return;
        }
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = callback;
        script.onerror = () => console.error("Could not load Chart.js via CDN.");
        document.head.appendChild(script);
    }

    function injectCanvasElement() {
        const graphWrapper = document.querySelector('.market-trends-graph');
        if (!graphWrapper) return null;

        graphWrapper.innerHTML = ''; 
        graphWrapper.style.position = 'relative';
        graphWrapper.style.height = '350px';
        graphWrapper.style.width = '100%';

        const canvas = document.createElement('canvas');
        canvas.id = 'dynamicPriceHistoryChart';
        graphWrapper.appendChild(canvas);

        return canvas.getContext('2d');
    }

    // CREATE OR FETCH THE KANAIRO CUSTOM HTML TOOLTIP ELEMENT
    function getOrCreateTooltip() {
        let tooltipEl = document.getElementById('chartjs-custom-tooltip');
        
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-custom-tooltip';
            
            // Inline styling to capture the exact look from your screenshot
            Object.assign(tooltipEl.style, {
                background: '#111111',
                color: '#ffffff',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                padding: '20px 40px',
                borderRadius: '4px',
                position: 'absolute',
                transform: 'translate(-50%, -110%)',
                pointerEvents: 'none',
                opacity: '0',
                transition: 'opacity 0.15s ease, left 0.1s ease, top 0.1s ease',
                zIndex: '100',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                textAlign: 'center',
                // Custom accent borders to mimic your reference card decoration
                borderLeft: '5px solid #00e676',
                borderBottom: '5px solid #00e676'
            });
            
            document.body.appendChild(tooltipEl);
        }
        return tooltipEl;
    }

    // CUSTOM TOOLTIP CONTEXT HANDLER
    function customTooltipHandler(context) {
        const { chart, tooltip } = context;
        const tooltipEl = getOrCreateTooltip();

        // Hide if no tooltip item is hovered
        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
        }

        // Set Text Data Content if elements exist
        if (tooltip.body) {
            const title = tooltip.title || "TREND LOG";
            const dataPoint = tooltip.dataPoints[0];
            const materialName = dataPoint.dataset.label;
            const currentPrice = dataPoint.raw;

            // Generate clean contextual data inside the popup layout card
            tooltipEl.innerHTML = `
                <div style="font-weight: bold; font-size: 1.25rem; color: #00e676; margin-bottom: 12px; letter-spacing: 1px;">
                    ${materialName.toUpperCase()} UPDATE
                </div>
                <div style="font-size: 0.9rem; color: #cccccc; line-height: 1.6;">
                    Live Pricing Rate: <span style="color: #ffffff; font-weight: bold;">${currentPrice} KES/kg</span><br>
                    Base Market Value: ${basePrices[materialName]} KES/kg<br>
                    Recorded Timestamp: ${dataPoint.label}
                </div>
            `;
        }

        // Find position of the chart on the page view portal
        const position = chart.canvas.getBoundingClientRect();

        // Position the custom popup directly over the active hovered node item point
        tooltipEl.style.opacity = '1';
        tooltipEl.style.left = position.left + window.pageXOffset + tooltip.caretX + 'px';
        tooltipEl.style.top = position.top + window.pageYOffset + tooltip.caretY + 'px';
    }

    function initChart(ctx) {
        const datasets = Object.keys(materialColors).map(material => ({
            label: material,
            data: priceHistoryData[material],
            borderColor: materialColors[material].border,
            backgroundColor: materialColors[material].bg,
            borderWidth: 2,
            pointRadius: 3,
            hoverPointRadius: 6, // Make point larger when hovered
            tension: 0.2, 
            fill: true
        }));

        priceChart = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: priceHistoryData.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { title: { display: true, text: 'Price (KES / kg)' } },
                    x: { title: { display: true, text: 'Real-time Ticks (5s)' } }
                },
                plugins: {
                    // Turn off built-in tooltip, hook up our custom element engine
                    tooltip: {
                        enabled: false,
                        external: customTooltipHandler
                    }
                }
            }
        });
    }

    function getActiveInventoryMaterials() {
        try {
            const stored = localStorage.getItem('kanairo_hotspots');
            if (!stored) return [];
            const hotspots = JSON.parse(stored);
            const activeSet = new Set();

            hotspots.forEach(h => {
                h.materials.forEach(m => {
                    if (m.quantity > 0) activeSet.add(m.name);
                });
            });
            return Array.from(activeSet);
        } catch (e) {
            return Object.keys(basePrices); 
        }
    }

    function fluctuatePricesAndTickChart() {
        if (!priceChart) return;

        const timestamp = new Date().toLocaleTimeString('en-KE', { hour12: false });
        const activeItems = getActiveInventoryMaterials();

        Object.keys(basePrices).forEach(matName => {
            const fluctuation = (Math.random() - 0.5) * 0.1; 
            simulatedLivePrices[matName] = Math.round(basePrices[matName] * (1 + fluctuation));
        });

        priceHistoryData.labels.push(timestamp);
        if (priceHistoryData.labels.length > MAX_HISTORY_POINTS) {
            priceHistoryData.labels.shift();
        }

        Object.keys(materialColors).forEach(material => {
            const dataTarget = priceHistoryData[material];

            if (activeItems.includes(material)) {
                dataTarget.push(simulatedLivePrices[material]);
            } else {
                dataTarget.push(null); 
            }

            if (dataTarget.length > MAX_HISTORY_POINTS) {
                dataTarget.shift();
            }
        });

        priceChart.update('none'); 
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadChartLibrary(() => {
            const ctx = injectCanvasElement();
            if (!ctx) return;
            
            initChart(ctx);
            fluctuatePricesAndTickChart();
            setInterval(fluctuatePricesAndTickChart, 5000);

            window.addEventListener('storage', (e) => {
                if (e.key === 'kanairo_hotspots' && priceChart) {
                    priceChart.update();
                }
            });
        });
    });
})();