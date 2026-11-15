"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  CheckCircle,
  Circle,
  Dumbbell,
  Moon,
  Brain,
  Smile,
  Droplet,
  Eye,
  Activity,
  Award,
  Zap,
} from "lucide-react";
import { HealthQuest, QuestType } from "@/lib/types";

interface QuestTrackerProps {
  quests: HealthQuest[];
  onCompleteQuest: (questId: string) => void;
  xpPoints?: number;
  streakDays?: number;
}

export default function QuestTracker({
  quests,
  onCompleteQuest,
  xpPoints = 1450,
  streakDays = 14,
}: QuestTrackerProps) {
  const [completedQuests, setCompletedQuests] = useState<string[]>(
    quests.filter((q) => q.completed).map((q) => q.id)
  );

  const completedCount = quests.filter((q) => q.completed).length;
  const totalCount = quests.length;
  const readinessScore = Math.round((completedCount / (totalCount || 1)) * 100);

  const getQuestIcon = (type: QuestType) => {
    switch (type) {
      case QuestType.ARED:
        return Dumbbell;
      case QuestType.SLEEP:
        return Moon;
      case QuestType.COGNITIVE:
        return Brain;
      case QuestType.MOOD:
        return Smile;
      case QuestType.NUTRITION:
        return Droplet;
      case QuestType.CARDIO:
        return Activity;
      case QuestType.OCULAR:
        return Eye;
      default:
        return Zap;
    }
  };

  const handleToggle = (questId: string) => {
    if (!completedQuests.includes(questId)) {
      setCompletedQuests([...completedQuests, questId]);
      onCompleteQuest(questId);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-xl">
      {/* Header & Streak Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              CREW COUNTERMEASURE QUESTS & BEHAVIORAL HEALTH
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Maintain crew readiness through prescribed physical and cognitive countermeasure compliance
          </p>
        </div>

        {/* Gamified Badges */}
        <div className="flex items-center gap-3">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold shadow-[0_0_10px_rgba(249,115,22,0.2)]">
            <Flame className="w-4 h-4 fill-orange-400 animate-bounce" />
            <span>{streakDays} DAY STREAK</span>
          </div>

          {/* XP Total */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>{xpPoints} XP</span>
          </div>
        </div>
      </div>

      {/* Readiness Progress Bar */}
      <div className="my-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-slate-300 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Daily Countermeasure Compliance
          </span>
          <span className="text-cyan-400 font-bold">
            {completedCount}/{totalCount} Completed ({readinessScore}% Readiness)
          </span>
        </div>
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${readinessScore}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          />
        </div>
      </div>

      {/* Quest Cards List */}
      <div className="space-y-2.5">
        {quests.map((quest) => {
          const Icon = getQuestIcon(quest.type);
          const isDone = quest.completed || completedQuests.includes(quest.id);

          return (
            <motion.div
              key={quest.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleToggle(quest.id)}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                isDone
                  ? "bg-slate-950/40 border-slate-800/60 opacity-80"
                  : "bg-slate-950/90 border-cyan-500/20 hover:border-cyan-400/60 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-2 rounded-lg border ${
                    isDone
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div
                    className={`text-xs font-semibold font-mono ${
                      isDone
                        ? "line-through text-slate-400"
                        : "text-slate-100"
                    }`}
                  >
                    {quest.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {quest.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950/40 text-cyan-300 border border-cyan-800/50">
                  +{quest.xp_reward} XP
                </span>

                {isDone ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400 transition-colors" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
