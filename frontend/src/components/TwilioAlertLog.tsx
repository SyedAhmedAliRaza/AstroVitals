"use client";

import React, { useState } from "react";
import {
  Bell,
  Send,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  ShieldAlert,
  Flame,
  RefreshCw,
} from "lucide-react";
import { AlertLog, AlertType } from "@/lib/types";

interface TwilioAlertLogProps {
  logs: AlertLog[];
  onSendAlert: (message: string, type: AlertType) => void;
  isLoading?: boolean;
}

export default function TwilioAlertLog({
  logs,
  onSendAlert,
  isLoading = false,
}: TwilioAlertLogProps) {
  const [selectedType, setSelectedType] = useState<AlertType>(AlertType.SMS);
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleDispatch = async () => {
    const msg =
      customMessage.trim() ||
      "CRITICAL: Astronaut vitals threshold breached. Immediate CMO triage required.";
    setIsSending(true);
    await onSendAlert(msg, selectedType);
    setCustomMessage("");
    setIsSending(false);
  };

  const handleQuickDonkiAlert = () => {
    const msg =
      "NASA DONKI ALERT: Class X1.2 Solar Flare detected. Crew shelter protocol initiated.";
    onSendAlert(msg, AlertType.WHATSAPP);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-400/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              TWILIO EMERGENCY ESCALATION & SPACE-TO-GROUND COMMS
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Programmable SMS, WhatsApp, and Voice dispatch to Earth Flight Surgeon & CMO
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickDonkiAlert}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Simulate DONKI Flare Alert
          </button>
        </div>
      </div>

      {/* Alert Dispatch Console */}
      <div className="my-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Dispatch Channel Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Channel:</span>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
              {[
                { type: AlertType.SMS, label: "SMS", icon: MessageSquare },
                { type: AlertType.WHATSAPP, label: "WhatsApp", icon: MessageSquare },
                { type: AlertType.VOICE, label: "Voice Call", icon: PhoneCall },
              ].map((c) => {
                const Icon = c.icon;
                const isSel = selectedType === c.type;
                return (
                  <button
                    key={c.type}
                    onClick={() => setSelectedType(c.type)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all ${
                      isSel
                        ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/50"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Target: <span className="text-slate-300">NASA Flight Surgeon Console (JSC)</span>
          </div>
        </div>

        {/* Dispatch Input and Action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Type priority dispatch message or click Send for automatic alert..."
            className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <button
            onClick={handleDispatch}
            disabled={isSending || isLoading}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? "Dispatching..." : "SEND EMERGENCY ALERT"}</span>
          </button>
        </div>
      </div>

      {/* Comms History Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Space-to-Ground Comms Log</span>
          <span>Twilio Delivery Receipts</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {logs.map((log) => {
            const dt = new Date(log.timestamp);
            const formatted = dt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            return (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-4 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      {log.alert_type}
                    </span>
                    <span className="text-slate-400 text-[11px]">{formatted}</span>
                    <span className="text-slate-400">• To: {log.recipient}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-xs">
                    {log.message}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      log.status === "delivered"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : log.status === "pending"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : "bg-red-500/20 text-red-400 border-red-500/40"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
