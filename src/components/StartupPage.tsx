import React, { useState, useEffect } from 'react';
import { CharacterConfig, CharacterGender, PlayerStats, DailyChallenge } from '../types/game';
import { soundFx } from '../utils/soundEffects';
import { relaxingBgm } from '../utils/relaxingBgm';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  Play,
  UserPlus,
  Trash2,
  CheckCircle,
  Music,
  Compass,
  BookOpen,
  Target,
  Trophy,
} from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  character: CharacterConfig;
  stats: PlayerStats;
  lastPlayed: string;
}

interface StartupPageProps {
  onStartGame: (profile: UserProfile) => void;
  selectedProfileId?: string;
  onSelectProfile?: (profile: UserProfile) => void;
  dailyChallenges?: DailyChallenge[];
  onOpenChallenges?: () => void;
  onOpenAchievements?: () => void;
  achievementsCount?: { unlocked: number; total: number; claimable: number };
}

const PRESET_PROFILES: UserProfile[] = [
  {
    id: 'profile-leo',
    name: 'Leo',
    character: {
      gender: 'boy',
      name: 'Leo',
      hairColor: '#5c3a21',
      shirtColor: '#2563eb',
      pantsColor: '#1d4ed8',
      skinColor: '#fed7aa',
      accessory: 'miner_helmet',
    },
    stats: {
      score: 120,
      cambridgeShields: { readingWriting: 3, listening: 3, speaking: 2 },
      level: 2,
      blocksPlaced: 18,
      questionsAnswered: 8,
    },
    lastPlayed: 'Today',
  },
  {
    id: 'profile-mia',
    name: 'Mia',
    character: {
      gender: 'girl',
      name: 'Mia',
      hairColor: '#d97706',
      shirtColor: '#dc2626',
      pantsColor: '#4d7c0f',
      skinColor: '#fed7aa',
      accessory: 'flower_crown',
    },
    stats: {
      score: 250,
      cambridgeShields: { readingWriting: 4, listening: 4, speaking: 3 },
      level: 3,
      blocksPlaced: 36,
      questionsAnswered: 15,
    },
    lastPlayed: 'Yesterday',
  },
];

