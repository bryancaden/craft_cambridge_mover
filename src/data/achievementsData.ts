import { PlayerStats, Achievement, AchievementStoredState, MoversPart, BlockType } from '../types/game';

export interface AchievementBlueprint {
  id: string;
  title: string;
  description: string;
  category: Achievement['category'];
  tier: Achievement['tier'];
  icon: string;
  targetCount: number;
  details: string;
  actionPart?: MoversPart;
  actionType?: 'exam' | 'build' | 'weather' | 'backpack';
  reward: {
    blockType?: BlockType;
    blockCount?: number;
    xp: number;
    titleName?: string;
  };
  getCurrentCount: (stats: PlayerStats, inventory: Record<string, number>) => number;
}

export const ALL_MOVERS_EXAM_PARTS: MoversPart[] = [
  'rw_part1',
  'rw_part2',
  'rw_part3',
  'rw_part4',
  'rw_part5',
  'rw_part6',
  'listening_part4',
  'speaking_differences',
  'speaking_odd_one_out',
];

export const ACHIEVEMENTS_BLUEPRINTS: AchievementBlueprint[] = [
  // Cambridge Milestones
  {
    id: 'cambridge_all_types',
    title: 'Cambridge Polymath',
    description: 'Complete at least one question in all 9 Cambridge Movers exam types',
    category: 'cambridge',
    tier: 'diamond',
    icon: '🎓',
    targetCount: 9,
    details: 'Mastering every section — from Vocabulary and Cloze to Listening and Speaking Differences — ensures a comprehensive mastery of A1 Movers English.',
    actionType: 'exam',
    reward: {
      blockType: 'diamond',
      blockCount: 15,
      xp: 600,
      titleName: 'Movers Polymath',
    },
    getCurrentCount: (stats) => {
      const parts = new Set(stats.completedExamParts || []);
      const count = ALL_MOVERS_EXAM_PARTS.filter((p) => parts.has(p)).length;
      return count;
    },
  },
  {
    id: 'all_shields_15',
    title: 'Shield Laureate',
    description: 'Earn all 15 Cambridge Shields (5 Reading & Writing, 5 Listening, 5 Speaking)',
    category: 'cambridge',
    tier: 'legendary',
    icon: '🛡️',
    targetCount: 15,
    details: 'The official Cambridge English evaluation awards up to 5 shields per skill. 15 shields represents the highest possible achievement.',
    actionType: 'exam',
    reward: {
      blockType: 'diamond',
      blockCount: 20,
      xp: 1000,
      titleName: 'Grand Laureate',
    },
    getCurrentCount: (stats) => {
      const s = stats.cambridgeShields;
      return (s.readingWriting || 0) + (s.listening || 0) + (s.speaking || 0);
    },
  },
  {
    id: 'questions_25',
    title: 'Diligent Student',
    description: 'Answer 25 Cambridge exam questions correctly',
    category: 'cambridge',
    tier: 'bronze',
    icon: '📝',
    targetCount: 25,
    details: 'Consistent daily practice builds confident vocabulary recall and grammatical reflexes.',
    actionType: 'exam',
    reward: {
      blockType: 'bookshelf',
      blockCount: 8,
      xp: 150,
      titleName: 'Scholar',
    },
    getCurrentCount: (stats) => stats.questionsAnswered || 0,
  },
  {
    id: 'questions_100',
    title: 'Century of Knowledge',
    description: 'Answer 100 Cambridge exam questions correctly',
    category: 'cambridge',
    tier: 'gold',
    icon: '📜',
    targetCount: 100,
    details: 'A hundred solved challenges spans hundreds of authentic words, conversational idioms, and grammar patterns.',
    actionType: 'exam',
    reward: {
      blockType: 'diamond',
      blockCount: 10,
      xp: 500,
      titleName: 'Cambridge Centurion',
    },
    getCurrentCount: (stats) => stats.questionsAnswered || 0,
  },
  {
    id: 'part1_vocab_ace',
    title: 'Vocabulary Virtuoso',
    description: 'Complete Cambridge R&W Part 1 vocabulary definitions',
    category: 'cambridge',
    tier: 'bronze',
    icon: '📖',
    targetCount: 1,
    details: 'Part 1 tests matching exact definitions to words like "blanket", "supermarket", and "kangaroo".',
    actionPart: 'rw_part1',
    actionType: 'exam',
    reward: {
      blockType: 'bookshelf',
      blockCount: 4,
      xp: 100,
      titleName: 'Vocab Ace',
    },
    getCurrentCount: (stats) => ((stats.completedExamParts || []).includes('rw_part1') ? 1 : 0),
  },
  {
    id: 'part2_dialogue_ace',
    title: 'Dialogue Diplomat',
    description: 'Complete Cambridge R&W Part 2 conversational responses',
    category: 'cambridge',
    tier: 'bronze',
    icon: '💬',
    targetCount: 1,
    details: 'Choosing the most natural conversational replies in authentic dialogue scenarios.',
    actionPart: 'rw_part2',
    actionType: 'exam',
    reward: {
      blockType: 'gold',
      blockCount: 4,
      xp: 100,
      titleName: 'Diplomat',
    },
    getCurrentCount: (stats) => ((stats.completedExamParts || []).includes('rw_part2') ? 1 : 0),
  },
  {
    id: 'speaking_master',
    title: 'Silver Tongue',
    description: 'Complete Speaking examinations (Differences and Odd-One-Out)',
    category: 'cambridge',
    tier: 'silver',
    icon: '🎤',
    targetCount: 2,
    details: 'In the Cambridge Speaking test, candidates describe differences between two pictures and explain which object is the odd one out.',
    actionPart: 'speaking_differences',
    actionType: 'exam',
    reward: {
      blockType: 'gold',
      blockCount: 8,
      xp: 250,
      titleName: 'Silver Tongue',
    },
    getCurrentCount: (stats) => {
      const parts = new Set(stats.completedExamParts || []);
      let count = 0;
      if (parts.has('speaking_differences')) count++;
      if (parts.has('speaking_odd_one_out')) count++;
      return count;
    },
  },

  // Progression Milestones
  {
    id: 'level_5',
    title: 'Adept Learner (Level 5)',
    description: 'Reach Level 5 by learning and building on your island',
    category: 'progression',
    tier: 'silver',
    icon: '🌟',
    targetCount: 5,
    details: 'Level 5 marks a confident transition from newcomer to seasoned island pioneer.',
    reward: {
      blockType: 'gold',
      blockCount: 6,
      xp: 200,
      titleName: 'Adept',
    },
    getCurrentCount: (stats) => stats.level || 1,
  },
  {
    id: 'level_10',
    title: 'Master of Movers (Level 10)',
    description: 'Reach Level 10 through dedicated Cambridge learning and crafting',
    category: 'progression',
    tier: 'gold',
    icon: '👑',
    targetCount: 10,
    details: 'Reaching Level 10 signifies exceptional dedication, unlocking full mastery over Cambridge A1 Movers content.',
    reward: {
      blockType: 'diamond',
      blockCount: 12,
      xp: 500,
      titleName: 'Movers Master',
    },
    getCurrentCount: (stats) => stats.level || 1,
  },
  {
    id: 'level_20',
    title: 'Legendary Academician (Level 20)',
    description: 'Ascend to Level 20 in the Cambridge Movers world',
    category: 'progression',
    tier: 'legendary',
    icon: '🏆',
    targetCount: 20,
    details: 'Reserved only for the greatest linguists and island architects in the entire archipelago.',
    reward: {
      blockType: 'diamond',
      blockCount: 25,
      xp: 1500,
      titleName: 'Grandmaster',
    },
    getCurrentCount: (stats) => stats.level || 1,
  },
  {
    id: 'score_1000',
    title: 'High Scorer',
    description: 'Accumulate 1,000 Total Score Points',
    category: 'progression',
    tier: 'bronze',
    icon: '✨',
    targetCount: 1000,
    details: 'Earn points by solving questions, completing daily quests, and building structures.',
    reward: {
      blockType: 'gold',
      blockCount: 5,
      xp: 150,
      titleName: 'High Scorer',
    },
    getCurrentCount: (stats) => stats.score || 0,
  },
  {
    id: 'score_5000',
    title: 'Score Tycoon',
    description: 'Accumulate 5,000 Total Score Points',
    category: 'progression',
    tier: 'gold',
    icon: '💰',
    targetCount: 5000,
    details: 'A true tycoon of academic achievements and world construction.',
    reward: {
      blockType: 'diamond',
      blockCount: 10,
      xp: 600,
      titleName: 'Score Tycoon',
    },
    getCurrentCount: (stats) => stats.score || 0,
  },

  // Building & Mining Milestones
  {
    id: 'builder_50',
    title: 'First Foundation',
    description: 'Place 50 blocks in the voxel world',
    category: 'building',
    tier: 'bronze',
    icon: '🧱',
    targetCount: 50,
    details: 'Every great monument begins with placing the first cornerstone.',
    actionType: 'build',
    reward: {
      blockType: 'wood',
      blockCount: 20,
      xp: 100,
      titleName: 'Apprentice Builder',
    },
    getCurrentCount: (stats) => stats.blocksPlaced || 0,
  },
  {
    id: 'builder_250',
    title: 'Town Craftsman',
    description: 'Place 250 blocks in the voxel world',
    category: 'building',
    tier: 'silver',
    icon: '🏘️',
    targetCount: 250,
    details: 'Creating roads, courtyards, and houses transforms the wilderness into civilization.',
    actionType: 'build',
    reward: {
      blockType: 'brick',
      blockCount: 24,
      xp: 250,
      titleName: 'Town Craftsman',
    },
    getCurrentCount: (stats) => stats.blocksPlaced || 0,
  },
  {
    id: 'builder_1000',
    title: 'Block Titan (1,000 Blocks)',
    description: 'Place 1,000 blocks to forge an expansive voxel kingdom',
    category: 'building',
    tier: 'gold',
    icon: '🏰',
    targetCount: 1000,
    details: 'Placing 1,000 blocks is a monumental engineering feat, creating a true fortress of knowledge.',
    actionType: 'build',
    reward: {
      blockType: 'gold',
      blockCount: 25,
      xp: 600,
      titleName: 'Block Titan',
    },
    getCurrentCount: (stats) => stats.blocksPlaced || 0,
  },
  {
    id: 'builder_2500',
    title: 'Architectural Wonder',
    description: 'Place 2,500 blocks in the voxel world',
    category: 'building',
    tier: 'legendary',
    icon: '🗿',
    targetCount: 2500,
    details: 'A legendary master builder whose voxel creations stand as timeless marvels.',
    actionType: 'build',
    reward: {
      blockType: 'diamond',
      blockCount: 20,
      xp: 1200,
      titleName: 'World Architect',
    },
    getCurrentCount: (stats) => stats.blocksPlaced || 0,
  },
  {
    id: 'miner_50',
    title: 'Quarry Worker',
    description: 'Mine and collect 50 blocks from the environment',
    category: 'building',
    tier: 'bronze',
    icon: '⛏️',
    targetCount: 50,
    details: 'Harvesting raw stone, dirt, and wood fuels your future architectural projects.',
    reward: {
      blockType: 'stone',
      blockCount: 20,
      xp: 100,
      titleName: 'Miner',
    },
    getCurrentCount: (stats) => stats.blocksMined || 0,
  },
  {
    id: 'miner_200',
    title: 'Master Quarryman',
    description: 'Mine and collect 200 blocks from the terrain',
    category: 'building',
    tier: 'silver',
    icon: '⛏️',
    targetCount: 200,
    details: 'Deep excavation uncovers hidden underground potential and rare geological strata.',
    reward: {
      blockType: 'gold',
      blockCount: 8,
      xp: 250,
      titleName: 'Master Quarryman',
    },
    getCurrentCount: (stats) => stats.blocksMined || 0,
  },
  {
    id: 'blueprints_3',
    title: 'Blueprint Engineer',
    description: 'Construct 3 architectural Schematics from the Blueprint Workshop',
    category: 'building',
    tier: 'gold',
    icon: '📐',
    targetCount: 3,
    details: 'Constructing pre-engineered structures like the Cambridge Study Room and Farmyard proves your architectural vision.',
    actionType: 'build',
    reward: {
      blockType: 'diamond',
      blockCount: 6,
      xp: 400,
      titleName: 'Chief Engineer',
    },
    getCurrentCount: (stats) => stats.blueprintsBuilt || 0,
  },

  // Exploration & Special Milestones
  {
    id: 'lanterns_15',
    title: 'Night Illuminator',
    description: 'Place 15 glowing Lanterns across your island',
    category: 'exploration',
    tier: 'silver',
    icon: '🏮',
    targetCount: 15,
    details: 'Banish the dark by placing warm golden lanterns along paths and terraces.',
    actionType: 'build',
    reward: {
      blockType: 'lantern',
      blockCount: 8,
      xp: 200,
      titleName: 'Illuminator',
    },
    getCurrentCount: (stats) => stats.lanternsPlaced || 0,
  },
  {
    id: 'diamond_hoard',
    title: 'Diamond Baron',
    description: 'Hold at least 20 Diamonds in your inventory backpack',
    category: 'exploration',
    tier: 'diamond',
    icon: '💎',
    targetCount: 20,
    details: 'Diamonds are the rarest, most radiant treasures in the voxel realm, earned through high-level exam accuracy.',
    actionType: 'backpack',
    reward: {
      blockType: 'diamond',
      blockCount: 10,
      xp: 500,
      titleName: 'Diamond Baron',
    },
    getCurrentCount: (_stats, inv) => inv['diamond'] || 0,
  },
  {
    id: 'weather_voyager',
    title: 'Meteorological Explorer',
    description: 'Complete 5 dynamic Weather Quests in Clear, Rain, and Snow conditions',
    category: 'exploration',
    tier: 'gold',
    icon: '🌈',
    targetCount: 5,
    details: 'Whether in peaceful sunshine, stormy rainfall, or shimmering snow, true explorers thrive in all elements.',
    actionType: 'weather',
    reward: {
      blockType: 'lantern',
      blockCount: 6,
      xp: 350,
      titleName: 'Sky Navigator',
    },
    getCurrentCount: (stats) => stats.weatherQuestsCompleted || 0,
  },
];

