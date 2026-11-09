import React from 'react';
import { PlayerStats } from '../types/game';
import { Award, Star, BookOpen, Check, Volume2 } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';
import { speakText } from '../utils/speechUtils';

interface TeacherTipModalProps {
  stats: PlayerStats;
  playerName: string;
  onClose: () => void;
  onResetWorld: () => void;
}

export const TeacherTipModal: React.FC<TeacherTipModalProps> = ({
  stats,
  playerName,
  onClose,
  onResetWorld,
}) => {
  const renderShields = (count: number, label: string) => {
    return (
      <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col items-center">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="flex items-center gap-1.5 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-7 h-9 rounded-md flex items-center justify-center font-black text-sm shadow-md transition-all ${
                i <= count
                  ? 'bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 border-2 border-amber-300 scale-105'
                  : 'bg-slate-900/60 text-slate-600 border border-slate-700'
              }`}
            >
              🛡️
            </div>
          ))}
        </div>
        <div className="text-[11px] text-amber-300 font-extrabold mt-1.5">
          {count} / 5 Cambridge Shields
        </div>
      </div>
    );
  };

  const grammarTips = [
    { rule: 'Agreeing with Affirmative', tip: '"I like playing games" -> "So do I" / "Me too"' },
    { rule: 'Agreeing with Negative', tip: '"I don\'t like rainy days" -> "Neither do I"' },
    { rule: 'Relative Pronouns', tip: '"who" for people ("the boy who is running"), "which" for animals & things ("the parrot which flew")' },
    { rule: 'Comparatives & Superlatives', tip: '"longer than", "the largest in the world"' },
    { rule: 'Prepositions of Place', tip: '"opposite the station", "between two trees", "in the fields", "on the roof"' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg">
              🎓
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Teacher's Desk & Cambridge Record</h2>
              <p className="text-xs text-indigo-300">
                Official CEFR A1 Movers assessment progress for {playerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Cambridge Shields Display */}
        <div className="mt-5">
          <div className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>Cambridge English Movers Shield Score</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {renderShields(stats.cambridgeShields.readingWriting, 'Reading & Writing')}
            {renderShields(stats.cambridgeShields.listening, 'Listening')}
            {renderShields(stats.cambridgeShields.speaking, 'Speaking')}
          </div>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Questions Solved</div>
            <div className="text-xl font-black text-white mt-0.5">{stats.questionsAnswered}</div>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Blocks Placed</div>
            <div className="text-xl font-black text-white mt-0.5">{stats.blocksPlaced}</div>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Explorer Level</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">Lvl {stats.level}</div>
          </div>
        </div>

        {/* Cambridge Movers Grammar Reference */}
        <div className="mt-5">
          <div className="text-xs font-black uppercase text-indigo-300 tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Key Cambridge Movers Grammar Tips</span>
          </div>
          <div className="space-y-2">
            {grammarTips.map((g, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-amber-300">{g.rule}</div>
                  <div className="text-slate-200 mt-0.5">{g.tip}</div>
                </div>
                <button
                  onClick={() => speakText(g.tip)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (
                confirm(
                  `Reset ${playerName}'s world to the original floating island? (Other explorers' worlds will not be affected)`
                )
              ) {
                onResetWorld();
                onClose();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 underline font-bold"
          >
            Reset {playerName}&apos;s World
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg"
          >
            Continue Playing
          </button>
        </div>
      </div>
    </div>
  );
};
