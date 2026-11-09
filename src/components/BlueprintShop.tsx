import React from 'react';
import { BlockType, VoxelBlock } from '../types/game';
import { soundFx } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { BLOCK_DEFINITIONS } from '../data/cambridgeMoversData';

interface Blueprint {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requiredMoversPart: string;
  requiredResources: { type: BlockType; count: number }[];
  blocksTemplate: (originX: number, originY: number, originZ: number) => VoxelBlock[];
}

export const BLUEPRINTS: Blueprint[] = [
  {
    id: 'bp-cambridge-library',
    name: 'Cambridge Study Room',
    description: 'A cozy academic library with double bookshelves, large windows, and reading lanterns.',
    emoji: '🏛️',
    requiredMoversPart: 'Part 1 (Vocabulary) & Part 3 (Stories)',
    requiredResources: [
      { type: 'wood', count: 6 },
      { type: 'bookshelf', count: 4 },
      { type: 'glass', count: 4 },
      { type: 'lantern', count: 2 },
    ],
    blocksTemplate: (ox, oy, oz) => {
      const b: VoxelBlock[] = [];
      // Floor
      for (let x = 0; x < 4; x++) {
        for (let z = 0; z < 4; z++) {
          b.push({ x: ox + x, y: oy, z: oz + z, type: 'wood' });
        }
      }
      // Bookshelf wall
      b.push({ x: ox, y: oy + 1, z: oz + 1, type: 'bookshelf' });
      b.push({ x: ox, y: oy + 2, z: oz + 1, type: 'bookshelf' });
      b.push({ x: ox, y: oy + 1, z: oz + 2, type: 'bookshelf' });
      b.push({ x: ox, y: oy + 2, z: oz + 2, type: 'bookshelf' });
      // Windows
      b.push({ x: ox + 3, y: oy + 1, z: oz + 1, type: 'glass' });
      b.push({ x: ox + 3, y: oy + 2, z: oz + 1, type: 'glass' });
      b.push({ x: ox + 3, y: oy + 1, z: oz + 2, type: 'glass' });
      b.push({ x: ox + 3, y: oy + 2, z: oz + 2, type: 'glass' });
      // Lanterns
      b.push({ x: ox + 1, y: oy + 1, z: oz + 1, type: 'lantern' });
      b.push({ x: ox + 2, y: oy + 1, z: oz + 2, type: 'lantern' });
      return b;
    },
  },
  {
    id: 'bp-farm-garden',
    name: 'Sunny Farmyard & Flowers',
    description: 'Lush agricultural crop garden with fresh water trench, vibrant poppies and dandelions.',
    emoji: '🌻',
    requiredMoversPart: 'Part 1 (Vocabulary) & Part 6 (Farm Scenes)',
    requiredResources: [
      { type: 'dirt', count: 6 },
      { type: 'water', count: 2 },
      { type: 'flower_red', count: 4 },
      { type: 'flower_yellow', count: 4 },
    ],
    blocksTemplate: (ox, oy, oz) => {
      const b: VoxelBlock[] = [];
      for (let x = 0; x < 4; x++) {
        for (let z = 0; z < 4; z++) {
          if (x === 1 || x === 2) {
            b.push({ x: ox + x, y: oy, z: oz + z, type: 'dirt' });
          } else {
            b.push({ x: ox + x, y: oy, z: oz + z, type: 'grass' });
          }
        }
      }
      b.push({ x: ox + 1, y: oy, z: oz + 1, type: 'water' });
      b.push({ x: ox + 2, y: oy, z: oz + 1, type: 'water' });
      b.push({ x: ox, y: oy + 1, z: oz, type: 'flower_red' });
      b.push({ x: ox, y: oy + 1, z: oz + 3, type: 'flower_red' });
      b.push({ x: ox + 3, y: oy + 1, z: oz, type: 'flower_yellow' });
      b.push({ x: ox + 3, y: oy + 1, z: oz + 3, type: 'flower_yellow' });
      return b;
    },
  },
  {
    id: 'bp-pirate-cove',
    name: 'Treasure Island Lookout',
    description: 'Gold treasure repository from the Movers pirate story with glowing dock and beacon.',
    emoji: '🏴‍☠️',
    requiredMoversPart: 'Part 4 (Grammar) & Part 5 (Comprehension)',
    requiredResources: [
      { type: 'sand', count: 6 },
      { type: 'wood', count: 6 },
      { type: 'gold', count: 4 },
      { type: 'diamond', count: 2 },
    ],
    blocksTemplate: (ox, oy, oz) => {
      const b: VoxelBlock[] = [];
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
          b.push({ x: ox + x, y: oy, z: oz + z, type: 'sand' });
        }
      }
      b.push({ x: ox + 1, y: oy + 1, z: oz + 1, type: 'gold' });
      b.push({ x: ox + 1, y: oy + 2, z: oz + 1, type: 'gold' });
      b.push({ x: ox + 1, y: oy + 3, z: oz + 1, type: 'diamond' });
      b.push({ x: ox, y: oy + 1, z: oz, type: 'wood' });
      b.push({ x: ox + 2, y: oy + 1, z: oz + 2, type: 'wood' });
      return b;
    },
  },
  {
    id: 'bp-castle-tower',
    name: 'Movers Champion Tower',
    description: 'A grand stone citadel tower with glass crown for mastering all Cambridge parts.',
    emoji: '🏰',
    requiredMoversPart: 'All Movers Test Parts (Listening + R&W)',
    requiredResources: [
      { type: 'stone', count: 10 },
      { type: 'brick', count: 6 },
      { type: 'glass', count: 4 },
      { type: 'diamond', count: 3 },
      { type: 'lantern', count: 2 },
    ],
    blocksTemplate: (ox, oy, oz) => {
      const b: VoxelBlock[] = [];
      for (let y = 0; y < 4; y++) {
        b.push({ x: ox, y: oy + y, z: oz, type: 'stone' });
        b.push({ x: ox + 2, y: oy + y, z: oz, type: 'stone' });
        b.push({ x: ox, y: oy + y, z: oz + 2, type: 'stone' });
        b.push({ x: ox + 2, y: oy + y, z: oz + 2, type: 'stone' });
        b.push({ x: ox + 1, y: oy + y, z: oz, type: 'brick' });
        b.push({ x: ox + 1, y: oy + y, z: oz + 2, type: 'brick' });
      }
      b.push({ x: ox + 1, y: oy + 4, z: oz + 1, type: 'glass' });
      b.push({ x: ox + 1, y: oy + 5, z: oz + 1, type: 'diamond' });
      b.push({ x: ox, y: oy + 4, z: oz, type: 'lantern' });
      b.push({ x: ox + 2, y: oy + 4, z: oz + 2, type: 'lantern' });
      return b;
    },
  },
];

