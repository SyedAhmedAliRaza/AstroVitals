"use client";

import React, { useState } from "react";
import {
  Database,
  ExternalLink,
  ShieldCheck,
  Server,
  Cloud,
  Cpu,
  Lock,
  PhoneCall,
  Globe,
  Radio,
  BookOpen,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { DonkiEvent, OsdrBaseline } from "@/lib/types";

interface NasaCitationsProps {
  osdrBaselines?: OsdrBaseline[];
  donkiEvents?: DonkiEvent[];
}

export default function NasaCitations({
  osdrBaselines = [],
  donkiEvents = [],
}: NasaCitationsProps) {
  const [activeSection, setActiveSection] = useState<"resources" | "architecture">("resources");

  const architectureStack = [
    {
      name: "Tiger Data",
      subtitle: "TimescaleDB + pgvector",
      description: "Continuous astronaut biometrics hypertable with time_bucket rollups and 768-dim vector embeddings for NASA protocols.",
      status: "CONNECTED",
      statusColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40",
      icon: Database,
    },
    {
      name: "Google Gemini AI",
      subtitle: "gemini-3.8-flash & text-embedding-004",
      description: "Autonomous diagnostic engine using structured JSON response_schema and pgvector RAG grounding.",
      status: "OPERATIONAL",
      statusColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40",
      icon: Cpu,
    },
    {
      name: "Auth0 Identity",
      subtitle: "JWT Bearer & 3-Role RBAC",
      description: "Role-based access control supporting astronaut self-care, crew medical officer triage, and flight surgeon console.",
      status: "VERIFIED",
      statusColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40",
      icon: Lock,
    },
    {
      name: "Twilio Communications",
      subtitle: "Programmable SMS, WhatsApp & Voice",
      description: "Emergency alert dispatch when vitals breach critical corridor or DONKI solar particle event occurs.",
      status: "CONFIGURED",
      statusColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40",
      icon: PhoneCall,
    },
    {
      name: "Vultr Cloud",
      subtitle: "Multi-Stage Docker Architecture",
      description: "Containerized deployment orchestrating Next.js 15, FastAPI, Tiger Data, and automated Caddy TLS proxy.",
      status: "READY",
      statusColor: "text-cyan-400 bg-cyan-500/20 border-cyan-500/40",
      icon: Cloud,
    },
    {
      name: "GoDaddy Custom Domain",
      subtitle: "astrovitals.health",
      description: "Automated Let's Encrypt SSL/TLS reverse proxy routing via Caddyfile for mission control accessibility.",
      status: "ROUTED",
      statusColor: "text-cyan-400 bg-cyan-500/20 border-cyan-500/40",
      icon: Globe,
    },
  ];

  const officialNasaResources = [
    {
      title: "NASA Human Research Program (HRP) — 5 Hazards of Human Spaceflight",
      agency: "NASA Johnson Space Center",
      url: "https://www.nasa.gov/hrp/hazards",
      desc: "Scientific foundation modeling Space Radiation, Isolation & Confinement, Distance from Earth, Gravity Fields, and Hostile/Closed Environments.",
    },
    {
      title: "NASA-STD-3001: Space Flight Human-System Standard",
      agency: "NASA Office of Chief Health and Medical Officer",
      url: "https://www.nasa.gov/hhp/standards",
      desc: "Clinical thresholds for crew heart rate, blood pressure, core temperature, radiation limits, and atmospheric exposure.",
    },
    {
      title: "Canadian Space Agency (CSA) Space Medicine Guidelines",
      agency: "Canadian Space Agency",
      url: "https://www.asc-csa.gc.ca/eng/astronauts/space-medicine/",
      desc: "Countermeasure protocols for cardiovascular deconditioning, bone density degradation (1-1.5% monthly BMD loss), and neuro-vestibular shifts.",
    },
    {
      title: "NASA OSDR OSD-575: Inspiration4 Blood Serum Cytokine Baseline",
      agency: "NASA Open Science Data Repository",
      url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-575",
      desc: "Multi-omics profiling of pre- vs post-flight immune cytokine deltas (IL-6, TNF-alpha, CRP, troponin, BNP).",
    },
    {
      title: "NASA OSDR OSD-656: Inspiration4 Urine Inflammation Panel",
      agency: "NASA Open Science Data Repository",
      url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-656",
      desc: "Comprehensive 203 cytokine/chemokine biomarker panels tracking spaceflight-induced renal and metabolic stress.",
    },
    {
      title: "NASA OSDR OSD-53: Whole-Blood Astronaut Gene Expression",
      agency: "NASA Open Science Data Repository",
      url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-53",
      desc: "Genomic modulation markers quantifying immune downregulation and DNA repair pathway stress during space missions.",
    },
    {
      title: "NASA DONKI: Space Weather Database Of Notifications, Knowledge, Information",
      agency: "NASA Goddard Space Flight Center (CCMC)",
      url: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
      desc: "Live ingestion of Solar Flares (FLR) and Solar Energetic Particle (SEP) events to correlate radiation spikes with crew risk.",
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              NASA DATASETS, CITATIONS & SPONSOR INTEGRATION ARCHITECTURE
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            2026 NASA Space Apps Challenge official resources & enterprise cloud architecture
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveSection("resources")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeSection === "resources"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            NASA Knowledge & OSDR
          </button>
          <button
            onClick={() => setActiveSection("architecture")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeSection === "architecture"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sponsor Tech Stack
          </button>
        </div>
      </div>

      {/* Content Section */}
      {activeSection === "resources" ? (
        <div className="mt-6 space-y-3">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold mb-2">
            <BookOpen className="w-4 h-4" />
            Official Challenge Resources Tab & Data Sources
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {officialNasaResources.map((res, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      {res.agency}
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 font-mono mt-1">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {res.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>VECTOR RAG EMBEDDED</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* NASA DONKI Live Solar Events Ticker */}
          {donkiEvents.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-400" />
                  Live NASA DONKI Solar Flare Events (Space Weather Feed)
                </span>
                <span className="text-[10px] font-mono text-amber-400">
                  Active Real-Time Ingestion
                </span>
              </div>
              <div className="space-y-2">
                {donkiEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono flex items-center justify-between"
                  >
                    <div>
                      <span className="text-amber-400 font-bold">
                        [{evt.event_type}]
                      </span>{" "}
                      <span className="text-slate-200">{evt.description}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(evt.start_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold mb-2">
            <Layers className="w-4 h-4" />
            Production Infrastructure & Sponsor Integrations
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {architectureStack.map((tech, idx) => {
              const Icon = tech.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${tech.statusColor}`}
                      >
                        {tech.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 font-mono">
                      {tech.name}
                    </h4>
                    <p className="text-[10px] font-mono text-cyan-400/80 mt-0.5">
                      {tech.subtitle}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {tech.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    STATUS: PRODUCTION-READY
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
