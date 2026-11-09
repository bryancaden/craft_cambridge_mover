import { BlockType, MoversPart, WeatherCondition, WeatherQuest, WeatherType } from '../types/game';

export interface WeatherQuestTemplate {
  title: string;
  description: string;
  condition: WeatherCondition;
  targetCount: number;
  reward: {
    blockType: BlockType;
    blockCount: number;
    xp: number;
  };
  icon: string;
  targetPart?: MoversPart;
}

export const WEATHER_QUEST_POOLS: Record<WeatherType, WeatherQuestTemplate[]> = {
  rain: [
    {
      title: 'Rain Shelter Builder',
      description: 'Build a dry shelter against the storm by placing 8 Wood or Brick blocks!',
      condition: 'place_wood_or_brick',
      targetCount: 8,
      reward: { blockType: 'lantern', blockCount: 3, xp: 160 },
      icon: '🪵',
    },
    {
      title: 'Rainy Reading Cloze',
      description: 'Cozy up and complete 2 Cambridge Reading & Writing exercises while listening to the rain.',
      condition: 'complete_reading',
      targetCount: 2,
      reward: { blockType: 'bookshelf', blockCount: 4, xp: 200 },
      icon: '📖',
      targetPart: 'rw_part1',
    },
    {
      title: 'Rainwater Basin',
      description: 'Place 4 Glass or Water blocks to catch shimmering droplets of rainfall!',
      condition: 'place_water_or_glass',
      targetCount: 4,
      reward: { blockType: 'diamond', blockCount: 2, xp: 180 },
      icon: '💧',
    },
    {
      title: 'Storm Construction',
      description: 'Place 12 blocks of any type through the moody rain shower.',
      condition: 'place_any',
      targetCount: 12,
      reward: { blockType: 'brick', blockCount: 6, xp: 150 },
      icon: '🔨',
    },
    {
      title: 'Listening in the Rain',
      description: 'Sharpen your ears! Complete 2 Cambridge Listening audio questions during the rainfall.',
      condition: 'complete_listening',
      targetCount: 2,
      reward: { blockType: 'lantern', blockCount: 4, xp: 190 },
      icon: '🎧',
      targetPart: 'listening_part1',
    },
  ],
  snow: [
    {
      title: 'Warm the Frosty Island',
      description: 'Place 3 Lanterns in the snow to bring warm light to your island home!',
      condition: 'place_lantern',
      targetCount: 3,
      reward: { blockType: 'diamond', blockCount: 3, xp: 220 },
      icon: '🏮',
    },
    {
      title: 'Winter Fortress Wall',
      description: 'Place 10 Stone blocks to shield your mountain camp against icy arctic winds.',
      condition: 'place_stone',
      targetCount: 10,
      reward: { blockType: 'wool_blue', blockCount: 6, xp: 170 },
      icon: '🧱',
    },
    {
      title: 'Frosty Speaking Explorer',
      description: 'Complete 2 Cambridge Speaking questions to warm up your voice in the winter breeze!',
      condition: 'complete_speaking',
      targetCount: 2,
      reward: { blockType: 'wool_red', blockCount: 6, xp: 210 },
      icon: '🗣️',
      targetPart: 'speaking_differences',
    },
    {
      title: 'Snowy Cabin Bookshelf',
      description: 'Place 6 Wood or Brick blocks to craft an alpine winter ski lodge.',
      condition: 'place_wood_or_brick',
      targetCount: 6,
      reward: { blockType: 'gold', blockCount: 4, xp: 190 },
      icon: '🏔️',
    },
    {
      title: 'Winter Wonderland Artisan',
      description: 'Place 14 blocks of any kind while snowflakes drift peacefully across the sky.',
      condition: 'place_any',
      targetCount: 14,
      reward: { blockType: 'glass', blockCount: 8, xp: 180 },
      icon: '❄️',
    },
  ],
  clear: [
    {
      title: 'Sunlit Meadow Garden',
      description: 'Plant 3 Red or Yellow Flowers under the glowing blue sunshine!',
      condition: 'place_flower',
      targetCount: 3,
      reward: { blockType: 'wool_red', blockCount: 4, xp: 140 },
      icon: '🌻',
    },
    {
      title: 'Sunny Day Speaking',
      description: 'Answer 2 Cambridge Speaking tasks under the glorious sunshine!',
      condition: 'complete_speaking',
      targetCount: 2,
      reward: { blockType: 'diamond', blockCount: 2, xp: 200 },
      icon: '☀️',
      targetPart: 'speaking_odd_one_out',
    },
    {
      title: 'Sunshine Grammar Practice',
      description: 'Complete 2 Cambridge Reading & Writing exercises while the sky is bright and clear.',
      condition: 'complete_reading',
      targetCount: 2,
      reward: { blockType: 'bookshelf', blockCount: 3, xp: 170 },
      icon: '📜',
      targetPart: 'rw_part4',
    },
    {
      title: 'Tower of Light',
      description: 'Construct 10 Stone blocks upward towards the warm sunny clouds.',
      condition: 'place_stone',
      targetCount: 10,
      reward: { blockType: 'gold', blockCount: 3, xp: 160 },
      icon: '🏰',
    },
  ],
};

let questCounter = 1;

export function generateWeatherQuest(weather: WeatherType, excludeId?: string): WeatherQuest {
  const pool = WEATHER_QUEST_POOLS[weather] || WEATHER_QUEST_POOLS.clear;
  // Pick randomly
  const candidateIndex = Math.floor(Math.random() * pool.length);
  const template = pool[candidateIndex];

  return {
    id: `wq_${weather}_${Date.now()}_${questCounter++}`,
    weather,
    title: template.title,
    description: template.description,
    condition: template.condition,
    targetCount: template.targetCount,
    currentProgress: 0,
    completed: false,
    claimed: false,
    reward: template.reward,
    icon: template.icon,
  };
}

export function matchesBlockCondition(condition: WeatherCondition, blockType: BlockType): boolean {
  switch (condition) {
    case 'place_wood_or_brick':
      return blockType === 'wood' || blockType === 'brick';
    case 'place_lantern':
      return blockType === 'lantern';
    case 'place_stone':
      return blockType === 'stone';
    case 'place_water_or_glass':
      return blockType === 'water' || blockType === 'glass';
    case 'place_flower':
      return blockType === 'flower_red' || blockType === 'flower_yellow';
    case 'place_any':
      return true;
    default:
      return false;
  }
}

export function matchesMoversPartCondition(condition: WeatherCondition, part: MoversPart): boolean {
  switch (condition) {
    case 'complete_reading':
      return part.startsWith('rw_');
    case 'complete_speaking':
      return part.startsWith('speaking_');
    case 'complete_listening':
      return part.startsWith('listening_');
    default:
      return false;
  }
}
