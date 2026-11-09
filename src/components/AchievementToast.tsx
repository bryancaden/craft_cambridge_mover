import React, { useEffect } from 'react';
import { Achievement } from '../types/game';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, Sparkles, X } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement;
  onOpenAchievements: () => void;
  onClose: () => void;
}

const TIER_THEMES = {
  bronze: {
    border: 'border-amber-700/80',
    bg: 'from-amber-950/95 via-slate-900/95 to-slate-900/95',
    text: 'text-amber-400',
    crest: 'bg-amber-700 text-amber-100 shadow-amber-900/50',
    tierName: 'Bronze Milestone',
  },
  silver: {
    border: 'border-slate-400/80',
    bg: 'from-slate-800/95 via-slate-900/95 to-slate-900/95',
    text: 'text-slate-200',
    crest: 'bg-slate-300 text-slate-950 shadow-slate-500/50',
    tierName: 'Silver Milestone',
  },
  gold: {
    border: 'border-amber-400/90',
    bg: 'from-amber-950/95 via-slate-900/95 to-slate-900/95',
    text: 'text-amber-300',
    crest: 'bg-amber-400 text-slate-950 shadow-amber-500/50',
    tierName: 'Gold Milestone',
  },
  diamond: {
    border: 'border-cyan-400/90',
    bg: 'from-cyan-950/95 via-slate-900/95 to-slate-900/95',
    text: 'text-cyan-300',
    crest: 'bg-gradient-to-tr from-cyan-400 to-sky-200 text-slate-950 shadow-cyan-500/50',
    tierName: 'Diamond Milestone',
  },
  legendary: {
    border: 'border-purple-400/90',
    bg: 'from-purple-950/95 via-slate-900/95 to-slate-900/95',
    text: 'text-purple-300',
    crest: 'bg-gradient-to-tr from-purple-500 to-pink-400 text-white shadow-purple-500/50',
    tierName: 'Legendary Milestone',
  },
};

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onOpenAchievements,
  onClose,
}) => {
  const theme = TIER_THEMES[achievement.tier] || TIER_THEMES.gold;

  useEffect(() => {
    soundFx.playAchievementUnlocked();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.85, y: 0.15 },
    });

    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 animate-slideDown select-none">
      <div
        className={`relative flex items-center gap-3.5 p-4 bg-gradient-to-r ${theme.bg} border-2 ${theme.border} rounded-2xl shadow-2xl backdrop-blur-md max-w-sm sm:max-w-md text-slate-100 overflow-hidden ring-1 ring-white/10`}
      >
        {/* Subtle background glow */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

        {/* Badge Crest */}
        <div
          className={`w-12 h-12 rounded-2xl ${theme.crest} flex items-center justify-center text-2xl font-black shadow-lg flex-shrink-0 animate-bounce ring-2 ring-white/20`}
        >
          {achievement.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Trophy className={`w-3.5 h-3.5 ${theme.text}`} />
            <span className={`text-[10px] font-black uppercase tracking-wider ${theme.text}`}>
              Achievement Unlocked!
            </span>
            <span className="text-[10px] text-slate-400">· {theme.tierName}</span>
          </div>

          <div className="text-sm font-black text-white truncate mt-0.5">
            {achievement.title}
          </div>

          <div className="text-xs text-slate-300 line-clamp-1 mt-0.5">
            {achievement.description}
          </div>

          <div className="text-[11px] text-amber-300 font-bold mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>
              +{achievement.reward.xp} XP
              {achievement.reward.blockType &&
                ` · +${achievement.reward.blockCount} ${achievement.reward.blockType}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenAchievements();
              onClose();
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center gap-1 transition-transform active:scale-95"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
