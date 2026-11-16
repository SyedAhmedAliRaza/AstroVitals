"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Rocket,
  Shield,
  Activity,
  Brain,
  Database,
  Radio,
  ArrowRight,
  Sparkles,
  Heart,
  Globe2,
  Lock,
  Layers,
  Award,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Starfield and Nebula Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
            <Rocket className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-wider text-slate-100 font-mono">
              ASTRO<span className="text-cyan-400">VITALS</span>
            </span>
            <span className="text-[10px] text-cyan-300/70 tracking-widest uppercase font-mono block">
              .health • Space Medicine OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NASA Space Apps 2026</span>
          </div>

          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <span>Launch Mission Control</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 py-12 lg:py-20 flex flex-col items-center text-center">
        {/* Subtitle Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AUTONOMOUS ASTRONAUT HEALTH MONITORING & CLINICAL AI</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-mono text-slate-100 max-w-4xl leading-tight"
        >
          Medicine for the <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Deep Space Frontier
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl font-sans leading-relaxed"
        >
          When Earth is 22 light-minutes away, astronauts cannot wait for Houston.
          <strong> AstroVitals</strong> pairs Tiger Data continuous biometric hypertables
          with Gemini AI autonomous clinical reasoning to diagnose, triage, and prescribe
          spaceflight countermeasures in real time.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-mono font-bold text-sm flex items-center gap-3 shadow-xl shadow-cyan-500/30 transition-all hover:scale-105"
          >
            <Rocket className="w-5 h-5 text-slate-950" />
            <span>ENTER MISSION CONTROL</span>
          </Link>

          <Link
            href="/dashboard#citations"
            className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-sm flex items-center gap-2 transition-all"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>View NASA & OSDR Citations</span>
          </Link>
        </motion.div>

        {/* Live Mission Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 w-full grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: "Mission Timeline", value: "MET +47d", sub: "Transit to Mars", icon: Radio },
            { label: "Crew Health Score", value: "94.2%", sub: "Physiology Nominal", icon: Heart },
            { label: "Deep Space Comms", value: "22m 00s", sub: "OWLT Light-Delay", icon: Globe2 },
            { label: "NASA Knowledge RAG", value: "3 Studies", sub: "OSD-575 / 656 / 53", icon: Database },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-xl backdrop-blur-md text-left flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-100">
                  {stat.value}
                </div>
                <div className="text-[11px] text-cyan-400/80 font-mono mt-1">
                  {stat.sub}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Core Architectural Highlights Grid */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 py-12 border-t border-slate-800/80">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-100">
            SYSTEM ARCHITECTURE & SPONSOR INTEGRATION
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Engineered for high-reliability medical computing in isolated spaceflight environments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-mono text-slate-100">
              Tiger Data Hypertables
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PostgreSQL with TimescaleDB continuous aggregates for 1-hour rollup telemetry
              and pgvector (768-dim) for semantic matching of NASA-STD-3001 and CSA clinical standards.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-mono text-slate-100">
              Gemini 3.8 Autonomous Triage
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Structured diagnostic JSON response schema evaluating telemetry deviations against
              OSD-575 cytokine deltas, OSD-656 urine panels, and OSD-53 genomic markers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-blue-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-mono text-slate-100">
              Emergency Comms & Deployment
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Twilio automated SMS, WhatsApp, and Voice dispatch for critical vital breaches
              and DONKI solar radiation spikes. Containerized for Vultr with GoDaddy domain routing.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-400 font-mono">
        <p>
          Built for the 2026 NASA Space Apps Challenge • "Create Health Monitoring Software for Astronauts on Space Missions"
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Simulated telemetry clearly labeled per NASA guidelines. Not for terrestrial clinical diagnosis.
        </p>
      </footer>
    </div>
  );
}
