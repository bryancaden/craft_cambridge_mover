import React, { useState } from 'react';
import {
  BlockType,
  MoversPart,
  Part1Question,
  Part2Question,
  Part3Story,
  Part4Grammar,
  Part5StoryComp,
  Part6PicWrite,
  ListeningQuestion,
  SpeakingDifferenceItem,
  SpeakingOddOneOutItem,
} from '../types/game';
import {
  generatePart1Questions,
  generatePart2Questions,
  generatePart3Story,
  generatePart4Grammar,
  generatePart5Story,
  generatePart6PicWrite,
  generateListeningQuestion,
  SPEAKING_DIFFERENCES,
  SPEAKING_ODD_ONE_OUT,
  BLOCK_DEFINITIONS,
  shuffle,
} from '../data/cambridgeMoversData';
import { soundFx } from '../utils/soundEffects';
import { speakText, stopSpeech } from '../utils/speechUtils';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Volume2,
  Sparkles,
  RefreshCw,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Mic,
  Headphones,
  Compass,
} from 'lucide-react';

interface ExamStationProps {
  onClose: () => void;
  onRewardBlocks: (type: BlockType, count: number) => void;
  onQuestionCompleted: (partCategory: 'readingWriting' | 'listening' | 'speaking', specificPart?: MoversPart) => void;
  initialPart?: MoversPart;
}

