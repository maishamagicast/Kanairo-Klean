# Kanairo-Klean ♻️
A digital marketplace platform connecting informal waste collectors, local aggregator yards, and industrial recyclers — bringing price transparency, instant payments, and full material traceability to the waste economy.

## The Problem
- **Asymmetric Information** - Collectors sell materials at arbitrary prices due to a lack of market data.
- **Liquidity Delays** - Independent collectors face significant gaps in receiving payments. 
- **Unpredictable Supply** - Industrial recyclers suffer from frequent supply shocks.  
- **Inefficient Brokerage** - The current waste economy relies on manual, inefficient middleman structures.

## Our Solution
- **Price Discovery** - Real-time market rates for PET, HDPE, and E-Waste. 
- **Verified Inventory** - Digital logging of "Material Hotspots" for real-time tracking.
- **Instant Settlement** - Automated M-Pesa payouts at the point of weight verification.  


## Who it is For
| Primary Users (Nodes) | Beneficiaries | Industrial Clients | Corporate Clients |
| :--- | :--- | :--- | :--- |
| Local aggregators and yard owners who act as digital nodes | Thousands of independent street-level collectors | Recycling plants requiring steady, traceable supply chains | Companies requiring Extended Producer Responsibility (EPR) compliance |


## Key Difference
- **Digital Circular Ledger** — Transforms physical waste into a traceable digital asset.
- **The "Micro-Hub" Strategy** — Bridges the device gap by using yard owners as proxies for collectors who lack smartphones/data access.
- **EPR Compliance** — Creates a verified paper trail aligned with current 2026 environmental regulations.
- **First-Mover Advantage** — Purpose-built compliance tooling aligned with active 2026 EPR standards, combined with a proxy-user model that sidesteps the informal sector's device-access barrier.


## Project Structure
```text
Kanairo-Klean/
├── public/
│   ├── data/
│   │   └── site-data.json       # Centralized platform static data
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Global SPA Navigation with React Router
│   │   └── Footer.jsx
│   ├── css/
│   │   ├── styles.css           # Global typography, colors & variables
│   │   ├── dashboard.css        # Scoped CSS grid-shell layouts
│   │   └── responsive.css       # Layout media queries
│   ├── hooks/
│   │   └── useScrollReveal.jsx  # Intersection observer hook for viewport triggers
│   ├── pages/
│   │   ├── Home.jsx             # Platform landing page
│   │   ├── About.jsx            # Platform mission & objectives
│   │   ├── Compliance.jsx       # EPR compliance tools & details
│   │   ├── Dashboard.jsx        # Node operator panel (sticky flex-aside layout)
│   │   └── Marketplace.jsx      # Active listings & pricing interface
│   ├── utils/
│   │   └── dataLoader.jsx       # Cached module-level Promise loader for site-data
│   ├── App.jsx                  # React Router configuration & path mappings
│   └── main.jsx                 # Vite application entry point
├── package.json                 # Dependency manifests (React, Router, Recharts, Lucide)
├── vite.config.js               # Vite compilation profiles
└── README.md
```


## Tech Stack & Dependencies
- **Core Engine:** React 18 / Vite (Single Page Application architecture)
- **Routing:** `react-router-dom` (Dynamic client-side transitions)
- **Icons:** `lucide-react` (SVG-based system icons)
- **Analytics:** `recharts` (Declarative interactive node-dashboard visualizers)


## Key Metrics We are Targeting
- 📈 **Collector Earnings** — Up to 30% increase in income via fair market rates
- 📦 **Supply Predictability** — Reduced supply shocks for industrial recyclers
- ✅ **Traceability** — 100% material traceability from collector to plant


## Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/maishamagicast/Kanairo-Klean.git](https://github.com/maishamagicast/Kanairo-Klean.git)
   cd Kanairo-Klean
   ```

2. Install the application dependencies:
   ```bash
   npm install
   ```

3. Spin up the local development server:
   ```bash
   npm run dev
   ```

4. Open the browser and navigate to the local server port provided by Vite (typically `http://localhost:5173`).


## Revenue Model
- **Marketplace Efficiency** — Capturing transactional micro-fees by replacing inefficient manual brokerage structures with a streamlined digital escrow system.
- **Traceability Data** — Offering enterprise SaaS API access to verified logistics audit logs to fulfill corporate 2026 EPR compliance requirements.
```
