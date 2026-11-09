import React from 'react';
import { BlockType } from '../types/game';
import { BLOCK_DEFINITIONS } from '../data/cambridgeMoversData';
import { soundFx } from '../utils/soundEffects';

interface InventoryModalProps {
  inventory: Record<string, number>;
  activeBlock: BlockType;
  onSelectActiveBlock: (type: BlockType) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  activeBlock,
  onSelectActiveBlock,
  onClose,
}) => {
  const allBlockTypes = Object.keys(BLOCK_DEFINITIONS) as BlockType[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-2xl">
              🎒
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Explorer Resource Backpack</h2>
              <p className="text-xs text-amber-300">
                Click any block to equip it into your hand for placing in the 3D world
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

        {/* Grid of all blocks */}
        <div className="mt-4 flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1">
          {allBlockTypes.map((type) => {
            const def = BLOCK_DEFINITIONS[type];
            const count = inventory[type] || 0;
            const isEquipped = activeBlock === type;

            return (
              <button
                key={type}
                onClick={() => {
                  soundFx.playClick();
                  onSelectActiveBlock(type);
                }}
                className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'bg-amber-500/20 border-amber-400 shadow-xl scale-102'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-8 h-8 rounded-lg border border-black/40 shadow-inner flex items-center justify-center text-sm"
                    style={{ backgroundColor: def.hexColor }}
                  >
                    {type === 'flower_red' ? '🌹' : type === 'flower_yellow' ? '🌼' : type === 'bookshelf' ? '📚' : ''}
                  </div>
                  <span
                    className={`font-mono font-black text-sm px-2 py-0.5 rounded-md ${
                      count > 0 ? 'bg-slate-900 text-amber-300' : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    ×{count}
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="font-bold text-white text-xs">{def.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                    {def.description}
                  </div>
                </div>

                {isEquipped && (
                  <div className="mt-2 text-[10px] font-extrabold uppercase text-amber-400 flex items-center gap-1">
                    <span>✓ In Hand</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md"
          >
            Close Backpack
          </button>
        </div>
      </div>
    </div>
  );
};