export const ExamStation: React.FC<ExamStationProps> = ({
  onClose,
  onRewardBlocks,
  onQuestionCompleted,
  initialPart = 'rw_part1',
}) => {
  const [activeTab, setActiveTab] = useState<MoversPart>(initialPart);

  // Dynamic question states
  const [part1List, setPart1List] = useState<Part1Question[]>(() => generatePart1Questions());
  const [p1CurrentIdx, setP1CurrentIdx] = useState(0);
  const [p1Selected, setP1Selected] = useState<string | null>(null);

  const [part2List, setPart2List] = useState<Part2Question[]>(() => generatePart2Questions());
  const [p2CurrentIdx, setP2CurrentIdx] = useState(0);
  const [p2SelectedKey, setP2SelectedKey] = useState<string | null>(null);

  const [part3Story, setPart3Story] = useState<Part3Story>(() => generatePart3Story());
  const [p3Answers, setP3Answers] = useState<Record<number, string>>({});
  const [p3SelectedTitle, setP3SelectedTitle] = useState<number | null>(null);

  const [part4Grammar, setPart4Grammar] = useState<Part4Grammar>(() => generatePart4Grammar());
  const [p4Answers, setP4Answers] = useState<Record<number, string>>({});

  const [part5Story, setPart5Story] = useState<Part5StoryComp>(() => generatePart5Story());
  const [p5Answers, setP5Answers] = useState<Record<string, string>>({});

  const [part6Data, setPart6Data] = useState<Part6PicWrite>(() => generatePart6PicWrite());
  const [p6Input1, setP6Input1] = useState('');
  const [p6Input2, setP6Input2] = useState('');
  const [p6Input3, setP6Input3] = useState('');
  const [p6Input4, setP6Input4] = useState('');

  const [listeningQ, setListeningQ] = useState<ListeningQuestion>(() => generateListeningQuestion());
  const [listeningSelected, setListeningSelected] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const [diffIndex, setDiffIndex] = useState(0);
  const [foundDiffIds, setFoundDiffIds] = useState<string[]>([]);

  const [oddIndex, setOddIndex] = useState(0);
  const [oddSelectedIdx, setOddSelectedIdx] = useState<number | null>(null);

  // Feedback banner state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    explanation?: string;
    reward?: { type: BlockType; count: number };
  } | null>(null);

  // Sync tab if initialPart changes
  React.useEffect(() => {
    if (initialPart) {
      setActiveTab(initialPart);
      setFeedback(null);
    }
  }, [initialPart]);

  // Clean up speech when switching tabs
  React.useEffect(() => {
    stopSpeech();
    setIsAudioPlaying(false);
  }, [activeTab]);

  // Stop speech when closing modal
  React.useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Audio helper
  const handleSpeak = (text: string) => {
    setIsAudioPlaying(true);
    speakText(text, () => setIsAudioPlaying(false));
  };

  // Re-generate current section questions
  const handleRegenerate = () => {
    soundFx.playClick();
    setFeedback(null);
    if (activeTab === 'rw_part1') {
      setPart1List(generatePart1Questions());
      setP1CurrentIdx(0);
      setP1Selected(null);
    } else if (activeTab === 'rw_part2') {
      setPart2List(generatePart2Questions());
      setP2CurrentIdx(0);
      setP2SelectedKey(null);
    } else if (activeTab === 'rw_part3') {
      setPart3Story(generatePart3Story());
      setP3Answers({});
      setP3SelectedTitle(null);
    } else if (activeTab === 'rw_part4') {
      setPart4Grammar(generatePart4Grammar());
      setP4Answers({});
    } else if (activeTab === 'rw_part5') {
      setPart5Story(generatePart5Story());
      setP5Answers({});
    } else if (activeTab === 'rw_part6') {
      setPart6Data(generatePart6PicWrite());
      setP6Input1('');
      setP6Input2('');
      setP6Input3('');
      setP6Input4('');
    } else if (activeTab === 'listening_part4') {
      setListeningQ(generateListeningQuestion());
      setListeningSelected(null);
    } else if (activeTab === 'speaking_differences') {
      setDiffIndex((prev) => (prev + 1) % SPEAKING_DIFFERENCES.length);
      setFoundDiffIds([]);
    } else if (activeTab === 'speaking_odd_one_out') {
      setOddIndex((prev) => (prev + 1) % SPEAKING_ODD_ONE_OUT.length);
      setOddSelectedIdx(null);
    }
  };

  // Check Part 1 Answer
  const handleP1Answer = (word: string) => {
    const currentQ = part1List[p1CurrentIdx];
    setP1Selected(word);
    if (word === currentQ.correctWord) {
      soundFx.playCorrect();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      onRewardBlocks(currentQ.rewardBlocks.type, currentQ.rewardBlocks.count);
      onQuestionCompleted('readingWriting', 'rw_part1');
      setFeedback({
        type: 'success',
        message: `Correct! "${currentQ.correctWord}" is the right answer!`,
        reward: currentQ.rewardBlocks,
      });
      setTimeout(() => {
        if (p1CurrentIdx < part1List.length - 1) {
          setP1CurrentIdx((i) => i + 1);
          setP1Selected(null);
          setFeedback(null);
        }
      }, 1500);
    } else {
      soundFx.playIncorrect();
      setFeedback({
        type: 'error',
        message: `Not quite! Read the clue carefully and try again.`,
      });
    }
  };

  // Check Part 2 Answer
  const handleP2Answer = (key: 'A' | 'B' | 'C') => {
    const currentQ = part2List[p2CurrentIdx];
    setP2SelectedKey(key);
    if (key === currentQ.correctKey) {
      soundFx.playCorrect();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      onRewardBlocks(currentQ.rewardBlocks.type, currentQ.rewardBlocks.count);
      onQuestionCompleted('readingWriting', 'rw_part2');
      setFeedback({
        type: 'success',
        message: `Excellent! That's the best reply!`,
        explanation: currentQ.explanation,
        reward: currentQ.rewardBlocks,
      });
      setTimeout(() => {
        if (p2CurrentIdx < part2List.length - 1) {
          setP2CurrentIdx((i) => i + 1);
          setP2SelectedKey(null);
          setFeedback(null);
        }
      }, 2000);
    } else {
      soundFx.playIncorrect();
      setFeedback({
        type: 'error',
        message: `That doesn't quite fit the conversation. Check the grammar:`,
        explanation: currentQ.explanation,
      });
    }
  };

  // Check Part 3 Story
  const handleP3Verify = () => {
    const blanks = part3Story.storySegments.filter((s) => s.blankNumber !== undefined);
    let allCorrect = true;
    for (const b of blanks) {
      if (p3Answers[b.blankNumber!] !== b.correctWord) {
        allCorrect = false;
        break;
      }
    }
    if (p3SelectedTitle !== part3Story.correctTitleIndex) {
      allCorrect = false;
    }

    if (allCorrect) {
      soundFx.playCorrect();
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      onRewardBlocks(part3Story.rewardBlocks.type, part3Story.rewardBlocks.count);
      onQuestionCompleted('readingWriting', 'rw_part3');
      setFeedback({
        type: 'success',
        message: `Brilliant! You completed the whole story and chose the perfect title!`,
        reward: part3Story.rewardBlocks,
      });
    } else {
      soundFx.playIncorrect();
      setFeedback({
        type: 'error',
        message: `Some words or the title need checking. Look at the story clues!`,
      });
    }
  };

  // Check Part 4 Grammar
  const handleP4Answer = (blankNumber: number, option: string, correct: string, explanation: string) => {
    setP4Answers((prev) => ({ ...prev, [blankNumber]: option }));
    if (option === correct) {
      soundFx.playCorrect();
      onRewardBlocks(part4Grammar.rewardBlocks.type, 2);
      onQuestionCompleted('readingWriting', 'rw_part4');
      setFeedback({
        type: 'success',
        message: `Correct grammar choice!`,
        explanation,
        reward: { type: part4Grammar.rewardBlocks.type, count: 2 },
      });
    } else {
      soundFx.playIncorrect();
      setFeedback({
        type: 'error',
        message: `Not quite right. Teacher's rule:`,
        explanation,
      });
    }
  };

  // Check Part 5 Comprehension
  const handleP5SubmitQuestion = (qId: string, acceptable: string[]) => {
    const userAns = (p5Answers[qId] || '').trim().toLowerCase();
    const isMatch = acceptable.some((ans) => userAns.includes(ans.toLowerCase()));

    if (isMatch) {
      soundFx.playCorrect();
      onRewardBlocks('diamond', 2);
      onQuestionCompleted('readingWriting', 'rw_part5');
      setFeedback({
        type: 'success',
        message: `Well done! Perfect answer from the text!`,
        reward: { type: 'diamond', count: 2 },
      });
    } else {
      soundFx.playIncorrect();
      setFeedback({
        type: 'error',
        message: `Check the reading passage above. Write 1, 2, or 3 words from the story.`,
      });
    }
  };

  // Check Part 6 Pictures
  const handleP6CheckAnswer = (userInput: string, acceptable: string[]) => {
    const clean = userInput.trim().toLowerCase();
    const match = acceptable.some((ans) => clean.includes(ans.toLowerCase()));
    if (match) {
      soundFx.playCorrect();
      onRewardBlocks('lantern', 2);
      onQuestionCompleted('readingWriting', 'rw_part6');
      setFeedback({
        type: 'success',
        message: `Great observation and English sentence!`,
        reward: { type: 'lantern', count: 2 },
      });
    } else {
      soundFx.playIncorrect();
      setFeedback({
        type: 'error',
        message: `Try again! Hint: Check the key objects in the picture.`,
      });
    }
  };

  // Check Listening
  const handleListeningAnswer = (key: string) => {
    setListeningSelected(key);
    if (key === listeningQ.correctKey) {
      soundFx.playCorrect();
      confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
      onRewardBlocks(listeningQ.rewardBlocks.type, listeningQ.rewardBlocks.count);
      onQuestionCompleted('listening', 'listening_part4');
      setFeedback({
        type: 'success',
        message: `Super listening ears! That matches the audio recording!`,
        explanation: listeningQ.explanation,
        reward: listeningQ.rewardBlocks,
      });
    } else {
      soundFx.playIncorrect();
      setFeedback({
        type: 'error',
        message: `Listen again to the audio description:`,
        explanation: listeningQ.explanation,
      });
    }
  };

  // Speaking Difference click
  const handleToggleDiff = (diffId: string, modelSentence: string) => {
    if (!foundDiffIds.includes(diffId)) {
      soundFx.playCorrect();
      handleSpeak(modelSentence);
      setFoundDiffIds((prev) => [...prev, diffId]);
      onRewardBlocks('diamond', 2);
      onQuestionCompleted('speaking', 'speaking_differences');
      if (foundDiffIds.length + 1 >= 4) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      handleSpeak(modelSentence);
    }
  };

  // Speaking Odd-One-Out click
  const handleOddSelect = (idx: number) => {
    setOddSelectedIdx(idx);
    const item = SPEAKING_ODD_ONE_OUT[oddIndex].items[idx];
    if (item.isOdd) {
      soundFx.playCorrect();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      handleSpeak(SPEAKING_ODD_ONE_OUT[oddIndex].explanation);
      onRewardBlocks('gold', 3);
      onQuestionCompleted('speaking', 'speaking_odd_one_out');
      setFeedback({
        type: 'success',
        message: `Spot on! "${item.name}" is the odd one out!`,
        explanation: item.reason,
        reward: { type: 'gold', count: 3 },
      });
    } else {
      soundFx.playIncorrect();
      setFeedback({
        type: 'error',
        message: `Not this one. ${item.reason} Which one doesn't belong?`,
      });
    }
  };

  const navItems: { id: MoversPart; label: string; icon: React.ReactNode; group: string }[] = [
    { id: 'rw_part1', label: 'R&W Part 1: Definitions', icon: <BookOpen className="w-4 h-4" />, group: 'Reading & Writing' },
    { id: 'rw_part2', label: 'R&W Part 2: Dialogues', icon: <MessageSquare className="w-4 h-4" />, group: 'Reading & Writing' },
    { id: 'rw_part3', label: 'R&W Part 3: Story Cloze', icon: <BookOpen className="w-4 h-4" />, group: 'Reading & Writing' },
    { id: 'rw_part4', label: 'R&W Part 4: Grammar', icon: <Sparkles className="w-4 h-4" />, group: 'Reading & Writing' },
    { id: 'rw_part5', label: 'R&W Part 5: Reading', icon: <Compass className="w-4 h-4" />, group: 'Reading & Writing' },
    { id: 'rw_part6', label: 'R&W Part 6: Picture Writing', icon: <Award className="w-4 h-4" />, group: 'Reading & Writing' },
    { id: 'listening_part4', label: 'Listening: Audio Choice', icon: <Headphones className="w-4 h-4" />, group: 'Listening' },
    { id: 'speaking_differences', label: 'Speaking: Find Differences', icon: <Mic className="w-4 h-4" />, group: 'Speaking' },
    { id: 'speaking_odd_one_out', label: 'Speaking: Odd-One-Out', icon: <Mic className="w-4 h-4" />, group: 'Speaking' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-600/30 via-slate-900 to-indigo-900/30 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Cambridge A1 Movers Exam Station
                </h2>
                <span className="px-2 py-0.5 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-black rounded-md">
                  Official Authentic Format
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Answer correctly to earn Minecraft resource blocks for your 3D world!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              title="Generate fresh new randomized questions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Question</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-base"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id);
                  setFeedback(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div
            className={`px-6 py-3 border-b flex items-start justify-between gap-3 animate-slideDown ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-sm">{feedback.message}</div>
                {feedback.explanation && (
                  <div className="text-xs mt-1 text-slate-300 font-medium">
                    💡 Teacher Tip: {feedback.explanation}
                  </div>
                )}
              </div>
            </div>

            {feedback.reward && (
              <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-xl border border-white/10 flex-shrink-0 text-xs font-bold text-amber-300">
                <span className="text-base">🎁</span>
                <span>
                  +{feedback.reward.count} {BLOCK_DEFINITIONS[feedback.reward.type].name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* ========================================================================= */}
          {/* PART 1: Reading & Writing (Definitions Match) */}
          {/* ========================================================================= */}
          {activeTab === 'rw_part1' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                    Question {p1CurrentIdx + 1} of {part1List.length}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    Look and read. Choose the correct word and earn{' '}
                    <span className="text-amber-400">
                      {part1List[p1CurrentIdx]?.rewardBlocks.count}{' '}
                      {BLOCK_DEFINITIONS[part1List[p1CurrentIdx]?.rewardBlocks.type]?.name}
                    </span>
                    !
                  </h3>
                </div>

                <button
                  onClick={() => handleSpeak(part1List[p1CurrentIdx].definition)}
                  className="p-2.5 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl border border-indigo-400/30 flex items-center gap-1.5 text-xs font-bold"
                  title="Listen to definition audio"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen</span>
                </button>
              </div>

              {/* The Definition Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/60 border-2 border-indigo-500/30 shadow-xl">
                <div className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                  "{part1List[p1CurrentIdx].definition}"
                </div>
              </div>

              {/* 4 Picture Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {part1List[p1CurrentIdx].options.map((opt) => {
                  const isChosen = p1Selected === opt.word;
                  return (
                    <button
                      key={opt.word}
                      onClick={() => handleP1Answer(opt.word)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                        isChosen
                          ? 'bg-amber-500/20 border-amber-400 scale-105 shadow-xl'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      <span className="text-4xl sm:text-5xl my-2">{opt.emoji}</span>
                      <span className="text-base font-black text-white mt-1 capitalize">
                        {opt.word}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">{opt.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PART 2: Reading & Writing (Conversations & Dialogue) */}
          {/* ========================================================================= */}
          {activeTab === 'rw_part2' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                    Dialogue {p2CurrentIdx + 1} of {part2List.length}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    Read the text and choose the best answer (A, B, or C).
                  </h3>
                </div>

                <button
                  onClick={() =>
                    handleSpeak(
                      `${part2List[p2CurrentIdx].speakerA} says: ${part2List[p2CurrentIdx].lineA}`
                    )
                  }
                  className="p-2.5 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl border border-indigo-400/30 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen</span>
                </button>
              </div>

              {/* Speaker Dialogue Balloon */}
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-4 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
                  👦
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-indigo-300">
                    {part2List[p2CurrentIdx].speakerA}:
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white mt-0.5">
                    "{part2List[p2CurrentIdx].lineA}"
                  </div>
                </div>
              </div>

              {/* 3 Cambridge Choice Options */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {part2List[p2CurrentIdx].speakerB}'s Reply:
                </div>
                {part2List[p2CurrentIdx].options.map((opt) => {
                  const isSelected = p2SelectedKey === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleP2Answer(opt.key)}
                      className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-xl'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-sm">
                        {opt.key}
                      </span>
                      <span className="text-base font-bold text-white">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PART 3: Reading & Writing (Story Cloze + Best Title) */}
          {/* ========================================================================= */}
          {activeTab === 'rw_part3' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Read the story. Choose a word from the box for each blank (1-5), then pick the
                    best story title!
                  </h3>
                </div>

                <button
                  onClick={() =>
                    handleSpeak(
                      part3Story.storySegments.map((s) => s.textBefore + (s.correctWord || '')).join(' ')
                    )
                  }
                  className="p-2.5 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl border border-indigo-400/30 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Read Story Aloud</span>
                </button>
              </div>

              {/* Word Bank */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                <div className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2">
                  📦 Word Bank (Picture Vocabulary)
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {part3Story.wordBank.map((item) => (
                    <div
                      key={item.word}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-2 text-xs font-bold text-white shadow-sm"
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span>{item.word}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Story Narrative */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-100 text-base leading-relaxed space-y-3 font-medium">
                <p>
                  {part3Story.storySegments.map((seg, idx) => (
                    <span key={idx}>
                      {seg.textBefore}
                      {seg.blankNumber !== undefined && (
                        <span className="inline-block mx-1">
                          <select
                            value={p3Answers[seg.blankNumber] || ''}
                            onChange={(e) =>
                              setP3Answers((prev) => ({
                                ...prev,
                                [seg.blankNumber!]: e.target.value,
                              }))
                            }
                            className="bg-slate-900 text-amber-300 font-bold border-2 border-amber-500/40 rounded-lg px-2 py-0.5 text-sm focus:outline-none focus:border-amber-400"
                          >
                            <option value="">({seg.blankNumber}) Choose...</option>
                            {part3Story.wordBank.map((w) => (
                              <option key={w.word} value={w.word}>
                                {w.word}
                              </option>
                            ))}
                          </select>
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>

              {/* Question 6: Best Title */}
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <div className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <span>(6)</span>
                  <span>Now choose the best name for the story:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {part3Story.titleOptions.map((title, idx) => (
                    <button
                      key={title}
                      onClick={() => {
                        soundFx.playClick();
                        setP3SelectedTitle(idx);
                      }}
                      className={`p-3.5 rounded-xl border-2 text-sm font-bold transition-all text-left ${
                        p3SelectedTitle === idx
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleP3Verify}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all text-base active:scale-98"
              >
                Verify Story & Claim Reward Blocks
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PART 4: Reading & Writing (Grammar Cloze 3-Option) */}
          {/* ========================================================================= */}
          {activeTab === 'rw_part4' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                    Topic: {part4Grammar.topic}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    Read the text. Choose the right words and write them on the lines (3 options).
                  </h3>
                </div>

                <button
                  onClick={() => handleSpeak(`${part4Grammar.topic}. ${part4Grammar.intro}`)}
                  className="p-2.5 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl border border-indigo-400/30 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Intro</span>
                </button>
              </div>

              {/* Intro snippet */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm leading-relaxed">
                {part4Grammar.intro}
              </div>

              {/* Grammatical blanks */}
              <div className="space-y-4">
                {part4Grammar.blanks.map((b) => {
                  const selectedOpt = p4Answers[b.blankNumber];
                  return (
                    <div
                      key={b.blankNumber}
                      className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="text-sm font-semibold text-white">
                        <span className="text-amber-400 font-mono font-bold mr-2">
                          ({b.blankNumber})
                        </span>
                        <span>{b.sentenceWithBlank}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.options.map((opt) => {
                          const isPicked = selectedOpt === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() =>
                                handleP4Answer(b.blankNumber, opt, b.correctAnswer, b.explanation)
                              }
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                isPicked
                                  ? opt === b.correctAnswer
                                    ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400'
                                    : 'bg-rose-500 text-white font-black border-rose-400'
                                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PART 5: Story Comprehension (1, 2, or 3 Words) */}
          {/* ========================================================================= */}
          {activeTab === 'rw_part5' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                    Illustrated Story: {part5Story.title}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    Complete the sentences about the story. You can use 1, 2 or 3 words.
                  </h3>
                </div>

                <button
                  onClick={() => handleSpeak(part5Story.text)}
                  className="p-2.5 bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-xl border border-indigo-400/30 flex items-center gap-1.5 text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen to Story</span>
                </button>
              </div>

              {/* Story text container */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                {part5Story.text}
              </div>

              {/* Comprehension Questions */}
              <div className="space-y-3">
                {part5Story.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2"
                  >
                    <div className="text-xs font-bold text-amber-300">Question {idx + 1}</div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-white">
                      <span>{q.leadSentence}</span>
                      <input
                        type="text"
                        placeholder="Write 1-3 words..."
                        value={p5Answers[q.id] || ''}
                        onChange={(e) =>
                          setP5Answers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400 min-w-[140px]"
                      />
                      <span>{q.targetEnding}</span>

                      <button
                        onClick={() => handleP5SubmitQuestion(q.id, q.acceptableAnswers)}
                        className="ml-auto px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md"
                      >
                        Check
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PART 6: Look, Read & Write */}
          {/* ========================================================================= */}
          {activeTab === 'rw_part6' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Part 6: Look and read and write ({part6Data.sceneTitle})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Complete the sentences and answer the questions about the scene.
                </p>
              </div>

              {/* Scene illustration banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border-2 border-indigo-500/30 flex flex-col sm:flex-row items-center gap-5">
                <div className="text-6xl sm:text-7xl">
                  {part6Data.sceneSvgType === 'beach'
                    ? '🏝️'
                    : part6Data.sceneSvgType === 'farm'
                    ? '🚜'
                    : '🏞️'}
                </div>
                <div>
                  <h4 className="text-base font-black text-white">{part6Data.sceneTitle}</h4>
                  <p className="text-sm text-slate-300 mt-1">{part6Data.sceneDescription}</p>
                </div>
              </div>

              {/* Sentence completion 1 & 2 */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  Complete the sentences:
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center gap-2 text-sm">
                  <span>1. {part6Data.sentenceCompletions[0].prompt}</span>
                  <input
                    type="text"
                    value={p6Input1}
                    onChange={(e) => setP6Input1(e.target.value)}
                    placeholder="word..."
                    className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold text-xs"
                  />
                  <span>.</span>
                  <button
                    onClick={() =>
                      handleP6CheckAnswer(p6Input1, part6Data.sentenceCompletions[0].acceptableAnswers)
                    }
                    className="ml-auto px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Check
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center gap-2 text-sm">
                  <span>2. {part6Data.sentenceCompletions[1].prompt}</span>
                  <input
                    type="text"
                    value={p6Input2}
                    onChange={(e) => setP6Input2(e.target.value)}
                    placeholder="word..."
                    className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold text-xs"
                  />
                  <span>.</span>
                  <button
                    onClick={() =>
                      handleP6CheckAnswer(p6Input2, part6Data.sentenceCompletions[1].acceptableAnswers)
                    }
                    className="ml-auto px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Check
                  </button>
                </div>
              </div>

              {/* Open question 3 & 4 */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  Answer the questions:
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center gap-2 text-sm">
                  <span>3. {part6Data.questions[0].question}</span>
                  <input
                    type="text"
                    value={p6Input3}
                    onChange={(e) => setP6Input3(e.target.value)}
                    placeholder="Answer in English..."
                    className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold text-xs flex-1 min-w-[140px]"
                  />
                  <button
                    onClick={() =>
                      handleP6CheckAnswer(p6Input3, part6Data.questions[0].acceptableAnswers)
                    }
                    className="ml-auto px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Check
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center gap-2 text-sm">
                  <span>4. {part6Data.questions[1].question}</span>
                  <input
                    type="text"
                    value={p6Input4}
                    onChange={(e) => setP6Input4(e.target.value)}
                    placeholder="Answer in English..."
                    className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-bold text-xs flex-1 min-w-[140px]"
                  />
                  <button
                    onClick={() =>
                      handleP6CheckAnswer(p6Input4, part6Data.questions[1].acceptableAnswers)
                    }
                    className="ml-auto px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Check
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* LISTENING: Audio Choice */}
          {/* ========================================================================= */}
          {activeTab === 'listening_part4' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">
                    Movers Listening Test
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    Listen and tick (✓) the box.
                  </h3>
                </div>

                <button
                  onClick={() => handleSpeak(listeningQ.audioScript)}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg flex items-center gap-2 text-xs font-black animate-pulse"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Play Listening Audio</span>
                </button>
              </div>

              {/* Audio Prompt Box */}
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl flex-shrink-0">
                  🎧
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{listeningQ.prompt}</div>
                  <div className="text-xs text-indigo-300 mt-0.5">
                    Click the Play button above to hear the native English audio recording.
                  </div>
                </div>
              </div>

              {/* 3 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {listeningQ.options.map((opt) => {
                  const isPicked = listeningSelected === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleListeningAnswer(opt.key)}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                        isPicked
                          ? 'bg-amber-500/20 border-amber-400 shadow-xl scale-105'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-sm">
                        {opt.key}
                      </span>
                      <span className="text-5xl my-3">{opt.emoji}</span>
                      <span className="text-base font-bold text-white">{opt.label}</span>
                      <span className="text-xs text-slate-300 mt-1">{opt.detail}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SPEAKING: Find the Differences */}
          {/* ========================================================================= */}
          {activeTab === 'speaking_differences' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Speaking Test: Find the Differences ({SPEAKING_DIFFERENCES[diffIndex].theme})
                  </h3>
                  <span className="text-xs font-bold text-amber-400">
                    Found: {foundDiffIds.length}/4 Differences
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Click each difference item to hear and practise the authentic Cambridge model speaking
                  response: "In picture 1..., but in picture 2..."
                </p>
              </div>

              {/* Side by side scene cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/80 border-2 border-slate-700">
                  <div className="text-xs font-black uppercase text-indigo-300 mb-2">Picture 1</div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {SPEAKING_DIFFERENCES[diffIndex].picture1Description}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/80 border-2 border-slate-700">
                  <div className="text-xs font-black uppercase text-amber-300 mb-2">Picture 2</div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {SPEAKING_DIFFERENCES[diffIndex].picture2Description}
                  </p>
                </div>
              </div>

              {/* Interactive differences checklist */}
              <div className="space-y-2.5">
                <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Spot Differences & Speak Aloud:
                </div>
                {SPEAKING_DIFFERENCES[diffIndex].differences.map((diff) => {
                  const isFound = foundDiffIds.includes(diff.id);
                  return (
                    <button
                      key={diff.id}
                      onClick={() => handleToggleDiff(diff.id, diff.modelSentence)}
                      className={`w-full p-4 rounded-2xl border-2 text-left flex items-start justify-between gap-3 transition-all ${
                        isFound
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{isFound ? '✅' : '🔍'}</span>
                        <div>
                          <div className="font-bold text-sm text-white">{diff.item}</div>
                          <div className="text-xs text-indigo-300 italic mt-0.5">
                            "{diff.modelSentence}"
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold flex-shrink-0">
                        <Volume2 className="w-4 h-4" />
                        <span>Speak</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SPEAKING: Odd-One-Out */}
          {/* ========================================================================= */}
          {activeTab === 'speaking_odd_one_out' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Speaking Test: Odd-One-Out (Which is different and why?)
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Look at the four pictures. One picture is different. Choose which one and explain
                  why!
                </p>
              </div>

              {/* 4 Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {SPEAKING_ODD_ONE_OUT[oddIndex].items.map((item, idx) => {
                  const isSelected = oddSelectedIdx === idx;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleOddSelect(idx)}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                        isSelected
                          ? item.isOdd
                            ? 'bg-emerald-500/20 border-emerald-400 shadow-xl scale-105'
                            : 'bg-rose-500/20 border-rose-400'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <span className="text-5xl my-2">{item.emoji}</span>
                      <span className="font-black text-white text-base mt-1">{item.name}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{item.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Teacher Explanation Card */}
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3.5">
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="text-xs font-black uppercase text-amber-300">
                    Cambridge Examiner Model Response:
                  </div>
                  <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                    "{SPEAKING_ODD_ONE_OUT[oddIndex].explanation}"
                  </p>
                  <button
                    onClick={() => handleSpeak(SPEAKING_ODD_ONE_OUT[oddIndex].explanation)}
                    className="mt-2 text-xs text-indigo-300 hover:text-white font-bold flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen to Model Answer</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Cambridge English A1 Movers</span>
            <span>•</span>
            <span className="text-amber-400">Collect blocks to craft your voxel world</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-md transition-all active:scale-95"
          >
            Back to 3D World
          </button>
        </div>
      </div>
    </div>
  );
};