export const StartupPage: React.FC<StartupPageProps> = ({
  onStartGame,
  selectedProfileId: propSelectedProfileId,
  onSelectProfile,
  dailyChallenges,
  onOpenChallenges,
  onOpenAchievements,
  achievementsCount,
}) => {
  // Saved profiles
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('movers_all_profiles');
    return saved ? JSON.parse(saved) : PRESET_PROFILES;
  });

  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    return propSelectedProfileId || profiles[0]?.id || 'profile-leo';
  });

  useEffect(() => {
    if (propSelectedProfileId && propSelectedProfileId !== selectedProfileId) {
      setSelectedProfileId(propSelectedProfileId);
    }
  }, [propSelectedProfileId, selectedProfileId]);

  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Helper to query isolated world block count
  const getWorldBlockCount = (profileId: string): number | null => {
    try {
      const raw = localStorage.getItem(`movers_world_blocks_${profileId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.length;
        }
      }
    } catch {}
    return null;
  };

  // New profile form state
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<CharacterGender>('boy');
  const [newShirtColor, setNewShirtColor] = useState('#2563eb');
  const [newHairColor, setNewHairColor] = useState('#5c3a21');
  const [newAccessory, setNewAccessory] = useState<CharacterConfig['accessory']>('none');

  // Music state
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.45);
  const [isGeneratingAiMusic, setIsGeneratingAiMusic] = useState(false);
  const [musicStatus, setMusicStatus] = useState<string>('Relaxing Ambient Piano');

  useEffect(() => {
    localStorage.setItem('movers_all_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    const unsub = relaxingBgm.subscribe(() => {
      setBgmPlaying(relaxingBgm.getIsPlaying());
      setBgmVolume(relaxingBgm.getVolume());
      setMusicStatus(relaxingBgm.getCurrentTrackName());
    });
    return unsub;
  }, []);

  const handleToggleMusic = () => {
    soundFx.playClick();
    if (bgmPlaying) {
      relaxingBgm.stop();
    } else {
      relaxingBgm.start();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    relaxingBgm.setVolume(val);
    setBgmVolume(val);
  };

  // Generate AI music via Lyria endpoint
  const handleGenerateLyriaMusic = async () => {
    try {
      setIsGeneratingAiMusic(true);
      soundFx.playClick();
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Soft, relaxing, cozy ambient piano and marimba melody in C major for a children learning voxel game',
        }),
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

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
        setMusicStatus('Lyria AI: Cozy Island Lullaby');
      }
    } catch (err) {
      console.warn('Lyria AI generation unavailable, continuing with procedural relaxing music');
      relaxingBgm.playProceduralTune();
      relaxingBgm.start();
    } finally {
      setIsGeneratingAiMusic(false);
    }
  };

  const handleCreateProfile = () => {
    if (!newName.trim()) return;
    soundFx.playCorrect();

    const created: UserProfile = {
      id: `profile-${Date.now()}`,
      name: newName.trim(),
      character: {
        gender: newGender,
        name: newName.trim(),
        hairColor: newHairColor,
        shirtColor: newShirtColor,
        pantsColor: newGender === 'boy' ? '#1d4ed8' : '#4d7c0f',
        skinColor: '#fed7aa',
        accessory: newAccessory,
      },
      stats: {
        score: 0,
        xp: 0,
        cambridgeShields: { readingWriting: 1, listening: 1, speaking: 1 },
        level: 1,
        blocksPlaced: 0,
        questionsAnswered: 0,
        blocksMined: 0,
        blueprintsBuilt: 0,
        completedExamParts: [],
        weatherQuestsCompleted: 0,
        lanternsPlaced: 0,
      },
      lastPlayed: 'Just now',
    };

    setProfiles((prev) => [...prev, created]);
    setSelectedProfileId(created.id);
    onSelectProfile?.(created);
    setIsCreatingNew(false);
    setNewName('');
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      alert('You must have at least one profile!');
      return;
    }
    soundFx.playClick();
    const filtered = profiles.filter((p) => p.id !== id);
    setProfiles(filtered);

    // Clean up all isolated storage keys for this profile
    try {
      localStorage.removeItem(`movers_world_blocks_${id}`);
      localStorage.removeItem(`movers_stats_${id}`);
      localStorage.removeItem(`movers_inventory_${id}`);
      localStorage.removeItem(`movers_hotbar_${id}`);
      localStorage.removeItem(`movers_character_${id}`);
      localStorage.removeItem(`movers_weather_quest_${id}`);
      localStorage.removeItem(`movers_achievements_${id}`);
      localStorage.removeItem(`movers_daily_challenges_${id}`);
    } catch {}

    if (selectedProfileId === id) {
      const nextProfile = filtered[0];
      setSelectedProfileId(nextProfile.id);
      onSelectProfile?.(nextProfile);
    }
  };

  const handleEnterGame = () => {
    const selected = profiles.find((p) => p.id === selectedProfileId) || profiles[0];
    soundFx.playLevelUp();
    // Start relaxing music if not yet playing
    relaxingBgm.start();
    onStartGame(selected);
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  return (
    <div className="relative w-screen h-screen overflow-y-auto bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-4 sm:p-8 select-none">
      {/* Background Decor - Floating Voxel Clouds & Blocks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute top-10 left-12 w-28 h-14 bg-white/40 rounded-xl blur-xs" />
        <div className="absolute top-24 right-20 w-40 h-16 bg-white/30 rounded-xl blur-xs" />
        <div className="absolute bottom-20 left-1/4 w-32 h-14 bg-white/20 rounded-xl blur-xs" />
        {/* Voxel Floating Cubes */}
        <div className="absolute top-1/3 left-10 w-12 h-12 bg-emerald-600 rounded-sm shadow-xl rotate-12 border border-emerald-400" />
        <div className="absolute top-1/2 right-12 w-14 h-14 bg-amber-500 rounded-sm shadow-xl -rotate-12 border border-amber-300" />
        <div className="absolute bottom-1/4 left-16 w-10 h-10 bg-cyan-500 rounded-sm shadow-xl rotate-45 border border-cyan-300" />
      </div>

      {/* Top Banner & Music Bar */}
      <header className="relative z-10 w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl border-2 border-amber-200">
            🏰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md tracking-wider">
                Cambridge English
              </span>
              <span className="text-[11px] font-black uppercase px-2 py-0.5 bg-indigo-500/40 text-indigo-200 rounded-md border border-indigo-400/30">
                CEFR Level A1
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-0.5">
              Movers: Craft & Learn 3D
            </h1>
          </div>
        </div>

        {/* Header Right: Daily Quests, Badges & Music */}
        <div className="flex items-center gap-3">
          {onOpenAchievements && achievementsCount && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenAchievements();
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/85 hover:bg-slate-800 text-amber-300 rounded-2xl border text-xs font-black shadow-xl transition-all ${
                achievementsCount.claimable > 0
                  ? 'border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                  : 'border-amber-500/30'
              }`}
              title="Milestone Achievements & Unlockable Badges"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Badges</span>
              {achievementsCount.claimable > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
                  {achievementsCount.claimable} Ready!
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono border border-amber-500/30">
                  {achievementsCount.unlocked}/{achievementsCount.total}
                </span>
              )}
            </button>
          )}

          {onOpenChallenges && dailyChallenges && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenChallenges();
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/85 hover:bg-slate-800 text-amber-300 rounded-2xl border border-amber-500/30 text-xs font-black shadow-xl transition-all"
              title="View Today's Daily Challenges"
            >
              <span className="text-base">🎯</span>
              <span className="hidden md:inline">Daily Quests</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono border border-amber-500/30">
                {dailyChallenges.filter((c) => c.completed).length}/{dailyChallenges.length}
              </span>
            </button>
          )}

          {/* Relaxing BGM Control Bar */}
          <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
          <button
            onClick={handleToggleMusic}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              bgmPlaying
                ? 'bg-emerald-500 text-slate-950 shadow-md scale-105'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={bgmPlaying ? 'Pause Music' : 'Play Relaxing Music'}
          >
            {bgmPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex flex-col">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3 h-3 text-amber-400" />
              <span>Relaxing BGM</span>
            </div>
            <div className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
              {musicStatus}
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bgmVolume}
            onChange={handleVolumeChange}
            className="w-16 accent-amber-400 cursor-pointer"
            title="Music Volume"
          />

          <button
            onClick={handleGenerateLyriaMusic}
            disabled={isGeneratingAiMusic}
            className="px-2.5 py-1.5 bg-indigo-600/70 hover:bg-indigo-600 text-indigo-100 rounded-xl text-[11px] font-bold border border-indigo-400/30 flex items-center gap-1 transition-all disabled:opacity-50"
            title="Generate new relaxing music with Google Lyria AI"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{isGeneratingAiMusic ? 'Generating...' : 'AI Melody'}</span>
          </button>
        </div>
      </div>
    </header>

      {/* Main Center Content: Profile Hub */}
      <main className="relative z-10 w-full max-w-5xl my-6 flex flex-col items-center">
        {/* Hero Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold mb-3 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Minecraft Voxel Sandbox + Cambridge A1 Exam Preparation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Choose Your Explorer Profile
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-xl mx-auto">
            Build your voxel island by answering real Cambridge Movers questions across Reading,
            Writing, Listening, and Speaking!
          </p>
        </div>

        {/* Profiles Grid */}
        {!isCreatingNew ? (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {profiles.map((profile) => {
                const isSelected = profile.id === selectedProfileId;
                const totalShields =
                  profile.stats.cambridgeShields.readingWriting +
                  profile.stats.cambridgeShields.listening +
                  profile.stats.cambridgeShields.speaking;

                return (
                  <div
                    key={profile.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedProfileId(profile.id);
                      onSelectProfile?.(profile);
                    }}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-amber-400 shadow-2xl shadow-amber-500/20 scale-102'
                        : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[11px] rounded-full shadow-md">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>READY</span>
                      </div>
                    )}

                    <div>
                      {/* Character Avatar Banner */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-inner flex items-center justify-center text-3xl flex-shrink-0"
                          style={{ backgroundColor: profile.character.shirtColor }}
                        >
                          {profile.character.gender === 'boy' ? '👦' : '👧'}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white">{profile.name}</h3>
                          <div className="text-xs text-amber-300 font-bold flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{profile.character.gender} Explorer</span>
                            <span>•</span>
                            <span>Level {profile.stats.level}</span>
                          </div>
                        </div>
                      </div>

                      {/* Isolated World & Private Island Indicator */}
                      <div className="mt-4 p-2.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-indigo-200">
                          <span className="text-lg">🏰</span>
                          <div className="leading-tight">
                            <div className="font-extrabold text-white text-[11px]">
                              {getWorldBlockCount(profile.id) !== null
                                ? `${getWorldBlockCount(profile.id)} Custom Blocks Built`
                                : 'Private Floating Island'}
                            </div>
                            <div className="text-[10px] text-indigo-300 font-medium">
                              {profile.name}&apos;s own world • Isolated
                            </div>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          🔒 Private
                        </span>
                      </div>

                      {/* Cambridge Shields Summary */}
                      <div className="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-bold">Cambridge Shields:</span>
                          <span className="text-amber-400 font-black flex items-center gap-1">
                            <span>🛡️</span>
                            <span>{totalShields} / 15</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                            <div className="text-slate-400">R & W</div>
                            <div className="font-black text-white">
                              {profile.stats.cambridgeShields.readingWriting}⭐
                            </div>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                            <div className="text-slate-400">Listening</div>
                            <div className="font-black text-white">
                              {profile.stats.cambridgeShields.listening}⭐
                            </div>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                            <div className="text-slate-400">Speaking</div>
                            <div className="font-black text-white">
                              {profile.stats.cambridgeShields.speaking}⭐
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Minecraft Stats */}
                      <div className="flex items-center justify-between mt-3 text-xs text-slate-300 px-1">
                        <span>📦 {profile.stats.blocksPlaced} Blocks Placed</span>
                        <span>✅ {profile.stats.questionsAnswered} Solved</span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Played: {profile.lastPlayed}</span>
                      {profiles.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteProfile(profile.id, e)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Profile Card */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsCreatingNew(true);
                }}
                className="min-h-[220px] p-6 rounded-3xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-slate-900/40 hover:bg-slate-900/80 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 group-hover:bg-indigo-600/50 border border-indigo-400/40 flex items-center justify-center text-indigo-300 text-2xl shadow-lg transition-transform group-hover:scale-110">
                  <UserPlus className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-white mt-3">Create New Explorer</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Add a new student profile for family or classroom practice
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* Profile Creator Form */
          <div className="w-full max-w-xl bg-slate-900/90 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fadeIn text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl">
                  ✨
                </div>
                <h3 className="text-xl font-black text-white">Create Explorer Profile</h3>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Gender selector */}
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Character Gender
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setNewGender('boy');
                      if (!newName) setNewName('Alex');
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      newGender === 'boy'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-2xl">👦</span>
                    <span className="font-bold text-sm">Boy Explorer</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setNewGender('girl');
                      if (!newName) setNewName('Zoe');
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                      newGender === 'girl'
                        ? 'bg-rose-600/20 border-rose-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-2xl">👧</span>
                    <span className="font-bold text-sm">Girl Explorer</span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Student / Explorer Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name (e.g. Jack, Daisy, Peter)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  maxLength={16}
                />
              </div>

              {/* Shirt color */}
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Shirt Color
                </label>
                <div className="flex gap-2 mt-1.5">
                  {['#2563eb', '#16a34a', '#dc2626', '#eab308', '#9333ea'].map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        soundFx.playClick();
                        setNewShirtColor(col);
                      }}
                      className={`w-8 h-8 rounded-lg border-2 transition-transform ${
                        newShirtColor === col ? 'scale-110 border-white' : 'border-black/30'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Hat / Accessory */}
              <div>
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Starter Hat
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[
                    { key: 'none', label: 'Classic', icon: '👤' },
                    { key: 'miner_helmet', label: 'Miner Hat', icon: '⛏️' },
                    { key: 'crown', label: 'Crown', icon: '👑' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        soundFx.playClick();
                        setNewAccessory(item.key as any);
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        newAccessory === item.key
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={!newName.trim()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg disabled:opacity-50"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enter Game CTA Button */}
        {!isCreatingNew && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={handleEnterGame}
              className="group px-10 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-2xl shadow-amber-500/30 border-2 border-amber-200 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-6 h-6 fill-slate-950 group-hover:translate-x-0.5 transition-transform" />
              <span>ENTER 3D WORLD AS {selectedProfile.name.toUpperCase()}</span>
            </button>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span>Press to launch 3D sandbox with soothing background music</span>
            </p>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-5xl py-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Cambridge Young Learners English: Movers (A1)</span>
          <span>•</span>
          <span>Authentic Exam Papers Practice</span>
        </div>
        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <span>Controls: WASD + Space (Jump) + Mouse (Mine/Place)</span>
        </div>
      </footer>
    </div>
  );
};
