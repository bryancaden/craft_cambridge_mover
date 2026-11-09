import React from 'react';
import { DailyChallenge, BlockType, MoversPart } from '../types/game';
import { BLOCK_DEFINITIONS } from '../data/cambridgeMoversData';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  Gift,
  ArrowRight,
  RotateCw,
  Sparkles,
  Flame,
  X,
  Trophy,
} from 'lucide-react';

interface DailyChallengesModalProps {
  challenges: DailyChallenge[];
  onClaimReward: (challengeId: string) => void;
  onClaimGrandChest: () => void;
  grandChestClaimed: boolean;
  onGoToPart?: (part: MoversPart) => void;
  onSelectBlock?: (type: BlockType) => void;
  onRerollChallenges: () => void;
  onClose: () => void;
  dateStr: string;
}

export const DailyChallengesModal: React.FC<DailyChallengesModalProps> = ({
  challenges,
  onClaimReward,
  onClaimGrandChest,
  grandChestClaimed,
  onGoToPart,
  onSelectBlock,
  onRerollChallenges,
  onClose,
  dateStr,
}) => {
  const completedCount = challenges.filter((c) => c.completed).length;
  const totalCount = challenges.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  const handleClaim = (c: DailyChallenge) => {
    soundFx.playCollectResource();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClaimReward(c.id);
  };

  const handleGrandChest = () => {
    soundFx.playLevelUp();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
    onClaimGrandChest();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">Daily Challenges</h2>
                <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Calendar className="w-3 h-3" />
                  <span>{dateStr}</span>
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Complete daily building & Cambridge learning tasks to earn bonus blocks and XP!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                if (confirm('Reroll daily challenges for more practice?')) {
                  onRerollChallenges();
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reroll Quests"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Daily Progress Overview Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-xl">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">Daily Quest Completion</div>
              <div className="text-base font-black text-white flex items-center gap-2">
                <span>
                  {completedCount} of {totalCount} Completed
                </span>
                {allCompleted && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                    All Done! 🎉
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grand Daily Completion Bonus Chest */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                Daily Grand Chest
              </div>
              <div className="text-xs text-slate-300 font-bold">+10 Diamonds • +500 XP</div>
            </div>
            {allCompleted && !grandChestClaimed ? (
              <button
                onClick={handleGrandChest}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-1.5 animate-bounce"
              >
                <Gift className="w-4 h-4" />
                <span>Claim Grand Chest!</span>
              </button>
            ) : grandChestClaimed ? (
              <div className="px-3 py-1.5 bg-slate-800 text-emerald-400 text-xs font-black rounded-xl border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Chest Claimed</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-slate-800/80 text-slate-500 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5">
                <Gift className="w-4 h-4" />
                <span>Locked ({completedCount}/{totalCount})</span>
              </div>
            )}
          </div>
        </div>

        {/* List of Challenges */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {challenges.map((c) => {
            const blockDef = BLOCK_DEFINITIONS[c.reward.blockType];
            const progressRatio = Math.min(1, c.currentProgress / c.targetCount);
            const percent = Math.round(progressRatio * 100);

            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all ${
                  c.claimed
                    ? 'bg-slate-900/40 border-slate-800 opacity-75'
                    : c.completed
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-800/60 hover:bg-slate-800/90 border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Icon & Description */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                      {c.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-white">{c.title}</h3>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            c.category === 'build'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : c.category === 'exam'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{c.description}</p>

                      {/* Rewards summary */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-extrabold text-slate-400">Reward:</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-bold text-amber-300">
                          <span
                            className="w-3.5 h-3.5 rounded-sm inline-block border border-black/30"
                            style={{ backgroundColor: blockDef.hexColor }}
                          />
                          <span>
                            +{c.reward.blockCount} {blockDef.name}
                          </span>
                        </div>
                        <div className="px-2 py-0.5 rounded-lg bg-indigo-950/70 border border-indigo-800 text-[11px] font-black text-indigo-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>+{c.reward.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress bar & Action Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 min-w-[150px]">
                    <div className="w-full text-right sm:text-right">
                      <div className="flex justify-between sm:justify-end gap-2 text-xs font-mono font-bold text-slate-300 mb-1">
                        <span>
                          {c.currentProgress} / {c.targetCount}
                        </span>
                        <span className="text-amber-400">({percent}%)</span>
                      </div>
                      <div className="w-36 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            c.completed
                              ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Button States */}
                    <div>
                      {c.claimed ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-slate-500 text-xs font-bold rounded-xl border border-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Claimed</span>
                        </div>
                      ) : c.completed ? (
                        <button
                          onClick={() => handleClaim(c)}
                          className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 animate-pulse"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Claim!</span>
                        </button>
                      ) : c.targetPart && onGoToPart ? (
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onGoToPart(c.targetPart!);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                        >
                          <span>Start Task</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : c.type === 'place_wood' && onSelectBlock ? (
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onSelectBlock('wood');
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <span>Equip Wood</span>
                        </button>
                      ) : (
                        <div className="text-[11px] font-bold text-slate-400 px-2 py-1">
                          In Progress
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Challenges reset every 24 hours at midnight</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md text-xs"
          >
            Back to Island
          </button>
        </div>
      </div>
    </div>
  );
};
