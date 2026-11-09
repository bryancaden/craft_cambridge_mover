import {
  BlockType,
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

// Cambridge Movers A1 Vocabulary Bank with Categories and Emojis
export const MOVERS_VOCABULARY = [
  { word: 'a balcony', category: 'Places', emoji: '🏢', hint: 'You can sit outside on this part of a flat.' },
  { word: 'a dentist', category: 'Jobs', emoji: '🦷', hint: 'When you see this person, he or she looks at your teeth.' },
  { word: 'a milkshake', category: 'Food & Drink', emoji: '🥤', hint: 'This cold, sweet drink sometimes has fruit in it.' },
  { word: 'coffee', category: 'Food & Drink', emoji: '☕', hint: 'Some people put milk in this hot brown drink.' },
  { word: 'a shower', category: 'Home', emoji: '🚿', hint: 'You stand under this when you want to wash your body.' },
  { word: 'a lamp', category: 'Home', emoji: '🛋️', hint: 'You turn this on in your bedroom when it is dark.' },
  { word: 'a salad', category: 'Food & Drink', emoji: '🥗', hint: 'This has lots of green vegetables in it, but you do not cook it.' },
  { word: 'a nurse', category: 'Jobs', emoji: '👩‍⚕️', hint: 'This person helps people who are not well in hospital.' },
  { word: 'a farmer', category: 'Jobs', emoji: '👨‍🌾', hint: 'This person works outside in the fields and takes care of animals.' },
  { word: 'a circus', category: 'Places', emoji: '🎪', hint: 'People go there to have fun and you can see funny clowns and acrobats.' },
  { word: 'toothpaste', category: 'Health', emoji: '🪥', hint: 'You need this in the bathroom in the morning and at night to clean teeth.' },
  { word: 'cheese', category: 'Food & Drink', emoji: '🧀', hint: 'Farmers sometimes make this yellow food from cow or goat milk.' },
  { word: 'a field', category: 'Nature', emoji: '🌾', hint: 'Some animals like sheep and cows live and eat grass in this.' },
  { word: 'a zoo', category: 'Places', emoji: '🦁', hint: 'Animals like pandas, penguins and kangaroos sometimes live here.' },
  { word: 'a supermarket', category: 'Places', emoji: '🛒', hint: 'You can buy vegetables, fruit, and other kinds of food from this big shop.' },
  { word: 'a playground', category: 'Places', emoji: '🛝', hint: 'Children run, shout, and play fun games in this outdoor area.' },
  { word: 'a cinema', category: 'Places', emoji: '🎬', hint: 'People go to this dark place to watch movies on a big screen.' },
  { word: 'a library', category: 'Places', emoji: '📚', hint: 'People can read interesting books here or borrow them to take home.' },
  { word: 'a mountain', category: 'Nature', emoji: '⛰️', hint: 'Some people like climbing these and you can often see snow on top.' },
  { word: 'a forest', category: 'Nature', emoji: '🌲', hint: 'There are always lots of tall green trees and wild animals in this place.' },
  { word: 'a doctor', category: 'Jobs', emoji: '👨‍⚕️', hint: 'This person works in a hospital or clinic with people who are sick.' },
  { word: 'a film star', category: 'Jobs', emoji: '🌟', hint: 'This famous person acts in movies and television shows.' },
  { word: 'a snail', category: 'Animals', emoji: '🐌', hint: 'This small slow animal can hide inside its hard round shell.' },
  { word: 'a dolphin', category: 'Animals', emoji: '🐬', hint: 'This clever sea animal swims fast and likes jumping out of waves.' },
  { word: 'a kangaroo', category: 'Animals', emoji: '🦘', hint: 'This animal carries its baby in a pouch and hops very high in Australia.' },
  { word: 'a bat', category: 'Animals', emoji: '🦇', hint: 'These animals can fly and sleep upside down in dark caves during the day.' },
  { word: 'a picnic', category: 'Activities', emoji: '🧺', hint: 'You sit on a blanket and eat sandwiches outside in the park or beach.' },
  { word: 'a sports centre', category: 'Places', emoji: '🏸', hint: 'You can play basketball, badminton, or go swimming in this building.' },
  { word: 'noodles', category: 'Food & Drink', emoji: '🍜', hint: 'These are long and thin and you eat them in a bowl with chopsticks or a fork.' },
  { word: 'pancakes', category: 'Food & Drink', emoji: '🥞', hint: 'You cook these flat cakes in a frying pan and put sweet syrup on them.' },
  { word: 'a plate', category: 'Home', emoji: '🍽️', hint: 'This is often round and people put their dinner food on it.' },
  { word: 'a cup', category: 'Home', emoji: '☕', hint: 'You drink your warm tea or coffee from this small container with a handle.' },
  { word: 'a funfair', category: 'Places', emoji: '🎡', hint: 'You can ride a big wheel, rollercoasters, and play games with friends here.' },
  { word: 'a towel', category: 'Home', emoji: '🧖', hint: 'You use this soft cloth to dry yourself after swimming or taking a bath.' },
];

// Helper to shuffle arrays
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// -------------------------------------------------------------
// PART 1: Reading & Writing (Look, read, match definitions)
// -------------------------------------------------------------
export function generatePart1Questions(): Part1Question[] {
  const shuffledVocab = shuffle(MOVERS_VOCABULARY);
  const selectedTargets = shuffledVocab.slice(0, 5);

  return selectedTargets.map((target, idx) => {
    // Pick 3 distractors
    const distractors = shuffledVocab
      .filter((v) => v.word !== target.word)
      .slice(0, 3);
    const options = shuffle([target, ...distractors]);

    const blockRewards: BlockType[] = ['wood', 'leaves', 'stone', 'brick', 'flower_red'];

    return {
      id: `p1-${idx}-${Date.now()}`,
      definition: target.hint,
      correctWord: target.word,
      options,
      rewardBlocks: {
        type: blockRewards[idx % blockRewards.length],
        count: 4,
      },
    };
  });
}

// -------------------------------------------------------------
// PART 2: Reading & Writing (Conversational Dialogues)
// Authentic Cambridge format: choose best response A, B, or C
// -------------------------------------------------------------
const PART2_DIALOGUE_POOL = [
  {
    speakerA: 'Fred',
    lineA: 'Our new kitten is so funny!',
    speakerB: 'Vicky',
    options: [
      { key: 'A', text: 'Do they laugh?' },
      { key: 'B', text: 'Is it?' },
      { key: 'C', text: 'Are those new?' },
    ],
    correctKey: 'B',
    explanation: "We use 'Is it?' as an active listening response to 'Our kitten is so funny!'.",
    reward: 'stone',
  },
  {
    speakerA: 'Vicky',
    lineA: 'Why is your kitten funny?',
    speakerB: 'Fred',
    options: [
      { key: 'A', text: 'You all smiled.' },
      { key: 'B', text: 'It loves hiding in boxes.' },
      { key: 'C', text: "I can't tell them." },
    ],
    correctKey: 'B',
    explanation: "'Why' asks for a reason or behavior, so 'It loves hiding' explains why it is funny.",
    reward: 'wood',
  },
  {
    speakerA: 'Vicky',
    lineA: 'Does your kitten like playing games?',
    speakerB: 'Fred',
    options: [
      { key: 'A', text: "Yes, that's right." },
      { key: 'B', text: "No, I can't today." },
      { key: 'C', text: "OK, let's do that." },
    ],
    correctKey: 'A',
    explanation: "'Yes, that's right' directly answers a yes/no question about someone's pet.",
    reward: 'brick',
  },
  {
    speakerA: 'Fred',
    lineA: 'How old is your puppy now, Vicky?',
    speakerB: 'Vicky',
    options: [
      { key: 'A', text: "It's the biggest one." },
      { key: 'B', text: 'Twelve weeks.' },
      { key: 'C', text: "It's great, thanks." },
    ],
    correctKey: 'B',
    explanation: "'How old' asks for age, so 'Twelve weeks' is the correct numerical age answer.",
    reward: 'gold',
  },
  {
    speakerA: 'Fred',
    lineA: "I'd like to have another pet.",
    speakerB: 'Vicky',
    options: [
      { key: 'A', text: 'Me too!' },
      { key: 'B', text: 'How often?' },
      { key: 'C', text: 'Well done!' },
    ],
    correctKey: 'A',
    explanation: "We use 'Me too!' to agree with someone expressing a personal desire or wish.",
    reward: 'diamond',
  },
  {
    speakerA: 'Paul',
    lineA: 'What did you do at the weekend, Jack?',
    speakerB: 'Jack',
    options: [
      { key: 'A', text: 'I went to the new sports centre.' },
      { key: 'B', text: 'I like the new sports centre.' },
      { key: 'C', text: "I'm at the new sports centre." },
    ],
    correctKey: 'A',
    explanation: "'What did you do' is in past tense, so 'I went...' correctly answers in past simple.",
    reward: 'wood',
  },
  {
    speakerA: 'Paul',
    lineA: 'Where is the new sports centre?',
    speakerB: 'Jack',
    options: [
      { key: 'A', text: "It's very big." },
      { key: 'B', text: 'We saw it on the map.' },
      { key: 'C', text: "It's opposite the station." },
    ],
    correctKey: 'C',
    explanation: "'Where is...' asks for location. 'Opposite the station' gives the precise place.",
    reward: 'stone',
  },
  {
    speakerA: 'Paul',
    lineA: 'I love doing sport.',
    speakerB: 'Jack',
    options: [
      { key: 'A', text: "That's right." },
      { key: 'B', text: 'Me too.' },
      { key: 'C', text: 'Come on.' },
    ],
    correctKey: 'B',
    explanation: "'Me too' agrees with 'I love doing sport'.",
    reward: 'brick',
  },
  {
    speakerA: 'Paul',
    lineA: "Let's go to that sports centre this afternoon!",
    speakerB: 'Jack',
    options: [
      { key: 'A', text: 'Good idea!' },
      { key: 'B', text: "I'm better!" },
      { key: 'C', text: 'Well done!' },
    ],
    correctKey: 'A',
    explanation: "'Good idea!' is the natural enthusiastic response to a suggestion with 'Let's'.",
    reward: 'lantern',
  },
  {
    speakerA: 'Paul',
    lineA: 'Shall I ask my mum to drive us there?',
    speakerB: 'Jack',
    options: [
      { key: 'A', text: 'Yes, I am.' },
      { key: 'B', text: 'Is she?' },
      { key: 'C', text: 'OK, thanks.' },
    ],
    correctKey: 'C',
    explanation: "When someone offers a favor ('Shall I ask...'), we politely say 'OK, thanks.'",
    reward: 'diamond',
  },
  {
    speakerA: 'Julia',
    lineA: 'Was it your brother’s birthday yesterday?',
    speakerB: 'Jack',
    options: [
      { key: 'A', text: 'Yes, he was.' },
      { key: 'B', text: "That's right." },
      { key: 'C', text: 'Happy Birthday!' },
    ],
    correctKey: 'B',
    explanation: "'That's right' confirms a factual yes/no question about an event.",
    reward: 'bookshelf',
  },
  {
    speakerA: 'Julia',
    lineA: 'What present did you give your brother?',
    speakerB: 'Jack',
    options: [
      { key: 'A', text: 'He gave it to me.' },
      { key: 'B', text: 'Here you are.' },
      { key: 'C', text: 'A book that he really wanted.' },
    ],
    correctKey: 'C',
    explanation: "'What present did you give...' asks for the gift item: 'A book that he really wanted'.",
    reward: 'glass',
  },
];

export function generatePart2Questions(): Part2Question[] {
  const chosen = shuffle(PART2_DIALOGUE_POOL).slice(0, 6);
  return chosen.map((item, i) => ({
    id: `p2-${i}-${Date.now()}`,
    speakerA: item.speakerA,
    lineA: item.lineA,
    speakerB: item.speakerB,
    options: item.options as { key: 'A' | 'B' | 'C'; text: string }[],
    correctKey: item.correctKey as 'A' | 'B' | 'C',
    explanation: item.explanation,
    rewardBlocks: {
      type: (item.reward as BlockType) || 'stone',
      count: 3,
    },
  }));
}

// -------------------------------------------------------------
// PART 3: Reading & Writing (Story Cloze & Title Choice)
// -------------------------------------------------------------
const PART3_STORY_POOL: Part3Story[] = [
  {
    id: 'p3-story-zoe',
    titlePrompt: 'Read the story. Choose a word from the box for each number 1-5.',
    storySegments: [
      { textBefore: 'Zoe is the youngest of three girls in her family. Last Sunday Zoe’s family had a great day. They ' },
      { textBefore: '', blankNumber: 1, correctWord: 'drove' },
      { textBefore: ' to the forest, went for a very ' },
      { textBefore: '', blankNumber: 2, correctWord: 'long' },
      { textBefore: ' walk and had a picnic. Then Zoe’s dad read his book and mother slept. Zoe climbed a tall tree and saw lots of big, black ' },
      { textBefore: '', blankNumber: 3, correctWord: 'clouds' },
      { textBefore: ' above the mountains. "Oh no! Rain!" she ' },
      { textBefore: '', blankNumber: 4, correctWord: 'shouted' },
      { textBefore: '. She ran to the car. When they put the ' },
      { textBefore: '', blankNumber: 5, correctWord: 'glasses' },
      { textBefore: ' and bowls back in the picnic bag, Zoe smiled. "They are all listening to me!" she thought.' },
    ],
    wordBank: [
      { word: 'drove', emoji: '🚗', hint: 'Past tense of drive' },
      { word: 'long', emoji: '🛤️', hint: 'Not short' },
      { word: 'clouds', emoji: '☁️', hint: 'Dark shapes in the sky before rain' },
      { word: 'shouted', emoji: '🗣️', hint: 'Spoke very loudly' },
      { word: 'glasses', emoji: '🥛', hint: 'Things you drink from' },
      { word: 'crying', emoji: '😭', hint: 'Tears coming down' },
      { word: 'strong', emoji: '💪', hint: 'Having lots of muscle' },
    ],
    titleOptions: ["The baby's favourite tree", 'What a windy day!', 'Zoe helps her family'],
    correctTitleIndex: 2,
    rewardBlocks: { type: 'brick', count: 8 },
  },
  {
    id: 'p3-story-doc-brown',
    titlePrompt: 'Read the story. Choose a word from the box for each number 1-5.',
    storySegments: [
      { textBefore: 'Doctor Brown had a nice new car and he loved driving it to the hospital every morning. Last Tuesday, the ' },
      { textBefore: '', blankNumber: 1, correctWord: 'weather' },
      { textBefore: ' was terrible with strong wind and rain. Doctor Brown saw people at the bus stop. He told them: "Don’t ' },
      { textBefore: '', blankNumber: 2, correctWord: 'wait' },
      { textBefore: ' for the bus this morning! I can take you to work." One passenger worked at the ' },
      { textBefore: '', blankNumber: 3, correctWord: 'supermarket' },
      { textBefore: ' and others worked at the library. Doctor Brown ' },
      { textBefore: '', blankNumber: 4, correctWord: 'laughed' },
      { textBefore: ' and said: "Today I am not a doctor. I am a bus ' },
      { textBefore: '', blankNumber: 5, correctWord: 'driver' },
      { textBefore: '!"' },
    ],
    wordBank: [
      { word: 'weather', emoji: '🌦️', hint: 'Rain, wind, or sun' },
      { word: 'wait', emoji: '⏱️', hint: 'Stay until something arrives' },
      { word: 'supermarket', emoji: '🏬', hint: 'A store with lots of food' },
      { word: 'laughed', emoji: '😄', hint: 'Smiled and made a happy sound' },
      { word: 'driver', emoji: '🚌', hint: 'A person who steers a vehicle' },
      { word: 'tickets', emoji: '🎫', hint: 'Paper passes for buses' },
      { word: 'snowed', emoji: '❄️', hint: 'White cold flakes fell' },
    ],
    titleOptions: ["Doctor Brown's new nurse", "Doctor Brown's best breakfast", "Doctor Brown's busy morning"],
    correctTitleIndex: 2,
    rewardBlocks: { type: 'brick', count: 8 },
  },
  {
    id: 'p3-story-donkey',
    titlePrompt: 'Read about Dan the donkey. Choose a word from the box for each number 1-5.',
    storySegments: [
      { textBefore: 'Julia’s family had a pet donkey called Dan. The family didn’t ride Dan. He had fun in their field and ate the ' },
      { textBefore: '', blankNumber: 1, correctWord: 'grass' },
      { textBefore: ' that grew there. Julia gave him apples every morning. But last Friday, the donkey didn’t ' },
      { textBefore: '', blankNumber: 2, correctWord: 'run' },
      { textBefore: ' to her. "Are you ill?" asked Julia. Her father said, "Don’t worry! Dan isn’t ' },
      { textBefore: '', blankNumber: 3, correctWord: 'hungry' },
      { textBefore: ' because he ate all the pears on Mrs Cook’s tree last night!" Mum said, "Mrs Cook was ' },
      { textBefore: '', blankNumber: 4, correctWord: 'angry' },
      { textBefore: ', so let’s take her a carrot ' },
      { textBefore: '', blankNumber: 5, correctWord: 'pie' },
      { textBefore: ' and say sorry!" Julia laughed.' },
    ],
    wordBank: [
      { word: 'grass', emoji: '🌱', hint: 'Green plants in fields' },
      { word: 'run', emoji: '🏃', hint: 'Move legs quickly' },
      { word: 'hungry', emoji: '🍕', hint: 'Wanting food' },
      { word: 'angry', emoji: '😠', hint: 'Not happy, cross' },
      { word: 'pie', emoji: '🥧', hint: 'Baked sweet pastry' },
      { word: 'shout', emoji: '📣', hint: 'Speak loudly' },
      { word: 'farm', emoji: '🚜', hint: 'Country place with animals' },
    ],
    titleOptions: ['Dan and the pear tree', "Mrs Cook's pet donkey", "Julia's very good idea"],
    correctTitleIndex: 0,
    rewardBlocks: { type: 'bookshelf', count: 8 },
  },
];

export function generatePart3Story(): Part3Story {
  const selected = PART3_STORY_POOL[Math.floor(Math.random() * PART3_STORY_POOL.length)];
  return {
    ...selected,
    id: `p3-${Date.now()}`,
  };
}

// -------------------------------------------------------------
// PART 4: Reading & Writing (Grammar Cloze - 3 Choices)
// Informational texts: Animals, Nature, Science
// -------------------------------------------------------------
const PART4_GRAMMAR_POOL: Part4Grammar[] = [
  {
    id: 'p4-dolphins',
    topic: 'Dolphins',
    intro: 'Dolphins are like small whales and some of them have more than 100 teeth! Dolphins do not need to drink because...',
    blanks: [
      {
        blankNumber: 1,
        sentenceWithBlank: 'drink because _____ is lots of water in the fish that they eat.',
        options: ['where', 'here', 'there'],
        correctAnswer: 'there',
        explanation: "We use 'there is' to state the existence of something ('there is lots of water').",
      },
      {
        blankNumber: 2,
        sentenceWithBlank: 'Dolphins sometimes play _____ people in the water and swim in front of boats.',
        options: ['to', 'with', 'from'],
        correctAnswer: 'with',
        explanation: "The preposition 'play with' expresses doing an activity together with someone.",
      },
      {
        blankNumber: 3,
        sentenceWithBlank: 'Dolphins _____ in the sea in families.',
        options: ['lived', 'living', 'live'],
        correctAnswer: 'live',
        explanation: "Present simple plural verb 'live' is used for general scientific facts.",
      },
      {
        blankNumber: 4,
        sentenceWithBlank: 'and the parents teach _____ babies to catch fish.',
        options: ['they', 'them', 'their'],
        correctAnswer: 'their',
        explanation: "'Their' is the possessive adjective modifying 'babies' (belonging to the parents).",
      },
      {
        blankNumber: 5,
        sentenceWithBlank: 'Dolphins cannot say words, _____ they can sing and whistle.',
        options: ['but', 'and', 'or'],
        correctAnswer: 'but',
        explanation: "'But' connects contrasting ideas (cannot say words vs can sing).",
      },
    ],
    rewardBlocks: { type: 'gold', count: 6 },
  },
  {
    id: 'p4-bats',
    topic: 'Bats',
    intro: 'Bats are small animals that can fly. There are many different kinds of bat in the world.',
    blanks: [
      {
        blankNumber: 1,
        sentenceWithBlank: 'Some live in jungles, some live in trees _____ inside houses.',
        options: ['because', 'or', 'when'],
        correctAnswer: 'or',
        explanation: "'Or' presents alternative living locations (in trees OR inside houses).",
      },
      {
        blankNumber: 2,
        sentenceWithBlank: 'but you do not often see _____ in the daytime.',
        options: ['it', 'him', 'them'],
        correctAnswer: 'them',
        explanation: "Bats are plural, so we use object pronoun 'them'.",
      },
      {
        blankNumber: 3,
        sentenceWithBlank: 'Bats cannot see very well with _____ eyes.',
        options: ['its', 'their', 'our'],
        correctAnswer: 'their',
        explanation: "'Their' is the plural possessive pronoun for bats.",
      },
      {
        blankNumber: 4,
        sentenceWithBlank: 'but they are all very good _____ flying quickly.',
        options: ['to', 'at', 'in'],
        correctAnswer: 'at',
        explanation: "The collocation is 'good at' + verb-ing.",
      },
      {
        blankNumber: 5,
        sentenceWithBlank: 'They drink juice that they _____ in flowers.',
        options: ['find', 'finds', 'finding'],
        correctAnswer: 'find',
        explanation: "Plural subject 'they' takes the base verb 'find' in present simple.",
      },
    ],
    rewardBlocks: { type: 'gold', count: 6 },
  },
  {
    id: 'p4-blue-whales',
    topic: 'Blue Whales',
    intro: 'Some blue whales are longer than three buses! They are the largest animals in the world.',
    blanks: [
      {
        blankNumber: 1,
        sentenceWithBlank: 'They eat the very smallest animals in the sea and _____ fish eggs, too.',
        options: ['first', 'here', 'sometimes'],
        correctAnswer: 'sometimes',
        explanation: "'Sometimes' is an adverb of frequency showing how often they eat fish eggs.",
      },
      {
        blankNumber: 2,
        sentenceWithBlank: 'Blue whales live in cold seas most _____ the year.',
        options: ['with', 'of', 'at'],
        correctAnswer: 'of',
        explanation: "The set phrase is 'most of the year'.",
      },
      {
        blankNumber: 3,
        sentenceWithBlank: 'When there is ice on the water, _____ whales swim to another warmer part.',
        options: ['these', 'both', 'lots'],
        correctAnswer: 'these',
        explanation: "'These whales' refers back to the whales mentioned earlier.",
      },
      {
        blankNumber: 4,
        sentenceWithBlank: 'There, they _____ until the warm weather returns.',
        options: ['wait', 'waited', 'waiting'],
        correctAnswer: 'wait',
        explanation: "Present simple 'wait' follows subject 'they' for general habits.",
      },
      {
        blankNumber: 5,
        sentenceWithBlank: 'They have a kind of moustache inside _____ mouths.',
        options: ['theirs', 'them', 'their'],
        correctAnswer: 'their',
        explanation: "Possessive adjective 'their' is followed by noun 'mouths'.",
      },
    ],
    rewardBlocks: { type: 'diamond', count: 6 },
  },
  {
    id: 'p4-the-jungle',
    topic: 'The Jungle',
    intro: 'A jungle is a kind of warm, wet forest. In jungles the weather is hot and it often rains.',
    blanks: [
      {
        blankNumber: 1,
        sentenceWithBlank: 'The _____ jungle in the world is called the Amazon.',
        options: ['largest', 'larger', 'large'],
        correctAnswer: 'largest',
        explanation: "'The' takes the superlative form 'largest'.",
      },
      {
        blankNumber: 2,
        sentenceWithBlank: 'It is difficult to walk in the jungle _____ the leaves are so big.',
        options: ['because', 'than', 'or'],
        correctAnswer: 'because',
        explanation: "'Because' introduces the reason why walking is difficult.",
      },
      {
        blankNumber: 3,
        sentenceWithBlank: 'Tigers, snakes, and monkeys are some animals _____ live there.',
        options: ['who', 'which', 'what'],
        correctAnswer: 'which',
        explanation: "'Which' is the relative pronoun used for animals and things.",
      },
      {
        blankNumber: 4,
        sentenceWithBlank: '_____ jungle animals live above the ground in high tree branches.',
        options: ['Another', 'Every', 'Many'],
        correctAnswer: 'Many',
        explanation: "'Many' is followed by a plural countable noun ('jungle animals').",
      },
      {
        blankNumber: 5,
        sentenceWithBlank: 'In some jungles, there are colorful frogs that can _____ between the trees!',
        options: ['flew', 'flying', 'fly'],
        correctAnswer: 'fly',
        explanation: "Modal verb 'can' is followed by base verb 'fly'.",
      },
    ],
    rewardBlocks: { type: 'gold', count: 6 },
  },
];

export function generatePart4Grammar(): Part4Grammar {
  const selected = PART4_GRAMMAR_POOL[Math.floor(Math.random() * PART4_GRAMMAR_POOL.length)];
  return {
    ...selected,
    id: `p4-${Date.now()}`,
  };
}

// -------------------------------------------------------------
// PART 5: Story Comprehension (Fill 1-3 words from text)
// -------------------------------------------------------------
const PART5_STORIES_POOL: Part5StoryComp[] = [
  {
    id: 'p5-fishing',
    title: 'Fishing in the lake',
    text: `Sally and her brother, Peter, live next to a lake and they love swimming and fishing in it. They often fish from the end of their garden, but last Saturday, they went fishing in another part of the lake. But there were no fish there.

'This is boring,' Sally said. She put her fishing things down and took off her shoes. Then she put her feet in the water because it was a hot and sunny day.

'Sally, look!' Peter said. 'I think I can see a lake monster!' Sally jumped up to look, but when she did that, she dropped her orange shoes in the water! Sally was angry with Peter because there was no monster. Peter looked down and could see Sally's orange shoes at the bottom of the lake.

'Well, let's try to catch your shoes now!' Peter said. He fished them out of the water with his fishing rod. Sally was happy again. When they got home, Mum was in the kitchen. She laughed when Peter said: 'Yes, we caught two Orange Shoe Fish!'`,
    questions: [
      {
        id: 'q1',
        leadSentence: 'Sally stopped fishing because there were',
        targetEnding: 'in the water that day.',
        acceptableAnswers: ['no fish', 'not any fish', 'zero fish'],
        hint: 'What was missing in the water that day? (2 words)',
      },
      {
        id: 'q2',
        leadSentence: 'Because it was hot and sunny, Sally put her',
        targetEnding: 'in the lake.',
        acceptableAnswers: ['feet', 'two feet'],
        hint: 'What did Sally dip into the lake to cool down?',
      },
      {
        id: 'q3',
        leadSentence: 'Peter said he saw a',
        targetEnding: 'in the water.',
        acceptableAnswers: ['lake monster', 'monster'],
        hint: 'What did Peter jokingly say he saw?',
      },
      {
        id: 'q4',
        leadSentence: 'When she jumped up, Sally dropped her',
        targetEnding: 'in the lake.',
        acceptableAnswers: ['shoes', 'orange shoes', 'her shoes'],
        hint: 'What fell into the water when she jumped up?',
      },
      {
        id: 'q5',
        leadSentence: 'Sally was angry because her shoes were at the',
        targetEnding: 'of the lake.',
        acceptableAnswers: ['bottom'],
        hint: 'Where did the shoes sink down to?',
      },
      {
        id: 'q6',
        leadSentence: 'Sally was',
        targetEnding: 'when Peter fished her shoes out.',
        acceptableAnswers: ['happy again', 'happy'],
        hint: 'How did Sally feel after getting her shoes back?',
      },
      {
        id: 'q7',
        leadSentence: 'Mum was in the',
        targetEnding: 'when the children came home.',
        acceptableAnswers: ['kitchen'],
        hint: 'Which room of the house was Mum in?',
      },
    ],
    rewardBlocks: { type: 'glass', count: 8 },
  },
  {
    id: 'p5-charlie-car',
    title: "Where's our car?",
    text: `Dad and Zoe live in the city. Last Saturday, they drove into the big car park under the shopping centre. Then they walked to the sports shop. Zoe needed a new swimsuit and she found one that was really pretty. Dad bought a new tennis racket there, too. Then they had lunch in a nice café. They had pasta with tomato sauce.

Then they bought lots of vegetables from the supermarket, and got some new books from the library. At the end of the day, they had lots of bags to carry back to the car park.

'Where's our car?' Zoe asked. 'I don't know!' said Dad. 'There are hundreds of cars here now!' They walked up and down the car park but couldn't find it.

'Look! There's a blue parrot on the roof of one car!' Zoe said. 'That's OUR car. Hooray!' Dad answered. 'What a clever parrot!' The parrot said 'Happy to help!' and then flew off.`,
    questions: [
      {
        id: 'cq1',
        leadSentence: 'Zoe found a pretty',
        targetEnding: 'in the sports shop.',
        acceptableAnswers: ['swimsuit', 'new swimsuit'],
        hint: 'What piece of swimming clothes did Zoe buy?',
      },
      {
        id: 'cq2',
        leadSentence: 'They went to a café for their',
        targetEnding: '.',
        acceptableAnswers: ['lunch', 'food'],
        hint: 'What meal did they eat in the café?',
      },
      {
        id: 'cq3',
        leadSentence: 'Zoe had some',
        targetEnding: 'with her pasta.',
        acceptableAnswers: ['tomato sauce'],
        hint: 'What kind of red sauce was on the pasta?',
      },
      {
        id: 'cq4',
        leadSentence: 'Zoe and Dad had to carry',
        targetEnding: 'back to the car park.',
        acceptableAnswers: ['lots of bags', 'many bags', 'bags'],
        hint: 'What were they carrying at the end of shopping?',
      },
      {
        id: 'cq5',
        leadSentence: 'They could not find their car because there were',
        targetEnding: 'in the car park.',
        acceptableAnswers: ['hundreds of cars', 'lots of cars', 'many cars'],
        hint: 'Why was the car difficult to find?',
      },
      {
        id: 'cq6',
        leadSentence: 'A blue parrot was sitting on the',
        targetEnding: "of Dad's car.",
        acceptableAnswers: ['roof', 'top'],
        hint: 'What part of the car was the parrot on?',
      },
    ],
    rewardBlocks: { type: 'diamond', count: 8 },
  },
];

export function generatePart5Story(): Part5StoryComp {
  const selected = PART5_STORIES_POOL[Math.floor(Math.random() * PART5_STORIES_POOL.length)];
  return {
    ...selected,
    id: `p5-${Date.now()}`,
  };
}

// -------------------------------------------------------------
// PART 6: Look, Read and Write (Sentence completions & writing)
// -------------------------------------------------------------
const PART6_SCENES_POOL: Part6PicWrite[] = [
  {
    id: 'p6-beach-pirates',
    sceneTitle: 'Pirate Island Beach',
    sceneDescription: 'A sunny beach on an island with palm trees, a red sailing ship, a friendly dolphin jumping in the waves, a sleeping pirate in a hammock, and a monkey holding watermelon.',
    sceneSvgType: 'beach',
    sentenceCompletions: [
      {
        prompt: 'The monkey on the sand is holding a slice of',
        acceptableAnswers: ['watermelon', 'melon', 'fruit'],
        hint: 'Look at the green and red fruit in the monkey’s hand.',
      },
      {
        prompt: 'There is a big dolphin jumping out of the',
        acceptableAnswers: ['water', 'sea', 'waves'],
        hint: 'Where is the dolphin jumping from?',
      },
    ],
    questions: [
      {
        question: 'What is the weather like on the island?',
        acceptableAnswers: ['sunny', 'it is sunny', 'hot and sunny', 'nice and sunny', 'hot'],
        hint: 'Look at the bright sun in the sky.',
      },
      {
        question: 'Where is the boy sleeping?',
        acceptableAnswers: ['in a hammock', 'between the trees', 'between two palm trees', 'in the hammock'],
        hint: 'What is hanging between the two palm trees?',
      },
    ],
    rewardBlocks: { type: 'lantern', count: 6 },
  },
  {
    id: 'p6-farm-snow',
    sceneTitle: 'Snowy Farm Day',
    sceneDescription: 'A winter farm covered with white snow. A red tractor is driving in the field, cows drink water, a girl ice skates with a pet rabbit, and a boy feeds small brown chickens.',
    sceneSvgType: 'farm',
    sentenceCompletions: [
      {
        prompt: 'The boy in the warm blue coat is feeding the',
        acceptableAnswers: ['chickens', 'birds', 'hens'],
        hint: 'What small farm birds are picking grains from the ground?',
      },
      {
        prompt: 'The farmer is driving a red',
        acceptableAnswers: ['tractor', 'car'],
        hint: 'What big agricultural vehicle is in the field?',
      },
    ],
    questions: [
      {
        question: 'What are the girl and the rabbit doing on the frozen lake?',
        acceptableAnswers: ['ice skating', 'skating', 'playing on ice'],
        hint: 'They have skates on their feet.',
      },
      {
        question: 'What is on the ground everywhere?',
        acceptableAnswers: ['snow', 'white snow'],
        hint: 'What cold white weather covers the roof and fields?',
      },
    ],
    rewardBlocks: { type: 'lantern', count: 6 },
  },
];

export function generatePart6PicWrite(): Part6PicWrite {
  const selected = PART6_SCENES_POOL[Math.floor(Math.random() * PART6_SCENES_POOL.length)];
  return {
    ...selected,
    id: `p6-${Date.now()}`,
  };
}

// -------------------------------------------------------------
// LISTENING TESTS: Interactive Audio TTS
// -------------------------------------------------------------
const LISTENING_POOL: ListeningQuestion[] = [
  {
    id: 'list-1',
    audioScript: "Look at the picture. Listen carefully: Can you see Daisy? Daisy is sitting under the tree eating a bowl of noodles with chopsticks. She is wearing a yellow t-shirt.",
    prompt: "Which person is Daisy?",
    options: [
      { key: 'A', label: 'Daisy', emoji: '🍜', detail: 'Girl eating noodles under the tree' },
      { key: 'B', label: 'Sally', emoji: '⚽', detail: 'Girl kicking a football on grass' },
      { key: 'C', label: 'Mary', emoji: '📖', detail: 'Girl reading a storybook on bench' },
    ],
    correctKey: 'A',
    explanation: "Daisy is the girl eating noodles under the tree in the yellow t-shirt.",
    rewardBlocks: { type: 'wood', count: 5 },
  },
  {
    id: 'list-2',
    audioScript: "Question: What did Alex do on his holiday? Alex's sister said: 'We went to the lake in the mountains and Alex loved sailing his small red boat all afternoon!'",
    prompt: "What did Alex do on holiday?",
    options: [
      { key: 'A', label: 'Tennis', emoji: '🎾', detail: 'Played tennis with friends' },
      { key: 'B', label: 'Sailing', emoji: '⛵', detail: 'Sailed a red boat on the lake' },
      { key: 'C', label: 'Fishing', emoji: '🎣', detail: 'Went fishing for big fish' },
    ],
    correctKey: 'B',
    explanation: "Alex loved sailing his small red boat on the lake.",
    rewardBlocks: { type: 'water', count: 5 },
  },
  {
    id: 'list-3',
    audioScript: "Question: Where does Uncle Charlie live? Listen: 'My Uncle Charlie bought a new flat. It is on the fourth floor, right opposite the river, next to the big park.'",
    prompt: "Where is Uncle Charlie's new apartment?",
    options: [
      { key: 'A', label: 'Opposite the river', emoji: '🌊', detail: 'Opposite the blue river' },
      { key: 'B', label: 'Near the airport', emoji: '✈️', detail: 'Near the busy airport' },
      { key: 'C', label: 'Behind the school', emoji: '🏫', detail: 'Behind the brick school' },
    ],
    correctKey: 'A',
    explanation: "The recording mentions: 'right opposite the river'.",
    rewardBlocks: { type: 'brick', count: 5 },
  },
  {
    id: 'list-4',
    audioScript: "Question: What did Daisy buy for her mother's birthday? Listen: 'Mum said she felt cold in the evenings, so Daisy bought her a warm pink sweater.'",
    prompt: "What present did Daisy buy?",
    options: [
      { key: 'A', label: 'Pink sweater', emoji: '🧶', detail: 'A warm pink sweater' },
      { key: 'B', label: 'Orange blanket', emoji: '🛋️', detail: 'An orange wool blanket' },
      { key: 'C', label: 'Winter coat', emoji: '🧥', detail: 'A long brown coat' },
    ],
    correctKey: 'A',
    explanation: "Daisy bought her a warm pink sweater because her mum felt cold.",
    rewardBlocks: { type: 'wool_red', count: 5 },
  },
  {
    id: 'list-5',
    audioScript: "Question: What is the matter with Tom today? Listen: 'Tom woke up holding his ear. He said: Ouch! My ear hurts a lot and I cannot listen to music today!'",
    prompt: "What is the matter with Tom?",
    options: [
      { key: 'A', label: 'Earache', emoji: '👂', detail: 'His ear hurts (earache)' },
      { key: 'B', label: 'Stomach-ache', emoji: '🤢', detail: 'His stomach hurts' },
      { key: 'C', label: 'Temperature', emoji: '🤒', detail: 'He is in bed with a fever' },
    ],
    correctKey: 'A',
    explanation: "Tom has an earache ('My ear hurts a lot').",
    rewardBlocks: { type: 'gold', count: 5 },
  },
];

export function generateListeningQuestion(): ListeningQuestion {
  return shuffle(LISTENING_POOL)[0];
}

// -------------------------------------------------------------
// SPEAKING TESTS: Authentic Cambridge Movers Speaking Test
// 1. "Find the Differences"
// 2. "Odd-One-Out"
// -------------------------------------------------------------
export const SPEAKING_DIFFERENCES: SpeakingDifferenceItem[] = [
  {
    id: 'spk-diff-1',
    theme: 'Harbour & Island Scene',
    picture1Description: 'In Picture 1: A man in a red boat is waving. A whale is in the sea. The boat has round windows. There are 3 palm trees on the island.',
    picture2Description: 'In Picture 2: A man in a red boat is rowing. A dolphin is jumping in the sea. The boat has square windows. There are 5 palm trees on the island.',
    differences: [
      {
        id: 'd1',
        item: 'Sea Animal',
        pic1State: 'A whale swimming in the water',
        pic2State: 'A dolphin jumping out of the water',
        modelSentence: 'In picture 1 there is a whale, but in picture 2 there is a dolphin.',
      },
      {
        id: 'd2',
        item: 'Boat Windows',
        pic1State: 'The windows are round',
        pic2State: 'The windows are square',
        modelSentence: 'In picture 1 the boat windows are round, but in picture 2 they are square.',
      },
      {
        id: 'd3',
        item: 'Palm Trees',
        pic1State: 'There are three palm trees',
        pic2State: 'There are five palm trees',
        modelSentence: 'In picture 1 there are three trees on the island, but in picture 2 there are five trees.',
      },
      {
        id: 'd4',
        item: 'Flying Bird',
        pic1State: 'A colorful parrot is flying in the sky',
        pic2State: 'There is no parrot in the sky',
        modelSentence: 'In picture 1 there is a parrot, but in picture 2 there is no parrot.',
      },
    ],
    rewardBlocks: { type: 'diamond', count: 8 },
  },
  {
    id: 'spk-diff-2',
    theme: 'Sunny Kitchen Breakfast',
    picture1Description: 'In Picture 1: The kitchen clock shows 8 o’clock. A yellow bowl is on the table. A cat is sleeping under the chair. The window shows a rainbow.',
    picture2Description: 'In Picture 2: The kitchen clock shows 9 o’clock. A plate with bananas is on the table. A toy tractor is on the floor. The window shows rain clouds.',
    differences: [
      {
        id: 'd1',
        item: 'Kitchen Clock',
        pic1State: 'The clock shows 8 o’clock',
        pic2State: 'The clock shows 9 o’clock',
        modelSentence: 'In picture 1 the clock says eight o’clock, but in picture 2 it says nine o’clock.',
      },
      {
        id: 'd2',
        item: 'Food on Table',
        pic1State: 'There is an empty yellow bowl',
        pic2State: 'There are yellow bananas on the table',
        modelSentence: 'In picture 1 there is a bowl, but in picture 2 there are bananas.',
      },
      {
        id: 'd3',
        item: 'Outside Window',
        pic1State: 'There is a colorful rainbow outside',
        pic2State: 'There is no rainbow, only grey clouds',
        modelSentence: 'In picture 1 you can see a rainbow, but in picture 2 you cannot see a rainbow.',
      },
      {
        id: 'd4',
        item: 'Boy’s Shirt',
        pic1State: 'The boy is wearing a green shirt',
        pic2State: 'The boy is wearing a blue shirt',
        modelSentence: 'In picture 1 the boy is wearing a green t-shirt, but in picture 2 he is wearing blue.',
      },
    ],
    rewardBlocks: { type: 'gold', count: 8 },
  },
];

export const SPEAKING_ODD_ONE_OUT: SpeakingOddOneOutItem[] = [
  {
    id: 'odd-1',
    items: [
      { name: 'Lemon', category: 'Fruit', emoji: '🍋', isOdd: false, reason: 'It is a fruit that you eat.' },
      { name: 'Pineapple', category: 'Fruit', emoji: '🍍', isOdd: false, reason: 'It is a fruit that you eat.' },
      { name: 'Book', category: 'School object', emoji: '📖', isOdd: true, reason: 'The book is different because you read it, but the others are fruits you eat!' },
      { name: 'Orange', category: 'Fruit', emoji: '🍊', isOdd: false, reason: 'It is a fruit that you eat.' },
    ],
    explanation: 'A lemon, a pineapple, and an orange are fruit. You eat them. You do not eat a book. You read a book!',
    rewardBlocks: { type: 'bookshelf', count: 6 },
  },
  {
    id: 'odd-2',
    items: [
      { name: 'Boy swimming', category: 'Sport / Outdoor', emoji: '🏊', isOdd: false, reason: 'He is doing outdoor exercise.' },
      { name: 'Girl riding bike', category: 'Sport / Outdoor', emoji: '🚴', isOdd: false, reason: 'She is doing outdoor exercise.' },
      { name: 'Boy doing homework', category: 'Studying', emoji: '✍️', isOdd: true, reason: 'The boy doing homework is inside studying, while the other children are doing sports outside!' },
      { name: 'Girl roller-skating', category: 'Sport / Outdoor', emoji: '🛼', isOdd: false, reason: 'She is doing outdoor sports.' },
    ],
    explanation: 'Swimming, cycling, and roller-skating are sports you do outside. The boy at his desk is studying inside.',
    rewardBlocks: { type: 'gold', count: 6 },
  },
  {
    id: 'odd-3',
    items: [
      { name: 'Doctor', category: 'Jobs', emoji: '👨‍⚕️', isOdd: false, reason: 'This is a person / profession.' },
      { name: 'Nurse', category: 'Jobs', emoji: '👩‍⚕️', isOdd: false, reason: 'This is a person / profession.' },
      { name: 'Farmer', category: 'Jobs', emoji: '👨‍🌾', isOdd: false, reason: 'This is a person / profession.' },
      { name: 'Toothbrush', category: 'Object', emoji: '🪥', isOdd: true, reason: 'The toothbrush is a bathroom object, while the other three are people with jobs!' },
    ],
    explanation: 'A doctor, a nurse, and a farmer are people who work jobs. A toothbrush is a thing to clean teeth.',
    rewardBlocks: { type: 'diamond', count: 6 },
  },
  {
    id: 'odd-4',
    items: [
      { name: 'Panda', category: 'Animals', emoji: '🐼', isOdd: false, reason: 'It is an animal.' },
      { name: 'Helicopter', category: 'Vehicles', emoji: '🚁', isOdd: true, reason: 'The helicopter is a vehicle/machine that flies, while the others are living animals!' },
      { name: 'Kangaroo', category: 'Animals', emoji: '🦘', isOdd: false, reason: 'It is an animal.' },
      { name: 'Bat', category: 'Animals', emoji: '🦇', isOdd: false, reason: 'It is an animal.' },
    ],
    explanation: 'The panda, kangaroo, and bat are living animals. The helicopter is a flying vehicle.',
    rewardBlocks: { type: 'lantern', count: 6 },
  },
];

// Block display colors & properties for 3D engine & UI
export const BLOCK_DEFINITIONS: Record<
  BlockType,
  { name: string; color: number; hexColor: string; textureType: string; description: string }
> = {
  grass: { name: 'Grass Block', color: 0x5b8c32, hexColor: '#5b8c32', textureType: 'grass', description: 'Top soil with lush green grass.' },
  dirt: { name: 'Dirt', color: 0x865b36, hexColor: '#865b36', textureType: 'dirt', description: 'Rich brown soil for planting.' },
  stone: { name: 'Cobblestone', color: 0x7c7c7c, hexColor: '#7c7c7c', textureType: 'stone', description: 'Strong building stone from mines.' },
  wood: { name: 'Oak Wood', color: 0xa06535, hexColor: '#a06535', textureType: 'wood', description: 'Sturdy oak log for walls and doors.' },
  leaves: { name: 'Oak Leaves', color: 0x3d7e2e, hexColor: '#3d7e2e', textureType: 'leaves', description: 'Fresh foliage for roofs and trees.' },
  brick: { name: 'Red Bricks', color: 0x9b3b2b, hexColor: '#9b3b2b', textureType: 'brick', description: 'Classic red brick blocks.' },
  glass: { name: 'Glass Window', color: 0x98d5e5, hexColor: '#98d5e5', textureType: 'glass', description: 'Clear glass to look outside.' },
  bookshelf: { name: 'Bookshelf', color: 0x8b5a2b, hexColor: '#8b5a2b', textureType: 'bookshelf', description: 'Filled with Cambridge study books!' },
  gold: { name: 'Gold Block', color: 0xf5b027, hexColor: '#f5b027', textureType: 'gold', description: 'Gleaming block of pure gold.' },
  diamond: { name: 'Diamond Block', color: 0x4be1d9, hexColor: '#4be1d9', textureType: 'diamond', description: 'Rare precious diamond crystal block.' },
  lantern: { name: 'Glow Lantern', color: 0xffd152, hexColor: '#ffd152', textureType: 'lantern', description: 'Emits warm glowing light at night.' },
  sand: { name: 'Beach Sand', color: 0xdfce8e, hexColor: '#dfce8e', textureType: 'sand', description: 'Fine golden sand from the seaside.' },
  water: { name: 'Water Tile', color: 0x3b82f6, hexColor: '#3b82f6', textureType: 'water', description: 'Cool blue water tile for lakes and pools.' },
  flower_red: { name: 'Red Poppy', color: 0xef4444, hexColor: '#ef4444', textureType: 'flower_red', description: 'Vibrant red flower for your garden.' },
  flower_yellow: { name: 'Dandelion', color: 0xeab308, hexColor: '#eab308', textureType: 'flower_yellow', description: 'Bright sunny yellow flower.' },
  wool_red: { name: 'Red Wool', color: 0xdc2626, hexColor: '#dc2626', textureType: 'wool', description: 'Soft colored block for decorations.' },
  wool_blue: { name: 'Blue Wool', color: 0x2563eb, hexColor: '#2563eb', textureType: 'wool', description: 'Deep blue woven block.' },
};
