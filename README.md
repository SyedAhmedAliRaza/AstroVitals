# 🚀 AstroVitals (.health) — Autonomous Astronaut Health Monitoring & Space Medicine Platform

<p align="center">
  <img src="https://img.shields.io/badge/NASA%20Space%20Apps-2026%20Challenge-0B3D91?style=for-the-badge&logo=nasa&logoColor=white" alt="NASA Space Apps 2026" />
  <img src="https://img.shields.io/badge/Next.js-15%20(App%20Router)-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/FastAPI-Python%203.11-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Tiger%20Data-TimescaleDB%20%2B%20pgvector-FDB515?style=for-the-badge&logo=postgresql&logoColor=black" alt="Tiger Data" />
  <img src="https://img.shields.io/badge/Gemini%202.5-Autonomous%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Twilio-Emergency%20Comms-F22F46?style=for-the-badge&logo=twilio&logoColor=white" alt="Twilio" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

---

## 🌌 Overview

**AstroVitals** is a production-grade, autonomous astronaut health monitoring and clinical AI platform designed for deep-space exploration missions (e.g., Artemis lunar habitats and crewed Mars transit).

On interplanetary missions to Mars, communication delays reach up to **22 minutes each way (44 minutes round-trip)**, rendering real-time telemedicine from Houston physically impossible. Concurrently, astronauts endure continuous cephalad fluid shifts, 1% to 1.5% monthly bone mineral density loss, Spaceflight-Associated Neuro-ocular Syndrome (SANS), immune dysregulation, and cosmic radiation spikes.

AstroVitals deploys an **onboard autonomous AI Flight Surgeon** that pairs continuous time-series biometric hypertables with generative clinical reasoning grounded in official NASA/CSA medical standards and multi-omics spaceflight baselines.

---

## 🫀 Core Features

1. **Interactive Anatomical Body Map (Hero Component):**
   - Clickable 6-region vector SVG human figure (Brain/Ocular, Cardiovascular, Musculoskeletal, Immune/Hematologic, Metabolic/Renal, Integumentary/Radiation Dosimetry).
   - Dynamic color-coded status badges (`Green = Nominal`, `Amber = Caution`, `Red = Critical`) reflecting real-time telemetry.
   - Slide-in **Guided Self-Exam & Physiology Drawer** providing step-by-step clinical self-exam checklists (e.g., optic nerve ultrasound, BP cuff, glucose fingersticks) and escalation thresholds.

2. **Continuous Vital Telemetry & NASA Safe Corridors:**
   - Powered by PostgreSQL + TimescaleDB continuous hypertables using `time_bucket('1 hour', recorded_at)` SQL queries.
   - Interactive Recharts visualizations with 24-hour, 7-day, and 30-day views plotted directly against shaded **NASA-STD-3001** clinical boundaries.

3. **Autonomous Gemini AI Flight Surgeon & RAG Triage:**
   - Powered by `gemini-3.8-flash` with strict Pydantic `response_schema` structured outputs.
   - RAG grounding using `text-embedding-004` and PostgreSQL `pgvector(768)` indexing NASA-STD-3001, CSA guidelines, and HRP 5 Hazards.
   - **Mars OWLT Delay Simulator Toggle:** Switch between 0-second LEO and 22-minute Mars speed-of-light delay to demonstrate why onboard autonomous AI is indispensable.

4. **Gamified Countermeasures & Behavioral Health Hub:**
   - Daily quests tracking ARED resistive exercise compliance, circadian light/sleep logs, and cognitive check-ins.
   - Gamified XP progression, 14-day streak tracking, and Crew Readiness Score gauges.

5. **Twilio Emergency Comms Console:**
   - Programmable SMS, WhatsApp, and Voice dispatch to Earth Mission Control and the onboard Crew Medical Officer.
   - Real-time delivery receipt monitoring, automated solar flare alert simulations, and local testing via **Twilio Dev Phone**.

---

## 🏗️ Architecture & Sponsor Integrations

| Subsystem | Technology | Purpose & Integration |
|---|---|---|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Recharts | Interactive Mission Control dashboard, anatomical SVG, telemetry charts |
| **Backend API** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy, asyncpg | High-throughput REST API, clinical evaluation engine, background workers |
| **Database (Tiger Data)** | PostgreSQL 16 + TimescaleDB 2.16 + pgvector | `vital_telemetry` hypertables + `nasa_medical_knowledge` vector embeddings (768-dim) |
| **AI Reasoning** | Google Gemini API (`gemini-3.8-flash`, `text-embedding-004`) | Deterministic clinical JSON triage, countermeasure planning, self-exam guidance |
| **Identity & RBAC** | Auth0 SDK + FastAPI JWT Bearer verification | 3-Role RBAC: `astronaut`, `crew_medical_officer`, and `flight_surgeon` |
| **Communications** | Twilio Python SDK (`twilio`) | Automated SMS/WhatsApp/Voice alerts for critical vitals and DONKI radiation storms |
| **Infrastructure** | Docker Compose, Caddy Reverse Proxy, Vultr Cloud | Automated TLS, container orchestration, pre-configured for `astrovitals.health` |

---

## 📡 NASA Datasets & Official Resources Integrated

AstroVitals directly incorporates and cites the official NASA Space Apps Challenge resources:

1. **NASA Open Science Data Repository (OSDR):**
   - **[OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575):** Inspiration4 Blood Serum metabolic, cardiac (Troponin, BNP), and cytokine pre/post-flight reference deltas.
   - **[OSD-656](https://osdr.nasa.gov/bio/repo/data/studies/OSD-656):** Inspiration4 Urine Inflammation Panel (203 cytokine/chemokine biomarker shifts).
   - **[OSD-53](https://osdr.nasa.gov/bio/repo/data/studies/OSD-53):** Whole-blood astronaut gene expression modulation markers (immune downregulation and DNA repair pathways).
2. **NASA Human Research Program (HRP):**
   - The *5 Hazards of Human Spaceflight* (Space Radiation, Isolation & Confinement, Distance from Earth, Gravity Fields, Hostile/Closed Environments).
3. **NASA-STD-3001 (Vol. 1 Rev B):**
   - Space Flight Human-System Standard clinical safe corridor thresholds.
4. **Canadian Space Agency (CSA) Space Medicine Guidelines:**
   - Countermeasures for cardiovascular deconditioning, bone mineral density loss, muscle atrophy, and SANS.
5. **NASA DONKI Live API:**
   - Real-time Solar Flare (`FLR`) and Solar Energetic Particle (`SEP`) ingestion to correlate radiation spikes with crew risk.

> ⚠️ **NASA Challenge Compliance Note:** All vital sign telemetry in demonstration modes is clearly labeled as **simulated telemetry** in accordance with NASA guidelines.

---

## 🚀 Quick Start

### 1. Clone & Configure
```bash
git clone https://github.com/SyedAhmedAliRaza/AstroVitals.git
cd AstroVitals
cp .env.example .env
```
*(By default, `DEMO_MODE=true` enables full offline simulation without needing external API keys!)*

### 2. Run with Docker Compose
```bash
docker compose up --build -d
```

### 3. Open the Application
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