export function getAchievementsStorageKey(profileId?: string): string {
  return profileId ? `movers_achievements_${profileId}` : 'movers_achievements_state';
}

export function loadAchievementsState(profileId?: string): Record<string, AchievementStoredState> {
  try {
    const key = getAchievementsStorageKey(profileId);
    let raw = localStorage.getItem(key);
    // Legacy fallback for default profile Leo
    if (!raw && profileId === 'profile-leo') {
      raw = localStorage.getItem('movers_achievements_state');
    }
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAchievementsState(state: Record<string, AchievementStoredState>, profileId?: string): void {
  try {
    const key = getAchievementsStorageKey(profileId);
    localStorage.setItem(key, JSON.stringify(state));
  } catch {}
}

export function computeAchievements(
  stats: PlayerStats,
  inventory: Record<string, number>,
  storedState: Record<string, AchievementStoredState>
): Achievement[] {
  return ACHIEVEMENTS_BLUEPRINTS.map((bp) => {
    const currentCount = bp.getCurrentCount(stats, inventory);
    const isCompleted = currentCount >= bp.targetCount;
    const existing = storedState[bp.id];

    return {
      id: bp.id,
      title: bp.title,
      description: bp.description,
      category: bp.category,
      tier: bp.tier,
      icon: bp.icon,
      targetCount: bp.targetCount,
      currentCount: Math.min(bp.targetCount, currentCount),
      completed: isCompleted,
      unlockedAt: existing?.unlockedAt || (isCompleted ? 'Unlocked' : undefined),
      claimed: !!existing?.claimed,
      reward: bp.reward,
      details: bp.details,
      actionPart: bp.actionPart,
      actionType: bp.actionType,
    };
  });
}

/**
 * Checks if any achievements just crossed the threshold into completion.
 * Updates stored state with the timestamp and returns the list of newly completed achievements.
 */
export function checkAndUnlockAchievements(
  stats: PlayerStats,
  inventory: Record<string, number>,
  storedState: Record<string, AchievementStoredState>,
  profileId?: string
): {
  newlyUnlocked: Achievement[];
  updatedState: Record<string, AchievementStoredState>;
} {
  const newlyUnlocked: Achievement[] = [];
  const updatedState = { ...storedState };

  ACHIEVEMENTS_BLUEPRINTS.forEach((bp) => {
    const current = bp.getCurrentCount(stats, inventory);
    const isCompleted = current >= bp.targetCount;
    const existing = updatedState[bp.id];

    if (isCompleted && (!existing || !existing.unlockedAt)) {
      const nowStr = new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      updatedState[bp.id] = {
        unlockedAt: nowStr,
        claimed: existing?.claimed || false,
      };

      newlyUnlocked.push({
        id: bp.id,
        title: bp.title,
        description: bp.description,
        category: bp.category,
        tier: bp.tier,
        icon: bp.icon,
        targetCount: bp.targetCount,
        currentCount: bp.targetCount,
        completed: true,
        unlockedAt: nowStr,
        claimed: existing?.claimed || false,
        reward: bp.reward,
        details: bp.details,
        actionPart: bp.actionPart,
        actionType: bp.actionType,
      });
    }
  });

  if (newlyUnlocked.length > 0) {
    saveAchievementsState(updatedState, profileId);
  }

  return { newlyUnlocked, updatedState };
}
