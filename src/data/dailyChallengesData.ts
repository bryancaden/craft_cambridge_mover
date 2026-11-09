import { DailyChallenge, ChallengeType, BlockType, MoversPart } from '../types/game';

export interface ChallengeTemplate {
  id: string;
  title: string;
  descriptionTemplate: string;
  type: ChallengeType;
  targetCount: number;
  reward: {
    blockType: BlockType;
    blockCount: number;
    xp: number;
  };
  icon: string;
  category: 'build' | 'exam' | 'explore';
  targetPart?: MoversPart;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'quest_place_wood',
    title: 'Woodland Architect',
    descriptionTemplate: 'Place {count} Wood Blocks',
    type: 'place_wood',
    targetCount: 20,
    reward: {
      blockType: 'brick',
      blockCount: 8,
      xp: 150,
    },
    icon: '🪵',
    category: 'build',
  },
  {
    id: 'quest_place_stone',
    title: 'Cobblestone Mason',
    descriptionTemplate: 'Place {count} Stone Blocks',
    type: 'place_stone',
    targetCount: 15,
    reward: {
      blockType: 'glass',
      blockCount: 6,
      xp: 130,
    },
    icon: '🪨',
    category: 'build',
  },
  {
    id: 'quest_place_any',
    title: 'Master Island Builder',
    descriptionTemplate: 'Place {count} Blocks of any type',
    type: 'place_any',
    targetCount: 25,
    reward: {
      blockType: 'gold',
      blockCount: 4,
      xp: 200,
    },
    icon: '🏗️',
    category: 'build',
  },
  {
    id: 'quest_mine_blocks',
    title: 'Resource Prospector',
    descriptionTemplate: 'Mine or harvest {count} Blocks from the world',
    type: 'mine_blocks',
    targetCount: 8,
    reward: {
      blockType: 'lantern',
      blockCount: 4,
      xp: 120,
    },
    icon: '⛏️',
    category: 'explore',
  },
  {
    id: 'quest_complete_speaking',
    title: 'Cambridge Voice Champion',
    descriptionTemplate: 'Complete {count} Speaking Tasks (Differences or Odd-One-Out)',
    type: 'complete_speaking',
    targetCount: 3,
    reward: {
      blockType: 'diamond',
      blockCount: 3,
      xp: 250,
    },
    icon: '🗣️',
    category: 'exam',
    targetPart: 'speaking_differences',
  },
  {
    id: 'quest_complete_reading',
    title: 'Grammar & Story Scholar',
    descriptionTemplate: 'Complete {count} Reading & Writing Questions',
    type: 'complete_reading',
    targetCount: 4,
    reward: {
      blockType: 'bookshelf',
      blockCount: 6,
      xp: 200,
    },
    icon: '📖',
    category: 'exam',
    targetPart: 'rw_part1',
  },
  {
    id: 'quest_complete_listening',
    title: 'Attentive Cambridge Ears',
    descriptionTemplate: 'Complete {count} Listening Audio Questions',
    type: 'complete_listening',
    targetCount: 3,
    reward: {
      blockType: 'lantern',
      blockCount: 5,
      xp: 180,
    },
    icon: '🎧',
    category: 'exam',
    targetPart: 'listening_part1',
  },
  {
    id: 'quest_build_blueprint',
    title: 'Grand Landmark Architect',
    descriptionTemplate: 'Construct {count} Blueprint Schematic in the workshop',
    type: 'build_blueprint',
    targetCount: 1,
    reward: {
      blockType: 'diamond',
      blockCount: 2,
      xp: 300,
    },
    icon: '📐',
    category: 'build',
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function generateDailyChallenges(dateStr: string): DailyChallenge[] {
  // Ensure we select a balanced set:
  // 1 building/crafting challenge, 2 exam challenges (reading/listening/speaking), and 1 exploration or extra build
  const buildQuests = CHALLENGE_TEMPLATES.filter((t) => t.category === 'build' && t.type !== 'build_blueprint');
  const examQuests = CHALLENGE_TEMPLATES.filter((t) => t.category === 'exam');
  const specialQuests = CHALLENGE_TEMPLATES.filter(
    (t) => t.type === 'mine_blocks' || t.type === 'build_blueprint' || t.type === 'place_any'
  );

  // Pseudo-random deterministic shuffle by dateStr so all users get consistent daily quests for the day
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) & 0xffffffff;
  }
  const pseudoRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const pickOne = <T>(arr: T[]): T => arr[Math.floor(pseudoRand() * arr.length)];

  const selectedTemplates: ChallengeTemplate[] = [];

  // Pick 1 specific place quest (e.g. Place 20 wood or 15 stone)
  selectedTemplates.push(pickOne(buildQuests));

  // Pick 2 distinct exam quests (e.g. Speaking + Reading or Listening)
  const shuffledExam = [...examQuests].sort(() => pseudoRand() - 0.5);
  selectedTemplates.push(shuffledExam[0]);
  selectedTemplates.push(shuffledExam[1] || shuffledExam[0]);

  // Pick 1 extra quest (mining or blueprint or place any)
  const extra = pickOne(specialQuests);
  if (!selectedTemplates.some((t) => t.id === extra.id)) {
    selectedTemplates.push(extra);
  } else {
    selectedTemplates.push(shuffledExam[2] || pickOne(buildQuests));
  }

  return selectedTemplates.map((t, idx) => ({
    id: `${t.id}_${dateStr}_${idx}`,
    title: t.title,
    description: t.descriptionTemplate.replace('{count}', t.targetCount.toString()),
    type: t.type,
    targetCount: t.targetCount,
    currentProgress: 0,
    completed: false,
    claimed: false,
    reward: t.reward,
    icon: t.icon,
    category: t.category,
    targetPart: t.targetPart,
  }));
}

export function getDailyChallengesStorageKey(profileId?: string): string {
  return profileId ? `movers_daily_challenges_${profileId}` : 'movers_daily_challenges';
}

export function loadStoredDailyChallenges(profileId?: string): { date: string; challenges: DailyChallenge[] } {
  const today = getTodayDateString();
  const key = getDailyChallengesStorageKey(profileId);
  try {
    let raw = localStorage.getItem(key);
    // Legacy fallback for Leo
    if (!raw && profileId === 'profile-leo') {
      raw = localStorage.getItem('movers_daily_challenges');
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today && Array.isArray(parsed.challenges) && parsed.challenges.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored daily challenges', e);
  }

  const generated = generateDailyChallenges(today);
  const data = { date: today, challenges: generated };
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
  return data;
}

export function saveStoredDailyChallenges(
  challenges: DailyChallenge[],
  date: string = getTodayDateString(),
  profileId?: string
) {
  try {
    const key = getDailyChallengesStorageKey(profileId);
    localStorage.setItem(key, JSON.stringify({ date, challenges }));
  } catch (e) {
    console.error('Failed to save daily challenges', e);
  }
}
