import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { VoxelWorld3D } from './components/VoxelWorld3D';
import { InventoryHotbar } from './components/InventoryHotbar';
import { ExamStation } from './components/ExamStation';
import { CharacterCustomizer } from './components/CharacterCustomizer';
import { BlueprintShop, BLUEPRINTS } from './components/BlueprintShop';
import { InventoryModal } from './components/InventoryModal';
import { TeacherTipModal } from './components/TeacherTipModal';
import { StartupPage, UserProfile } from './components/StartupPage';
import { DailyChallengesModal } from './components/DailyChallengesModal';
import { ChallengeToast } from './components/ChallengeToast';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementToast } from './components/AchievementToast';
import {
  BlockType,
  VoxelBlock,
  CharacterConfig,
  CameraView,
  MoversPart,
  PlayerStats,
  DailyChallenge,
  WeatherType,
  WeatherQuest,
  Achievement,
  AchievementStoredState,
} from './types/game';
import {
  loadStoredDailyChallenges,
  saveStoredDailyChallenges,
  generateDailyChallenges,
  getTodayDateString,
} from './data/dailyChallengesData';
import {
  generateWeatherQuest,
  matchesBlockCondition,
  matchesMoversPartCondition,
} from './data/weatherData';
import {
  computeAchievements,
  checkAndUnlockAchievements,
  loadAchievementsState,
  saveAchievementsState,
} from './data/achievementsData';
import { WeatherQuestWidget } from './components/WeatherQuestWidget';
import { soundFx } from './utils/soundEffects';
import { relaxingBgm } from './utils/relaxingBgm';
import {
  Award,
  BookOpen,
  User,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  Music,
  LogOut,
  Target,
  Trophy,
} from 'lucide-react';

const DEFAULT_CHARACTER: CharacterConfig = {
  gender: 'boy',
  name: 'Leo',
  hairColor: '#5c3a21',
  shirtColor: '#2563eb',
  pantsColor: '#1d4ed8',
  skinColor: '#fed7aa',
  accessory: 'none',
};

const DEFAULT_HOTBAR: BlockType[] = [
  'wood',
  'stone',
  'brick',
  'glass',
  'bookshelf',
  'lantern',
  'gold',
  'diamond',
  'flower_red',
];

const STARTER_INVENTORY: Record<string, number> = {
  wood: 12,
  stone: 12,
  brick: 8,
  glass: 6,
  bookshelf: 4,
  lantern: 4,
  gold: 2,
  diamond: 2,
  flower_red: 4,
  flower_yellow: 4,
  dirt: 10,
  grass: 10,
  sand: 6,
  water: 4,
  wool_red: 4,
  wool_blue: 4,
};

const DEFAULT_STATS: PlayerStats = {
  score: 0,
  xp: 0,
  cambridgeShields: {
    readingWriting: 2,
    listening: 2,
    speaking: 1,
  },
  level: 1,
  blocksPlaced: 0,
  questionsAnswered: 0,
  blocksMined: 0,
  blueprintsBuilt: 0,
  completedExamParts: [],
  weatherQuestsCompleted: 0,
  lanternsPlaced: 0,
};

function loadProfileData(profileId: string, fallbackProfile?: UserProfile) {
  // 1. Character Config
  let char = DEFAULT_CHARACTER;
  const savedChar = localStorage.getItem(`movers_character_${profileId}`);
  if (savedChar) {
    try {
      char = JSON.parse(savedChar);
    } catch {}
  } else if (fallbackProfile) {
    char = fallbackProfile.character;
  } else if (profileId === 'profile-leo') {
    const legacy = localStorage.getItem('movers_character');
    if (legacy) {
      try {
        char = JSON.parse(legacy);
      } catch {}
    }
  }

  // 2. Inventory
  let inv = { ...STARTER_INVENTORY };
  const savedInv = localStorage.getItem(`movers_inventory_${profileId}`);
  if (savedInv) {
    try {
      inv = JSON.parse(savedInv);
    } catch {}
  } else if (profileId === 'profile-leo') {
    const legacy = localStorage.getItem('movers_inventory');
    if (legacy) {
      try {
        inv = JSON.parse(legacy);
      } catch {}
    }
  } else if (profileId === 'profile-mia') {
    // Mia preset: Level 3 bonus building blocks
    inv = {
      ...STARTER_INVENTORY,
      wood: 24,
      stone: 20,
      brick: 16,
      bookshelf: 8,
      lantern: 6,
      gold: 6,
      diamond: 4,
    };
  }

  // 3. Stats
  let st: PlayerStats = { ...DEFAULT_STATS };
  const savedStats = localStorage.getItem(`movers_stats_${profileId}`);
  if (savedStats) {
    try {
      const parsed = JSON.parse(savedStats);
      st = {
        ...DEFAULT_STATS,
        ...parsed,
        cambridgeShields: {
          ...DEFAULT_STATS.cambridgeShields,
          ...(parsed.cambridgeShields || {}),
        },
        completedExamParts: parsed.completedExamParts || [],
      };
    } catch {}
  } else if (fallbackProfile) {
    st = {
      ...DEFAULT_STATS,
      ...fallbackProfile.stats,
      cambridgeShields: {
        ...DEFAULT_STATS.cambridgeShields,
        ...(fallbackProfile.stats.cambridgeShields || {}),
      },
      completedExamParts: fallbackProfile.stats.completedExamParts || [],
    };
  } else if (profileId === 'profile-leo') {
    const legacy = localStorage.getItem('movers_stats');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        st = {
          ...DEFAULT_STATS,
          ...parsed,
          cambridgeShields: {
            ...DEFAULT_STATS.cambridgeShields,
            ...(parsed.cambridgeShields || {}),
          },
          completedExamParts: parsed.completedExamParts || [],
        };
      } catch {}
    }
  }

  // 4. Hotbar
  let hotbar = DEFAULT_HOTBAR;
  const savedHotbar = localStorage.getItem(`movers_hotbar_${profileId}`);
  if (savedHotbar) {
    try {
      hotbar = JSON.parse(savedHotbar);
    } catch {}
  }

  // 5. World Blocks (Isolated strictly per profile!)
  let blocks: VoxelBlock[] = [];
  const savedBlocks = localStorage.getItem(`movers_world_blocks_${profileId}`);
  if (savedBlocks) {
    try {
      blocks = JSON.parse(savedBlocks);
    } catch {}
  } else if (profileId === 'profile-leo') {
    // Migrate legacy shared world blocks to Leo
    const legacy = localStorage.getItem('movers_world_blocks');
    if (legacy) {
      try {
        blocks = JSON.parse(legacy);
        localStorage.setItem(`movers_world_blocks_${profileId}`, legacy);
      } catch {}
    }
  }

  // 6. Weather Quest
  let wQuest: WeatherQuest | null = null;
  const savedQuest = localStorage.getItem(`movers_weather_quest_${profileId}`);
  if (savedQuest) {
    try {
      wQuest = JSON.parse(savedQuest);
    } catch {}
  } else {
    wQuest = generateWeatherQuest('clear');
  }

  // 7. Achievements
  const achState = loadAchievementsState(profileId);

  // 8. Daily Challenges
  const dData = loadStoredDailyChallenges(profileId);
  const grandChest = localStorage.getItem(`movers_grand_chest_${profileId}_${dData.date}`) === 'true';

  return {
    character: char,
    inventory: inv,
    stats: st,
    hotbar,
    worldBlocks: blocks,
    weatherQuest: wQuest,
    achievementsState: achState,
    dailyData: dData,
    grandChestClaimed: grandChest,
  };
}

