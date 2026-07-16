# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:
## Our Solution
- **Price Discovery** - Real-time market rates for PET, HDPE, and E-Waste. 
- **Verified Inventory** - Digital logging of "Material Hotspots" for real-time tracking.
- **Instant Settlement** - Automated M-Pesa payouts at the point of weight verification.  


## Who it is For
|---|---|
| **Primary Users (Nodes)** | Local aggregators and yard owners who act as digital nodes |
| **Beneficiaries**| Thousands of independent street-level collectors |
| **Industrial Clients** | Recycling plants requiring steady,traceable supply chains |
| **Corporate Clients** | Companies requiring Extended Producer Responsibility (EPR) compliance |


## Key Difference
- **Digital Circular Ledger** — Transforms physical waste into a traceable digital asset.
- **The "Micro-Hub" Strategy** — Bridges the device gap by using yard owners as proxies for collectors who lack smartphones/data access.
- **EPR Compliance** — Creates a verified paper trail aligned with incoming 2026 environmental regulations.
- **First-Mover Advantage** — Purpose-built compliance tooling ahead of the 2026 EPR standards, combined with a proxy-user model that sidesteps the informal sector's device-access barrier.


## Project structure
|-------css/
|---images/
| |---garbage favicon.png
| |---right tree.avif
| |--smiley garbage bin.jpg
|---js/
| |---about.js
| |---analytics.js
| |---compliance.js
| |---data-loader.js
| |---home-static.js
| |---home.js
| |---inventory.js
| |---market-data.js
| |--marketplace.js
| |---payments.js
| |---react-shared.js
| |---reveal.js
| |---storage.js
|---.gitignore
|---about.html
|---compliance.html
|---dashboard.html
|---index.html
|---marketplace.html
|---README.md

## Pages
- ** `index.html`** -Landing page
- ** `dashboard.html`** - User/node dashboard
- ** `marketplace.html`** - Marketplace for buying/selling materials
- ** `compliance.html`** - EPR compliance & traceability information
- ** `about.html`** - About the project


## Core Scripts
- **`analytics.js`** — Tracking and reporting on platform metrics
- **`inventory.js`** — Digital inventory and material hotspot logging
- **`marketplace.js`** — Marketplace logic (pricing, listings, transactions)
- **`payments.js`** — Automated M-Pesa payout integration


## Key Metrics We are Targeting
- 📈 **Collector Earnings** — Up to 30% increase in income via fair market rates
- 📦 **Supply Predictability** — Reduced supply shocks for industrial recyclers
- ✅ **Traceability** — 100% material traceability from collector to plant

## Getting Started

1. Clone the repository
```bash
   git clone <your-repo-url>
   cd KANAIRO-KLEAN
```
2. Open `index.html` in your browser, or serve the folder with a local server:
```bash
   npx serve .
```

## Revenue Model

- **Marketplace Efficiency** — Capturing value by replacing inefficient brokerage with a streamlined digital system.
- **Traceability Data** — Providing verified data to meet 2026 EPR compliance requirements.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
