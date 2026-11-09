import React, { useEffect } from 'react';
import { DailyChallenge } from '../types/game';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface ChallengeToastProps {
  challenge: DailyChallenge;
  onOpenChallenges: () => void;
  onClose: () => void;
}

export const ChallengeToast: React.FC<ChallengeToastProps> = ({
  challenge,
  onOpenChallenges,
  onClose,
}) => {
  useEffect(() => {
    soundFx.playCorrect();
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [challenge, onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 animate-slideDown select-none">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-slate-900/95 border-2 border-amber-400/80 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm text-slate-100">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-lg flex-shrink-0 animate-bounce">
          🎯
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
              Daily Challenge Complete!
            </span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </div>
          <div className="text-xs font-bold text-white truncate mt-0.5">{challenge.title}</div>
          <div className="text-[11px] text-amber-300/90 font-medium">
            Reward: +{challenge.reward.blockCount} {challenge.reward.blockType} & +{challenge.reward.xp} XP
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenChallenges();
            onClose();
          }}
          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black rounded-lg shadow-md flex items-center gap-1 flex-shrink-0"
        >
          <span>Claim</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