interface BlueprintShopProps {
  inventory: Record<string, number>;
  onBuildBlueprint: (blueprint: Blueprint) => void;
  onOpenExamPart: (part: string) => void;
  onClose: () => void;
}

export const BlueprintShop: React.FC<BlueprintShopProps> = ({
  inventory,
  onBuildBlueprint,
  onOpenExamPart,
  onClose,
}) => {
  const checkCanBuild = (bp: Blueprint) => {
    return bp.requiredResources.every((req) => (inventory[req.type] || 0) >= req.count);
  };

  const handleConstruct = (bp: Blueprint) => {
    if (!checkCanBuild(bp)) {
      soundFx.playIncorrect();
      return;
    }
    soundFx.playLevelUp();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    onBuildBlueprint(bp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-md">
              📐
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Voxel Blueprint Workshop</h2>
              <p className="text-xs text-indigo-300">
                Earn blocks by answering Cambridge Movers questions, then craft structures!
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

        {/* Blueprint Cards Grid */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {BLUEPRINTS.map((bp) => {
            const canBuild = checkCanBuild(bp);

            return (
              <div
                key={bp.id}
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                    {bp.emoji}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white flex items-center gap-2">
                      <span>{bp.name}</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">{bp.description}</p>
                    <div className="text-[11px] text-amber-400 font-bold mt-1">
                      📚 Practise in: {bp.requiredMoversPart}
                    </div>

                    {/* Cost pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {bp.requiredResources.map((req) => {
                        const playerHas = inventory[req.type] || 0;
                        const isSatisfied = playerHas >= req.count;
                        const def = BLOCK_DEFINITIONS[req.type];

                        return (
                          <span
                            key={req.type}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border ${
                              isSatisfied
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-xs border border-black/40"
                              style={{ backgroundColor: def?.hexColor }}
                            />
                            <span>{def?.name}</span>
                            <span className="font-mono">
                              {playerHas}/{req.count}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleConstruct(bp)}
                    disabled={!canBuild}
                    className={`w-full sm:w-32 py-2.5 px-4 rounded-xl text-xs font-black shadow-lg transition-all ${
                      canBuild
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 hover:scale-105 active:scale-95 shadow-emerald-500/20'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canBuild ? '✨ Construct' : 'Need Blocks'}
                  </button>

                  {!canBuild && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenExamPart('rw_part1');
                      }}
                      className="w-full sm:w-32 py-1.5 px-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-400/30 rounded-xl text-[11px] font-bold"
                    >
                      Earn in Exam
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
