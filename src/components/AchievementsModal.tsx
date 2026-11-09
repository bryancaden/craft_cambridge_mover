import React, { useState, useMemo } from 'react';
import { Achievement, AchievementCategory, BadgeTier, MoversPart, BlockType } from '../types/game';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Gift,
  ArrowRight,
  Search,
  BookOpen,
  Hammer,
  TrendingUp,
  Compass,
  X,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClaimReward: (achievementId: string) => void;
  onClaimAllRewards: () => void;
  onGoToExamPart?: (part: MoversPart) => void;
  onOpenBlueprints?: () => void;
  onOpenWeather?: () => void;
  onClose: () => void;
}

const TIER_META: Record<
  BadgeTier,
  {
    label: string;
    badgeBg: string;
    border: string;
    glow: string;
    textColor: string;
    ribbonColor: string;
    accent: string;
  }
> = {
  bronze: {
    label: 'Bronze',
    badgeBg: 'from-amber-900/40 via-amber-800/20 to-slate-900/60',
    border: 'border-amber-700/60 hover:border-amber-600',
    glow: 'shadow-amber-900/20',
    textColor: 'text-amber-400',
    ribbonColor: 'bg-amber-800 text-amber-200 border-amber-700',
    accent: '#b45309',
  },
  silver: {
    label: 'Silver',
    badgeBg: 'from-slate-700/40 via-slate-600/20 to-slate-900/60',
    border: 'border-slate-400/60 hover:border-slate-300',
    glow: 'shadow-slate-500/20',
    textColor: 'text-slate-200',
    ribbonColor: 'bg-slate-700 text-slate-100 border-slate-500',
    accent: '#94a3b8',
  },
  gold: {
    label: 'Gold',
    badgeBg: 'from-amber-500/30 via-yellow-600/20 to-slate-900/60',
    border: 'border-amber-400/70 hover:border-amber-300',
    glow: 'shadow-amber-500/30',
    textColor: 'text-amber-300',
    ribbonColor: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black border-amber-300',
    accent: '#f59e0b',
  },
  diamond: {
    label: 'Diamond',
    badgeBg: 'from-cyan-500/30 via-blue-600/20 to-slate-900/60',
    border: 'border-cyan-400/80 hover:border-cyan-300',
    glow: 'shadow-cyan-400/40',
    textColor: 'text-cyan-300',
    ribbonColor: 'bg-gradient-to-r from-cyan-400 to-sky-300 text-slate-950 font-black border-cyan-200',
    accent: '#06b6d4',
  },
  legendary: {
    label: 'Legendary',
    badgeBg: 'from-purple-600/30 via-pink-600/20 to-slate-900/60',
    border: 'border-purple-400/80 hover:border-pink-400',
    glow: 'shadow-purple-500/40',
    textColor: 'text-purple-300',
    ribbonColor: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-white font-black border-purple-300',
    accent: '#a855f7',
  },
};

