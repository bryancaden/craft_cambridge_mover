import React, { useEffect } from 'react';
import { BlockType } from '../types/game';
import { BLOCK_DEFINITIONS } from '../data/cambridgeMoversData';
import { soundFx } from '../utils/soundEffects';

interface InventoryHotbarProps {
  hotbarSlots: BlockType[];
  activeSlotIndex: number;
  onSelectSlot: (index: number) => void;
  inventory: Record<string, number>;
  onOpenInventory: () => void;
  onOpenBlueprints: () => void;
  buildMode: 'place' | 'mine';
  onToggleBuildMode: (mode: 'place' | 'mine') => void;
  onDig?: () => void;
}

export const InventoryHotbar: React.FC<InventoryHotbarProps> = ({
  hotbarSlots,
  activeSlotIndex,
  onSelectSlot,
  inventory,
  onOpenInventory,
  onOpenBlueprints,
  buildMode,
  onToggleBuildMode,
  onDig,
}) => {
  // Listen for digit keys 1-9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= hotbarSlots.length) {
        onSelectSlot(num - 1);
        soundFx.playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotbarSlots.length, onSelectSlot]);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
      {/* Active mode & block info label */}
      <div className="flex items-center gap-2">
        {buildMode === 'mine' ? (
          <div className="bg-amber-500/90 text-slate-950 px-4 py-1 rounded-full text-xs font-black border border-amber-300 shadow-xl flex items-center gap-2 animate-pulse">
            <span>⛏️</span>
            <span>DIG MODE ACTIVE</span>
            <span className="text-[11px] font-medium opacity-90 hidden sm:inline">• Click block or press [X] to dig</span>
          </div>
        ) : (
          <div className="bg-slate-900/90 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold text-white border border-white/10 shadow-lg flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm border border-black/30 shadow-sm"
              style={{ backgroundColor: BLOCK_DEFINITIONS[hotbarSlots[activeSlotIndex]]?.hexColor || '#fff' }}
            />
            <span>{BLOCK_DEFINITIONS[hotbarSlots[activeSlotIndex]]?.name || 'Block'}</span>
            <span className="text-amber-400 font-extrabold">
              ×{inventory[hotbarSlots[activeSlotIndex]] || 0}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline font-normal">
              (Left-click: place • Right-click or [X]: dig)
            </span>
          </div>
        )}
      </div>

      {/* The Hotbar with Dig Controls */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/80 backdrop-blur-xl border-2 border-slate-700/80 rounded-2xl shadow-2xl">
        {hotbarSlots.map((type, idx) => {
          const count = inventory[type] || 0;
          const isActive = idx === activeSlotIndex;
          const def = BLOCK_DEFINITIONS[type];

          return (
            <button
              key={type}
              onClick={() => {
                onSelectSlot(idx);
                soundFx.playClick();
              }}
              className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                isActive
                  ? 'bg-gradient-to-b from-amber-400/25 to-amber-600/30 border-2 border-amber-400 shadow-md scale-105'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500'
              }`}
              title={`${def?.name} (${count}) - Press [${idx + 1}]`}
            >
              {/* Digit indicator */}
              <span className="absolute top-0.5 left-1 text-[9px] font-mono text-slate-400">
                {idx + 1}
              </span>

              {/* Block icon rendering */}
              <div
                className="w-6 h-6 rounded border border-black/40 shadow-inner flex items-center justify-center text-[10px]"
                style={{ backgroundColor: def?.hexColor }}
              >
                {type === 'flower_red' ? '🌹' : type === 'flower_yellow' ? '🌼' : type === 'bookshelf' ? '📚' : ''}
              </div>

              {/* Quantity badge */}
              <span
                className={`absolute bottom-0.5 right-1 text-[11px] font-black font-mono ${
                  count > 0 ? 'text-white' : 'text-rose-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Digging / Mode Controls */}
        <div className="h-9 w-[1px] bg-slate-700 mx-1" />

        {/* Instant Dig Button */}
        {onDig && (
          <button
            onClick={() => {
              onDig();
            }}
            className="relative w-12 h-12 rounded-xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-600 active:scale-95 border-2 border-amber-400/80 flex flex-col items-center justify-center text-white shadow-lg transition-all group"
            title="Dig Block: Excavate target or ground block [X] or [F]"
          >
            <span className="text-base group-hover:scale-125 transition-transform">⛏️</span>
            <span className="text-[9px] font-black uppercase text-amber-200">Dig</span>
            <span className="absolute top-0.5 right-1 text-[8px] font-mono text-amber-300">[X]</span>
          </button>
        )}

        {/* Build / Dig Mode Toggle Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleBuildMode(buildMode === 'place' ? 'mine' : 'place');
          }}
          className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all shadow-lg ${
            buildMode === 'mine'
              ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 font-black border-2 border-amber-300 ring-2 ring-amber-400/40'
              : 'bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-400/50 text-white'
          }`}
          title={`Mode: ${buildMode === 'mine' ? 'Dig / Mine Mode Active' : 'Place Mode Active'} - Press [M] to toggle`}
        >
          <span className="text-base">{buildMode === 'mine' ? '⛏️' : '🔨'}</span>
          <span className="text-[9px] font-extrabold uppercase">
            {buildMode === 'mine' ? 'Mine' : 'Place'}
          </span>
          <span className="absolute top-0.5 right-1 text-[8px] opacity-75 font-mono">[M]</span>
        </button>

        {/* Blueprint & Backpack shortcut buttons */}
        <div className="h-9 w-[1px] bg-slate-700 mx-1" />

        <button
          onClick={onOpenBlueprints}
          className="w-12 h-12 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-400/50 flex flex-col items-center justify-center text-white shadow-lg transition-all"
          title="Build Schematics & Blueprints"
        >
          <span className="text-lg">📐</span>
          <span className="text-[9px] font-extrabold uppercase">Builds</span>
        </button>

        <button
          onClick={onOpenInventory}
          className="w-12 h-12 rounded-xl bg-amber-600/80 hover:bg-amber-500 border border-amber-400/50 flex flex-col items-center justify-center text-white shadow-lg transition-all"
          title="Open All Inventory & Crafting"
        >
          <span className="text-lg">🎒</span>
          <span className="text-[9px] font-extrabold uppercase">Bag</span>
        </button>
      </div>
    </div>
  );
};
