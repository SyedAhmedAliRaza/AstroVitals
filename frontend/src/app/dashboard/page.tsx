"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BodyMapSVG from "@/components/BodyMapSVG";
import VitalsCharts from "@/components/VitalsCharts";
import GeminiTriage from "@/components/GeminiTriage";
import QuestTracker from "@/components/QuestTracker";
import TwilioAlertLog from "@/components/TwilioAlertLog";
import NasaCitations from "@/components/NasaCitations";

import {
  Astronaut,
  VitalTelemetry,
  BodyRegionStatus,
  DiagnosticAssessment,
  HealthQuest,
  AlertLog,
  DonkiEvent,
  OsdrBaseline,
  BodyRegion,
  AlertType,
  OWLTConfig,
  RiskLevel,
} from "@/lib/types";

import {
  getAstronautProfile,
  getVitalsTimeseries,
  getBodyMapStatus,
  evaluateDiagnostics,
  getQuests,
  completeQuest,
  sendAlert,
  getAlertLogs,
  getDonkiEvents,
  getOsdrBaselines,
} from "@/lib/api";

import {
  mockAstronaut,
  mockVitals24h,
  mockVitals7d,
  mockVitals30d,
  mockBodyRegions,
  mockDiagnosticAssessment,
  mockQuests,
  mockAlertLogs,
  mockDonkiEvents,
  mockOsdrBaselines,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [astronaut, setAstronaut] = useState<Astronaut>(mockAstronaut);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [vitals, setVitals] = useState<VitalTelemetry[]>(mockVitals24h);
  const [bodyRegions, setBodyRegions] = useState<BodyRegionStatus[]>(mockBodyRegions);
  const [assessment, setAssessment] = useState<DiagnosticAssessment | null>(
    mockDiagnosticAssessment
  );
  const [isTriageLoading, setIsTriageLoading] = useState(false);
  const [quests, setQuests] = useState<HealthQuest[]>(mockQuests);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>(mockAlertLogs);
  const [donkiEvents, setDonkiEvents] = useState<DonkiEvent[]>(mockDonkiEvents);
  const [osdrBaselines, setOsdrBaselines] = useState<OsdrBaseline[]>(mockOsdrBaselines);

  // Mars OWLT Delay configuration
  const [owlt, setOwlt] = useState<OWLTConfig>({
    mode: "LEO",
    delay_seconds: 0,
  });

  const toggleOwlt = () => {
    setOwlt((prev) =>
      prev.mode === "LEO"
        ? { mode: "Mars", delay_seconds: 1320 } // 22 minutes
        : { mode: "LEO", delay_seconds: 0 }
    );
  };

  // Initial data loading from API
  useEffect(() => {
    async function loadInitialData() {
      try {
        const astro = await getAstronautProfile();
        setAstronaut(astro);

        const vData = await getVitalsTimeseries(astro.id, timeRange);
        setVitals(vData);

        const bmData = await getBodyMapStatus(astro.id);
        setBodyRegions(bmData);

        const qData = await getQuests(astro.id);
        setQuests(qData);

        const aData = await getAlertLogs(astro.id);
        setAlertLogs(aData);

        const dData = await getDonkiEvents();
        setDonkiEvents(dData);

        const oData = await getOsdrBaselines();
        setOsdrBaselines(oData);
      } catch (err) {
        console.warn("API loaded with mock fallbacks", err);
      }
    }
    loadInitialData();
  }, []);

  // Update vitals when timeRange changes
  useEffect(() => {
    async function updateRange() {
      try {
        const vData = await getVitalsTimeseries(astronaut.id, timeRange);
        setVitals(vData);
      } catch (err) {
        if (timeRange === "24h") setVitals(mockVitals24h);
        else if (timeRange === "7d") setVitals(mockVitals7d);
        else setVitals(mockVitals30d);
      }
    }
    updateRange();
  }, [timeRange, astronaut.id]);

  // Request AI diagnostic evaluation
  const handleRequestTriage = async (region?: BodyRegion) => {
    setIsTriageLoading(true);
    try {
      const result = await evaluateDiagnostics(astronaut.id, region);
      setAssessment(result);
    } catch (err) {
      console.error("Diagnostic request failed:", err);
    } finally {
      setIsTriageLoading(false);
    }
  };

  // Complete quest
  const handleCompleteQuest = async (questId: string) => {
    try {
      await completeQuest(questId);
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, completed: true } : q))
      );
    } catch (err) {
      console.error("Quest completion failed:", err);
    }
  };

  // Dispatch emergency alert via Twilio
  const handleSendAlert = async (message: string, alertType: AlertType) => {
    try {
      const newLog = await sendAlert(astronaut.id, message, alertType);
      setAlertLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error("Alert dispatch failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          const el = document.getElementById(tab);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        missionDay={astronaut.mission_day}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          owlt={owlt}
          onToggleOwlt={toggleOwlt}
          astronautName={astronaut.name}
          role={astronaut.role}
          missionDay={astronaut.mission_day}
          activeAlertCount={astronaut.active_alerts}
        />

        {/* Dashboard Sections */}
        <main className="p-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Section 1: Hero Anatomical Body Map */}
          <section id="bodymap">
            <BodyMapSVG
              regions={bodyRegions}
              onRequestTriage={(region) => {
                handleRequestTriage(region);
                const triageEl = document.getElementById("triage");
                if (triageEl) triageEl.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </section>

          {/* Section 2: Continuous Vitals Time-Series with Safe Corridors */}
          <section id="dashboard">
            <VitalsCharts
              data={vitals}
              selectedRange={timeRange}
              onRangeChange={setTimeRange}
            />
          </section>

          {/* Section 3: Gemini AI Autonomous Flight Surgeon */}
          <section id="triage">
            <GeminiTriage
              assessment={assessment}
              isLoading={isTriageLoading}
              onRequestTriage={handleRequestTriage}
              owlt={owlt}
              onEscalate={(type) => {
                const role =
                  type === "cmo" ? "Crew Medical Officer" : "Earth Flight Surgeon";
                handleSendAlert(
                  `ESCALATION: Urgent medical consultation requested with ${role}. Assessment: ${assessment?.diagnosis}`,
                  AlertType.SMS
                );
              }}
            />
          </section>

          {/* Section 4: Gamified Countermeasure Quests & Behavioral Health */}
          <section id="quests">
            <QuestTracker
              quests={quests}
              onCompleteQuest={handleCompleteQuest}
              streakDays={14}
              xpPoints={1450}
            />
          </section>

          {/* Section 5: Twilio Emergency Dispatch Console */}
          <section id="alerts">
            <TwilioAlertLog
              logs={alertLogs}
              onSendAlert={handleSendAlert}
            />
          </section>

          {/* Section 6: Official NASA Datasets & Sponsor Architecture */}
          <section id="citations">
            <NasaCitations
              osdrBaselines={osdrBaselines}
              donkiEvents={donkiEvents}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