const CATEGORY_ITEMS: { id: 'all' | AchievementCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Badges', icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: 'cambridge', label: 'Cambridge Scholar', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'building', label: 'Master Builder', icon: <Hammer className="w-3.5 h-3.5" /> },
  { id: 'progression', label: 'Progression', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: 'exploration', label: 'Exploration', icon: <Compass className="w-3.5 h-3.5" /> },
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClaimReward,
  onClaimAllRewards,
  onGoToExamPart,
  onOpenBlueprints,
  onOpenWeather,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | AchievementCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectAchievement, setInspectAchievement] = useState<Achievement | null>(null);

  const totalUnlocked = achievements.filter((a) => a.completed).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? Math.round((totalUnlocked / totalCount) * 100) : 0;

  const claimableCount = achievements.filter((a) => a.completed && !a.claimed).length;

  const totalXpEarned = achievements
    .filter((a) => a.completed)
    .reduce((sum, a) => sum + (a.reward.xp || 0), 0);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      // Category filter
      if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;

      // Status filter
      if (selectedStatus === 'unlocked' && !a.completed) return false;
      if (selectedStatus === 'locked' && a.completed) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(q);
        const matchesDesc = a.description.toLowerCase().includes(q);
        const matchesDetails = a.details.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesDetails) return false;
      }

      return true;
    });
  }, [achievements, selectedCategory, selectedStatus, searchQuery]);

  const handleClaim = (a: Achievement) => {
    soundFx.playCollectResource();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClaimReward(a.id);
  };

  const handleClaimAll = () => {
    soundFx.playCelebration();
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
    });
    onClaimAllRewards();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/50 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-500/20 ring-2 ring-amber-300/40">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Milestones & Achievement Badges
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Permanent Records</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Unlock long-term awards across learning, building, and exploration</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-bold">{totalXpEarned} Milestone XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {claimableCount > 0 && (
              <button
                onClick={handleClaimAll}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 animate-pulse"
                title="Claim all ready milestone rewards at once"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Claim All ({claimableCount})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-base transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Global Progress Track */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex items-center gap-4">
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-lg font-black text-white">{totalUnlocked}</span>
              <span className="text-xs text-slate-500">/</span>
              <span className="text-xs text-slate-400 font-bold">{totalCount} Unlocked</span>
            </div>

            <div className="flex-1 sm:w-56 bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="text-xs font-black text-amber-400 font-mono">{progressPercent}%</span>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search badges & milestones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {CATEGORY_ITEMS.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('unlocked')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedStatus === 'unlocked'
                  ? 'bg-emerald-600/80 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unlocked ({totalUnlocked})
            </button>
            <button
              onClick={() => setSelectedStatus('locked')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedStatus === 'locked'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In Progress ({totalCount - totalUnlocked})
            </button>
          </div>
        </div>

        {/* Badges Grid Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredAchievements.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Trophy className="w-12 h-12 text-slate-600 mb-2 stroke-[1.5]" />
              <div className="font-bold text-white text-base">No achievements match your filters</div>
              <p className="text-xs text-slate-500 max-w-sm">
                Try switching categories or clearing search keywords to view all unlockable badges.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAchievements.map((badge) => {
                const tier = TIER_META[badge.tier] || TIER_META.gold;
                const isComplete = badge.completed;
                const isClaimed = badge.claimed;
                const percent = Math.min(100, Math.round((badge.currentCount / badge.targetCount) * 100));

                return (
                  <div
                    key={badge.id}
                    onClick={() => setInspectAchievement(badge)}
                    className={`relative group flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isComplete
                        ? `bg-gradient-to-br ${tier.badgeBg} ${tier.border} shadow-lg ${tier.glow}`
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Medal Emblem + Title + Tier Ribbon */}
                    <div className="flex items-start gap-3.5">
                      {/* Medallion */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md border transition-transform group-hover:scale-105 ${
                            isComplete
                              ? `bg-slate-900 ${tier.border} text-white`
                              : 'bg-slate-950 border-slate-800 text-slate-600 grayscale opacity-80'
                          }`}
                        >
                          {badge.icon}
                        </div>
                        {isComplete ? (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md ring-2 ring-slate-900">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shadow-md ring-2 ring-slate-900">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Header details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              isComplete ? tier.textColor : 'text-slate-500'
                            }`}
                          >
                            {tier.label} Tier
                          </span>

                          {isComplete && badge.unlockedAt && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {badge.unlockedAt}
                            </span>
                          )}
                        </div>

                        <h3
                          className={`text-sm font-black truncate mt-0.5 ${
                            isComplete ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {badge.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">
                          Progress:{' '}
                          <span className="font-mono text-slate-200 font-bold">
                            {badge.currentCount.toLocaleString()} / {badge.targetCount.toLocaleString()}
                          </span>
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isComplete ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {percent}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isComplete
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-amber-600 to-amber-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-amber-400 font-black">+{badge.reward.xp} XP</span>
                        {badge.reward.blockType && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-300 font-bold">
                              +{badge.reward.blockCount} {badge.reward.blockType}
                            </span>
                          </>
                        )}
                        {badge.reward.titleName && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="text-indigo-300 font-mono text-[10px]">
                              "{badge.reward.titleName}"
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isComplete ? (
                          isClaimed ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Claimed</span>
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClaim(badge);
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1 transition-transform active:scale-95 animate-pulse"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>Claim Reward</span>
                            </button>
                          )
                        ) : badge.actionPart && onGoToExamPart ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onGoToExamPart(badge.actionPart!);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <span>Practice</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : badge.actionType === 'build' && onOpenBlueprints ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenBlueprints();
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <span>Build</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">In Progress</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info summary */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Tip: Click any badge to inspect educational notes, study tips & lore.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">Press [B] to toggle anytime</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>

        {/* INSPECT DETAIL MODAL / DRAWER */}
        {inspectAchievement && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg border ${
                      inspectAchievement.completed
                        ? 'bg-slate-800 border-amber-400 text-white shadow-amber-500/20'
                        : 'bg-slate-950 border-slate-700 text-slate-500'
                    }`}
                  >
                    {inspectAchievement.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      <span>{inspectAchievement.tier} Badge</span>
                      <span aria-hidden="true">·</span>
                      <span>{inspectAchievement.category}</span>
                    </div>
                    <h3 className="text-lg font-black text-white">{inspectAchievement.title}</h3>
                  </div>
                </div>

                <button
                  onClick={() => setInspectAchievement(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Requirement description */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Milestone Criteria</span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {inspectAchievement.description}
                </p>
              </div>

              {/* Learning Lore & Cambridge Tip */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-indigo-300">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Cambridge Teacher Insights</span>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">{inspectAchievement.details}</p>
              </div>

              {/* Milestone Rewards */}
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-amber-400">Milestone Rewards</span>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 text-amber-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{inspectAchievement.reward.xp} XP Points</span>
                  </div>
                  {inspectAchievement.reward.blockType && (
                    <div className="flex items-center gap-1 text-slate-200 font-bold">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        +{inspectAchievement.reward.blockCount} {inspectAchievement.reward.blockType} Blocks
                      </span>
                    </div>
                  )}
                </div>
                {inspectAchievement.reward.titleName && (
                  <div className="text-[11px] text-indigo-300 font-mono mt-1">
                    Unlocks player honorific: "{inspectAchievement.reward.titleName}"
                  </div>
                )}
              </div>

              {/* Progress & Status */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Progress</span>
                  <span className="font-mono font-bold text-white">
                    {inspectAchievement.currentCount.toLocaleString()} /{' '}
                    {inspectAchievement.targetCount.toLocaleString()} (
                    {Math.min(
                      100,
                      Math.round((inspectAchievement.currentCount / inspectAchievement.targetCount) * 100)
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      inspectAchievement.completed
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (inspectAchievement.currentCount / inspectAchievement.targetCount) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                {inspectAchievement.completed && !inspectAchievement.claimed && (
                  <button
                    onClick={() => {
                      handleClaim(inspectAchievement);
                      setInspectAchievement(null);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Claim Milestone Reward</span>
                  </button>
                )}

                {inspectAchievement.actionPart && onGoToExamPart && !inspectAchievement.completed && (
                  <button
                    onClick={() => {
                      onGoToExamPart(inspectAchievement.actionPart!);
                      setInspectAchievement(null);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <span>Practice Question Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setInspectAchievement(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
