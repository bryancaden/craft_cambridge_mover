export type CharacterGender = 'boy' | 'girl';

export interface CharacterConfig {
  gender: CharacterGender;
  name: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  skinColor: string;
  accessory: 'none' | 'miner_helmet' | 'pirate_hat' | 'explorer_cap' | 'flower_crown' | 'crown';
}

export type BlockType =
  | 'grass'
  | 'dirt'
  | 'stone'
  | 'wood'
  | 'leaves'
  | 'brick'
  | 'glass'
  | 'bookshelf'
  | 'gold'
  | 'diamond'
  | 'lantern'
  | 'sand'
  | 'water'
  | 'flower_red'
  | 'flower_yellow'
  | 'wool_red'
  | 'wool_blue';

export interface VoxelBlock {
  x: number;
  y: number;
  z: number;
  type: BlockType;
}

export interface Inventory {
  [key: string]: number;
}

export type CameraView = 'firstPerson' | 'thirdPerson' | 'orbit';

export type MoversPart =
  | 'rw_part1' // Look and read: choose words
  | 'rw_part2' // Dialogue: choose best answer
  | 'rw_part3' // Story cloze + best title
  | 'rw_part4' // Grammar cloze (3 options)
  | 'rw_part5' // Story comprehension: complete 1-3 words
  | 'rw_part6' // Look and read and write
  | 'listening_part1' // Audio match names
  | 'listening_part4' // Audio multiple choice pictures
  | 'speaking_differences' // Find 4 differences
  | 'speaking_odd_one_out'; // Which one is different and why

export interface Part1Question {
  id: string;
  definition: string;
  correctWord: string;
  options: { word: string; category: string; emoji: string; hint: string }[];
  rewardBlocks: { type: BlockType; count: number };
}

export interface Part2Question {
  id: string;
  speakerA: string;
  lineA: string;
  speakerB: string;
  options: { key: 'A' | 'B' | 'C'; text: string }[];
  correctKey: 'A' | 'B' | 'C';
  explanation: string;
  rewardBlocks: { type: BlockType; count: number };
}

export interface Part3Story {
  id: string;
  titlePrompt: string;
  storySegments: {
    textBefore: string;
    blankNumber?: number;
    correctWord?: string;
  }[];
  wordBank: { word: string; emoji: string; hint: string }[];
  titleOptions: string[];
  correctTitleIndex: number;
  rewardBlocks: { type: BlockType; count: number };
}

export interface Part4Grammar {
  id: string;
  topic: string;
  intro: string;
  blanks: {
    blankNumber: number;
    sentenceWithBlank: string;
    options: [string, string, string];
    correctAnswer: string;
    explanation: string;
  }[];
  rewardBlocks: { type: BlockType; count: number };
}

export interface Part5StoryComp {
  id: string;
  title: string;
  text: string;
  questions: {
    id: string;
    leadSentence: string;
    targetEnding: string;
    acceptableAnswers: string[];
    hint: string;
  }[];
  rewardBlocks: { type: BlockType; count: number };
}

export interface Part6PicWrite {
  id: string;
  sceneTitle: string;
  sceneDescription: string;
  sceneSvgType: 'park' | 'beach' | 'farm' | 'classroom';
  sentenceCompletions: {
    prompt: string;
    acceptableAnswers: string[];
    hint: string;
  }[];
  questions: {
    question: string;
    acceptableAnswers: string[];
    hint: string;
  }[];
  rewardBlocks: { type: BlockType; count: number };
}

export interface ListeningQuestion {
  id: string;
  audioScript: string;
  prompt: string;
  options: { key: string; label: string; emoji: string; detail: string }[];
  correctKey: string;
  explanation: string;
  rewardBlocks: { type: BlockType; count: number };
}

export interface SpeakingDifferenceItem {
  id: string;
  theme: string;
  picture1Description: string;
  picture2Description: string;
  differences: {
    id: string;
    item: string;
    pic1State: string;
    pic2State: string;
    modelSentence: string;
  }[];
  rewardBlocks: { type: BlockType; count: number };
}

export interface SpeakingOddOneOutItem {
  id: string;
  items: { name: string; category: string; emoji: string; isOdd: boolean; reason: string }[];
  explanation: string;
  rewardBlocks: { type: BlockType; count: number };
}

export interface PlayerStats {
  score: number;
  xp?: number;
  cambridgeShields: {
    readingWriting: number; // 0-5
    listening: number; // 0-5
    speaking: number; // 0-5
  };
  level: number;
  blocksPlaced: number;
  questionsAnswered: number;
  blocksMined?: number;
  blueprintsBuilt?: number;
  completedExamParts?: MoversPart[];
  weatherQuestsCompleted?: number;
  lanternsPlaced?: number;
}

export type AchievementCategory = 'cambridge' | 'building' | 'progression' | 'exploration';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: BadgeTier;
  icon: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  unlockedAt?: string;
  claimed: boolean;
  reward: {
    blockType?: BlockType;
    blockCount?: number;
    xp: number;
    titleName?: string;
  };
  details: string;
  actionPart?: MoversPart;
  actionType?: 'exam' | 'build' | 'weather' | 'backpack';
}

export interface AchievementStoredState {
  unlockedAt?: string;
  claimed: boolean;
}

export type ChallengeType =
  | 'place_wood'
  | 'place_stone'
  | 'place_any'
  | 'mine_blocks'
  | 'complete_speaking'
  | 'complete_reading'
  | 'complete_listening'
  | 'build_blueprint';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  targetCount: number;
  currentProgress: number;
  completed: boolean;
  claimed: boolean;
  reward: {
    blockType: BlockType;
    blockCount: number;
    xp: number;
  };
  icon: string;
  category: 'build' | 'exam' | 'explore';
  targetPart?: MoversPart;
}

export type WeatherType = 'clear' | 'rain' | 'snow';

export type WeatherCondition =
  | 'place_wood_or_brick'
  | 'place_lantern'
  | 'place_stone'
  | 'place_water_or_glass'
  | 'place_flower'
  | 'complete_reading'
  | 'complete_speaking'
  | 'complete_listening'
  | 'place_any';

export interface WeatherQuest {
  id: string;
  weather: WeatherType;
  title: string;
  description: string;
  condition: WeatherCondition;
  targetCount: number;
  currentProgress: number;
  completed: boolean;
  claimed: boolean;
  reward: {
    blockType: BlockType;
    blockCount: number;
    xp: number;
  };
  icon: string;
}
