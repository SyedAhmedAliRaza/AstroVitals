"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Heart,
  Bone,
  ShieldCheck,
  Droplet,
  SunMedium,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  X,
  Stethoscope,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { BodyRegion, BodyRegionStatus, RiskLevel } from "@/lib/types";

interface BodyMapSVGProps {
  regions: BodyRegionStatus[];
  onSelectRegion?: (region: BodyRegion) => void;
  onRequestTriage?: (region: BodyRegion) => void;
}

export default function BodyMapSVG({
  regions,
  onSelectRegion,
  onRequestTriage,
}: BodyMapSVGProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<BodyRegion>(
    BodyRegion.BRAIN_OCULAR
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeRegion =
    regions.find((r) => r.region === selectedRegionId) || regions[0];

  const getStatusColor = (status: RiskLevel) => {
    switch (status) {
      case RiskLevel.CRITICAL:
        return {
          fill: "rgba(239, 68, 68, 0.35)",
          stroke: "#ef4444",
          badge: "bg-red-500/20 text-red-400 border-red-500/40",
          glow: "drop-shadow(0 0 12px rgba(239,68,68,0.7))",
        };
      case RiskLevel.CAUTION:
        return {
          fill: "rgba(245, 158, 11, 0.3)",
          stroke: "#f59e0b",
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
          glow: "drop-shadow(0 0 10px rgba(245,158,11,0.6))",
        };
      case RiskLevel.NOMINAL:
      default:
        return {
          fill: "rgba(16, 185, 129, 0.25)",
          stroke: "#10b981",
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          glow: "drop-shadow(0 0 8px rgba(16,185,129,0.5))",
        };
    }
  };

  const handleRegionClick = (regionId: BodyRegion) => {
    setSelectedRegionId(regionId);
    setIsDrawerOpen(true);
    if (onSelectRegion) onSelectRegion(regionId);
  };

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Background Hologram Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header title */}
      <div className="relative flex items-center justify-between mb-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              BIOMEDICAL ANATOMICAL MAP
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Click any physiological subsystem for guided self-exam & microgravity analysis
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Nominal
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Caution
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        {/* Left: Quick Region Badges / Selector Buttons */}
        <div className="lg:col-span-4 space-y-2.5">
          {regions.map((reg) => {
            const isSelected = selectedRegionId === reg.region;
            const style = getStatusColor(reg.status);

            const getIcon = (r: BodyRegion) => {
              switch (r) {
                case BodyRegion.BRAIN_OCULAR:
                  return Brain;
                case BodyRegion.CARDIOVASCULAR:
                  return Heart;
                case BodyRegion.MUSCULOSKELETAL:
                  return Bone;
                case BodyRegion.IMMUNE_HEMATOLOGIC:
                  return ShieldCheck;
                case BodyRegion.METABOLIC_RENAL:
                  return Droplet;
                case BodyRegion.INTEGUMENTARY_RADIATION:
                  return SunMedium;
              }
            };
            const Icon = getIcon(reg.region);

            return (
              <motion.button
                key={reg.region}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRegionClick(reg.region)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg border ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                        : "bg-slate-800/60 border-slate-700 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {reg.name}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      {reg.summary}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${style.badge}`}
                  >
                    {reg.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Center: Anatomical Vector Body Map SVG */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-4 relative min-h-[460px]">
          {/* Target Reticle Background */}
          <div className="absolute w-72 h-72 rounded-full border border-cyan-500/10 pointer-events-none animate-spin-slow" />
          <div className="absolute w-96 h-96 rounded-full border border-dashed border-cyan-500/10 pointer-events-none" />

          <svg
            viewBox="0 0 320 520"
            className="w-full max-w-[320px] h-auto drop-shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer"
          >
            <defs>
              {/* Outer Glow Filters */}
              <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Astronaut Full Body Silhouette Base */}
            <path
              d="M 160,35 
                 C 142,35 132,50 132,70 
                 C 132,88 140,100 150,105 
                 C 130,112 110,125 96,150 
                 C 82,175 75,220 72,270 
                 C 70,300 80,310 92,305 
                 C 98,300 106,260 110,230 
                 L 112,320 
                 L 105,450 
                 C 103,475 125,485 136,485 
                 C 146,485 152,460 154,420 
                 L 160,335 
                 L 166,420 
                 C 168,460 174,485 184,485 
                 C 195,485 217,475 215,450 
                 L 208,320 
                 L 210,230 
                 C 214,260 222,300 228,305 
                 C 240,310 250,300 248,270 
                 C 245,220 238,175 224,150 
                 C 210,125 190,112 170,105 
                 C 180,100 188,88 188,70 
                 C 188,50 178,35 160,35 Z"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="#1e293b"
              strokeWidth="2"
            />

            {/* 1. BRAIN & OCULAR (Head / Eyes / SANS) */}
            {(() => {
              const reg = regions.find((r) => r.region === BodyRegion.BRAIN_OCULAR);
              const color = getStatusColor(reg?.status || RiskLevel.NOMINAL);
              const isSelected = selectedRegionId === BodyRegion.BRAIN_OCULAR;

              return (
                <g
                  onClick={() => handleRegionClick(BodyRegion.BRAIN_OCULAR)}
                  className="group transition-all"
                >
                  <circle
                    cx="160"
                    cy="70"
                    r="32"
                    fill={color.fill}
                    stroke={isSelected ? "#38bdf8" : color.stroke}
                    strokeWidth={isSelected ? "3" : "1.8"}
                    strokeDasharray={isSelected ? "none" : "3,2"}
                    className="transition-all duration-300 group-hover:stroke-cyan-300"
                    style={{ filter: isSelected ? color.glow : "none" }}
                  />
                  {/* Visor highlight */}
                  <ellipse
                    cx="160"
                    cy="68"
                    rx="18"
                    ry="11"
                    fill="rgba(6, 182, 212, 0.4)"
                    stroke="#22d3ee"
                    strokeWidth="1.2"
                  />
                  {/* Pulse ring for alerts */}
                  {reg?.status !== RiskLevel.NOMINAL && (
                    <circle
                      cx="160"
                      cy="70"
                      r="36"
                      fill="none"
                      stroke={color.stroke}
                      strokeWidth="1"
                      className="animate-ping opacity-50"
                    />
                  )}
                  <text
                    x="160"
                    y="72"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    OCULAR/CNS
                  </text>
                </g>
              );
            })()}

            {/* 2. CARDIOVASCULAR (Chest / Heart / Hemodynamics) */}
            {(() => {
              const reg = regions.find((r) => r.region === BodyRegion.CARDIOVASCULAR);
              const color = getStatusColor(reg?.status || RiskLevel.NOMINAL);
              const isSelected = selectedRegionId === BodyRegion.CARDIOVASCULAR;

              return (
                <g
                  onClick={() => handleRegionClick(BodyRegion.CARDIOVASCULAR)}
                  className="group transition-all"
                >
                  <path
                    d="M 134,122 
                       C 145,115 175,115 186,122 
                       C 192,138 190,165 182,185 
                       C 172,192 148,192 138,185 
                       C 130,165 128,138 134,122 Z"
                    fill={color.fill}
                    stroke={isSelected ? "#38bdf8" : color.stroke}
                    strokeWidth={isSelected ? "3" : "2"}
                    className="transition-all duration-300 group-hover:stroke-cyan-300"
                    style={{ filter: isSelected ? color.glow : "none" }}
                  />
                  <circle cx="160" cy="150" r="9" fill="#ef4444" opacity="0.8" className="animate-pulse" />
                  <Heart className="w-3.5 h-3.5 text-white" />
                  <text
                    x="160"
                    y="175"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    CARDIO
                  </text>
                </g>
              );
            })()}

            {/* 3. METABOLIC & RENAL (Abdomen / Hydration / OSD-656) */}
            {(() => {
              const reg = regions.find((r) => r.region === BodyRegion.METABOLIC_RENAL);
              const color = getStatusColor(reg?.status || RiskLevel.NOMINAL);
              const isSelected = selectedRegionId === BodyRegion.METABOLIC_RENAL;

              return (
                <g
                  onClick={() => handleRegionClick(BodyRegion.METABOLIC_RENAL)}
                  className="group transition-all"
                >
                  <path
                    d="M 136,192 
                       C 148,192 172,192 184,192 
                       C 188,215 184,245 178,258 
                       C 168,262 152,262 142,258 
                       C 136,245 132,215 136,192 Z"
                    fill={color.fill}
                    stroke={isSelected ? "#38bdf8" : color.stroke}
                    strokeWidth={isSelected ? "3" : "2"}
                    className="transition-all duration-300 group-hover:stroke-cyan-300"
                    style={{ filter: isSelected ? color.glow : "none" }}
                  />
                  <text
                    x="160"
                    y="228"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    RENAL/GLU
                  </text>
                </g>
              );
            })()}

            {/* 4. MUSCULOSKELETAL (Limbs / Spine / ARED load) */}
            {(() => {
              const reg = regions.find((r) => r.region === BodyRegion.MUSCULOSKELETAL);
              const color = getStatusColor(reg?.status || RiskLevel.NOMINAL);
              const isSelected = selectedRegionId === BodyRegion.MUSCULOSKELETAL;

              return (
                <g
                  onClick={() => handleRegionClick(BodyRegion.MUSCULOSKELETAL)}
                  className="group transition-all"
                >
                  {/* Left Leg */}
                  <path
                    d="M 120,270 L 148,270 L 146,440 L 122,440 Z"
                    fill={color.fill}
                    stroke={isSelected ? "#38bdf8" : color.stroke}
                    strokeWidth={isSelected ? "2.5" : "1.8"}
                  />
                  {/* Right Leg */}
                  <path
                    d="M 172,270 L 200,270 L 198,440 L 174,440 Z"
                    fill={color.fill}
                    stroke={isSelected ? "#38bdf8" : color.stroke}
                    strokeWidth={isSelected ? "2.5" : "1.8"}
                  />
                  {/* Spine Center Axis */}
                  <line
                    x1="160"
                    y1="115"
                    x2="160"
                    y2="265"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="4,3"
                  />
                  <text
                    x="160"
                    y="350"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    BMD / ARED
                  </text>
                </g>
              );
            })()}

            {/* 5. IMMUNE & HEMATOLOGIC (Blood circulation & OSD-575 / OSD-53) */}
            {(() => {
              const reg = regions.find((r) => r.region === BodyRegion.IMMUNE_HEMATOLOGIC);
              const color = getStatusColor(reg?.status || RiskLevel.NOMINAL);
              const isSelected = selectedRegionId === BodyRegion.IMMUNE_HEMATOLOGIC;

              return (
                <g
                  onClick={() => handleRegionClick(BodyRegion.IMMUNE_HEMATOLOGIC)}
                  className="group transition-all"
                >
                  {/* Left Arm Vascular */}
                  <path
                    d="M 98,145 L 124,135 L 86,275 L 75,268 Z"
                    fill={color.fill}
                    stroke={isSelected ? "#38bdf8" : color.stroke}
                    strokeWidth="1.8"
                  />
                  {/* Right Arm Vascular */}
                  <path
                    d="M 222,145 L 196,135 L 234,275 L 245,268 Z"
                    fill={color.fill}
                    stroke={isSelected ? "#38bdf8" : color.stroke}
                    strokeWidth="1.8"
                  />
                  <text
                    x="75"
                    y="215"
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    OSD-575
                  </text>
                  <text
                    x="245"
                    y="215"
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    OSD-53
                  </text>
                </g>
              );
            })()}

            {/* 6. INTEGUMENTARY & RADIATION DOSIMETRY (Full Body Contour Halo) */}
            {(() => {
              const reg = regions.find((r) => r.region === BodyRegion.INTEGUMENTARY_RADIATION);
              const color = getStatusColor(reg?.status || RiskLevel.NOMINAL);
              const isSelected = selectedRegionId === BodyRegion.INTEGUMENTARY_RADIATION;

              return (
                <g
                  onClick={() => handleRegionClick(BodyRegion.INTEGUMENTARY_RADIATION)}
                  className="group transition-all"
                >
                  <circle
                    cx="275"
                    cy="65"
                    r="24"
                    fill={color.fill}
                    stroke={isSelected ? "#38bdf8" : color.stroke}
                    strokeWidth="1.8"
                    className="cursor-pointer"
                  />
                  <text
                    x="275"
                    y="63"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    DOSIMETRY
                  </text>
                  <text
                    x="275"
                    y="74"
                    textAnchor="middle"
                    fill={color.stroke}
                    fontSize="7"
                    fontFamily="monospace"
                    pointerEvents="none"
                  >
                    {reg?.status.toUpperCase()}
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Quick Click Hint */}
          <div className="text-center mt-3">
            <span className="text-[11px] font-mono text-cyan-300/80 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/40">
              Active Focus: {activeRegion.name} ({activeRegion.status.toUpperCase()})
            </span>
          </div>
        </div>
      </div>

      {/* Guided Self-Exam & Physiology Drawer (Modal Slide-In) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end"
            onClick={() => setIsDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-slate-950 border-l border-cyan-500/30 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${
                          getStatusColor(activeRegion.status).badge
                        }`}
                      >
                        {activeRegion.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        NASA-STD-3001
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 font-mono mt-1">
                      {activeRegion.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Key Biometric Readings */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4" />
                    Current Telemetry & Biomarkers
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {activeRegion.key_metrics.map((km, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800"
                      >
                        <div className="text-[11px] text-slate-400 font-mono">
                          {km.label}
                        </div>
                        <div className="text-lg font-bold font-mono text-slate-100 mt-0.5 flex items-baseline gap-1">
                          {km.value}{" "}
                          <span className="text-xs text-slate-400 font-normal">
                            {km.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* How Microgravity Affects This System */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                  <h4 className="text-xs font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <BookOpen className="w-4 h-4" />
                    Microgravity & Space Radiation Physiology
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeRegion.microgravity_effects}
                  </p>
                </div>

                {/* Step-by-Step Guided Self-Exam Protocol */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Onboard Guided Self-Exam Protocol
                  </h4>
                  <div className="space-y-2">
                    {activeRegion.self_exam_steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 text-xs"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[11px] font-bold flex items-center justify-center border border-cyan-500/40">
                          {idx + 1}
                        </span>
                        <p className="text-slate-300 leading-normal">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escalation Thresholds */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                  <h4 className="text-xs font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    When to Escalate to CMO / Flight Surgeon
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeRegion.escalation_criteria.map((crit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Drawer Bottom Action */}
              <div className="pt-4 border-t border-slate-800 flex gap-3">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (onRequestTriage) onRequestTriage(activeRegion.region);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Request Gemini AI Assessment for {activeRegion.name}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
