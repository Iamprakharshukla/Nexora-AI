# 🌌 Nexora AI — Immersive Luxury Real Estate Platform

Nexora AI is an ultra-premium, high-fidelity real estate ecosystem. It blends modern **glassmorphic dark-theme aesthetics** with **AI-native capability** (interactive conversational assistant, automated pricing valuation, intelligent search console) and is backed by a **Prisma + SQLite Next.js API backend**.

---

## 🌟 Core Features & Modules

### 1. 🏠 Luxury Estates Catalog
- **Interactive Search Console**: Highly refined tabs for **Buy** and **Rent** with dropdowns for City, BHK configuration, and property types.
- **Comparison Engine**: Select up to 3 properties to compare carpet area, pricing, facing, possession date, RERA IDs, and custom premium amenities.
- **Live Price Ticker**: Simulates live luxury real estate index shifts with rising/stable indicator animations.

### 2. 🧠 AI Jarvis Orb & Command Palette
- **Conversational Real Estate Assistant**: Real-time text-to-property match engine. Suggests luxury estates dynamically based on custom user prompts (e.g. *"Show me villas in Bangalore under 10 Crore"*).
- **Interactive Visualizer**: Dynamic visual orb pulsing animations.

### 3. 📝 AI-Powered Property Listing Wizard
- **Owner & Dealer Flow**: 4-step wizard to configure properties, furnish status, facing direction, carpet area, and pricing.
- **AI-Powered Description Generation**: Enhances owner listings on-the-fly and automatically projects optimal square footage valuations based on pre-seeded city datasets.

### 4. 🧮 Interactive EMI Matrix Calculator
- **Dynamic Valuation**: Real-time principal vs. interest breakdown.
- **Dual Sliders**: Adjust loan amount, tenure, and interest rates with immediate visual graphs representing interest components.

### 5. 📊 Locality Insights & Market Matrix
- **Market Trends**: Details YoY property appreciation growth, connectivity scores, lifestyle scores, and listings trends across Worli, Whitefield, DLF Phase 5, and more.
- **Appreciation Forecasts**: Clean SVG charts tracking real estate yields up to the year 2030.

---

## 🛠️ Technology Stack

| Layer | Technologies | Description |
|---|---|---|
| **Frontend** | React 19, Next.js 15 App Router, Tailwind CSS, Framer Motion | High-performance user interface with smooth animations and interactive 3D WebGL space canvases. |
| **Database** | SQLite, Prisma ORM | File-based database configuration requiring zero external setup. |
| **Authentication** | JWT (`jose`), `bcryptjs` | State-of-the-art token security and hashed credential verification. |
| **Styling** | Custom HSL CSS, CSS Glassmorphism | Custom variables to force consistent dark modes, autofill fixes, and select element dropdown coloring. |

---

## ⚡ API Endpoint Reference

### 🔐 Auth Router
- `POST /api/auth/register` — Standard registration. Generates JWT.
- `POST /api/auth/login` — Verifies bcrypt hash. Returns JWT.
- `GET /api/auth/me` — Fetches current user session profile.

### 🏢 Properties Router
- `GET /api/properties` — Lists approved properties with filter parameters (city, BHK, category, price bounds).
- `POST /api/properties` — Creates property listing pending verification.
- `GET /api/properties/[id]` — Fetches comprehensive details for a specific listing.

### ❤️ Shortlists Router (JWT Required)
- `GET /api/shortlist` — Lists user-shortlisted estates.
- `POST /api/shortlist` — Adds a property to the user's shortlist database.
- `DELETE /api/shortlist/[id]` — Removes property from shortlist.

### 📩 Inquiries & Subscriptions
- `POST /api/inquiries` — Submits a callback or site visit booking request.
- `POST /api/newsletter` — Registers email for off-market estate alerts.

---

## 🚀 Running Locally

Follow these quick commands to spin up the codebase on your machine:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database & Migrations
Initialize the SQLite database (`prisma/dev.db`) and seed properties:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Run Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** to browse the application.

---

## 🔑 Pre-Seeded Accounts

Verify full-fledged user and admin workflows immediately using these pre-seeded accounts:

### 👤 Buyer / Client Account
- **Email**: `test@nexora.ai`
- **Password**: `user@123`

### 🔑 Administrator Dashboard Account
- **Email**: `admin@nexora.ai`
- **Password**: `nexora@admin123`

*Note: Any new credentials entered in the email password login tab will automatically register a new user in the SQLite database.*
