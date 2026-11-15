"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  Heart,
  Droplet,
  Moon,
  SunMedium,
  Smile,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { VitalTelemetry } from "@/lib/types";

interface VitalsChartsProps {
  data: VitalTelemetry[];
  selectedRange: "24h" | "7d" | "30d";
  onRangeChange: (range: "24h" | "7d" | "30d") => void;
}

export default function VitalsCharts({
  data,
  selectedRange,
  onRangeChange,
}: VitalsChartsProps) {
  const [activeChart, setActiveChart] = useState<
    "cardio" | "bp" | "metabolic" | "sleep_mood" | "radiation"
  >("cardio");

  // Format timestamp for chart x-axis
  const formattedData = data.map((d) => {
    const dt = new Date(d.timestamp);
    let label = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (selectedRange === "7d") {
      label = `${dt.getMonth() + 1}/${dt.getDate()} ${dt.getHours()}:00`;
    } else if (selectedRange === "30d") {
      label = `Day ${dt.getDate()}`;
    }
    return {
      ...d,
      formattedTime: label,
    };
  });

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-xl">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              CONTINUOUS VITAL TELEMETRY & SAFE CORRIDORS
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Tiger Data continuous aggregate time_bucket queries vs NASA-STD-3001
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
          {(["24h", "7d", "30d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                selectedRange === r
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r === "24h" ? "24 Hours" : r === "7d" ? "7 Days" : "30 Mission Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {[
          { id: "cardio", label: "Heart Rate & HRV", icon: Heart },
          { id: "bp", label: "Blood Pressure (Systolic/Diastolic)", icon: Activity },
          { id: "metabolic", label: "Blood Glucose & Temp", icon: Droplet },
          { id: "sleep_mood", label: "Sleep & Mood Index", icon: Moon },
          { id: "radiation", label: "Radiation Dosimetry", icon: SunMedium },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeChart === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap border transition-all ${
                isActive
                  ? "bg-cyan-950/40 border-cyan-400/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Canvas Area */}
      <div className="h-[340px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === "cardio" ? (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="formattedTime"
                stroke="#64748b"
                tick={{ fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#06b6d4"
                domain={[40, 130]}
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                label={{
                  value: "HR (bpm)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#06b6d4",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#a855f7"
                domain={[10, 100]}
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                label={{
                  value: "HRV (ms)",
                  angle: 90,
                  position: "insideRight",
                  fill: "#a855f7",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#06b6d4",
                  borderRadius: "0.75rem",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              />
              {/* NASA-STD-3001 HR Safe Corridor Band: 55-90 bpm */}
              <ReferenceArea
                yAxisId="left"
                y1={55}
                y2={90}
                fill="#10b981"
                fillOpacity={0.08}
                stroke="#10b981"
                strokeDasharray="2 2"
                strokeOpacity={0.3}
              />
              <ReferenceLine
                yAxisId="left"
                y={100}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "NASA Alert >100", fill: "#ef4444", fontSize: 10 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="heart_rate"
                name="Heart Rate (bpm)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: "#22d3ee" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hrv"
                name="HRV (ms)"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : activeChart === "bp" ? (
            <AreaChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="formattedTime"
                stroke="#64748b"
                tick={{ fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                stroke="#94a3b8"
                domain={[50, 170]}
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                label={{
                  value: "mmHg",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94a3b8",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#06b6d4",
                  borderRadius: "0.75rem",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              />
              {/* Safe Systolic Corridor: 90 - 135 */}
              <ReferenceArea
                y1={90}
                y2={135}
                fill="#10b981"
                fillOpacity={0.08}
                stroke="#10b981"
                strokeOpacity={0.3}
              />
              <ReferenceLine
                y={140}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{ value: "Caution: 140", fill: "#f59e0b", fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="systolic_bp"
                name="Systolic BP"
                stroke="#38bdf8"
                fill="url(#bpGradient)"
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="diastolic_bp"
                name="Diastolic BP"
                stroke="#818cf8"
                fill="rgba(129, 140, 248, 0.15)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="bpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
            </AreaChart>
          ) : activeChart === "metabolic" ? (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="formattedTime"
                stroke="#64748b"
                tick={{ fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#10b981"
                domain={[60, 160]}
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                label={{
                  value: "Glucose (mg/dL)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#10b981",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f97316"
                domain={[35.5, 38.5]}
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                label={{
                  value: "Core Temp (°C)",
                  angle: 90,
                  position: "insideRight",
                  fill: "#f97316",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#10b981",
                  borderRadius: "0.75rem",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="blood_sugar"
                name="Blood Glucose (mg/dL)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="core_temp"
                name="Core Temp (°C)"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : activeChart === "sleep_mood" ? (
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="formattedTime"
                stroke="#64748b"
                tick={{ fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                stroke="#818cf8"
                domain={[0, 10]}
                tick={{ fontSize: 11, fontFamily: "monospace" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#818cf8",
                  borderRadius: "0.75rem",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine
                y={7}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: "NASA Target: 7+ hrs", fill: "#10b981", fontSize: 10 }}
              />
              <Bar dataKey="sleep_hours" name="Sleep Hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mood_score" name="Mood Score (1-10)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="formattedTime"
                stroke="#64748b"
                tick={{ fontSize: 11, fontFamily: "monospace" }}
              />
              <YAxis
                stroke="#ef4444"
                domain={[0, 2.5]}
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                label={{
                  value: "mSv / day",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#ef4444",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderColor: "#ef4444",
                  borderRadius: "0.75rem",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine
                y={1.0}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: "NASA DONKI Critical Solar Event >1.0 mSv",
                  fill: "#ef4444",
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="radiation_dose_msv"
                name="Radiation Dosimetry (mSv)"
                stroke="#ef4444"
                fill="rgba(239, 68, 68, 0.25)"
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Safe Corridor Guide Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-emerald-500/30 border border-emerald-500/50" />
            NASA-STD-3001 Safe Corridor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400" />
            Caution Threshold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-400" />
            Critical Alert Trigger
          </span>
        </div>

        <div className="text-slate-400">
          Source: Tiger Data Continuous Hypertable Rollup (1h aggregate)
        </div>
      </div>
    </div>
  );
}
