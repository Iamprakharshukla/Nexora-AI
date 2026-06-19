# 🚀 Project Titan Commerce AI
## The AI-Native Next-Generation E-Commerce Ecosystem

Project Titan is a world-class, enterprise-grade, high-fidelity e-commerce ecosystem designed to showcase Apple-like WebGL components, Tesla-like scroll interactions, Stripe-like payment checkouts, and OpenAI-style AI Copilot assistants.

---

## 🌟 Key Architecture & Features

### 🌌 Immersive 3D Space & Luxury UI
- **Procedural Orbits Canvas**: A responsive, 120 FPS WebGL-inspired canvas rendering product nodes orbiting a central quantum core.
- **Micro-Animations**: Glassmorphism controls and cursor coordinate tracking elements built using modern CSS, hover states, and smooth layouts.

### 🧠 AI Shopping Copilot
- **Voice Commerce**: Built-in speech recognition (STT) and voice speech synthesizer (TTS) logic.
- **Conversational Recommendations**: Dynamic product suggestion cards generated directly within the chat stream.

### 🔍 Semantic NLP Search
- **Embedding Space Vector Projection**: Interactive 2D projection mapping that visualizes semantic distances between query keywords and products.
- **Simulated Visual Search**: Fast image upload mapping feature maps via ViT/CLIP.

### 📊 Admin Super Panel & Analytics
- **Live Sockets**: Dynamic tick streams showcasing user traffic, payment alerts, and fraud logs.
- **Admin AI Insights**: Natural Language prompts parsed into SQL insights and charts forecasts.

---

## 🛠️ Stack & Technology

- **Frontend Workspace**: Next.js 15+ App Router, React 19, Tailwind CSS, Lucide icons.
- **Backend Workspace**: NestJS monolithic core, Socket.io gateway, Swagger APIs.
- **Databases**: PostgreSQL (Prisma), MongoDB (Mongoose), Redis caches, Qdrant vector DB.
- **Infrastructure**: Docker Compose configurations, Kubernetes manifests, CI/CD actions.

---

## 🚀 Getting Started (Quick Run)

Follow these commands to launch the workspace locally:

### 1. Install Workspace Dependencies
Run this command at the root workspace directory to install all monorepo packages (shared, frontend, backend):
```bash
npm install
```

### 2. Startup Backend Service
Start the NestJS Core API server on port 4000:
```bash
npm run dev --workspace=@titan/backend
```

### 3. Startup Frontend Web App
Start the Next.js development server on port 3000:
```bash
npm run dev --workspace=@titan/frontend
```

Now, navigate to:
- **Web App**: http://localhost:3000
- **Swagger Documentation**: http://localhost:4000/api/docs

---

## 🧪 Testing Configurations

### Unit & Integration Tests (Jest)
Run unit validations across the backend and shared folders:
```bash
npm run test --workspaces
```

### E2E Tests (Playwright)
Run end-to-end user flow scripts:
```bash
npx playwright test
```
