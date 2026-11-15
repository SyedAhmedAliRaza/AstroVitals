"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  User,
  Brain,
  Trophy,
  Bell,
  Database,
  ShieldAlert,
  Rocket,
  Sparkles,
  Radio,
} from "lucide-react";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  missionDay?: number;
}

export default function Sidebar({
  activeTab = "dashboard",
  onTabChange,
  missionDay = 47,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", label: "Mission Telemetry", icon: Activity, href: "/dashboard" },
    { id: "bodymap", label: "Anatomical Map", icon: User, href: "/dashboard#bodymap" },
    { id: "triage", label: "Gemini AI Triage", icon: Brain, href: "/dashboard#triage" },
    { id: "quests", label: "Countermeasures", icon: Trophy, href: "/dashboard#quests" },
    { id: "alerts", label: "Comms & Alerts", icon: Bell, href: "/dashboard#alerts" },
    { id: "citations", label: "NASA Knowledge", icon: Database, href: "/dashboard#citations" },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col justify-between p-4 h-screen sticky top-0 z-40">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-2 py-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-400/40 shadow-lg shadow-cyan-500/20 group-hover:border-cyan-300 transition-all">
            <Rocket className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-wider text-slate-100 font-mono">
                ASTRO<span className="text-cyan-400">VITALS</span>
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/70 tracking-widest uppercase font-mono">
              SPACE MEDICINE OS
            </p>
          </div>
        </Link>

        {/* Mission Status Badge */}
        <div className="px-3 py-2.5 rounded-lg bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              ARTEMIS-VII
            </span>
            <span className="text-cyan-400 font-semibold">MET +{missionDay}d</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[47%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 font-mono">
            <span>TRANSIT TO MARS</span>
            <span className="text-emerald-400">NOMINAL</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onTabChange) {
                    onTabChange(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-mono text-[11px]">Gemini 2.5 Flash</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
            RAG ONLINE
          </span>
        </div>

        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Tiger Data
          </span>
          <span className="text-slate-400">v0.1.0-space</span>
        </div>
      </div>
    </aside>
  );
}