export default function App() {
  // Navigation: Startup page or 3D Game World
  const [inGame, setInGame] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    try {
      const savedProfiles = localStorage.getItem('movers_all_profiles');
      if (savedProfiles) {
        const list = JSON.parse(savedProfiles);
        if (Array.isArray(list) && list[0]?.id) return list[0].id;
      }
    } catch {}
    return 'profile-leo';
  });

  const initialData = useMemo(() => loadProfileData(currentProfileId), []);

  // Character state
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>(initialData.character);

  // Hotbar & Active block
  const [hotbarSlots, setHotbarSlots] = useState<BlockType[]>(initialData.hotbar);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // Inventory
  const [inventory, setInventory] = useState<Record<string, number>>(initialData.inventory);

  // Player Stats
  const [stats, setStats] = useState<PlayerStats>(initialData.stats);

  // Environment & Building state
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [buildMode, setBuildMode] = useState<'place' | 'mine'>('place');
  const [digTrigger, setDigTrigger] = useState(0);
  const handleDig = useCallback(() => {
    setDigTrigger((v) => v + 1);
  }, []);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [activeWeatherQuest, setActiveWeatherQuest] = useState<WeatherQuest | null>(initialData.weatherQuest);

  // Dynamic periodic weather cycle (every 3.5 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      setWeather((prevWeather) => {
        const next: WeatherType = prevWeather === 'clear' ? 'rain' : prevWeather === 'rain' ? 'snow' : 'clear';
        soundFx.playWeatherChange(next);
        setActiveWeatherQuest((current) => {
          if (!current || current.completed || current.claimed || current.weather !== next) {
            const fresh = generateWeatherQuest(next);
            try {
              localStorage.setItem(`movers_weather_quest_${currentProfileId}`, JSON.stringify(fresh));
            } catch {}
            return fresh;
          }
          return current;
        });
        return next;
      });
    }, 210000);
    return () => clearInterval(timer);
  }, [currentProfileId]);

  // Persist weather quest
  useEffect(() => {
    if (activeWeatherQuest) {
      try {
        localStorage.setItem(`movers_weather_quest_${currentProfileId}`, JSON.stringify(activeWeatherQuest));
      } catch {}
    }
  }, [activeWeatherQuest, currentProfileId]);

  // Music state inside HUD
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.45);
  const [trackName, setTrackName] = useState('Peaceful Voxel Melody');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  // Daily Challenges State
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(initialData.dailyData.challenges);
  const [challengeDate, setChallengeDate] = useState<string>(initialData.dailyData.date);
  const [grandChestClaimed, setGrandChestClaimed] = useState<boolean>(initialData.grandChestClaimed);
  const [isDailyChallengesOpen, setIsDailyChallengesOpen] = useState(false);
  const [activeToastChallenge, setActiveToastChallenge] = useState<DailyChallenge | null>(null);

  // Long-Term Milestone Achievements State
  const [achievementsState, setAchievementsState] = useState<Record<string, AchievementStoredState>>(
    initialData.achievementsState
  );
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [activeAchievementToast, setActiveAchievementToast] = useState<Achievement | null>(null);

  const achievements = useMemo(
    () => computeAchievements(stats, inventory, achievementsState),
    [stats, inventory, achievementsState]
  );

  // Modals
  const [isExamStationOpen, setIsExamStationOpen] = useState(false);
  const [examStationPart, setExamStationPart] = useState<MoversPart>('rw_part1');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isBlueprintShopOpen, setIsBlueprintShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isTeacherDeskOpen, setIsTeacherDeskOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Camera view mode (1st person, 3rd person, or aerial overview)
  const [cameraView, setCameraView] = useState<CameraView>('thirdPerson');

  // Toggle directly between First Person (character hidden) and Third Person (character visible)
  const handleToggleCamera = useCallback(() => {
    soundFx.playClick();
    setCameraView((prev) => (prev === 'firstPerson' ? 'thirdPerson' : 'firstPerson'));
  }, []);

  const handleToggleOrbit = useCallback(() => {
    soundFx.playClick();
    setCameraView((prev) => (prev === 'orbit' ? 'thirdPerson' : 'orbit'));
  }, []);

  // Persistent world blocks strictly isolated per profile
  const [worldBlocks, setWorldBlocks] = useState<VoxelBlock[]>(initialData.worldBlocks);

  const handleWorldUpdated = useCallback((blocks: VoxelBlock[]) => {
    setWorldBlocks(blocks);
    try {
      localStorage.setItem(`movers_world_blocks_${currentProfileId}`, JSON.stringify(blocks));
    } catch {}
  }, [currentProfileId]);

  // Pending blueprint to place into 3D world
  const [pendingBlueprint, setPendingBlueprint] = useState<{ name: string; blocks: VoxelBlock[] } | null>(null);

  useEffect(() => {
    if (pendingBlueprint) {
      const timer = setTimeout(() => setPendingBlueprint(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [pendingBlueprint]);

  // Check date on interval to ensure daily challenges auto-refresh after midnight
  useEffect(() => {
    const checkDate = () => {
      const today = getTodayDateString();
      if (today !== challengeDate) {
        const fresh = loadStoredDailyChallenges(currentProfileId);
        setDailyChallenges(fresh.challenges);
        setChallengeDate(fresh.date);
        setGrandChestClaimed(
          localStorage.getItem(`movers_grand_chest_${currentProfileId}_${fresh.date}`) === 'true'
        );
      }
    };
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, [challengeDate, currentProfileId]);

  // Subscribe to BGM changes
  useEffect(() => {
    const unsub = relaxingBgm.subscribe(() => {
      setBgmPlaying(relaxingBgm.getIsPlaying());
      setBgmVolume(relaxingBgm.getVolume());
      setTrackName(relaxingBgm.getCurrentTrackName());
    });
    return unsub;
  }, []);

  // Persist state & sync to profile
  useEffect(() => {
    try {
      localStorage.setItem(`movers_character_${currentProfileId}`, JSON.stringify(characterConfig));
    } catch {}
  }, [characterConfig, currentProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem(`movers_inventory_${currentProfileId}`, JSON.stringify(inventory));
    } catch {}
  }, [inventory, currentProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem(`movers_hotbar_${currentProfileId}`, JSON.stringify(hotbarSlots));
    } catch {}
  }, [hotbarSlots, currentProfileId]);

  useEffect(() => {
    try {
      localStorage.setItem(`movers_stats_${currentProfileId}`, JSON.stringify(stats));

      // Update the profile in the profiles list
      const savedProfiles = localStorage.getItem('movers_all_profiles');
      if (savedProfiles) {
        const list: UserProfile[] = JSON.parse(savedProfiles);
        const idx = list.findIndex((p) => p.id === currentProfileId);
        if (idx !== -1) {
          list[idx].stats = stats;
          list[idx].character = characterConfig;
          list[idx].lastPlayed = 'Today';
          localStorage.setItem('movers_all_profiles', JSON.stringify(list));
        }
      }
    } catch {}
  }, [stats, characterConfig, currentProfileId]);

  // Handle profile selection preview in StartupPage
  const handleSelectProfile = useCallback((profile: UserProfile) => {
    setCurrentProfileId(profile.id);
    const data = loadProfileData(profile.id, profile);
    setCharacterConfig(data.character);
    setInventory(data.inventory);
    setStats(data.stats);
    setHotbarSlots(data.hotbar);
    setActiveSlotIndex(0);
    setWorldBlocks(data.worldBlocks);
    setActiveWeatherQuest(data.weatherQuest);
    setAchievementsState(data.achievementsState);
    setDailyChallenges(data.dailyData.challenges);
    setChallengeDate(data.dailyData.date);
    setGrandChestClaimed(data.grandChestClaimed);
  }, []);

  // Handle start game from profile selection
  const handleStartGame = useCallback((profile: UserProfile) => {
    handleSelectProfile(profile);
    setInGame(true);
  }, [handleSelectProfile]);

  // Keyboard shortcuts: [B] badges, [X]/[F] Digs, [C]/[V] toggles 1st/3rd Person, [O] Orbit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'KeyB') {
        soundFx.playClick();
        setIsAchievementsOpen((prev) => !prev);
      }
      if (e.code === 'KeyX' || e.code === 'KeyF') {
        handleDig();
      }
      if (e.code === 'KeyC' || e.code === 'KeyV') {
        handleToggleCamera();
      }
      if (e.code === 'KeyO') {
        handleToggleOrbit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDig, handleToggleCamera, handleToggleOrbit]);

  // Check achievements after stats or inventory changes
  useEffect(() => {
    const { newlyUnlocked, updatedState } = checkAndUnlockAchievements(
      stats,
      inventory,
      achievementsState,
      currentProfileId
    );
    if (newlyUnlocked.length > 0) {
      setAchievementsState(updatedState);
      saveAchievementsState(updatedState, currentProfileId);
      setActiveAchievementToast(newlyUnlocked[0]);
    }
  }, [stats, inventory, achievementsState, currentProfileId]);

  // Claim Individual Achievement Reward
  const handleClaimAchievementReward = useCallback(
    (achievementId: string) => {
      const a = achievements.find((item) => item.id === achievementId);
      if (!a || !a.completed || a.claimed) return;

      if (a.reward.blockType && a.reward.blockCount) {
        setInventory((prev) => ({
          ...prev,
          [a.reward.blockType!]: (prev[a.reward.blockType!] || 0) + a.reward.blockCount!,
        }));
      }

      setStats((prev) => {
        const newXp = (prev.xp || 0) + a.reward.xp;
        const newScore = prev.score + a.reward.xp;
        const newLevel = Math.max(prev.level, Math.floor(newScore / 250) + 1);
        if (newLevel > prev.level) {
          soundFx.playLevelUp();
        }
        return {
          ...prev,
          xp: newXp,
          score: newScore,
          level: newLevel,
        };
      });

      setAchievementsState((prev) => {
        const next = {
          ...prev,
          [achievementId]: {
            ...prev[achievementId],
            claimed: true,
          },
        };
        saveAchievementsState(next, currentProfileId);
        return next;
      });
    },
    [achievements, currentProfileId]
  );

  // Claim All Ready Achievement Rewards
  const handleClaimAllAchievementRewards = useCallback(() => {
    const claimable = achievements.filter((a) => a.completed && !a.claimed);
    if (claimable.length === 0) return;

    let totalXp = 0;
    const blockGains: Record<string, number> = {};

    claimable.forEach((a) => {
      totalXp += a.reward.xp;
      if (a.reward.blockType && a.reward.blockCount) {
        blockGains[a.reward.blockType] = (blockGains[a.reward.blockType] || 0) + a.reward.blockCount;
      }
    });

    setInventory((prev) => {
      const next = { ...prev };
      Object.entries(blockGains).forEach(([type, count]) => {
        next[type] = (next[type] || 0) + count;
      });
      return next;
    });

    setStats((prev) => {
      const newXp = (prev.xp || 0) + totalXp;
      const newScore = prev.score + totalXp;
      const newLevel = Math.max(prev.level, Math.floor(newScore / 250) + 1);
      if (newLevel > prev.level) {
        soundFx.playLevelUp();
      }
      return {
        ...prev,
        xp: newXp,
        score: newScore,
        level: newLevel,
      };
    });

    setAchievementsState((prev) => {
      const next = { ...prev };
      claimable.forEach((a) => {
        next[a.id] = {
          ...next[a.id],
          claimed: true,
        };
      });
      saveAchievementsState(next, currentProfileId);
      return next;
    });
  }, [achievements, currentProfileId]);

  // Helper to increment daily challenge progress
  const updateChallengeProgress = useCallback(
    (predicate: (c: DailyChallenge) => boolean, increment: number = 1) => {
      setDailyChallenges((prev) => {
        let completedJustNow: DailyChallenge | null = null;

        const next = prev.map((c) => {
          if (predicate(c) && !c.completed) {
            const newProgress = Math.min(c.targetCount, c.currentProgress + increment);
            const isCompleted = newProgress >= c.targetCount;
            if (isCompleted && !c.completed) {
              completedJustNow = { ...c, currentProgress: newProgress, completed: true };
            }
            return {
              ...c,
              currentProgress: newProgress,
              completed: isCompleted,
            };
          }
          return c;
        });

        if (completedJustNow) {
          setActiveToastChallenge(completedJustNow);
        }

        saveStoredDailyChallenges(next, challengeDate, currentProfileId);
        return next;
      });
    },
    [challengeDate, currentProfileId]
  );

  // Block placement / consumption handler
  const handleConsumeBlock = useCallback(
    (type: BlockType): boolean => {
      const current = inventory[type] || 0;
      if (current <= 0) return false;

      setInventory((prev) => ({
        ...prev,
        [type]: prev[type] - 1,
      }));
      setStats((prev) => ({
        ...prev,
        blocksPlaced: prev.blocksPlaced + 1,
        lanternsPlaced: type === 'lantern' ? (prev.lanternsPlaced || 0) + 1 : (prev.lanternsPlaced || 0),
      }));

      // Update Daily Challenges for placing blocks (any block, wood, stone)
      updateChallengeProgress(
        (c) =>
          c.type === 'place_any' ||
          (c.type === 'place_wood' && type === 'wood') ||
          (c.type === 'place_stone' && type === 'stone')
      );

      // Update Weather Quest for placing blocks
      setActiveWeatherQuest((prev) => {
        if (!prev || prev.completed || prev.claimed) return prev;
        if (matchesBlockCondition(prev.condition, type)) {
          const nextProgress = prev.currentProgress + 1;
          const isDone = nextProgress >= prev.targetCount;
          if (isDone) {
            soundFx.playCelebration();
          }
          return {
            ...prev,
            currentProgress: Math.min(prev.targetCount, nextProgress),
            completed: isDone,
          };
        }
        return prev;
      });

      return true;
    },
    [inventory, updateChallengeProgress]
  );

  // Block add handler (from mining or rewards)
  const handleAddBlock = useCallback(
    (type: BlockType, count: number) => {
      setInventory((prev) => ({
        ...prev,
        [type]: (prev[type] || 0) + count,
      }));
      setStats((prev) => ({
        ...prev,
        blocksMined: (prev.blocksMined || 0) + count,
      }));

      // Update Daily Challenges for mining
      updateChallengeProgress((c) => c.type === 'mine_blocks', count);
    },
    [updateChallengeProgress]
  );

  // Reward from Exam Station
  const handleRewardBlocks = useCallback((type: BlockType, count: number) => {
    soundFx.playCollectResource();
    setInventory((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + count,
    }));
    setStats((prev) => ({
      ...prev,
      score: prev.score + count * 10,
    }));
  }, []);

  // Progress question stats & Cambridge Shields
  const handleQuestionCompleted = useCallback(
    (category: 'readingWriting' | 'listening' | 'speaking', specificPart?: MoversPart) => {
      setStats((prev) => {
        const newTotal = prev.questionsAnswered + 1;
        const newLevel = Math.max(prev.level, Math.floor(newTotal / 5) + 1);

        // Increment shield every 3 or 4 questions up to 5 max
        const currentShields = { ...prev.cambridgeShields };
        if (category === 'readingWriting' && currentShields.readingWriting < 5) {
          if (newTotal % 3 === 0) currentShields.readingWriting += 1;
        } else if (category === 'listening' && currentShields.listening < 5) {
          if (newTotal % 2 === 0) currentShields.listening += 1;
        } else if (category === 'speaking' && currentShields.speaking < 5) {
          if (newTotal % 2 === 0) currentShields.speaking += 1;
        }

        const parts = new Set(prev.completedExamParts || []);
        if (specificPart) {
          parts.add(specificPart);
        }

        return {
          ...prev,
          questionsAnswered: newTotal,
          level: newLevel,
          cambridgeShields: currentShields,
          completedExamParts: Array.from(parts),
        };
      });

      // Update Daily Challenges according to exam category
      if (category === 'speaking') {
        updateChallengeProgress((c) => c.type === 'complete_speaking', 1);
      } else if (category === 'readingWriting') {
        updateChallengeProgress((c) => c.type === 'complete_reading', 1);
      } else if (category === 'listening') {
        updateChallengeProgress((c) => c.type === 'complete_listening', 1);
      }

      // Update Weather Quest according to exam category
      setActiveWeatherQuest((prev) => {
        if (!prev || prev.completed || prev.claimed) return prev;
        const matchesCondition =
          (category === 'speaking' && prev.condition === 'complete_speaking') ||
          (category === 'readingWriting' && prev.condition === 'complete_reading') ||
          (category === 'listening' && prev.condition === 'complete_listening');

        if (matchesCondition) {
          const nextProgress = prev.currentProgress + 1;
          const isDone = nextProgress >= prev.targetCount;
          if (isDone) {
            soundFx.playCelebration();
          }
          return {
            ...prev,
            currentProgress: Math.min(prev.targetCount, nextProgress),
            completed: isDone,
          };
        }
        return prev;
      });
    },
    [updateChallengeProgress]
  );

  // Weather toggle handler
  const handleToggleWeather = useCallback(() => {
    setWeather((prevWeather) => {
      const next: WeatherType = prevWeather === 'clear' ? 'rain' : prevWeather === 'rain' ? 'snow' : 'clear';
      soundFx.playWeatherChange(next);
      setActiveWeatherQuest((current) => {
        if (!current || current.completed || current.claimed || current.weather !== next) {
          const fresh = generateWeatherQuest(next);
          try {
            localStorage.setItem(`movers_weather_quest_${currentProfileId}`, JSON.stringify(fresh));
          } catch {}
          return fresh;
        }
        return current;
      });
      return next;
    });
  }, [currentProfileId]);

  // Claim Weather Quest Reward
  const handleClaimWeatherReward = useCallback(
    (quest: WeatherQuest) => {
      soundFx.playCelebration();
      // Add reward blocks
      setInventory((prev) => ({
        ...prev,
        [quest.reward.blockType]: (prev[quest.reward.blockType] || 0) + quest.reward.blockCount,
      }));
      // Add XP & score
      setStats((prev) => ({
        ...prev,
        xp: (prev.xp || 0) + quest.reward.xp,
        score: prev.score + quest.reward.xp,
        weatherQuestsCompleted: (prev.weatherQuestsCompleted || 0) + 1,
      }));
      // Generate next quest for current weather
      const nextQuest = generateWeatherQuest(weather, quest.id);
      setActiveWeatherQuest(nextQuest);
      try {
        localStorage.setItem(`movers_weather_quest_${currentProfileId}`, JSON.stringify(nextQuest));
      } catch {}
    },
    [weather, currentProfileId]
  );

  // Build Blueprint schematic
  const handleBuildBlueprint = useCallback(
    (bp: typeof BLUEPRINTS[0]) => {
      // Deduct resources
      setInventory((prev) => {
        const updated = { ...prev };
        bp.requiredResources.forEach((req) => {
          updated[req.type] = Math.max(0, (updated[req.type] || 0) - req.count);
        });
        return updated;
      });

      // Generate schematic blocks near island garden/center
      const ox = 2;
      const oy = 2;
      const oz = -2;
      const blueprintBlocks = bp.blocksTemplate(ox, oy, oz);

      setStats((prev) => ({
        ...prev,
        score: prev.score + 50,
        blocksPlaced: prev.blocksPlaced + blueprintBlocks.length,
        blueprintsBuilt: (prev.blueprintsBuilt || 0) + 1,
      }));

      // Queue blueprint blocks to place into 3D scene
      setPendingBlueprint({ name: bp.name, blocks: blueprintBlocks });

      // Update Daily Challenges for Blueprint construction
      updateChallengeProgress((c) => c.type === 'build_blueprint', 1);

      setIsBlueprintShopOpen(false);
    },
    [updateChallengeProgress]
  );

  // Claim Individual Daily Challenge Reward
  const handleClaimDailyReward = useCallback(
    (challengeId: string) => {
      const challenge = dailyChallenges.find((c) => c.id === challengeId);
      if (!challenge || !challenge.completed || challenge.claimed) return;

      // Add resource blocks
      setInventory((prev) => ({
        ...prev,
        [challenge.reward.blockType]: (prev[challenge.reward.blockType] || 0) + challenge.reward.blockCount,
      }));

      // Add XP and Score
      setStats((prev) => {
        const newXp = (prev.xp || 0) + challenge.reward.xp;
        const newScore = prev.score + challenge.reward.xp;
        const newLevel = Math.max(prev.level, Math.floor(newScore / 250) + 1);

        if (newLevel > prev.level) {
          soundFx.playLevelUp();
        }

        return {
          ...prev,
          xp: newXp,
          score: newScore,
          level: newLevel,
        };
      });

      // Update challenge state
      setDailyChallenges((prev) => {
        const next = prev.map((c) => (c.id === challengeId ? { ...c, claimed: true } : c));
        saveStoredDailyChallenges(next, challengeDate, currentProfileId);
        return next;
      });
    },
    [dailyChallenges, challengeDate, currentProfileId]
  );

  // Claim Grand Daily Completion Chest (+10 Diamonds + 500 XP)
  const handleClaimGrandChest = useCallback(() => {
    if (grandChestClaimed) return;

    setInventory((prev) => ({
      ...prev,
      diamond: (prev['diamond'] || 0) + 10,
    }));

    setStats((prev) => {
      const newXp = (prev.xp || 0) + 500;
      const newScore = prev.score + 500;
      const newLevel = Math.max(prev.level, Math.floor(newScore / 250) + 1);
      return {
        ...prev,
        xp: newXp,
        score: newScore,
        level: newLevel,
      };
    });

    setGrandChestClaimed(true);
    try {
      localStorage.setItem(`movers_grand_chest_${currentProfileId}_${challengeDate}`, 'true');
    } catch {}
  }, [grandChestClaimed, challengeDate, currentProfileId]);

  // Reroll Daily Challenges
  const handleRerollChallenges = useCallback(() => {
    const fresh = generateDailyChallenges(challengeDate + '_' + Date.now());
    setDailyChallenges(fresh);
    saveStoredDailyChallenges(fresh, challengeDate, currentProfileId);
    setGrandChestClaimed(false);
    try {
      localStorage.removeItem(`movers_grand_chest_${currentProfileId}_${challengeDate}`);
    } catch {}
    soundFx.playCollectResource();
  }, [challengeDate, currentProfileId]);

  // Reset World Island (strictly resets only current profile's world)
  const handleResetWorld = useCallback(() => {
    try {
      localStorage.removeItem(`movers_world_blocks_${currentProfileId}`);
    } catch {}
    setWorldBlocks([]);
    soundFx.playCelebration();
  }, [currentProfileId]);

  // Lyria AI Music generation handler
  const handleGenerateLyria = async () => {
    try {
      setIsGeneratingMusic(true);
      soundFx.playClick();
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:
            'Relaxing peaceful ambient music, soft piano and warm marimba notes for children exploring a cozy Minecraft world',
        }),
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      if (data.audioBase64) {
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
        const url = URL.createObjectURL(blob);
        relaxingBgm.playAiTrack(url, 'Lyria AI: Cozy Island Lullaby');
      }
    } catch {
      relaxingBgm.playProceduralTune();
      relaxingBgm.start();
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // If not in game, show the Startup Page with profile selection!
  if (!inGame) {
    const claimableBadgesCount = achievements.filter((a) => a.completed && !a.claimed).length;
    const unlockedBadgesCount = achievements.filter((a) => a.completed).length;

    return (
      <>
        <StartupPage
          onStartGame={handleStartGame}
          selectedProfileId={currentProfileId}
          onSelectProfile={handleSelectProfile}
          dailyChallenges={dailyChallenges}
          onOpenChallenges={() => setIsDailyChallengesOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          achievementsCount={{
            unlocked: unlockedBadgesCount,
            total: achievements.length,
            claimable: claimableBadgesCount,
          }}
        />
        {isDailyChallengesOpen && (
          <DailyChallengesModal
            challenges={dailyChallenges}
            onClaimReward={handleClaimDailyReward}
            onClaimGrandChest={handleClaimGrandChest}
            grandChestClaimed={grandChestClaimed}
            onGoToPart={(part) => {
              setExamStationPart(part);
              setIsDailyChallengesOpen(false);
              setInGame(true);
              setIsExamStationOpen(true);
            }}
            onSelectBlock={(type) => {
              setHotbarSlots((prev) => {
                const copy = [...prev];
                copy[activeSlotIndex] = type;
                return copy;
              });
              setIsDailyChallengesOpen(false);
              setInGame(true);
            }}
            onRerollChallenges={handleRerollChallenges}
            onClose={() => setIsDailyChallengesOpen(false)}
            dateStr={challengeDate}
          />
        )}
        {isAchievementsOpen && (
          <AchievementsModal
            achievements={achievements}
            onClaimReward={handleClaimAchievementReward}
            onClaimAllRewards={handleClaimAllAchievementRewards}
            onGoToExamPart={(part) => {
              setExamStationPart(part);
              setIsAchievementsOpen(false);
              setInGame(true);
              setIsExamStationOpen(true);
            }}
            onOpenBlueprints={() => {
              setIsAchievementsOpen(false);
              setInGame(true);
              setIsBlueprintShopOpen(true);
            }}
            onOpenWeather={() => {
              setIsAchievementsOpen(false);
              setInGame(true);
              handleToggleWeather();
            }}
            onClose={() => setIsAchievementsOpen(false)}
          />
        )}
      </>
    );
  }

  const activeBlockType = hotbarSlots[activeSlotIndex];
  const completedQuests = dailyChallenges.filter((c) => c.completed).length;
  const claimableCount =
    dailyChallenges.filter((c) => c.completed && !c.claimed).length +
    (dailyChallenges.length > 0 && dailyChallenges.every((c) => c.completed) && !grandChestClaimed ? 1 : 0);
  const claimableBadgesCount = achievements.filter((a) => a.completed && !a.claimed).length;
  const unlockedBadgesCount = achievements.filter((a) => a.completed).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D Voxel Engine Viewport with key={currentProfileId} for pure world isolation */}
      <VoxelWorld3D
        key={currentProfileId}
        characterConfig={characterConfig}
        activeBlockType={activeBlockType}
        inventory={inventory}
        onConsumeBlock={handleConsumeBlock}
        onAddBlock={handleAddBlock}
        onOpenExamStation={() => {
          soundFx.playClick();
          setIsExamStationOpen(true);
        }}
        timeOfDay={timeOfDay}
        onToggleTimeOfDay={() => {
          soundFx.playClick();
          setTimeOfDay((t) => (t === 'day' ? 'sunset' : t === 'sunset' ? 'night' : 'day'));
        }}
        buildMode={buildMode}
        onToggleBuildMode={(mode) => {
          soundFx.playClick();
          setBuildMode(mode);
        }}
        initialBlocks={worldBlocks}
        onWorldUpdated={handleWorldUpdated}
        weather={weather}
        onToggleWeather={handleToggleWeather}
        blueprintToBuild={pendingBlueprint}
        cameraView={cameraView}
        onToggleCameraView={handleToggleCamera}
        digTrigger={digTrigger}
      />

      {/* Top Left Profile & Dynamic Weather Quest Area */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setInGame(false);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-2xl border border-white/10 text-slate-300 hover:text-white text-xs font-bold shadow-xl transition-all"
            title="Return to Profiles & Switch Explorer"
          >
            <LogOut className="w-3.5 h-3.5 rotate-180 text-amber-400" />
            <span className="hidden sm:inline">Switch Profile</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-white/10 text-white text-xs font-bold shadow-xl">
            <span className="text-base">{characterConfig.gender === 'boy' ? '👦' : '👧'}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span>{characterConfig.name}</span>
                <span className="text-amber-300 text-[10px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                  Lvl {stats.level}
                </span>
              </div>
              <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1 leading-none mt-0.5">
                <span>🔒</span>
                <span>{characterConfig.name}&apos;s Private World</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Weather & Weather Quest Card */}
        <WeatherQuestWidget
          weather={weather}
          onToggleWeather={handleToggleWeather}
          quest={activeWeatherQuest}
          onClaimReward={handleClaimWeatherReward}
          onGoToPart={(part) => {
            setExamStationPart(part as MoversPart);
            setIsExamStationOpen(true);
          }}
          onSelectBlock={(type) => {
            setHotbarSlots((prev) => {
              const copy = [...prev];
              copy[activeSlotIndex] = type as BlockType;
              return copy;
            });
          }}
        />
      </div>

      {/* Top Center: Cambridge Exam Station Callout & Relaxing Music Player Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 pointer-events-auto">
        {/* Cambridge Exam Station Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsExamStationOpen(true);
          }}
          className="group flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/25 border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all text-xs"
          title="Cambridge Exam Station (Key E)"
        >
          <span className="text-base animate-bounce">📜</span>
          <span className="tracking-wide uppercase font-extrabold hidden md:inline">Exam Station</span>
          <span className="px-1.5 py-0.5 bg-slate-950 text-amber-300 rounded text-[10px] font-mono">
            [E]
          </span>
        </button>

        {/* Music Player Bar */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-xl">
          <button
            onClick={() => {
              soundFx.playClick();
              relaxingBgm.toggle();
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              bgmPlaying
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={bgmPlaying ? 'Pause Relaxing Music' : 'Play Relaxing Music'}
          >
            {bgmPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">Relaxing BGM</span>
            <span className="text-[11px] font-bold text-slate-200 truncate max-w-[110px]">{trackName}</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bgmVolume}
            onChange={(e) => relaxingBgm.setVolume(parseFloat(e.target.value))}
            className="w-12 accent-amber-400 cursor-pointer hidden xl:block"
            title="Music Volume"
          />

          <button
            onClick={handleGenerateLyria}
            disabled={isGeneratingMusic}
            className="px-2 py-1 bg-indigo-600/70 hover:bg-indigo-600 text-indigo-100 rounded-lg text-[10px] font-bold border border-indigo-400/30 flex items-center gap-1 transition-all disabled:opacity-50"
            title="Generate fresh AI melody with Lyria"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">{isGeneratingMusic ? '...' : 'Lyria'}</span>
          </button>
        </div>
      </div>

      {/* Top Right Quick HUD */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        {/* Camera View Mode & Character Visibility Toggle */}
        <button
          onClick={handleToggleCamera}
          className={`px-3 py-2 backdrop-blur-md rounded-2xl border text-xs font-bold shadow-xl transition-all flex items-center gap-1.5 ${
            cameraView === 'firstPerson'
              ? 'bg-emerald-600/90 hover:bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/40'
              : 'bg-slate-900/85 hover:bg-slate-800 border-white/10 text-slate-200'
          }`}
          title={`Click to ${
            cameraView === 'firstPerson'
              ? 'Show Character & enter 3rd-Person View'
              : 'Hide Character & enter 1st-Person View'
          } [C / V]`}
        >
          <span className="text-sm">
            {cameraView === 'firstPerson' ? '👁️' : '👤'}
          </span>
          <span className="text-[11px] font-extrabold">
            {cameraView === 'firstPerson' ? '1st Person' : '3rd Person'}
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-black hidden sm:inline ${
              cameraView === 'firstPerson'
                ? 'bg-slate-950/80 text-emerald-300 border border-emerald-400/40'
                : 'bg-indigo-950/80 text-indigo-300 border border-indigo-400/40'
            }`}
          >
            {cameraView === 'firstPerson' ? 'Hero Hidden' : 'Hero Shown'}
          </span>
          <span className="px-1 py-0.5 bg-slate-950/80 text-amber-300 rounded text-[9px] font-mono hidden md:inline">
            [C]
          </span>
        </button>

        {/* Orbit View Toggle */}
        <button
          onClick={handleToggleOrbit}
          className={`px-2.5 py-2 backdrop-blur-md rounded-2xl border text-xs font-bold shadow-xl transition-all flex items-center gap-1 ${
            cameraView === 'orbit'
              ? 'bg-indigo-600/90 hover:bg-indigo-500 border-indigo-400 text-white ring-2 ring-indigo-400/40'
              : 'bg-slate-900/85 hover:bg-slate-800 border-white/10 text-slate-300'
          }`}
          title="Toggle Aerial Orbit View of Island [O]"
        >
          <span>🛰️</span>
          <span className="hidden xl:inline text-[11px]">Orbit</span>
        </button>

        {/* Time of Day Toggle */}
        <button
          onClick={() => {
            soundFx.playClick();
            setTimeOfDay((t) => (t === 'day' ? 'sunset' : t === 'sunset' ? 'night' : 'day'));
          }}
          className="px-3 py-2 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-2xl border border-white/10 text-slate-200 text-xs font-bold shadow-xl transition-all flex items-center gap-1.5"
          title="Toggle Time of Day: Day / Sunset / Night [T]"
        >
          <span>{timeOfDay === 'day' ? '☀️' : timeOfDay === 'sunset' ? '🌅' : '🌙'}</span>
          <span className="hidden xl:inline text-[11px] capitalize">{timeOfDay}</span>
        </button>

        {/* Achievements / Badges Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsAchievementsOpen(true);
          }}
          className={`group flex items-center gap-2 px-3 py-2 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-2xl border text-xs font-black shadow-xl transition-all ${
            claimableBadgesCount > 0
              ? 'border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
              : 'border-amber-500/30 text-amber-300'
          }`}
          title="Milestone Achievements & Unlockable Badges [B]"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Badges</span>
          {claimableBadgesCount > 0 ? (
            <span className="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse shadow-md">
              {claimableBadgesCount} Claim!
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {unlockedBadgesCount}/{achievements.length}
            </span>
          )}
        </button>

        {/* Daily Challenges Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsDailyChallengesOpen(true);
          }}
          className={`group flex items-center gap-2 px-3 py-2 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-2xl border text-xs font-black shadow-xl transition-all ${
            claimableCount > 0
              ? 'border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
              : 'border-amber-500/30 text-amber-300'
          }`}
          title="Daily Challenges & Quests"
        >
          <span className="text-base">🎯</span>
          <span className="hidden sm:inline">Quests</span>
          {claimableCount > 0 ? (
            <span className="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse shadow-md">
              {claimableCount} Claim!
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {completedQuests}/{dailyChallenges.length}
            </span>
          )}
        </button>

        {/* Cambridge Shields Widget */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsTeacherDeskOpen(true);
          }}
          className="group flex items-center gap-2 px-3.5 py-2 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-2xl border border-amber-500/30 text-amber-300 text-xs font-black shadow-xl transition-all"
          title="Cambridge Shields & Learning Stats"
        >
          <span className="text-base">🛡️</span>
          <span>
            {stats.cambridgeShields.readingWriting +
              stats.cambridgeShields.listening +
              stats.cambridgeShields.speaking}
            /15 Shields
          </span>
        </button>

        {/* Character Customizer Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsCustomizerOpen(true);
          }}
          className="p-2.5 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl transition-all"
          title="Change Character (Boy / Girl, Outfits)"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Teacher Desk & Rules */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsTeacherDeskOpen(true);
          }}
          className="p-2.5 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-2xl border border-white/10 text-indigo-300 shadow-xl transition-all"
          title="Teacher's Desk & Grammar Reference"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Controls Help */}
        <button
          onClick={() => {
            soundFx.playClick();
            setIsHelpOpen(true);
          }}
          className="p-2.5 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md rounded-2xl border border-white/10 text-slate-300 shadow-xl transition-all"
          title="How to Play & Controls"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Minecraft-style Hotbar (Slots 1-9) */}
      <InventoryHotbar
        hotbarSlots={hotbarSlots}
        activeSlotIndex={activeSlotIndex}
        onSelectSlot={setActiveSlotIndex}
        inventory={inventory}
        onOpenInventory={() => {
          soundFx.playClick();
          setIsInventoryOpen(true);
        }}
        onOpenBlueprints={() => {
          soundFx.playClick();
          setIsBlueprintShopOpen(true);
        }}
        buildMode={buildMode}
        onToggleBuildMode={setBuildMode}
        onDig={handleDig}
      />

      {/* MODAL: Cambridge Exam Station */}
      {isExamStationOpen && (
        <ExamStation
          initialPart={examStationPart}
          onClose={() => setIsExamStationOpen(false)}
          onRewardBlocks={handleRewardBlocks}
          onQuestionCompleted={handleQuestionCompleted}
        />
      )}

      {/* MODAL: Character Customizer */}
      {isCustomizerOpen && (
        <CharacterCustomizer
          config={characterConfig}
          onChangeConfig={setCharacterConfig}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}

      {/* MODAL: Blueprint Schematics Workshop */}
      {isBlueprintShopOpen && (
        <BlueprintShop
          inventory={inventory}
          onBuildBlueprint={handleBuildBlueprint}
          onOpenExamPart={(part) => {
            setExamStationPart(part as MoversPart);
            setIsExamStationOpen(true);
          }}
          onClose={() => setIsBlueprintShopOpen(false)}
        />
      )}

      {/* MODAL: Backpack / All Inventory */}
      {isInventoryOpen && (
        <InventoryModal
          inventory={inventory}
          activeBlock={activeBlockType}
          onSelectActiveBlock={(type) => {
            setHotbarSlots((prev) => {
              const copy = [...prev];
              copy[activeSlotIndex] = type;
              return copy;
            });
            setIsInventoryOpen(false);
          }}
          onClose={() => setIsInventoryOpen(false)}
        />
      )}

      {/* MODAL: Daily Challenges */}
      {isDailyChallengesOpen && (
        <DailyChallengesModal
          challenges={dailyChallenges}
          onClaimReward={handleClaimDailyReward}
          onClaimGrandChest={handleClaimGrandChest}
          grandChestClaimed={grandChestClaimed}
          onGoToPart={(part) => {
            setExamStationPart(part);
            setIsExamStationOpen(true);
          }}
          onSelectBlock={(type) => {
            setHotbarSlots((prev) => {
              const copy = [...prev];
              copy[activeSlotIndex] = type;
              return copy;
            });
          }}
          onRerollChallenges={handleRerollChallenges}
          onClose={() => setIsDailyChallengesOpen(false)}
          dateStr={challengeDate}
        />
      )}

      {/* Notification Toast for newly completed challenge */}
      {activeToastChallenge && (
        <ChallengeToast
          challenge={activeToastChallenge}
          onOpenChallenges={() => setIsDailyChallengesOpen(true)}
          onClose={() => setActiveToastChallenge(null)}
        />
      )}

      {/* Notification Toast for newly unlocked achievement milestone */}
      {activeAchievementToast && (
        <AchievementToast
          achievement={activeAchievementToast}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
          onClose={() => setActiveAchievementToast(null)}
        />
      )}

      {/* MODAL: Achievements & Milestones Badges */}
      {isAchievementsOpen && (
        <AchievementsModal
          achievements={achievements}
          onClaimReward={handleClaimAchievementReward}
          onClaimAllRewards={handleClaimAllAchievementRewards}
          onGoToExamPart={(part) => {
            setExamStationPart(part);
            setIsAchievementsOpen(false);
            setIsExamStationOpen(true);
          }}
          onOpenBlueprints={() => {
            setIsAchievementsOpen(false);
            setIsBlueprintShopOpen(true);
          }}
          onOpenWeather={() => {
            setIsAchievementsOpen(false);
            handleToggleWeather();
          }}
          onClose={() => setIsAchievementsOpen(false)}
        />
      )}

      {/* MODAL: Teacher's Desk & Cambridge Shields */}
      {isTeacherDeskOpen && (
        <TeacherTipModal
          stats={stats}
          playerName={characterConfig.name}
          onClose={() => setIsTeacherDeskOpen(false)}
          onResetWorld={handleResetWorld}
        />
      )}

      {/* MODAL: How to Play / Controls Guide */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎮</span>
                <h3 className="text-lg font-black text-white">How to Play & Controls</h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <span className="text-lg">🏆</span>
                <div>
                  <span className="font-bold text-amber-300">Milestone Badges:</span> Press{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">[B]</span> or click the{' '}
                  <span className="font-bold text-amber-300">Badges</span> button to view permanent trophies, such as
                  reaching Level 10, placing 1,000 blocks, or completing all Cambridge Movers exam types!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <span className="text-lg">🎯</span>
                <div>
                  <span className="font-bold text-amber-400">Daily Challenges:</span> Complete daily building,
                  mining, and Cambridge English tasks to earn bonus block rewards, XP, and unlock the Grand Daily Chest!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <span className="text-lg">👁️</span>
                <div>
                  <span className="font-bold text-indigo-300">1st Person & Building Interiors:</span> Press{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">[C]</span> or click the{' '}
                  <span className="font-bold text-indigo-300">View</span> button in the top HUD to switch into{' '}
                  <span className="font-bold text-emerald-300">1st Person (Hero Hidden)</span> mode! You can walk right inside the study cabin and buildings, look around bookshelves, study desks, and out the glass windows with no walls blocking your view. Click again to return to 3rd person and show your character!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <span className="text-lg">⌨️</span>
                <div>
                  <span className="font-bold text-amber-300">Move & Smooth Jump:</span> Use{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">Arrow keys (▲ ▼ ◀ ▶)</span> or{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">W, A, S, D</span> to walk, run, and turn smoothly around the island and cabin. Press{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">SPACE</span> to trigger a smooth jumping animation with athletic limb tucks, dynamic balance, and tactile landing dust!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <span className="text-lg">⛏️</span>
                <div>
                  <span className="font-bold text-amber-300">Dig & Mine Blocks:</span> Press{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">[X]</span> or{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">[F]</span> or click the{' '}
                  <span className="font-bold text-amber-400">⛏️ Dig</span> button to immediately dig the targeted block or the ground beneath your feet! You can also press{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">[M]</span> to toggle between Place and Dig mode. Digging spawns tactile 3D rubble debris, plays crunchy digging audio, and collects voxel blocks into your bag while progressing Quarryman achievements and Daily Quests!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <span className="text-lg">🔨</span>
                <div>
                  <span className="font-bold text-emerald-300">Place Blocks:</span> In Place mode, left-click on any block face to place the active block in your hand. In Mine mode (or right-click), click to break blocks and collect them! Toggle mode with{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">[M]</span>.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <span className="text-lg">📜</span>
                <div>
                  <span className="font-bold text-amber-400">Cambridge Exam Station:</span> Press{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">[E]</span> or click the top
                  banner. Answer Reading, Writing, Listening & Speaking questions to earn blocks, gold, and diamonds!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <span className="text-lg">📐</span>
                <div>
                  <span className="font-bold text-indigo-300">Blueprint Workshop:</span> Click the Builds button in the
                  hotbar to construct full structures like the Cambridge Study Room, Farmyard, or Castle!
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-3">
                <span className="text-lg">🌧️</span>
                <div>
                  <span className="font-bold text-sky-300">Dynamic Weather & Weather Quests:</span> Rain and snow fall
                  across the island with custom sky, fog, and particle atmospheres. Complete special Weather Quests (press{' '}
                  <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-white">[K]</span> or click the
                  weather widget) for bonus diamonds, lanterns, and XP!
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg"
            >
              Got it, let's explore!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
