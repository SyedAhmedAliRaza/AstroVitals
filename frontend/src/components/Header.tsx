"use client";

import React from "react";
import {
  Radio,
  Clock,
  Shield,
  User,
  Activity,
  Zap,
  Globe2,
  AlertTriangle,
} from "lucide-react";
import { OWLTConfig } from "@/lib/types";

interface HeaderProps {
  owlt: OWLTConfig;
  onToggleOwlt: () => void;
  astronautName: string;
  role: string;
  missionDay: number;
  activeAlertCount: number;
}

export default function Header({
  owlt,
  onToggleOwlt,
  astronautName,
  role,
  missionDay,
  activeAlertCount,
}: HeaderProps) {
  const isMars = owlt.mode === "Mars";

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 px-6 py-3 flex items-center justify-between">
      {/* Left: Location & Telemetry Health */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
            Deep Space Hab 1 • Telemetry Synced
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>TimescaleDB Hypertable: 1 Hz</span>
        </div>
      </div>

      {/* Center / Right: Mars OWLT Toggle & User Profile */}
      <div className="flex items-center gap-4">
        {/* Mars OWLT Delay Simulator Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {isMars ? (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Globe2 className="w-4 h-4 text-amber-500 animate-spin-slow" />
                MARS OWLT: 22m 00s
              </span>
            ) : (
              <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                <Radio className="w-4 h-4 text-cyan-400" />
                LEO DELAY: 0.0s
              </span>
            )}
          </div>

          <button
            onClick={onToggleOwlt}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isMars ? "bg-amber-600" : "bg-cyan-700"
            }`}
            title="Toggle Earth-Mars One-Way Light Time (OWLT) Communication Delay"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                isMars ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>

          <span className="hidden lg:inline text-[10px] font-mono text-slate-400 border-l border-slate-700 pl-2">
            {isMars ? "Autonomous Onboard AI Active" : "Earth Comms Real-Time"}
          </span>
        </div>

        {/* Active Alerts Pill */}
        {activeAlertCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{activeAlertCount} CAUTION</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 p-[1.5px] shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <User className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-100 flex items-center gap-1">
              {astronautName}
              <Shield className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-[10px] font-mono text-cyan-400/80 uppercase">
              {role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
