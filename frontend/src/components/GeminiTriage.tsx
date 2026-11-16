"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Clock,
  Send,
  Radio,
  FileText,
  ChevronRight,
  ExternalLink,
  Shield,
  Zap,
} from "lucide-react";
import {
  DiagnosticAssessment,
  RiskLevel,
  BodyRegion,
  OWLTConfig,
} from "@/lib/types";

interface GeminiTriageProps {
  assessment: DiagnosticAssessment | null;
  isLoading: boolean;
  onRequestTriage: (region?: BodyRegion) => void;
  owlt: OWLTConfig;
  onEscalate?: (type: "cmo" | "surgeon") => void;
}

export default function GeminiTriage({
  assessment,
  isLoading,
  onRequestTriage,
  owlt,
  onEscalate,
}: GeminiTriageProps) {
  const [marsCountdown, setMarsCountdown] = useState<number | null>(null);
  const isMars = owlt.mode === "Mars";

  const handleTriageClick = () => {
    if (isMars) {
      // Simulate demonstration of Mars OWLT transmission lag vs onboard AI
      setMarsCountdown(3);
      const timer = setInterval(() => {
        setMarsCountdown((prev) => {
          if (prev && prev > 1) return prev - 1;
          clearInterval(timer);
          setMarsCountdown(null);
          onRequestTriage();
          return null;
        });
      }, 1000);
    } else {
      onRequestTriage();
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL:
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/50",
          text: "text-red-400",
          label: "CRITICAL RISK",
        };
      case RiskLevel.CAUTION:
        return {
          bg: "bg-amber-500/20",
          border: "border-amber-500/50",
          text: "text-amber-400",
          label: "ELEVATED RISK / CAUTION",
        };
      case RiskLevel.NOMINAL:
      default:
        return {
          bg: "bg-emerald-500/20",
          border: "border-emerald-500/50",
          text: "text-emerald-400",
          label: "PHYSIOLOGY NOMINAL",
        };
    }
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              GEMINI 3.8 FLASH AUTONOMOUS FLIGHT SURGEON
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Grounded in pgvector NASA-STD-3001, CSA guidelines, and OSDR study baselines
          </p>
        </div>

        {/* Action Trigger Button */}
        <button
          onClick={handleTriageClick}
          disabled={isLoading || marsCountdown !== null}
          className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>
            {marsCountdown !== null
              ? `Simulating OWLT Uplink (${marsCountdown}s)...`
              : isLoading
              ? "Running Hybrid RAG Diagnostic..."
              : "Run Autonomous Diagnostic"}
          </span>
        </button>
      </div>

      {/* Mars OWLT Autonomous Justification Banner */}
      {isMars && (
        <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <Radio className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>
              <strong>Deep Space Protocol Active:</strong> Earth-Mars OWLT delay is 22 minutes (44 min round-trip).
              Onboard Gemini AI executes autonomous local triage without relying on Earth mission control.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold border border-amber-500/30">
            AUTONOMOUS
          </span>
        </div>
      )}

      {/* Main Diagnostic Body */}
      {assessment ? (
        <div className="mt-6 space-y-6">
          {/* Top Risk Score & Clinical Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Risk Gauge */}
            <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                Crew Clinical Risk Score
              </span>
              <div className="relative my-3 flex items-center justify-center">
                <div
                  className={`text-4xl font-extrabold font-mono ${
                    getRiskBadge(assessment.overall_risk).text
                  }`}
                >
                  {assessment.risk_score}
                  <span className="text-lg text-slate-400">/100</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  getRiskBadge(assessment.overall_risk).bg
                } ${getRiskBadge(assessment.overall_risk).border} ${
                  getRiskBadge(assessment.overall_risk).text
                }`}
              >
                {getRiskBadge(assessment.overall_risk).label}
              </span>
            </div>

            {/* Plain-Language Clinical Synthesis */}
            <div className="md:col-span-8 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <Stethoscope className="w-4 h-4" />
                    AI Clinical Synthesis
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Timestamp: {new Date(assessment.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {assessment.diagnosis}
                </p>
              </div>

              {/* Affected Subsystems */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  Targeted Systems:
                </span>
                {assessment.affected_systems.map((sys, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/50 text-cyan-300 border border-cyan-800/50"
                  >
                    {sys}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Prescribed Countermeasure Protocol */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Immediate Autonomous Countermeasure Protocol
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assessment.countermeasures.map((cm, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 text-xs"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center border border-emerald-500/40">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 leading-normal">{cm}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NASA Protocol & OSDR Citations Drawer */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-900/40">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <FileText className="w-4 h-4 text-cyan-400" />
                NASA / CSA Scientific Evidence Grounding (RAG Context)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                pgvector similarity match &gt; 0.88
              </span>
            </div>
            <div className="space-y-2">
              {assessment.citations.map((cite, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-cyan-300 font-semibold mb-1">
                    <span>{cite.source}</span>
                    {cite.url && (
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-slate-400 italic text-[11px] leading-relaxed">
                    "{cite.excerpt}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Escalation Console Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-mono">
              Status:{" "}
              <span className="text-slate-200">
                Assessment signed by Autonomous Medical Officer Engine
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEscalate && onEscalate("cmo")}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-medium transition-colors"
              >
                Brief Crew Medical Officer
              </button>
              <button
                onClick={() => onEscalate && onEscalate("surgeon")}
                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 text-xs font-mono font-medium transition-colors"
              >
                Escalate to Earth Flight Surgeon
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Brain className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
          <h4 className="text-sm font-mono text-slate-300 font-semibold">
            Ready for Clinical Evaluation
          </h4>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-4 font-mono">
            Click "Run Autonomous Diagnostic" to query continuous TimescaleDB telemetry,
            OSDR multi-omics baselines, and pgvector NASA-STD-3001 evidence chunks.
          </p>
        </div>
      )}
    </div>
  );
}
