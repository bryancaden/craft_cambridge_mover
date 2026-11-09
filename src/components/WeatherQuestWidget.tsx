import React, { useState } from 'react';
import { WeatherQuest, WeatherType } from '../types/game';
import { BLOCK_DEFINITIONS } from '../data/cambridgeMoversData';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { CloudRain, Snowflake, Sun, ChevronDown, ChevronUp, Gift, Sparkles, CheckCircle2 } from 'lucide-react';

interface WeatherQuestWidgetProps {
  weather: WeatherType;
  onToggleWeather: () => void;
  quest: WeatherQuest | null;
  onClaimReward: (quest: WeatherQuest) => void;
  onGoToPart?: (part: string) => void;
  onSelectBlock?: (blockType: string) => void;
}

export const WeatherQuestWidget: React.FC<WeatherQuestWidgetProps> = ({
  weather,
  onToggleWeather,
  quest,
  onClaimReward,
  onGoToPart,
  onSelectBlock,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const weatherConfig = {
    clear: {
      label: 'Sunny & Clear',
      icon: <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />,
      badgeBg: 'from-amber-500/20 to-yellow-500/20 border-amber-400/30 text-amber-200',
      bannerText: 'Warm sunshine over the island',
    },
    rain: {
      label: 'Rain Shower',
      icon: <CloudRain className="w-4 h-4 text-sky-400 animate-bounce" />,
      badgeBg: 'from-blue-600/25 to-sky-600/25 border-sky-400/40 text-sky-200',
      bannerText: 'Gentle raindrops fall on blocks',
    },
    snow: {
      label: 'Snow Flurries',
      icon: <Snowflake className="w-4 h-4 text-cyan-300 animate-spin" />,
      badgeBg: 'from-cyan-500/20 to-indigo-500/20 border-cyan-300/40 text-cyan-100',
      bannerText: 'Peaceful winter snowflakes drifting',
    },
  }[weather];

  const handleClaim = () => {
    if (!quest || !quest.completed || quest.claimed) return;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.2, x: 0.15 },
    });
    onClaimReward(quest);
  };

  const rewardDef = quest ? BLOCK_DEFINITIONS[quest.reward.blockType] : null;
  const progressPercent = quest
    ? Math.min(100, Math.round((quest.currentProgress / quest.targetCount) * 100))
    : 0;

  return (
    <div className="flex flex-col gap-1.5 pointer-events-auto max-w-xs sm:max-w-sm select-none">
      {/* Top Pill: Current Weather & Quick Switcher */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleWeather();
          }}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r ${weatherConfig.badgeBg} border backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all text-xs font-black`}
          title="Click to change weather (Clear → Rain → Snow) [Key K]"
        >
          {weatherConfig.icon}
          <span className="tracking-wide">{weatherConfig.label}</span>
          <span className="text-[10px] opacity-75 font-mono px-1 rounded bg-black/30">Next [K]</span>
        </button>

        {quest && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 backdrop-blur-md shadow-md transition-all"
            title={isExpanded ? 'Collapse Weather Quest' : 'Expand Weather Quest'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Weather Quest Card */}
      {quest && isExpanded && (
        <div
          className={`relative p-3 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
            quest.completed && !quest.claimed
              ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-teal-950/80 border-emerald-400 shadow-emerald-500/20 ring-1 ring-emerald-400/40'
              : 'bg-slate-900/85 border-white/10'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl p-1.5 rounded-xl bg-white/5 border border-white/10">
                {quest.icon}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Weather Quest
                  </span>
                  {quest.completed && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Done
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-white leading-tight mt-0.5">{quest.title}</h4>
              </div>
            </div>

            {/* Reward Pill */}
            {rewardDef && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-black/40 border border-white/10 text-[10px] font-bold text-amber-300">
                <Gift className="w-3 h-3 text-amber-400" />
                <span>
                  +{quest.reward.blockCount} {rewardDef.name}
                </span>
                <span className="text-emerald-400 text-[9px]">+{quest.reward.xp}xp</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
            {quest.description}
          </p>

          {/* Progress Bar & Actions */}
          <div className="mt-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-400">Progress</span>
              <span className={quest.completed ? 'text-emerald-400 font-mono' : 'text-amber-300 font-mono'}>
                {quest.currentProgress} / {quest.targetCount}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  quest.completed
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-orange-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Claim Reward Button or Quick Action */}
            {quest.completed && !quest.claimed ? (
              <button
                onClick={handleClaim}
                className="mt-1 w-full py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all animate-bounce"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Claim Weather Rewards!</span>
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
