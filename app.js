/* ===========================================================
   Wild Survival: The Game / Дика Природа: Виживання
   hotseat digital card game (adapted from
   "Nasi Lemak: The Game" by Faculty of Fun, re-themed)

   Theme note: internal identifiers (variable/function names, CSS class
   names like .burger-slot, translation keys like fxBurger/pileBurgers)
   still use the original "ingredient/burger" vocabulary from the game's
   first (cheeseburger) skin — they're invisible plumbing, never shown to
   a player. Only the actual displayed text below (INGREDIENTS/ACTIONS
   names+descriptions, STRINGS values, rules text) reflects the current
   theme. If you reskin again, that's the split to follow: reuse the
   engine as-is, just swap what these arrays and STRINGS say.
   =========================================================== */

const INGREDIENTS = [
  { kind: 'bun',     ic: '🪵', name: { uk: 'Деревина', en: 'Wood' } },
  { kind: 'patty',   ic: '💧', name: { uk: 'Вода',     en: 'Water' } },
  { kind: 'cheese',  ic: '🔥', name: { uk: 'Іскра',    en: 'Spark' } },
  { kind: 'lettuce', ic: '🪢', name: { uk: 'Мотузка',  en: 'Rope' } },
  { kind: 'tomato',  ic: '🩹', name: { uk: 'Аптечка',  en: 'Medkit' } },
];

/* Completing a shelter pile isn't just "1 of each of the 5 kinds" — Rope
   and Medkit each need 2 copies (survival gear you'd realistically want a
   spare of), making 2 of the 5 requirements meaningfully harder than the
   other 3. Total cards per pile: 1+1+1+2+2 = 7 (up from 5 — see
   WIN_THRESHOLD, tuned down accordingly). Grandma's Recipe bypasses this
   entirely (any 3 distinct kinds, 1 each), which is now an even bigger
   shortcut than before. */
const PILE_REQUIREMENTS = { bun: 1, patty: 1, cheese: 1, lettuce: 2, tomato: 2 };

const ACTIONS = [
  { kind: 'foodtruck',  ic: '🪂',
    name: { uk: 'Скидання з повітря', en: 'Airdrop' },
    desc: { uk: 'Візьми 2 верхні карти колоди собі в руку (будь-які).', en: 'Take the top 2 cards of the draw pile into your hand (any kind).' } },
  { kind: 'delivery',   ic: '📻',
    name: { uk: 'Сигнал SOS', en: 'SOS Signal' },
    desc: { uk: 'Оголоси ресурс — всі інші гравці віддають тобі всі такі карти.', en: 'Call a resource — all other players give you every card of that kind.' } },
  { kind: 'grandma',    ic: '🎒',
    name: { uk: 'Дідусеві навички', en: "Grandpa's Survival Skills" },
    desc: { uk: 'Добудуй прихисток лише з 3 різних ресурсів (по 1) замість повного набору.', en: 'Finish a shelter with just 3 different resources (1 each) instead of the full set.' } },
  { kind: 'inspector',  ic: '🌲',
    name: { uk: 'Лісник', en: 'Ranger' },
    desc: { uk: 'Подивись руку одного гравця і візьми собі 2 карти.', en: "Look through one player's hand and take 2 cards for yourself." } },
  { kind: 'shoplifter', ic: '🐦‍⬛',
    name: { uk: 'Ворон-злодій', en: 'Thieving Raven' },
    desc: { uk: 'Вкради верхню (останню викладену) картку зі столу одного суперника.', en: "Steal the top (most recently placed) card off one opponent's table." } },
  { kind: 'fly',        ic: '🐻',
    name: { uk: 'Хижак', en: 'Predator' },
    desc: { uk: 'Напусти хижака на прихисток іншого гравця — він недійсний, поки хижака не прогнати.', en: "Send a predator to raid another player's shelter — it doesn't count until the predator is driven off." } },
  { kind: 'swatter',    ic: '🔥',
    name: { uk: 'Багаття', en: 'Bonfire' },
    desc: { uk: 'Відлякай хижака зі свого прихистку.', en: 'Drive a predator off your own shelter.' } },
  { kind: 'gust',       ic: '👣',
    name: { uk: 'Слід', en: 'Trail' },
    desc: { uk: 'Заплутай слід — направ хижака зі свого прихистку на прихисток іншого гравця.', en: "Cover your tracks — lead the predator off your shelter onto another player's." } },
  { kind: 'wild',       ic: '🔧',
    name: { uk: 'Імпровізація', en: 'Improvise' },
    desc: { uk: 'Виклади на свій стіл замість будь-якого ресурсу на вибір.', en: 'Play onto your table as any one resource of your choice.' } },
  { kind: 'forcedeal',  ic: '🦁',
    name: { uk: 'Закон джунглів', en: 'Law of the Jungle' },
    desc: { uk: 'Віддай непотрібний ресурс і забери будь-який ресурс зі столу суперника — відмовитись не можна.', en: "Give away one resource and take any resource off an opponent's table — they can't refuse." } },
  { kind: 'sayno',      ic: '✋',
    name: { uk: 'Скажи Ні', en: 'Just Say No' },
    desc: { uk: 'Зіграй у відповідь, щоб скасувати дію суперника проти тебе.', en: "Play in response to cancel an opponent's action against you." } },
];

/* Final physical print spec — fixed deck for 2–6 players:
   60 resources (12x5) + 37 action cards + 18 shelter cards = 115 total. Say No is
   deliberately scarce (2 copies) — like Monopoly Deal's "Just Say No",
   chains of it countering it are allowed (see offerReaction/respondSayNo),
   naturally bounded by there only being 2 in the whole deck. */
const ACTION_COUNTS = { foodtruck: 4, delivery: 4, grandma: 3, inspector: 4, shoplifter: 4, fly: 5, swatter: 3, gust: 3, wild: 3, forcedeal: 2, sayno: 2 };
const INGREDIENT_COUNT_PER_KIND = 12;
const BURGER_PILE_SINGLES = 10; // value-1 cards
const BURGER_PILE_DOUBLES = 8;  // value-2 cards
const WIN_THRESHOLD = 5;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

const BOT_NAMES = {
  uk: [
    'Компас Термінатор', 'Вузлов\'яз 9000', 'Багаттябот Валентин', 'Слідопит Інтелект',
    'МотузМайстер', 'Виживач Матриця', 'Наметовий Оракул', 'ТайгаТрон',
    'Хижакова Загроза', 'Компас Термоядерний', 'Дідусь Слідопит', 'Капітан Компас',
  ],
  en: [
    'Compass-9000', 'Knotinator X', 'Sir Fixes-a-Lot', 'The Trailblazer Prime',
    'RopeMcBot', 'Wilderness Overlord', 'Basecamp Deluxe', 'TrailTron',
    'Predator Menace', 'Ranger Boss 5000', 'Grandpa Trailhead', 'Captain Compass',
  ],
};

/* ---------------- Audio (synthesized, no audio files needed) ---------------- */
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _audioCtx = new AC();
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

const Sfx = (() => {
  let muted = localStorage.getItem('cbSfxMuted') === '1';

  // One short tone: freq (Hz), start offset (s), duration (s), waveform, peak volume.
  function tone(freq, t0, dur, type, vol) {
    const c = getAudioCtx();
    if (!c || muted) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    const start = c.currentTime + t0;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  // A low growling swell — two detuned oscillators sweeping down/up/down,
  // the closest a simple synth oscillator gets to a bear roar.
  function growl() {
    const c = getAudioCtx();
    if (!c || muted) return;
    const start = c.currentTime;
    [0, 7].forEach(detune => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sawtooth';
      osc.detune.value = detune;
      osc.frequency.setValueAtTime(170, start);
      osc.frequency.exponentialRampToValueAtTime(85, start + 0.32);
      osc.frequency.exponentialRampToValueAtTime(125, start + 0.48);
      osc.frequency.exponentialRampToValueAtTime(65, start + 0.72);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.13, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.78);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.8);
    });
  }

  const SOUNDS = {
    draw:     () => tone(520, 0, 0.09, 'triangle', 0.11),
    play:     () => { tone(660, 0, 0.07, 'square', 0.07); tone(880, 0.05, 0.09, 'square', 0.07); },
    trade:    () => { tone(500, 0, 0.08, 'sine', 0.1); tone(700, 0.08, 0.1, 'sine', 0.1); },
    burger:   () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.16, 'triangle', 0.12)); },
    turn:     () => { tone(784, 0, 0.1, 'sine', 0.09); tone(988, 0.1, 0.14, 'sine', 0.09); },
    win:      () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.13)); },
    click:    () => tone(440, 0, 0.04, 'square', 0.05),
    error:    () => { tone(220, 0, 0.1, 'sawtooth', 0.08); tone(180, 0.09, 0.14, 'sawtooth', 0.08); },
    predator: growl,
  };

  return {
    play(name) { const fn = SOUNDS[name]; if (fn) fn(); },
    isMuted() { return muted; },
    setMuted(v) {
      muted = v;
      localStorage.setItem('cbSfxMuted', v ? '1' : '0');
    },
    toggleMuted() { this.setMuted(!muted); return muted; },
  };
})();

/* Soft looping ambient pad (4-chord progression), independent volume/mute from Sfx. */
/* Upbeat looping bounce: a bass pulse + soft chord pad + a cheerful lead
   riff, stepped through eighth-notes. The lead alternates between two
   phrases every full pass through the progression, so the loop has some
   sense of development instead of repeating one static bar forever. */
const Music = (() => {
  let enabled = localStorage.getItem('cbMusicOn') !== '0';
  let volume = parseFloat(localStorage.getItem('cbMusicVol'));
  if (isNaN(volume)) volume = 0.3;
  let master = null;
  let playing = false;
  let timer = null;
  let stepIndex = 0;

  const BPM = 132;
  const STEP_DUR = 60 / BPM / 2; // eighth note
  const STEPS_PER_CHORD = 8;

  // I-V-vi-IV in C major — a classic cheerful, upbeat pop progression.
  const CHORDS = [
    { root: 261.63, notes: [261.63, 329.63, 392.00] }, // C
    { root: 392.00, notes: [392.00, 493.88, 587.33] }, // G
    { root: 220.00, notes: [220.00, 261.63, 329.63] }, // Am
    { root: 349.23, notes: [349.23, 440.00, 523.25] }, // F
  ];
  const STEPS_PER_PASS = STEPS_PER_CHORD * CHORDS.length;

  // Melodic multipliers relative to each chord's root — two alternating
  // bouncy phrases so every other pass through the progression feels new.
  const LEAD_A = [1, 1.5, 2, 1.5, 1.25, 1.5, 1, 0];
  const LEAD_B = [2, 1.5, 1.25, 1.5, 2, 2.5, 2, 1.5];

  function ensureMaster() {
    const c = getAudioCtx();
    if (!c) return null;
    if (!master) {
      master = c.createGain();
      master.gain.value = volume;
      master.connect(c.destination);
    }
    return c;
  }

  function playNote(freq, startTime, dur, type, vol) {
    const c = _audioCtx;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0008, startTime + dur);
    osc.connect(g).connect(master);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.02);
  }

  function scheduleStep() {
    if (!playing) return;
    const c = ensureMaster();
    if (!c) return;
    const posInPass = stepIndex % STEPS_PER_PASS;
    const chordIdx = Math.floor(posInPass / STEPS_PER_CHORD);
    const stepInChord = posInPass % STEPS_PER_CHORD;
    const pass = Math.floor(stepIndex / STEPS_PER_PASS);
    const chord = CHORDS[chordIdx];
    const lead = (pass % 2 === 0) ? LEAD_A : LEAD_B;
    const startTime = c.currentTime + 0.03;

    if (stepInChord === 0) {
      chord.notes.forEach(freq => playNote(freq, startTime, STEP_DUR * STEPS_PER_CHORD * 0.95, 'sine', 0.045));
    }
    if (stepInChord % 2 === 0) {
      playNote(chord.root / 2, startTime, STEP_DUR * 0.85, 'triangle', 0.11);
    }
    const mult = lead[stepInChord];
    if (mult > 0) playNote(chord.root * mult, startTime, STEP_DUR * 0.8, 'square', 0.055);

    stepIndex++;
    timer = setTimeout(scheduleStep, STEP_DUR * 1000);
  }

  function start() {
    if (playing) return;
    const c = ensureMaster();
    if (!c) return;
    playing = true;
    scheduleStep();
  }
  function stop() {
    playing = false;
    clearTimeout(timer);
  }

  return {
    unlock() { if (enabled) start(); },
    isEnabled() { return enabled; },
    setEnabled(v) {
      enabled = v;
      localStorage.setItem('cbMusicOn', v ? '1' : '0');
      if (v) start(); else stop();
    },
    toggleEnabled() { this.setEnabled(!enabled); return enabled; },
    getVolume() { return volume; },
    setVolume(v) {
      volume = Math.max(0, Math.min(1, v));
      localStorage.setItem('cbMusicVol', String(volume));
      if (master) master.gain.setTargetAtTime(volume, _audioCtx.currentTime, 0.05);
    },
  };
})();

document.addEventListener('pointerdown', () => { getAudioCtx(); Music.unlock(); }, { once: true });

/* Maps triggerEffect()'s emoji to a sound, so every action-card effect
   (burger made, trade, steal, fly, etc.) gets audio for free at one call site. */
const EFFECT_SFX = {
  '🏕️✨': 'burger',
  '🤝': 'trade',
  '🪂': 'play',
  '📻': 'play',
  '🌲': 'play',
  '🐦‍⬛': 'play',
  '🦁': 'play',
  '🐻': 'predator',
  '🔥💥': 'play',
  '👣': 'predator',
};

function pickRandomBotNames(count) {
  const pool = shuffle(BOT_NAMES[LANG].slice());
  return pool.slice(0, count);
}

/* ---------------- Language ---------------- */

let LANG = 'uk';
try { LANG = localStorage.getItem('cbg_lang') || 'uk'; } catch (e) {}

function setLang(l) {
  LANG = l;
  try { localStorage.setItem('cbg_lang', l); } catch (e) {}
  render();
}
function toggleLang() { setLang(LANG === 'uk' ? 'en' : 'uk'); }

function mName(meta) { return meta.name[LANG]; }
function mDesc(meta) { return meta.desc[LANG]; }

const STRINGS = {
  uk: {
    appTitle: 'ДИКА ПРИРОДА: ВИЖИВАННЯ',
    appSubtitle: (min, max) => `Настільна карткова гра для ${min}–${max} гравців · hotseat`,
    howManyPlayers: 'Скільки гравців?',
    playerNames: 'Імена гравців',
    playerPlaceholder: (i) => `Гравець ${i}`,
    startGame: 'Почати гру 🏕️',
    rulesBtn: '📖 Правила гри',
    rulesTooltip: 'Правила',
    menuTooltip: 'Меню',
    logHistoryTitle: '📜 Історія ходів',
    logHistoryEmpty: 'Поки що подій немає.',
    avatarPickerTitle: '🙂 Обрати аватарку',
    avatarPickerConfirm: 'Зберегти',
    langToggle: 'EN',
    modeHotseat: '👥 Локально (з друзями)',
    modeBots: '🤖 Проти ботів',
    modeOnline: '🌐 Онлайн',
    yourName: "Твоє ім'я",
    yourNamePlaceholder: "Твоє ім'я",
    createRoomBtn: '🆕 Створити кімнату',
    orJoinLabel: 'або приєднайся за кодом',
    roomCodePlaceholder: 'КОД КІМНАТИ',
    joinRoomBtn: '🚪 Приєднатися',
    onlineNotConfigured: 'Онлайн-режим ще не налаштовано (бракує Firebase-конфігурації).',
    onlineConnectError: 'Не вдалося з\'єднатися. Спробуй ще раз.',
    onlineRoomNotFound: 'Кімнату з таким кодом не знайдено.',
    onlineRoomStarted: 'Ця гра вже розпочалася.',
    onlineRoomFull: `У кімнаті вже максимум гравців (${MAX_PLAYERS}).`,
    roomCodeLabel: 'Код кімнати — поділись ним з друзями',
    copyLink: '🔗 Скопіювати посилання',
    playersInRoom: (n) => `Гравці в кімнаті (${n})`,
    startOnlineGame: 'Почати гру 🏕️',
    waitingForMorePlayers: `Чекаємо ще гравців (мінімум ${MIN_PLAYERS})...`,
    waitingForHost: 'Очікуємо, поки хост розпочне гру...',
    leaveRoom: '🚪 Вийти з кімнати',
    otherTurn: (name) => `⏳ Хід гравця ${name}`,
    otherTurnBot: (name) => `🤖 Хід бота ${name}`,
    notYourTurn: 'Зараз не твій хід',
    waitingForTradeResponse: (target, from) => `⏳ ${target} обмірковує пропозицію обміну від ${from}...`,
    waitingForSayNoResponse: (target) => `⏳ ${target} вирішує, чи казати "Ні"...`,
    botConsideringSayNo: (name) => `🤖 ${name} вирішує, чи казати "Ні"...`,
    waitingTitle: 'Очікування',
    howManyTotal: 'Скільки гравців разом з тобою?',
    difficultyLabel: 'Рівень складності ботів',
    diffEasy: '😌 Легкий',
    diffMedium: '🙂 Середній',
    diffHard: '😈 Важкий',
    startVsBots: 'Почати гру 🤖',
    botConsideringTrade: (name) => `🤖 ${name} обмірковує твою пропозицію обміну...`,
    fxBurger: 'Прихисток готовий!',
    fxSwat: 'Хижака відлякано!',
    fxFly: 'Хижак!',
    fxGust: 'Слід заплутано!',
    fxSteal: 'Крадіжка!',
    fxTruck: 'Скидання!',
    fxDelivery: 'SOS!',
    fxInspect: 'Перевірка!',
    fxTrade: 'Обмін!',
    passInfoBanner: 'Пристрій передається по колу. Перед кожним ходом на екрані буде заставка «Передай пристрій...» — це знак віддати телефон/ноутбук наступному гравцю.',
    rulesTitle: '📖 Правила гри «Дика Природа: Виживання»',
    gotIt: 'Зрозуміло',
    passHintDefault: 'Переконайся, що інші гравці не бачать екран.',
    passHintStart: 'Настав твій хід. Переконайся, що інші не бачать екран, і тисни, щоб побачити свою руку.',
    passHintTradeRespond: (name) => `Гравець ${name} пропонує тобі обмін. Подивись пропозицію приватно.`,
    passHintTradeBack: 'Обмін завершено. Поверни пристрій собі, щоб продовжити хід.',
    passToPlayer: (name) => `Передай пристрій гравцю<br>«${name}»`,
    imPlayerShowHand: (name) => `Я — ${name}, показати мою руку`,
    tradeOfferTitle: '🤝 Пропозиція обміну',
    tradeOffersYou: (name) => `${name} пропонує тобі цю карту:`,
    tradeChooseResponse: 'Обери свою карту у відповідь, або відхили пропозицію:',
    declineTrade: 'Відхилити обмін',
    yourTurn: (name) => `🏕️ ${name} — твій хід`,
    movesLeft: (n) => `${n} з 3 ходів залишилось`,
    pileDraw: '🎒 Колода',
    pileDiscard: '🗑️ Скид',
    pileBurgers: '🏕️ Прихистки',
    tradeBtn: '🔄 Обмін',
    endTurnBtn: '➡️ Завершити хід',
    handLabel: (n) => `Твоя рука (${n} карт) — торкнись картки, щоб зіграти її`,
    burgerProgress: (sum, threshold) => `${sum}/${threshold} 🏕️`,
    burgerTooltip: (v) => `Прихисток — ${v} 🏕️`,
    burgerTooltipFly: (v) => `Прихисток — ${v} 🏕️ (не рахується, поки не прогнати хижака 🐻)`,
    burgerRevealText: (v) => `🏕️ Тобі випав прихисток номіналом ${v}!`,
    wildLabel: 'імпровізація',
    wildPickTitle: '🔧 Імпровізація — обери, яким ресурсом стане',
    shoplifterTargetTitle: '🐦‍⬛ Ворон-злодій — вкради верхню картку зі столу гравця',
    playerBuildCount: (name, n) => `${name} (${n} на столі)`,
    forceDealGiveTitle: '🦁 Закон джунглів — віддай ресурс',
    forceDealTargetTitle: '🦁 Закон джунглів — обери гравця',
    forceDealTakeTitle: (name) => `🦁 Візьми зі столу гравця ${name}`,
    sayNoPromptTitle: (actorName, cardName) => `${actorName} грає "${cardName}" проти тебе!`,
    sayNoPromptBody: 'Хочеш зіграти "Скажи Ні" й скасувати цю дію?',
    sayNoConfirm: '✋ Скажи Ні!',
    sayNoDecline: 'Дозволити',
    saidNo: (name) => `✋ ${name} каже "Ні!" — дію скасовано.`,
    fxSayNo: 'Скажи Ні!',
    tradeTargetTitle: '🔄 Обмін — обери гравця',
    playerCardsCount: (name, n) => `${name} (${n} карт)`,
    tradeOfferTitle2: (name) => `🔄 Обмін з ${name}`,
    tradeChooseOffer: 'Обери одну свою карту, яку пропонуєш:',
    tradeChooseWant: 'Що хочеш отримати натомість?',
    wantAny: 'Будь-яка карта',
    wantAction: 'Будь-яка карта дії',
    tradeWants: (want) => `Хоче отримати: ${want}`,
    tradeNoMatch: 'У тебе немає такої картки — можеш лише відхилити обмін.',
    reasonTradeKindMismatch: 'Не те, що просили',
    proposeTrade: 'Запропонувати обмін',
    deliveryTitle: "📻 Сигнал SOS — оголоси ресурс",
    inspectorTargetTitle: '🌲 Лісник — обери гравця',
    inspectorViewTitle: (name) => `🌲 Рука гравця ${name} — обери 2 карти`,
    takeSelected: (n) => `Забрати обрані карти (${n}/2)`,
    flyTargetTitle: '🐻 Хижак — обери жертву',
    playerBurgersCount: (name, n) => `${name} (${n} прихисток(и))`,
    gustTargetTitle: '👣 Слід — направити хижака на когось',
    cancel: 'Скасувати',
    menuTitle: '☰ Меню',
    menuRules: '📖 Правила гри',
    menuLang: '🌐 Switch to English',
    menuRestart: '🔁 Почати заново (ті самі гравці)',
    settingsTitle: 'Налаштування',
    menuSoundOn: '🔊 Звукові ефекти: увімкнено',
    menuSoundOff: '🔇 Звукові ефекти: вимкнено',
    menuMusicOn: '🎵 Музика: увімкнено',
    menuMusicOff: '🔕 Музика: вимкнено',
    musicVolume: 'Гучність музики',
    menuExit: '🚪 Вийти в головне меню',
    close: 'Закрити',
    confirmRestartTitle: '🔁 Почати заново?',
    confirmRestartBody: 'Поточний прогрес гри буде втрачено. Гравці лишаться ті самі, карти роздадуться наново.',
    yesRestart: 'Так, почати заново',
    confirmExitTitle: '🚪 Вийти в головне меню?',
    confirmExitBody: 'Поточний прогрес гри буде втрачено.',
    yesExit: 'Так, вийти',
    winnerTableHeaders: ['Гравець', '🏕️ Прихистків', '🐻 З хижаком'],
    newGameBtn: 'Нова гра',
    gameStarted: 'Гру розпочато! Кожен гравець отримав по 7 карт.',
    reshuffled: 'Колоду скидів перетасовано назад у колоду для взяття карт.',
    drawCards: (name, n) => `${name} бере ${n} карт(и) з колоди.`,
    burgerPileEmpty: 'Прихистків не залишилось!',
    playedIngredient: (name, ing) => `${name} викладає ${ing} на стіл.`,
    playedGrandma: (name) => `🎒 ${name} використовує Дідусеві навички — тепер потрібно лише 3 ресурси!`,
    madeBurger: (name) => `🏕️ ${name} добудовує прихисток!`,
    tradeDeclined: (to, from) => `${to} відхилив(ла) пропозицію обміну від ${from}.`,
    tradeAccepted: (from, to) => `🤝 ${from} та ${to} успішно обмінялися картами.`,
    playedFoodTruck: (name, kept) => `🪂 ${name} грає Скидання з повітря і бере ${kept} карт(и) з колоди.`,
    playedDelivery: (name, ing, total) => `📻 ${name} подає Сигнал SOS: запросив "${ing}" і отримав ${total} карт(и).`,
    playedInspector: (name, target) => `🌲 ${name} грає Лісника проти ${target} і бере 2 карти.`,
    playedShoplifter: (name, target, ing) => `🐦‍⬛ ${name} (Ворон-злодій) краде ${ing} зі столу гравця ${target}.`,
    playedForceDeal: (name, target, given, taken) => `🦁 ${name} застосовує закон джунглів: віддає ${given} гравцю ${target} і забирає ${taken} з його столу.`,
    playedFly: (name, target) => `🐻 ${name} напускає хижака на прихисток гравця ${target}.`,
    playedSwatter: (name) => `🔥 ${name} відлякує хижака багаттям!`,
    playedGust: (name, target) => `👣 ${name} заплутує слід — хижак тепер у гравця ${target}.`,
    turnEnded: (name) => `--- Хід гравця ${name} завершено ---`,
    winByThreshold: (name) => `${name} збудував табір і готовий вижити в дикій природі!`,
    pileDepleted: 'Прихистки закінчились!',
    reasonNoMoves: 'Не залишилось ходів у цьому ході',
    reasonGrandmaAlready: 'Дідусеві навички вже діють для поточного прихистку',
    reasonInspectorNoTargets: 'У жодного суперника немає карт на руках',
    reasonShoplifterNoTargets: 'У жодного суперника немає ресурсів на столі',
    reasonForceDealNoGive: 'У тебе немає ресурсів для обміну',
    reasonFlyNoTargets: 'У жодного суперника немає готового прихистку',
    reasonNoFlyOnYours: 'На твоєму прихистку немає хижака',
    reasonSayNoReactive: 'Цю карту можна зіграти лише у відповідь на дію суперника',
    newBadge: 'НОВА',
    groupBtn: '📚 Групувати',
    fanBtn: '🎴 Віялом',
  },
  en: {
    appTitle: 'WILD SURVIVAL',
    appSubtitle: (min, max) => `A tabletop card game for ${min}–${max} players · hotseat`,
    howManyPlayers: 'How many players?',
    playerNames: 'Player names',
    playerPlaceholder: (i) => `Player ${i}`,
    startGame: 'Start Game 🏕️',
    rulesBtn: '📖 Rules',
    rulesTooltip: 'Rules',
    menuTooltip: 'Menu',
    logHistoryTitle: '📜 Move history',
    logHistoryEmpty: 'No events yet.',
    avatarPickerTitle: '🙂 Choose an avatar',
    avatarPickerConfirm: 'Save',
    langToggle: 'UA',
    modeHotseat: '👥 Local (pass & play)',
    modeBots: '🤖 Vs bots',
    modeOnline: '🌐 Online',
    yourName: 'Your name',
    yourNamePlaceholder: 'Your name',
    createRoomBtn: '🆕 Create room',
    orJoinLabel: 'or join with a code',
    roomCodePlaceholder: 'ROOM CODE',
    joinRoomBtn: '🚪 Join',
    onlineNotConfigured: "Online mode isn't set up yet (missing Firebase config).",
    onlineConnectError: 'Could not connect. Please try again.',
    onlineRoomNotFound: 'No room found with that code.',
    onlineRoomStarted: 'That game has already started.',
    onlineRoomFull: `The room already has the maximum of ${MAX_PLAYERS} players.`,
    roomCodeLabel: 'Room code — share it with your friends',
    copyLink: '🔗 Copy invite link',
    playersInRoom: (n) => `Players in room (${n})`,
    startOnlineGame: 'Start Game 🏕️',
    waitingForMorePlayers: `Waiting for more players (at least ${MIN_PLAYERS})...`,
    waitingForHost: 'Waiting for the host to start the game...',
    leaveRoom: '🚪 Leave room',
    otherTurn: (name) => `⏳ ${name}'s turn`,
    otherTurnBot: (name) => `🤖 ${name}'s turn`,
    notYourTurn: "It's not your turn",
    waitingForTradeResponse: (target, from) => `⏳ ${target} is considering a trade offer from ${from}...`,
    waitingForSayNoResponse: (target) => `⏳ ${target} is deciding whether to say "No"...`,
    botConsideringSayNo: (name) => `🤖 ${name} is deciding whether to say "No"...`,
    waitingTitle: 'Waiting',
    howManyTotal: 'How many players total, including you?',
    difficultyLabel: 'Bot difficulty',
    diffEasy: '😌 Easy',
    diffMedium: '🙂 Medium',
    diffHard: '😈 Hard',
    startVsBots: 'Start Game 🤖',
    botConsideringTrade: (name) => `🤖 ${name} is considering your trade offer...`,
    fxBurger: 'Shelter complete!',
    fxSwat: 'Predator scared off!',
    fxFly: 'Predator!',
    fxGust: 'Trail covered!',
    fxSteal: 'Stolen!',
    fxTruck: 'Airdrop!',
    fxDelivery: 'SOS!',
    fxInspect: 'Inspected!',
    fxTrade: 'Traded!',
    passInfoBanner: 'The device is passed around the table. Before every turn you’ll see a "Pass the device..." screen — that’s the cue to hand the phone/laptop to the next player.',
    rulesTitle: '📖 Wild Survival — Rules',
    gotIt: 'Got it',
    passHintDefault: "Make sure other players can't see the screen.",
    passHintStart: "It's your turn. Make sure no one else can see the screen, then tap to reveal your hand.",
    passHintTradeRespond: (name) => `${name} is offering you a trade. Check the offer privately.`,
    passHintTradeBack: 'The trade is done. Pass the device back to yourself to continue your turn.',
    passToPlayer: (name) => `Pass the device to<br>"${name}"`,
    imPlayerShowHand: (name) => `I'm ${name}, show my hand`,
    tradeOfferTitle: '🤝 Trade Offer',
    tradeOffersYou: (name) => `${name} offers you this card:`,
    tradeChooseResponse: 'Choose a card to trade back, or decline the offer:',
    declineTrade: 'Decline trade',
    yourTurn: (name) => `🏕️ ${name} — your turn`,
    movesLeft: (n) => `${n} of 3 moves left`,
    pileDraw: '🎒 Draw',
    pileDiscard: '🗑️ Discard',
    pileBurgers: '🏕️ Shelters',
    tradeBtn: '🔄 Trade',
    endTurnBtn: '➡️ End turn',
    handLabel: (n) => `Your hand (${n} cards) — tap a card to play it`,
    burgerProgress: (sum, threshold) => `${sum}/${threshold} 🏕️`,
    burgerTooltip: (v) => `Shelter — ${v} 🏕️`,
    burgerTooltipFly: (v) => `Shelter — ${v} 🏕️ (doesn't count until the predator is driven off 🐻)`,
    burgerRevealText: (v) => `🏕️ You got a value-${v} shelter!`,
    wildLabel: 'improvise',
    wildPickTitle: '🔧 Improvise — choose which resource it becomes',
    shoplifterTargetTitle: "🐦‍⬛ Thieving Raven — steal the top card off a player's table",
    playerBuildCount: (name, n) => `${name} (${n} on the table)`,
    forceDealGiveTitle: '🦁 Law of the Jungle — give up a resource',
    forceDealTargetTitle: '🦁 Law of the Jungle — choose a player',
    forceDealTakeTitle: (name) => `🦁 Take from ${name}'s table`,
    sayNoPromptTitle: (actorName, cardName) => `${actorName} plays "${cardName}" against you!`,
    sayNoPromptBody: 'Do you want to play "Just Say No" and cancel it?',
    sayNoConfirm: '✋ Just Say No!',
    sayNoDecline: 'Allow it',
    saidNo: (name) => `✋ ${name} says "No!" — the action is cancelled.`,
    fxSayNo: 'Just Say No!',
    tradeTargetTitle: '🔄 Trade — choose a player',
    playerCardsCount: (name, n) => `${name} (${n} cards)`,
    tradeOfferTitle2: (name) => `🔄 Trade with ${name}`,
    tradeChooseOffer: 'Choose one of your cards to offer:',
    tradeChooseWant: 'What do you want back?',
    wantAny: 'Any card',
    wantAction: 'Any action card',
    tradeWants: (want) => `Wants: ${want}`,
    tradeNoMatch: "You don't have that — you can only decline this trade.",
    reasonTradeKindMismatch: "Not what's being asked for",
    proposeTrade: 'Propose trade',
    deliveryTitle: '📻 SOS Signal — call a resource',
    inspectorTargetTitle: '🌲 Ranger — choose a player',
    inspectorViewTitle: (name) => `🌲 ${name}'s hand — pick 2 cards`,
    takeSelected: (n) => `Take selected cards (${n}/2)`,
    flyTargetTitle: '🐻 Predator — choose a victim',
    playerBurgersCount: (name, n) => `${name} (${n} shelter(s))`,
    gustTargetTitle: '👣 Trail — lead the predator to someone',
    cancel: 'Cancel',
    menuTitle: '☰ Menu',
    menuRules: '📖 Rules',
    menuLang: '🌐 Переключити на українську',
    menuRestart: '🔁 Restart (same players)',
    settingsTitle: 'Settings',
    menuSoundOn: '🔊 Sound effects: on',
    menuSoundOff: '🔇 Sound effects: off',
    menuMusicOn: '🎵 Music: on',
    menuMusicOff: '🔕 Music: off',
    musicVolume: 'Music volume',
    menuExit: '🚪 Exit to main menu',
    close: 'Close',
    confirmRestartTitle: '🔁 Restart the game?',
    confirmRestartBody: 'Current progress will be lost. Same players, cards will be reshuffled and redealt.',
    yesRestart: 'Yes, restart',
    confirmExitTitle: '🚪 Exit to main menu?',
    confirmExitBody: 'Current progress will be lost.',
    yesExit: 'Yes, exit',
    winnerTableHeaders: ['Player', '🏕️ Shelters', '🐻 With predator'],
    newGameBtn: 'New game',
    gameStarted: 'Game started! Each player was dealt 7 cards.',
    reshuffled: 'The discard pile was reshuffled back into the draw pile.',
    drawCards: (name, n) => `${name} draws ${n} card(s) from the deck.`,
    burgerPileEmpty: 'No shelters left!',
    playedIngredient: (name, ing) => `${name} plays ${ing} onto the table.`,
    playedGrandma: (name) => `🎒 ${name} uses Grandpa's Survival Skills — now only 3 resources are needed!`,
    madeBurger: (name) => `🏕️ ${name} finishes a shelter!`,
    tradeDeclined: (to, from) => `${to} declined the trade offer from ${from}.`,
    tradeAccepted: (from, to) => `🤝 ${from} and ${to} successfully traded cards.`,
    playedFoodTruck: (name, kept) => `🪂 ${name} plays Airdrop and grabs ${kept} card(s).`,
    playedDelivery: (name, ing, total) => `📻 ${name} sends an SOS Signal: called "${ing}" and received ${total} card(s).`,
    playedInspector: (name, target) => `🌲 ${name} plays Ranger on ${target} and takes 2 cards.`,
    playedShoplifter: (name, target, ing) => `🐦‍⬛ ${name} (Thieving Raven) steals ${ing} off ${target}'s table.`,
    playedForceDeal: (name, target, given, taken) => `🦁 ${name} invokes the Law of the Jungle: gives ${given} to ${target} and takes ${taken} off their table.`,
    playedFly: (name, target) => `🐻 ${name} sends a predator to raid ${target}'s shelter.`,
    playedSwatter: (name) => `🔥 ${name} scares the predator off with a bonfire!`,
    playedGust: (name, target) => `👣 ${name} covers their tracks — the predator now stalks ${target}.`,
    turnEnded: (name) => `--- ${name}'s turn ended ---`,
    winByThreshold: (name) => `${name} built their camp and is ready to survive the wild!`,
    pileDepleted: 'The shelter pile ran out!',
    reasonNoMoves: 'No moves left this turn',
    reasonGrandmaAlready: "Grandpa's Survival Skills are already active for this shelter",
    reasonInspectorNoTargets: 'No opponent has any cards in hand',
    reasonShoplifterNoTargets: 'No opponent has anything on their table',
    reasonForceDealNoGive: 'You have no resources to trade away',
    reasonFlyNoTargets: 'No opponent has a finished shelter',
    reasonSayNoReactive: 'This card can only be played in response to an opponent’s action',
    reasonNoFlyOnYours: "You don't have a predator on your shelter",
    newBadge: 'NEW',
    groupBtn: '📚 Group',
    fanBtn: '🎴 Fan out',
  },
};

function t(key, ...args) {
  const entry = STRINGS[LANG][key];
  if (typeof entry === 'function') return entry(...args);
  return entry;
}

/* ---------------- Rules text ---------------- */

/* Actual card art in the rules — the components list names the resource
   and action cards but a first-time reader has no idea what those look
   like until they're already mid-game. */
function rulesCardGalleryHtml() {
  const uk = LANG === 'uk';
  const row = (label, cardsHtml) => `
    <div class="rules-gallery-row">
      <div class="rules-gallery-label">${escapeHtml(label)}</div>
      <div class="rules-gallery-cards">${cardsHtml}</div>
    </div>
  `;
  const ingredientCards = INGREDIENTS.map(i => renderCard({ id: 'rules-' + i.kind, type: 'ingredient', kind: i.kind }, true, null, false, null, null, true)).join('');
  const actionCards = ACTIONS.map(a => renderCard({ id: 'rules-' + a.kind, type: 'action', kind: a.kind }, true, null, false, null, null, true)).join('');
  const burgerCards = `
    <div class="card burger-front"><img class="card-art-img" src="${BURGER_FRONT_ART[1]}" alt="" draggable="false" /></div>
    <div class="card burger-front"><img class="card-art-img" src="${BURGER_FRONT_ART[2]}" alt="" draggable="false" /></div>
    <div class="card burger-front"><img class="card-art-img" src="${BACK_ART.burger}" alt="" draggable="false" /></div>
  `;
  return `
    <div class="rules-card-gallery">
      ${row(uk ? 'Ресурси' : 'Resources', ingredientCards)}
      ${row(uk ? 'Карти дій' : 'Action cards', actionCards)}
      ${row(uk ? 'Прихистки (номінал 1, 2, сорочка)' : 'Shelters (value 1, 2, face-down)', burgerCards)}
    </div>
  `;
}

function rulesHtml() {
  const uk = LANG === 'uk';
  const ingredientNames = INGREDIENTS.map(i => mName(i)).join(', ');
  const actionCountsLine = ACTIONS.map(a => `${mName(a)} ×${ACTION_COUNTS[a.kind]}`).join(', ');
  const actionListItems = ACTIONS.map(a => `<li><b>${a.ic} ${mName(a)}</b> — ${mDesc(a)}</li>`).join('');
  const cardGallery = rulesCardGalleryHtml();

  if (uk) {
    return `
      <p><b>${MIN_PLAYERS}–${MAX_PLAYERS} гравців · 20–40 хвилин</b></p>
      <p>Ви опинилися серед дикої природи, і найважливіше — вижити. Але потрібні
      ресурси розкидані й рідкісні, тож кожен будує власний прихисток, змагаючись,
      хто зробить це першим. Прихисток збирається прямо на столі перед гравцем,
      картка за карткою — тож усі бачать, наскільки суперник близький до завершення.</p>

      <h4>Компоненти</h4>
      <ul>
        <li><b>60 карт ресурсів</b> — по ${INGREDIENT_COUNT_PER_KIND} карток кожного з 5 видів: ${ingredientNames}.</li>
        <li><b>Карти дій</b> — ${actionCountsLine}.</li>
        <li><b>18 карт прихистків</b> (окрема колода, сорочкою догори) — ${BURGER_PILE_SINGLES} карток вартістю 1 і ${BURGER_PILE_DOUBLES} карток вартістю 2.</li>
      </ul>
      ${cardGallery}

      <h4>Що потрібно для прихистку</h4>
      <p>Прихисток — це не просто "5 різних карток". Потрібен конкретний набір:
      по <b>1</b> Деревині, Воді та Іскрі — і по <b>2</b> Мотузки та Аптечки (разом
      <b>7 карток</b>). Мотузка й Аптечка — дефіцитні, тож саме на них варто
      орієнтуватись заздалегідь.</p>

      <h4>Підготовка</h4>
      <ol>
        <li>Перетасуйте 18 карт прихистків окремо — це стос прихистків, кладіть його сорочкою догори в центр столу.</li>
        <li>Перетасуйте разом усі карти ресурсів та дій.</li>
        <li>Роздайте кожному гравцю по 7 карт.</li>
        <li>Решта карт — колода для взяття, кладіть поруч сорочкою догори.</li>
      </ol>

      <h4>Хід гравця</h4>
      <p>Ходи йдуть за годинниковою стрілкою. На своєму ході гравець:</p>
      <ol>
        <li>Бере 2 карти з колоди (це не рахується як хід).</li>
        <li>Робить <b>до 3 ходів</b> у будь-якому порядку й комбінації:</li>
      </ol>
      <ul>
        <li><b>Викласти ресурс на стіл</b> — кожна картка ресурсу з руки, викладена на свій стіл, це окремий хід. Коли на столі зібрано повний набір (1 Деревина + 1 Вода + 1 Іскра + 2 Мотузки + 2 Аптечки — або 3 будь-яких різних, якщо зіграно Дідусеві навички) — прихисток одразу завершується цим же ходом: карти скидаються, гравець бере верхню картку зі стосу прихистків. Можна вести кілька прихистків одночасно — зайва картка виду, якого вже досить, просто починає новий.</li>
        <li><b>Обмін</b> — запропонувати одному гравцю обмін картами (1 на 1): віддай одну свою карту й вкажи, що хочеш отримати натомість (конкретний ресурс, будь-яку карту дії або без різниці). Гравець може погодитись, давши відповідну карту, або відмовитись; відмова не рахується як витрачений хід.</li>
        <li><b>Зіграти карту дії</b> — розіграти одну з карт дій (описи нижче). Кожна зіграна карта дії — окремий хід.</li>
      </ul>
      <p>Коли колода для взяття закінчується, скид перетасовується і стає новою колодою.</p>

      <h4>Карти дій</h4>
      <ul>${actionListItems}</ul>

      <h4>Скажи Ні</h4>
      <p>Лісник, Хижак, Слід, Ворон-злодій і Закон джунглів цілять в конкретного
      гравця — той може у відповідь зіграти «Скажи Ні», щоб скасувати саму дію
      (картка й хід нападника все одно витрачені, скасовується лише ефект). На «Скажи Ні»
      теж можна відповісти своїм «Скажи Ні» — і так по колу, поки в когось лишається
      картка; всього їх у грі ${ACTION_COUNTS.sayno}, тож ланцюжок сам собою обривається.</p>

      <h4>Хижак на прихистку</h4>
      <p>Картка «Хижак» кладеться на один з готових прихистків суперника — така картка не
      рахується у фінальному підрахунку, поки хижака не проженуть Багаттям (назавжди) або
      Слідом (направити на іншого гравця). Готові прихистки кладуться перед гравцем
      сорочкою догори, поруч один з одним (не в стос) — так усі бачать кількість карт,
      але не їхню вартість (1 чи 2).</p>

      <h4>Кінець гри</h4>
      <p>Гра закінчується, щойно сумарна вартість прихистків (без хижаків) одного гравця
      досягає <b>${WIN_THRESHOLD}</b> — він перемагає.</p>
      <p>Альтернативний варіант: якщо стос прихистків закінчився раніше — гра завершується
      одразу, перемагає гравець із найбільшою сумою (без хижаків); при нічиї — у кого більше карток прихистків.</p>
    `;
  }

  return `
    <p><b>${MIN_PLAYERS}–${MAX_PLAYERS} players · 20–40 minutes</b></p>
    <p>You're stranded in the wilderness, and staying alive is all that matters. Resources
    are scattered and scarce, so everyone builds their own shelter, racing to finish
    first. A shelter is assembled right on the table in front of each player, card by
    card — so everyone can see exactly how close their rivals are.</p>

    <h4>Components</h4>
    <ul>
      <li><b>60 resource cards</b> — ${INGREDIENT_COUNT_PER_KIND} of each of the 5 kinds: ${ingredientNames}.</li>
      <li><b>Action cards</b> — ${actionCountsLine}.</li>
      <li><b>18 shelter cards</b> (a separate face-down deck) — ${BURGER_PILE_SINGLES} cards worth 1 and ${BURGER_PILE_DOUBLES} cards worth 2.</li>
    </ul>
    ${cardGallery}

    <h4>What a shelter needs</h4>
    <p>A shelter isn't just "5 different cards" — it needs a specific set:
    <b>1</b> each of Wood, Water, and Spark — plus <b>2</b> each of Rope and
    Medkit (<b>7 cards</b> total). Rope and Medkit are the scarce ones, so
    plan around them early.</p>

    <h4>Setup</h4>
    <ol>
      <li>Shuffle the 18 shelter cards separately — this is the shelter pile, place it face-down in the middle of the table.</li>
      <li>Shuffle all the resource and action cards together.</li>
      <li>Deal 7 cards to each player.</li>
      <li>The rest becomes the draw pile — place it face-down nearby.</li>
    </ol>

    <h4>Turn overview</h4>
    <p>Turns go clockwise. On their turn, a player:</p>
    <ol>
      <li>Draws 2 cards from the draw pile (this doesn't count as a move).</li>
      <li>Makes <b>up to 3 moves</b> in any order or combination:</li>
    </ol>
    <ul>
      <li><b>Play a resource onto the table</b> — each resource card played from your hand onto your own table is a separate move. Once the full set is on the table (1 Wood + 1 Water + 1 Spark + 2 Rope + 2 Medkit — or any 3 different kinds if Grandpa's Survival Skills was played), the shelter completes immediately as part of that same move: the cards are discarded and you take the top card of the shelter pile. You can have several shelters going at once — an extra card of a kind you already have enough of just starts a new one.</li>
      <li><b>Trade</b> — offer another player a 1-for-1 card trade: give up one of your cards and say what you want back (a specific resource, any action card, or no preference). They can accept by handing over a matching card, or decline; a decline doesn't cost you the move.</li>
      <li><b>Play an action card</b> — play one of the action cards (described below). Each action card played is a separate move.</li>
    </ul>
    <p>When the draw pile runs out, the discard pile is reshuffled and becomes the new draw pile.</p>

    <h4>Action cards</h4>
    <ul>${actionListItems}</ul>

    <h4>Just Say No</h4>
    <p>Ranger, Predator, Trail, Thieving Raven, and Law of the Jungle all target one
    specific player — that player can respond with "Just Say No" to cancel the effect
    (the mover's card and move are still spent; only the payoff is cancelled). Just Say
    No can itself be answered with another Just Say No, and so on for as long as
    someone still has one — there are only ${ACTION_COUNTS.sayno} in the whole deck, so
    the chain is naturally short.</p>

    <h4>Predator on your shelter</h4>
    <p>The Predator card is placed on one of an opponent's finished shelter cards — that
    card doesn't count toward the final total until the predator is driven off, either
    with a Bonfire (gone for good) or a Trail (led onto another player). Finished
    shelters are placed face-down in front of a player, side by side (not stacked) — so
    everyone can see how many cards a player has, but not their value (1 or 2).</p>

    <h4>Ending the game</h4>
    <p>The game ends the moment any player's shelter total (excluding any with a
    predator on them) reaches <b>${WIN_THRESHOLD}</b> — that player wins.</p>
    <p>Alternative ending: if the shelter pile runs out first, the game ends immediately
    and the player with the highest total (excluding predators) wins; ties are broken by
    whoever has more shelter cards.</p>
  `;
}

function openRules() { rulesOpen = true; renderLocal(); }
function closeRules() { rulesOpen = false; renderLocal(); }
function renderRulesModal() {
  if (!rulesOpen) return '';
  return `
    <div class="modal-overlay">
      <div class="modal rules-modal">
        <h3>${t('rulesTitle')}</h3>
        <div class="rules-text">${rulesHtml()}</div>
        <div class="footer-actions"><button class="btn-primary" onclick="closeRules()">${t('gotIt')}</button></div>
      </div>
    </div>
  `;
}

/* Illustrated card art (SVGs in assets/cards/). Action-card art has the
   name + rules text baked in (English only, from the source design files);
   ingredient art is icon-only, so we still overlay a text label for those. */
/* Points at the wilderness-survival art set (assets/cards/*) — the
   original cheeseburger illustrations are still on disk unused, in case
   a future reskin ever wants them back. */
const CARD_ART = {
  ingredient: {
    bun: 'assets/cards/wood.svg',
    patty: 'assets/cards/water.svg',
    cheese: 'assets/cards/spark.svg',
    lettuce: 'assets/cards/rope.svg',
    tomato: 'assets/cards/medkit.svg',
  },
  action: {
    foodtruck: 'assets/cards/airdrop.svg',
    delivery: 'assets/cards/sos.svg',
    grandma: 'assets/cards/grandpa.svg',
    inspector: 'assets/cards/ranger.svg',
    shoplifter: 'assets/cards/raven.svg',
    fly: 'assets/cards/predator.svg',
    swatter: 'assets/cards/bonfire.svg',
    gust: 'assets/cards/trail.svg',
    wild: 'assets/cards/wild.svg',
    forcedeal: 'assets/cards/forcedeal.svg',
    sayno: 'assets/cards/sayno.svg',
  },
};
const BACK_ART = { generic: 'assets/cards/card-back.svg', burger: 'assets/cards/shelter-back.svg' };
const BURGER_FRONT_ART = { 1: 'assets/cards/shelter1.svg', 2: 'assets/cards/shelter2.svg' };
function cardArtSrc(card) { return CARD_ART[card.type] && CARD_ART[card.type][card.kind]; }

function ingMeta(kind) { return INGREDIENTS.find(i => i.kind === kind); }
function actMeta(kind) { return ACTIONS.find(a => a.kind === kind); }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------------- Deck building ---------------- */

function buildDeck() {
  let id = 0;
  const cards = [];
  INGREDIENTS.forEach(ing => {
    for (let i = 0; i < INGREDIENT_COUNT_PER_KIND; i++) cards.push({ id: 'c' + (id++), type: 'ingredient', kind: ing.kind });
  });
  ACTIONS.forEach(a => {
    for (let i = 0; i < ACTION_COUNTS[a.kind]; i++) cards.push({ id: 'c' + (id++), type: 'action', kind: a.kind });
  });
  return cards;
}

function buildBurgerPile() {
  const cards = [];
  for (let i = 0; i < BURGER_PILE_SINGLES; i++) cards.push({ id: 'b' + i, value: 1 });
  for (let i = 0; i < BURGER_PILE_DOUBLES; i++) cards.push({ id: 'b' + (BURGER_PILE_SINGLES + i), value: 2 });
  return cards;
}

/* ---------------- Online multiplayer (Firebase Realtime Database) ----------------
   Fill this in with your own free Firebase project's config (Project settings
   → General → Your apps → SDK setup and configuration). These values are
   meant to be public/client-side for Firebase — that's normal, access is
   controlled by database security rules, not by hiding this object. */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBsljuTSDop2_e4hInOba23IRDSMMZuuP0',
  authDomain: 'cheeseburger-game.firebaseapp.com',
  databaseURL: 'https://cheeseburger-game-default-rtdb.firebaseio.com',
  projectId: 'cheeseburger-game',
  storageBucket: 'cheeseburger-game.firebasestorage.app',
  messagingSenderId: '113927076846',
  appId: '1:113927076846:web:dd02c5d21757806980ecff',
};

let ONLINE = null; // { code, myId, isHost, roomRef, roomData, syncing }
let fbDb = null;

function firebaseReady() {
  return typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey !== 'PASTE_YOUR_API_KEY';
}
function ensureFirebase() {
  if (fbDb) return fbDb;
  firebase.initializeApp(FIREBASE_CONFIG);
  fbDb = firebase.database();
  return fbDb;
}

function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I — easy to read aloud
  let s = '';
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/* Firebase JSON can't hold a Set — swap it for a plain array on the way out
   and back on the way in. Local-only timer handles never leave this device. */
function serializeState(state) {
  const copy = Object.assign({}, state);
  copy.newCardIds = Array.from(state.newCardIds || []);
  delete copy.newCardTimer;
  delete copy.effectTimer;
  return copy;
}
/* Firebase Realtime Database silently drops empty arrays/objects on write
   (an empty [] comes back as `undefined`, not []) — patch every array-typed
   field back to [] so the rest of the game logic can keep assuming arrays. */
function deserializeState(data) {
  const copy = Object.assign({}, data);
  copy.newCardIds = new Set(data.newCardIds || []);
  copy.newCardTimer = null;
  copy.effectTimer = null;
  copy.drawPile = data.drawPile || [];
  copy.discardPile = data.discardPile || [];
  copy.burgerPile = data.burgerPile || [];
  copy.log = data.log || [];
  copy.players = (data.players || []).map(p => Object.assign({}, p, {
    hand: p.hand || [],
    burgers: p.burgers || [],
  }));
  return copy;
}

function pushStateToFirebase() {
  if (!ONLINE || !ONLINE.roomRef || !G) return;
  ONLINE.roomRef.child('state').set(serializeState(G));
}

function onlineCreateRoom(name, avatar) {
  if (!firebaseReady()) { setupState.onlineError = t('onlineNotConfigured'); renderSetup(); return; }
  const db = ensureFirebase();
  const code = genRoomCode();
  const roomRef = db.ref('rooms/' + code);
  roomRef.set({ players: [{ id: 0, name, avatar: avatar || '' }], started: false, state: null, createdAt: Date.now() })
    .then(() => {
      ONLINE = { code, myId: 0, isHost: true, roomRef, roomData: null, syncing: false };
      subscribeOnlineRoom();
    })
    .catch(() => { setupState.onlineError = t('onlineConnectError'); renderSetup(); });
}

function onlineJoinRoom(codeRaw, name, avatar) {
  if (!firebaseReady()) { setupState.onlineError = t('onlineNotConfigured'); renderSetup(); return; }
  const code = codeRaw.trim().toUpperCase();
  if (!code) return;
  const db = ensureFirebase();
  const roomRef = db.ref('rooms/' + code);
  roomRef.once('value').then(snap => {
    const data = snap.val();
    if (!data) { setupState.onlineError = t('onlineRoomNotFound'); renderSetup(); return; }
    if (data.started) { setupState.onlineError = t('onlineRoomStarted'); renderSetup(); return; }
    let assignedId = null, tooFull = false;
    roomRef.child('players').transaction(players => {
      players = players || [];
      if (players.length >= MAX_PLAYERS) { tooFull = true; return; }
      assignedId = players.length;
      players.push({ id: players.length, name, avatar: avatar || '' });
      return players;
    }, (error, committed) => {
      if (tooFull) { setupState.onlineError = t('onlineRoomFull'); renderSetup(); return; }
      if (error || !committed) { setupState.onlineError = t('onlineConnectError'); renderSetup(); return; }
      ONLINE = { code, myId: assignedId, isHost: false, roomRef, roomData: null, syncing: false };
      subscribeOnlineRoom();
    });
  });
}

function subscribeOnlineRoom() {
  ONLINE.roomRef.on('value', snap => {
    const data = snap.val();
    if (!data || !ONLINE) return;
    ONLINE.roomData = data;
    if (data.started && data.state) {
      ONLINE.syncing = true;
      G = deserializeState(data.state);
      G.online = true;
    } else {
      G = null;
    }
    doLocalRender();
  });
}

function onlineStartGame() {
  if (!ONLINE || !ONLINE.isHost || !ONLINE.roomData) return;
  const players = ONLINE.roomData.players;
  if (players.length < MIN_PLAYERS) return;
  const names = players.map(p => p.name);
  const avatars = players.map(p => p.avatar || '');
  ONLINE.syncing = true;
  newGame(names, { online: true, avatars });
  ONLINE.roomRef.child('started').set(true);
}

function onlineLeaveRoom() {
  if (ONLINE && ONLINE.roomRef) ONLINE.roomRef.off();
  ONLINE = null;
}

/* ---------------- Global state ---------------- */

let G = null;
let rulesOpen = false;
/* Per-device UI state that must NEVER be synced to other online players —
   which modal is open, hand view mode, main menu. In online mode the whole
   of G gets pushed to Firebase and broadcast to every connected client, so
   anything that lives on G is effectively shared; this stays purely local. */
let LOCAL_UI = { modal: null, mainMenuOpen: false, handGrouped: false, burgerReveal: null, burgerRevealTimer: null, logToasts: [], lastLogSeq: undefined, logToastTimer: null, animatedIds: new Set(), logHistoryOpen: false, avatarModal: null };

function currentPlayer() { return G.players[G.currentPlayerIndex]; }
function otherPlayers() { return G.players.filter(p => p.id !== currentPlayer().id); }
/* Online: everyone's shared table renders all seats at once, so anything
   that should be private (a player's own burger score/value) must be
   gated by "is this actually my seat" rather than by turn order. In
   hotseat/vs-bots the screen itself is already private per player, so
   treat every seat as "mine" there. */
/* The one constant "whose screen is this" identity across all three modes:
   online — the device's own player, fixed all game; hotseat — whoever's
   turn it is, since the device gets physically handed to that player;
   vs bots — the one human, which is NOT currentPlayer() during a bot's
   turn (that's the mistake that used to rotate the whole seating and leak
   bot burger counts as if they were "mine"). */
function getViewerId() {
  if (!G) return null;
  if (G.online) return ONLINE && ONLINE.myId;
  if (G.vsBots) { const human = G.players.find(p => !p.isBot); return human ? human.id : currentPlayer().id; }
  return currentPlayer().id;
}
function isMe(playerId) {
  if (!G) return true;
  return playerId === getViewerId();
}
function addLog(msg) {
  G.log.unshift(msg);
  if (G.log.length > 40) G.log.pop();
  // Monotonic counter rather than diffing text — two different actions can
  // produce byte-identical log lines (e.g. Shoplifter against the same
  // players twice in a row), which would otherwise look like "nothing new".
  G.logSeq = (G.logSeq || 0) + 1;
}

function newGame(names, options) {
  options = options || {};
  const isBotFlags = options.isBotFlags || names.map(() => false);
  const avatars = options.avatars || [];
  const difficulty = options.difficulty || 'medium';
  const vsBots = !!options.vsBots;
  const deck = shuffle(buildDeck());
  const burgerPile = shuffle(buildBurgerPile());
  const players = names.map((name, i) => ({ id: i, name, avatar: avatars[i] || null, hand: [], burgers: [], builds: [], isBot: !!isBotFlags[i], difficulty }));
  LOCAL_UI = { modal: null, mainMenuOpen: false, handGrouped: false, burgerReveal: null, burgerRevealTimer: null, logToasts: [], lastLogSeq: undefined, logToastTimer: null, animatedIds: new Set(), logHistoryOpen: false, avatarModal: null };
  lastEndRenderKey = null;
  G = {
    players, drawPile: deck, discardPile: [], burgerPile,
    currentPlayerIndex: 0, movesLeft: 3,
    log: [], logSeq: 0, phase: 'pass', passTarget: 0, passPurpose: 'startTurn',
    tradeState: null, pendingReveal: null, reaction: null, winner: null, endReason: null, buildSeq: 0,
    newCardIds: new Set(), newCardTimer: null,
    vsBots, online: !!options.online,
  };
  for (let i = 0; i < 7; i++) players.forEach(p => p.hand.push(G.drawPile.pop()));
  addLog(t('gameStarted'));
  render();
}

/* ---------------- "New card" entrance animation tracking ---------------- */

function markNewCards(ids) {
  ids.forEach(id => G.newCardIds.add(id));
}
function scheduleNewCardExpiry() {
  clearTimeout(G.newCardTimer);
  G.newCardTimer = setTimeout(() => {
    G.newCardIds = new Set();
    render();
  }, 2200);
}

/* ---------------- Transient action "toast" effect over the table ---------------- */

/* targetId anchors the toast to that player's seat so the effect appears
   next to whoever it actually happened to, instead of always floating at
   the top of the table. Falls back to a table-centered toast if omitted. */
function triggerEffect(emoji, text, targetId) {
  if (!G) return;
  Sfx.play(EFFECT_SFX[emoji] || 'play');
  G.effect = { emoji, text, targetId, key: Date.now() + '-' + Math.random() };
  clearTimeout(G.effectTimer);
  G.effectTimer = setTimeout(() => {
    if (G) { G.effect = null; render(); }
  }, 1100);
}
function fxToastHtml() {
  return `<span class="fx-emoji">${G.effect.emoji}</span>${G.effect.text ? `<span class="fx-text">${escapeHtml(G.effect.text)}</span>` : ''}`;
}
function renderEffectToast() {
  if (!G || !G.effect || G.effect.targetId != null) return '';
  return `<div class="fx-toast" data-key="${G.effect.key}">${fxToastHtml()}</div>`;
}
/* The predator gets its own "thrown at you" arc instead of the generic
   gentle pop-in every other effect uses — it's the one card that's
   explicitly an attack landing on a specific target, so it should read
   as something being lobbed at them, not just quietly appearing. */
/* Predator (🐻) and Trail (👣) both read as the predator actively lunging
   at this seat (Trail is literally "redirect the predator onto someone
   else"), so both get the thrown-in arc instead of the generic pop. Trail
   additionally gets a quick claw-mark slash across the toast — it's the
   one that's framed as "the predator strikes here now". */
function renderSeatEffectToast(pl) {
  if (!G || !G.effect || G.effect.targetId !== pl.id) return '';
  const isAttack = G.effect.emoji === '🐻' || G.effect.emoji === '👣';
  const extra = (isAttack ? ' fx-throw' : '') + (G.effect.emoji === '👣' ? ' fx-claw' : '');
  const claws = G.effect.emoji === '👣' ? '<span class="fx-claw-marks" aria-hidden="true"></span>' : '';
  return `<div class="fx-toast fx-toast-seat${extra}" data-key="${G.effect.key}">${fxToastHtml()}${claws}</div>`;
}

function ensureDrawPile(n) {
  while (G.drawPile.length < n && G.discardPile.length > 0) {
    G.drawPile.push(...shuffle(G.discardPile));
    G.discardPile = [];
    addLog(t('reshuffled'));
  }
}
function drawOne() {
  ensureDrawPile(1);
  if (G.drawPile.length === 0) return null;
  Sfx.play('draw');
  return G.drawPile.pop();
}

function startTurnDraw() {
  const p = currentPlayer();
  ensureDrawPile(2);
  let n = 0;
  const drawnIds = [];
  for (let i = 0; i < 2; i++) { const c = drawOne(); if (c) { p.hand.push(c); n++; drawnIds.push(c.id); } }
  G.movesLeft = 3;
  addLog(t('drawCards', p.name, n));
  markNewCards(drawnIds);
  scheduleNewCardExpiry();
}

/* ---------------- Pass-device flow ---------------- */

function goToPassCover(playerIndex, purpose) {
  G.phase = 'pass';
  G.passTarget = playerIndex;
  G.passPurpose = purpose;
  LOCAL_UI.modal = null;
  render();
}

function confirmPassReveal() {
  const purpose = G.passPurpose;
  if (purpose === 'startTurn') {
    G.currentPlayerIndex = G.passTarget;
    startTurnDraw();
    G.phase = 'game';
    Sfx.play('turn');
  } else if (purpose === 'tradeRespond') {
    G.phase = 'tradeRespond';
  } else if (purpose === 'sayNoRespond') {
    G.phase = 'sayNoRespond';
  } else if (purpose === 'applyReaction') {
    applyReaction();
    return;
  } else if (purpose === 'tradeBack' || purpose === 'backToGame') {
    G.phase = 'game';
    scheduleNewCardExpiry();
  }
  render();
}

/* ---------------- Say No / reaction flow ----------------
   Certain action cards target one specific opponent (Health Inspector,
   Fly, Gust of Wind, Shoplifter, Force Deal) and can be answered with a
   "Just Say No" card. Rather than applying their effect immediately, the
   caller logs what was attempted, then routes the actual effect through
   here — reusing the same pass-device/bot-auto/online-gated machinery
   Trade already uses, so hotseat hands the device to the target, vsBots
   asks the bot AI, and online waits for that player's own client. */
function offerReaction(kind, actorId, targetId, extra) {
  G.reaction = { kind, actorId, targetId, extra: extra || null };
  const target = G.players.find(p => p.id === targetId);
  const hasSayNo = target && target.hand.some(c => c.type === 'action' && c.kind === 'sayno');
  if (!hasSayNo) { applyReaction(); return; }
  goToPassCover(targetId, 'sayNoRespond');
}

function respondSayNo(useSayNo) {
  const r = G.reaction;
  if (!r) return;
  const target = G.players.find(p => p.id === r.targetId);
  if (useSayNo) {
    const card = removeFromHand(target, c => c.type === 'action' && c.kind === 'sayno');
    if (card) G.discardPile.push(card);
    addLog(t('saidNo', target.name));
    triggerEffect('✋', t('fxSayNo'), target.id);
    G.reaction = null;
    goToPassCover(r.actorId, 'backToGame');
  } else {
    goToPassCover(r.actorId, 'applyReaction');
  }
}

/* Applies the actually-reacted-to effect once nobody's saying no (or once
   the responder declined to). Card/move cost was already paid up front by
   the caller — this only ever resolves the payoff, so a cancelled action
   still cost its mover the card and the move, matching how Health
   Inspector's anti-exploit fix already worked before Say No existed. */
function applyReaction() {
  const r = G.reaction;
  G.phase = 'game';
  G.reaction = null;
  if (!r) { render(); return; }
  const actor = G.players.find(p => p.id === r.actorId);
  const target = G.players.find(p => p.id === r.targetId);
  switch (r.kind) {
    case 'inspector': {
      if (actor.isBot) {
        const have = new Set(actor.hand.filter(c => c.type === 'ingredient').map(c => c.kind));
        const sorted = target.hand.slice().sort((a, b) => {
          const aScore = a.type === 'ingredient' && !have.has(a.kind) ? 1 : 0;
          const bScore = b.type === 'ingredient' && !have.has(b.kind) ? 1 : 0;
          return bScore - aScore;
        });
        const taken = [];
        for (let i = 0; i < 2 && sorted.length; i++) {
          const c = sorted.shift();
          removeFromHand(target, cc => cc.id === c.id);
          actor.hand.push(c);
          taken.push(c);
        }
        markNewCards(taken.map(c => c.id));
      } else {
        LOCAL_UI.modal = { type: 'inspectorView', targetId: target.id, picked: [] };
      }
      break;
    }
    case 'fly': {
      const slot = target.burgers.find(b => !b.fly);
      if (slot) slot.fly = true;
      break;
    }
    case 'gust': {
      const slot = target.burgers.find(b => !b.fly);
      if (slot) slot.fly = true;
      else target.burgers.push({ id: 'ghost' + Date.now(), value: 0, fly: true });
      break;
    }
    case 'shoplifter': {
      const found = findTopBuildCard(target);
      if (found) {
        removeBuildCard(target, found.card.id);
        actor.hand.push(found.card.isWild ? { id: found.card.id, type: 'action', kind: 'wild' } : { id: found.card.id, type: 'ingredient', kind: found.card.kind });
        markNewCards([found.card.id]);
      }
      break;
    }
    case 'forcedeal': {
      const { giveCardId, takeKind } = r.extra;
      const given = removeFromHand(actor, c => c.id === giveCardId);
      if (given) target.hand.push(given);
      let takenCard = null;
      target.builds.forEach(pile => {
        if (takenCard) return;
        const c = pile.cards.find(cc => cc.kind === takeKind);
        if (c) takenCard = c;
      });
      if (takenCard) {
        removeBuildCard(target, takenCard.id);
        const destPile = addToBuild(actor, takenCard.kind, takenCard.id, takenCard.isWild);
        markNewCards([takenCard.id]);
        finishMoveMaybeCompletePile(actor, destPile);
        return; // finishMoveMaybeCompletePile already calls render()
      }
      break;
    }
  }
  scheduleNewCardExpiry();
  resumeBotIfNeeded();
  render();
}

function botDecideSayNo() { return Math.random() < 0.6; }

/* Bots decide/auto-resolve reactions instantly for each other (and for the
   "no Say No held" fast path) with no UI — offerReaction() only ever pauses
   for a human target. This resumes a bot's own turn after it was
   interrupted to let a human target react to something the bot played. */
function resumeBotIfNeeded() {
  if (!G || G.phase !== 'game' || G.movesLeft <= 0) return;
  const cp = currentPlayer();
  if (cp && cp.isBot) setTimeout(() => botMoveStep(cp), BOT_ACT_DELAY);
}

/* ---------------- Burger building (on the table) ----------------
   Ingredients are no longer assembled from hand in one shot — each one is
   played onto the player's own table individually (like Monopoly Deal's
   face-up property sets), one card = one move. A player can have several
   burgers in progress at once (p.builds is an array of independent
   piles) — playing a kind you already started elsewhere just opens a new
   pile instead of blocking you, so there's never a reason to hold an
   ingredient in hand. Each card's "seq" is a global monotonic counter so
   Shoplifter can find the single most-recently-placed card across every
   pile a player has, regardless of which pile it landed in. */
function pileKindsHave(pile) { return new Set(pile.cards.map(c => c.kind)); }
function pileKindCount(pile, kind) { return pile.cards.filter(c => c.kind === kind).length; }
/* How many of this kind a pile still wants — 1 for every kind once
   Grandma's shortcut is active on it (just needs 3 distinct kinds total),
   otherwise whatever PILE_REQUIREMENTS says (1 for most, 2 for Rope/Medkit). */
function pileRequiredCount(pile, kind) { return pile.grandmaActive ? 1 : (PILE_REQUIREMENTS[kind] || 1); }
function pileTargetCount(pile) { return pile.grandmaActive ? 3 : Object.values(PILE_REQUIREMENTS).reduce((s, n) => s + n, 0); }
function pileIsComplete(pile) {
  if (pile.grandmaActive) return pileKindsHave(pile).size >= 3;
  return INGREDIENTS.every(i => pileKindCount(pile, i.kind) >= PILE_REQUIREMENTS[i.kind]);
}
function hasGrandmaCard(p) { return p.hand.some(c => c.type === 'action' && c.kind === 'grandma'); }

/* Finds (or opens) a pile that still wants more of this kind — so playing
   a duplicate of something a pile has already fully satisfied starts a
   second burger instead of being wasted, while a pile that still needs a
   2nd Rope/Medkit keeps collecting into itself. */
function addToBuild(p, kind, cardId, isWild) {
  let pile = p.builds.find(b => pileKindCount(b, kind) < pileRequiredCount(b, kind));
  if (!pile) { pile = { cards: [], grandmaActive: false }; p.builds.push(pile); }
  G.buildSeq = (G.buildSeq || 0) + 1;
  pile.cards.push({ id: cardId, kind, isWild, seq: G.buildSeq });
  return pile;
}
function findTopBuildCard(p) {
  let best = null, bestPile = null;
  p.builds.forEach(pile => pile.cards.forEach(c => {
    if (!best || c.seq > best.seq) { best = c; bestPile = pile; }
  }));
  return best ? { card: best, pile: bestPile } : null;
}
function removeBuildCard(p, cardId) {
  let removed = null;
  p.builds.forEach(pile => {
    const idx = pile.cards.findIndex(c => c.id === cardId);
    if (idx >= 0) removed = pile.cards.splice(idx, 1)[0];
  });
  p.builds = p.builds.filter(pile => pile.cards.length > 0);
  return removed;
}
function totalBuildCards(p) { return p.builds.reduce((s, pile) => s + pile.cards.length, 0); }

function giveBurgerCard(p) {
  if (G.burgerPile.length === 0) { addLog(t('burgerPileEmpty')); return null; }
  const card = G.burgerPile.pop();
  p.burgers.push({ id: card.id, value: card.value, fly: false });
  return card;
}

/* Shown only on the maker's own device (LOCAL_UI is never synced) — the
   burger's value stays hidden from opponents even though the action itself
   is public. */
function showBurgerReveal(value) {
  LOCAL_UI.burgerReveal = { value, key: Date.now() + '-' + Math.random() };
  clearTimeout(LOCAL_UI.burgerRevealTimer);
  LOCAL_UI.burgerRevealTimer = setTimeout(() => {
    LOCAL_UI.burgerReveal = null;
    renderLocal();
  }, 2400);
}
function renderBurgerReveal() {
  if (!LOCAL_UI.burgerReveal) return '';
  return `<div class="burger-reveal-toast" data-key="${LOCAL_UI.burgerReveal.key}">${t('burgerRevealText', LOCAL_UI.burgerReveal.value)}</div>`;
}

function removeFromHand(p, predicate) {
  const idx = p.hand.findIndex(predicate);
  if (idx < 0) return null;
  return p.hand.splice(idx, 1)[0];
}

/* Plays one ingredient card from hand onto the current player's own table.
   Completing a pile's set (3 distinct kinds with Grandma active on it, 5
   otherwise) happens automatically as part of this same move — no extra
   move to "collect" the finished burger. Playing a kind you're already
   building elsewhere just opens a second pile rather than being blocked —
   nothing stops working on several burgers in parallel. */
function playIngredientToBuild(cardId) {
  const p = currentPlayer();
  if (G.movesLeft <= 0) return;
  const card = p.hand.find(c => c.id === cardId);
  if (!card || card.type !== 'ingredient') return;
  removeFromHand(p, c => c.id === cardId);
  const pile = addToBuild(p, card.kind, card.id, false);
  G.movesLeft--;
  addLog(t('playedIngredient', p.name, mName(ingMeta(card.kind))));
  triggerEffect(ingMeta(card.kind).ic, null, p.id);
  finishMoveMaybeCompletePile(p, pile);
}

/* Grandma's Recipe applies to a single pile — whichever one you most
   recently started that isn't already on the shortcut, or a fresh one if
   every open pile already has it. If that pile already has 3+ distinct
   kinds, the burger completes immediately, same as before. */
function playGrandmaShortcut() {
  const p = currentPlayer();
  if (G.movesLeft <= 0) return;
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'grandma');
  if (!card) return;
  G.discardPile.push(card);
  let pile = [...p.builds].reverse().find(b => !b.grandmaActive);
  if (!pile) { pile = { cards: [], grandmaActive: false }; p.builds.push(pile); }
  pile.grandmaActive = true;
  G.movesLeft--;
  addLog(t('playedGrandma', p.name));
  triggerEffect('🎒', null, p.id);
  finishMoveMaybeCompletePile(p, pile);
}

function openWildModal() {
  const p = currentPlayer();
  if (G.movesLeft <= 0 || !p.hand.some(c => c.type === 'action' && c.kind === 'wild')) return;
  LOCAL_UI.modal = { type: 'wildPick' };
  renderLocal();
}
function playWild(kind) {
  const p = currentPlayer();
  if (G.movesLeft <= 0) return;
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'wild');
  if (!card) return;
  G.discardPile.push(card);
  const pile = addToBuild(p, kind, card.id, true);
  G.movesLeft--;
  addLog(t('playedIngredient', p.name, `${t('wildLabel')} (${mName(ingMeta(kind))})`));
  triggerEffect('🔧', null, p.id);
  LOCAL_UI.modal = null;
  finishMoveMaybeCompletePile(p, pile);
}

/* ---------------- Force Deal ---------------- */
/* 3-step flow (give card → pick target → pick which of their table kinds
   to take), same shape as Trade's target→offer flow. Unlike Trade this
   can't be declined — the only recourse for the target is Say No, applied
   once the actor confirms which kind they're taking (see applyReaction's
   'forcedeal' case). */
function openForceDealModal() {
  const p = currentPlayer();
  if (G.movesLeft <= 0 || !p.hand.some(c => c.type === 'action' && c.kind === 'forcedeal')) return;
  if (!p.hand.some(c => c.type === 'ingredient')) return;
  if (!otherPlayers().some(pl => pl.builds.length > 0)) return;
  LOCAL_UI.modal = { type: 'forceDealGive' };
  renderLocal();
}
function pickForceDealGive(cardId) {
  LOCAL_UI.modal = { type: 'forceDealTarget', giveCardId: cardId };
  renderLocal();
}
function pickForceDealTarget(targetId) {
  LOCAL_UI.modal = { type: 'forceDealTake', giveCardId: LOCAL_UI.modal.giveCardId, targetId };
  renderLocal();
}
function confirmForceDeal(kind) {
  const p = currentPlayer();
  const m = LOCAL_UI.modal;
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'forcedeal');
  if (!card) return;
  G.discardPile.push(card);
  G.movesLeft--;
  const target = G.players.find(pl => pl.id === m.targetId);
  const givenMeta = ingMeta((p.hand.find(c => c.id === m.giveCardId) || {}).kind);
  addLog(t('playedForceDeal', p.name, target.name, givenMeta ? mName(givenMeta) : '?', mName(ingMeta(kind))));
  triggerEffect('🦁', null, target.id);
  LOCAL_UI.modal = null;
  offerReaction('forcedeal', p.id, m.targetId, { giveCardId: m.giveCardId, takeKind: kind });
}

function finishMoveMaybeCompletePile(p, pile) {
  if (pileIsComplete(pile)) {
    p.builds = p.builds.filter(b => b !== pile);
    pile.cards.forEach(b => G.discardPile.push({ id: b.id, type: 'ingredient', kind: b.kind }));
    const burgerCard = giveBurgerCard(p);
    addLog(t('madeBurger', p.name));
    triggerEffect('🏕️✨', t('fxBurger'), p.id);
    if (burgerCard && isMe(p.id)) showBurgerReveal(burgerCard.value);
    afterBurgerMade();
    return;
  }
  render();
}

function afterBurgerMade() {
  const p = currentPlayer();
  const validSum = p.burgers.filter(b => !b.fly).reduce((s, b) => s + b.value, 0);
  if (validSum >= WIN_THRESHOLD) {
    G.phase = 'end';
    G.winner = [p];
    G.endReason = t('winByThreshold', p.name);
    Sfx.play('win');
    render();
    return;
  }
  maybeEndByDepletion();
  render();
}

function maybeEndByDepletion() {
  if (G.phase === 'end') return;
  if (G.burgerPile.length > 0) return;
  let best = -1, winners = [];
  G.players.forEach(pl => {
    const sum = pl.burgers.filter(b => !b.fly).reduce((s, b) => s + b.value, 0);
    if (sum > best) { best = sum; winners = [pl]; } else if (sum === best) { winners.push(pl); }
  });
  if (winners.length > 1) {
    let bestCount = -1, finalWinners = [];
    winners.forEach(pl => {
      const cnt = pl.burgers.filter(b => !b.fly).length;
      if (cnt > bestCount) { bestCount = cnt; finalWinners = [pl]; } else if (cnt === bestCount) finalWinners.push(pl);
    });
    winners = finalWinners;
  }
  G.phase = 'end';
  G.winner = winners;
  G.endReason = t('pileDepleted');
  Sfx.play('win');
}

/* ---------------- Trade ---------------- */

function openTradeModal() {
  if (G.movesLeft <= 0) return;
  LOCAL_UI.modal = { type: 'tradeTarget' };
  renderLocal();
}
function pickTradeTarget(targetId) {
  LOCAL_UI.modal = { type: 'tradeOffer', targetId, offeredCardId: null, requestedKind: 'any' };
  renderLocal();
}
function selectOfferCard(cardId) {
  LOCAL_UI.modal.offeredCardId = cardId;
  renderLocal();
}
function selectRequestedKind(kind) {
  LOCAL_UI.modal.requestedKind = kind;
  renderLocal();
}
/* kind is either an ingredient kind, 'action' (any action card), or 'any' (no preference) */
function cardMatchesKind(c, kind) {
  if (!kind || kind === 'any') return true;
  if (kind === 'action') return c.type === 'action';
  return c.type === 'ingredient' && c.kind === kind;
}
function describeRequestedKind(kind) {
  if (!kind || kind === 'any') return t('wantAny');
  if (kind === 'action') return t('wantAction');
  const meta = ingMeta(kind);
  return `${meta.ic} ${mName(meta)}`;
}
function confirmOffer() {
  const { targetId, offeredCardId, requestedKind } = LOCAL_UI.modal;
  if (!offeredCardId) return;
  G.tradeState = { fromId: currentPlayer().id, targetId, offeredCardId, requestedKind: requestedKind || 'any', status: 'pending' };
  LOCAL_UI.modal = null;
  goToPassCover(targetId, 'tradeRespond');
}
function respondTrade(responseCardId) {
  const ts = G.tradeState;
  const from = G.players.find(p => p.id === ts.fromId);
  const to = G.players.find(p => p.id === ts.targetId);
  if (responseCardId === 'DECLINE') {
    ts.status = 'declined';
    addLog(t('tradeDeclined', to.name, from.name));
  } else {
    const offered = removeFromHand(from, c => c.id === ts.offeredCardId);
    const given = removeFromHand(to, c => c.id === responseCardId);
    from.hand.push(given);
    to.hand.push(offered);
    G.movesLeft--;
    ts.status = 'accepted';
    addLog(t('tradeAccepted', from.name, to.name));
    triggerEffect('🤝', t('fxTrade'), from.id);
    markNewCards([given.id, offered.id]);
  }
  goToPassCover(from.id, 'tradeBack');
}
function closeTradeResult() {
  G.tradeState = null;
  G.phase = 'game';
  render();
}

/* ---------------- Action cards ---------------- */

function playFoodTruck() {
  const p = currentPlayer();
  if (G.movesLeft <= 0) return;
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'foodtruck');
  if (!card) return;
  G.discardPile.push(card);
  ensureDrawPile(2);
  const taken = [];
  for (let i = 0; i < 2 && G.drawPile.length > 0; i++) taken.push(drawOne());
  taken.forEach(c => p.hand.push(c));
  G.movesLeft--;
  addLog(t('playedFoodTruck', p.name, taken.length));
  triggerEffect('🪂', t('fxTruck'), p.id);
  markNewCards(taken.map(c => c.id));
  scheduleNewCardExpiry();
  LOCAL_UI.modal = null;
  render();
}

function openDeliveryModal() {
  if (G.movesLeft <= 0 || !currentPlayer().hand.some(c => c.type === 'action' && c.kind === 'delivery')) return;
  LOCAL_UI.modal = { type: 'delivery' };
  renderLocal();
}
function playDelivery(kind) {
  const p = currentPlayer();
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'delivery');
  if (!card) return;
  G.discardPile.push(card);
  let total = 0;
  const gainedIds = [];
  otherPlayers().forEach(other => {
    const matches = other.hand.filter(c => c.type === 'ingredient' && c.kind === kind);
    other.hand = other.hand.filter(c => !(c.type === 'ingredient' && c.kind === kind));
    p.hand.push(...matches);
    total += matches.length;
    matches.forEach(c => gainedIds.push(c.id));
  });
  G.movesLeft--;
  addLog(t('playedDelivery', p.name, mName(ingMeta(kind)), total));
  triggerEffect('📻', t('fxDelivery'), p.id);
  markNewCards(gainedIds);
  scheduleNewCardExpiry();
  LOCAL_UI.modal = null;
  render();
}

function openInspectorModal() {
  if (G.movesLeft <= 0 || !currentPlayer().hand.some(c => c.type === 'action' && c.kind === 'inspector')) return;
  LOCAL_UI.modal = { type: 'inspectorTarget' };
  renderLocal();
}
/* Consumes the Inspector card and spends the move right here, before the
   target's hand is even shown — viewing the hand is the payoff of playing
   the card, so canceling afterward must not refund it (previously the card
   wasn't spent until confirmInspector, letting players peek for free).
   The reveal itself now routes through offerReaction() so the target can
   Say No to it — see applyReaction()'s 'inspector' case for what actually
   happens once nobody cancels it. */
function pickInspectorTarget(targetId) {
  const p = currentPlayer();
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'inspector');
  if (!card) return;
  G.discardPile.push(card);
  G.movesLeft--;
  const target = G.players.find(pl => pl.id === targetId);
  addLog(t('playedInspector', p.name, target.name));
  triggerEffect('🌲', t('fxInspect'), target.id);
  LOCAL_UI.modal = null;
  offerReaction('inspector', p.id, targetId);
}
function toggleInspectorPick(cardId) {
  const m = LOCAL_UI.modal;
  const idx = m.picked.indexOf(cardId);
  if (idx >= 0) m.picked.splice(idx, 1);
  else if (m.picked.length < 2) m.picked.push(cardId);
  renderLocal();
}
function confirmInspector() {
  const p = currentPlayer();
  const m = LOCAL_UI.modal;
  if (m.picked.length !== 2) return;
  const target = G.players.find(pl => pl.id === m.targetId);
  const taken = [];
  m.picked.forEach(cid => {
    const c = removeFromHand(target, cc => cc.id === cid);
    if (c) { p.hand.push(c); taken.push(c); }
  });
  markNewCards(taken.map(c => c.id));
  scheduleNewCardExpiry();
  LOCAL_UI.modal = null;
  render();
}

function openShoplifterModal() {
  if (G.movesLeft <= 0 || !currentPlayer().hand.some(c => c.type === 'action' && c.kind === 'shoplifter')) return;
  if (!otherPlayers().some(pl => pl.builds.length > 0)) return;
  LOCAL_UI.modal = { type: 'shoplifterTarget' };
  renderLocal();
}
/* Steals only the TOP (most recently placed) card off the chosen
   opponent's table — the single most recent placement across all of their
   piles, not a random pick from their whole hand like the old version.
   Restricting to "top only" keeps it from being a precision snipe of
   exactly the ingredient the thief needs. */
function playShoplifter(targetId) {
  const p = currentPlayer();
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'shoplifter');
  if (!card) return;
  G.discardPile.push(card);
  G.movesLeft--;
  const target = G.players.find(pl => pl.id === targetId);
  const found = findTopBuildCard(target);
  const ingName = found ? (found.card.isWild ? t('wildLabel') : mName(ingMeta(found.card.kind))) : '';
  addLog(t('playedShoplifter', p.name, target.name, ingName));
  triggerEffect('🐦‍⬛', t('fxSteal'), target.id);
  LOCAL_UI.modal = null;
  offerReaction('shoplifter', p.id, targetId);
}

function openFlyModal() {
  if (G.movesLeft <= 0 || !currentPlayer().hand.some(c => c.type === 'action' && c.kind === 'fly')) return;
  const eligible = otherPlayers().filter(pl => pl.burgers.length > 0);
  if (eligible.length === 0) return;
  LOCAL_UI.modal = { type: 'flyTarget' };
  renderLocal();
}
function playFly(targetId) {
  const p = currentPlayer();
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'fly');
  if (!card) return;
  G.discardPile.push(card);
  G.movesLeft--;
  const target = G.players.find(pl => pl.id === targetId);
  addLog(t('playedFly', p.name, target.name));
  triggerEffect('🐻', t('fxFly'), target.id);
  LOCAL_UI.modal = null;
  offerReaction('fly', p.id, targetId);
}

function openSwatterModal() {
  const p = currentPlayer();
  if (G.movesLeft <= 0) return;
  if (!p.hand.some(c => c.type === 'action' && c.kind === 'swatter')) return;
  if (!p.burgers.some(b => b.fly)) return;
  playSwatter();
}
function playSwatter() {
  const p = currentPlayer();
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'swatter');
  if (!card) return;
  G.discardPile.push(card);
  const slot = p.burgers.find(b => b.fly);
  if (slot) slot.fly = false;
  G.movesLeft--;
  addLog(t('playedSwatter', p.name));
  triggerEffect('🔥💥', t('fxSwat'), p.id);
  render();
}

function openGustModal() {
  const p = currentPlayer();
  if (G.movesLeft <= 0) return;
  if (!p.hand.some(c => c.type === 'action' && c.kind === 'gust')) return;
  if (!p.burgers.some(b => b.fly)) return;
  LOCAL_UI.modal = { type: 'gustTarget' };
  renderLocal();
}
function playGust(targetId) {
  const p = currentPlayer();
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'gust');
  if (!card) return;
  G.discardPile.push(card);
  // Removing your OWN fly happens immediately — only placing it on the
  // target is something they could Say No to.
  const slot = p.burgers.find(b => b.fly);
  if (slot) slot.fly = false;
  G.movesLeft--;
  const target = G.players.find(pl => pl.id === targetId);
  addLog(t('playedGust', p.name, target.name));
  triggerEffect('👣', t('fxGust'), target.id);
  LOCAL_UI.modal = null;
  offerReaction('gust', p.id, targetId);
}

/* Picking your own avatar is a real, shared, synced change (other players
   see it too) — but it must work regardless of whose turn it is, so it
   can't live in LOCAL_UI.modal (that channel only renders during your own
   turn — see renderGame/renderOnlineGame). Gets its own ungated slot, same
   pattern as settings/log-history. */
function openAvatarPicker(playerId) {
  if (!isMe(playerId)) return;
  LOCAL_UI.avatarModal = { playerId, draft: null };
  renderLocal();
}
function closeAvatarPicker() { LOCAL_UI.avatarModal = null; renderLocal(); }
function setAvatarDraft(value) {
  LOCAL_UI.avatarModal.draft = value.trim().slice(0, 4);
  renderLocal();
}
function confirmAvatarPick() {
  const m = LOCAL_UI.avatarModal;
  const target = G.players.find(pl => pl.id === m.playerId);
  const emoji = (m.draft != null ? m.draft : (target.avatar || '')).trim();
  if (!target || !emoji) return;
  target.avatar = emoji;
  LOCAL_UI.avatarModal = null;
  render();
}

/* Cancel/close only — mutating actions (delivery, inspector, fly, gust,
   grandma's recipe) clear LOCAL_UI.modal themselves and sync via render(),
   since closing here must never be responsible for pushing their mutation. */
function closeModal() {
  LOCAL_UI.modal = null;
  if (G.pendingReveal) { G.pendingReveal = null; render(); }
  else { renderLocal(); }
}

/* ---------------- Bot AI ---------------- */

const BOT_ACT_DELAY = 800;

function botTakeTurn(bot) {
  botMoveStep(bot);
}

function botMoveStep(bot) {
  if (!G || G.phase !== 'game' || !currentPlayer() || currentPlayer().id !== bot.id) return;
  if (G.movesLeft <= 0) { setTimeout(() => endTurn(), 500); return; }
  const acted = botDoOneMove(bot);
  render();
  if (!acted) { setTimeout(() => endTurn(), 500); return; }
  setTimeout(() => botMoveStep(bot), BOT_ACT_DELAY);
}

/* Greedy rule-based move picker. Reuses the same action functions the human
   UI calls — they all operate on currentPlayer(), which is already the bot
   during its turn, so no separate "bot version" of the core logic is needed
   except where the human path depends on open modal state (Grandma's
   Recipe, Health Inspector). */
function botDoOneMove(bot) {
  const diff = bot.difficulty || 'medium';
  const chance = (easy, medium, hard) => ({ easy, medium, hard }[diff] ?? medium);

  // Playing any ingredient onto the table is always the top priority —
  // it's free, guaranteed progress with no downside (a duplicate kind just
  // opens a second pile instead of being wasted).
  const anyIngredient = bot.hand.find(c => c.type === 'ingredient');
  if (anyIngredient) { playIngredientToBuild(anyIngredient.id); return true; }

  if (hasGrandmaCard(bot)) {
    const targetPile = [...bot.builds].reverse().find(b => !b.grandmaActive);
    const willFinishNow = targetPile && pileKindsHave(targetPile).size >= 3;
    if (willFinishNow || Math.random() < chance(0.3, 0.6, 0.85)) { playGrandmaShortcut(); return true; }
  }

  if (bot.hand.some(c => c.type === 'action' && c.kind === 'wild')) {
    if (Math.random() < chance(0.4, 0.7, 0.9)) {
      const allHave = new Set(bot.builds.flatMap(pile => pile.cards.map(c => c.kind)));
      const missing = INGREDIENTS.map(i => i.kind).filter(k => !allHave.has(k));
      playWild(missing.length ? missing[0] : INGREDIENTS[0].kind);
      return true;
    }
  }

  if (bot.hand.some(c => c.type === 'action' && c.kind === 'swatter') && bot.burgers.some(b => b.fly)) {
    playSwatter();
    return true;
  }

  // Only hard bots bother negotiating trades with each other — easy/medium
  // bots keep it simple and just play cards.
  if (diff === 'hard' && Math.random() < 0.3) {
    if (botTryTradeWithBot(bot)) return true;
  }

  if (bot.hand.some(c => c.type === 'action' && c.kind === 'delivery')) {
    const kind = botPickNeededIngredientKind(bot);
    if (kind) { playDelivery(kind); return true; }
  }

  if (bot.hand.some(c => c.type === 'action' && c.kind === 'foodtruck')) {
    if (Math.random() < chance(0.5, 0.75, 0.95)) { playFoodTruck(); return true; }
  }

  if (bot.hand.some(c => c.type === 'action' && c.kind === 'shoplifter')) {
    const target = botPickBuildTarget(bot);
    if (target && Math.random() < chance(0.35, 0.6, 0.85)) { playShoplifter(target.id); return true; }
  }

  if (bot.hand.some(c => c.type === 'action' && c.kind === 'forcedeal') && bot.hand.some(c => c.type === 'ingredient')) {
    const target = botPickBuildTarget(bot);
    if (target && Math.random() < chance(0.3, 0.55, 0.8)) {
      const takeKind = [...new Set(target.builds.flatMap(pile => pile.cards.map(c => c.kind)))][0];
      const giveCard = bot.hand.find(c => c.type === 'ingredient' && c.kind !== takeKind);
      if (takeKind && giveCard) {
        const card = removeFromHand(bot, c => c.type === 'action' && c.kind === 'forcedeal');
        if (card) {
          G.discardPile.push(card);
          G.movesLeft--;
          addLog(t('playedForceDeal', bot.name, target.name, mName(ingMeta(giveCard.kind)), mName(ingMeta(takeKind))));
          triggerEffect('🦁', null, target.id);
          offerReaction('forcedeal', bot.id, target.id, { giveCardId: giveCard.id, takeKind });
          return true;
        }
      }
    }
  }

  if (bot.hand.some(c => c.type === 'action' && c.kind === 'inspector')) {
    const target = botPickRichestTarget(bot);
    if (target && Math.random() < chance(0.4, 0.7, 0.9)) { botPlayInspector(bot, target); return true; }
  }

  if (bot.hand.some(c => c.type === 'action' && c.kind === 'fly')) {
    const target = botPickLeaderTarget(bot);
    if (target && Math.random() < chance(0.25, 0.55, 0.8)) { playFly(target.id); return true; }
  }

  if (bot.hand.some(c => c.type === 'action' && c.kind === 'gust') && bot.burgers.some(b => b.fly)) {
    const target = botPickLeaderTarget(bot);
    if (target) { playGust(target.id); return true; }
  }

  return false;
}

function botPickNeededIngredientKind(bot) {
  const have = new Set(bot.builds.flatMap(pile => pile.cards.map(c => c.kind)));
  const missing = INGREDIENTS.map(i => i.kind).filter(k => !have.has(k));
  if (!missing.length) return INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)].kind;
  return missing[Math.floor(Math.random() * missing.length)];
}

function botPickRichestTarget(bot) {
  const candidates = otherPlayers().filter(pl => pl.hand.length > 0);
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.hand.length - a.hand.length);
  return candidates[0];
}

/* Prefers whoever's closest to finishing their burger — that's the most
   disruptive target for both Shoplifter and Force Deal. */
function botPickBuildTarget(bot) {
  const candidates = otherPlayers().filter(pl => pl.builds.length > 0);
  if (!candidates.length) return null;
  candidates.sort((a, b) => totalBuildCards(b) - totalBuildCards(a));
  return candidates[0];
}

function botPickLeaderTarget(bot) {
  const candidates = G.players.filter(pl => pl.id !== bot.id && pl.burgers.length > 0);
  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    const sa = a.burgers.filter(x => !x.fly).reduce((s, x) => s + x.value, 0);
    const sb = b.burgers.filter(x => !x.fly).reduce((s, x) => s + x.value, 0);
    return sb - sa;
  });
  return candidates[0];
}

/* Bots don't open the inspectorTarget/inspectorView modals a human would —
   this plays the card and announces it the same way, then routes the
   actual reveal-and-take through offerReaction() same as the human path,
   so a human target still gets a chance to Say No. The picking-which-2-
   cards logic itself now lives in applyReaction()'s 'inspector' case
   (shared for any bot actor, not just this one). */
function botPlayInspector(bot, target) {
  const card = removeFromHand(bot, c => c.type === 'action' && c.kind === 'inspector');
  if (!card) return;
  G.discardPile.push(card);
  G.movesLeft--;
  addLog(t('playedInspector', bot.name, target.name));
  triggerEffect('🌲', t('fxInspect'), target.id);
  offerReaction('inspector', bot.id, target.id);
}

/* Bots never propose a trade to the human (would need extra UI to let the
   human respond asynchronously mid-bot-turn) — but hard-difficulty bots will
   negotiate with each other, resolved instantly with no UI since neither
   side needs privacy from the human observer. */
function botDecideTradeResponse(bot) {
  const ts = G.tradeState;
  const from = G.players.find(p => p.id === ts.fromId);
  const offered = findCardAnywhereForDisplay(ts.offeredCardId, from);
  const requestedKind = ts.requestedKind || 'any';
  const matches = bot.hand.filter(c => cardMatchesKind(c, requestedKind));
  if (!matches.length) return 'DECLINE'; // can't fulfill what's being asked for
  const diff = bot.difficulty || 'medium';
  const acceptChance = { easy: 0.5, medium: 0.65, hard: 0.8 }[diff] ?? 0.6;
  const have = new Set(bot.hand.filter(c => c.type === 'ingredient').map(c => c.kind));
  const wantsOffered = offered.type === 'ingredient' && !have.has(offered.kind);
  if (!wantsOffered && Math.random() > acceptChance) return 'DECLINE';
  const counts = {};
  bot.hand.forEach(c => { counts[c.kind] = (counts[c.kind] || 0) + 1; });
  const give = matches.slice().sort((a, b) => (counts[b.kind] - counts[a.kind]))[0];
  return give.id;
}

function botTryTradeWithBot(bot) {
  const partners = G.players.filter(pl => pl.id !== bot.id && pl.isBot && pl.hand.length > 0);
  if (!partners.length || !bot.hand.length) return false;
  const partner = partners[Math.floor(Math.random() * partners.length)];

  const counts = {};
  bot.hand.forEach(c => { counts[c.kind] = (counts[c.kind] || 0) + 1; });
  const offerCard = bot.hand.slice().sort((a, b) => counts[b.kind] - counts[a.kind])[0];

  const partnerHave = new Set(partner.hand.filter(c => c.type === 'ingredient').map(c => c.kind));
  const wantsOffered = offerCard.type === 'ingredient' && !partnerHave.has(offerCard.kind);
  const acceptChance = { easy: 0.5, medium: 0.65, hard: 0.8 }[partner.difficulty] ?? 0.6;
  if (!wantsOffered && Math.random() > acceptChance) {
    addLog(t('tradeDeclined', partner.name, bot.name));
    return false; // a decline doesn't cost a move, same rule as human trades
  }

  const partnerCounts = {};
  partner.hand.forEach(c => { partnerCounts[c.kind] = (partnerCounts[c.kind] || 0) + 1; });
  const giveBack = partner.hand.slice().sort((a, b) => partnerCounts[b.kind] - partnerCounts[a.kind])[0];
  if (!giveBack) return false;

  removeFromHand(bot, c => c.id === offerCard.id);
  removeFromHand(partner, c => c.id === giveBack.id);
  bot.hand.push(giveBack);
  partner.hand.push(offerCard);
  G.movesLeft--;
  addLog(t('tradeAccepted', bot.name, partner.name));
  triggerEffect('🤝', t('fxTrade'), bot.id);
  markNewCards([giveBack.id, offerCard.id]);
  scheduleNewCardExpiry();
  return true;
}

/* ---------------- Main menu (restart / exit) ---------------- */

function toggleSfx() {
  const nowMuted = Sfx.toggleMuted();
  if (!nowMuted) Sfx.play('click');
  renderLocal();
}

/* Settings modal is independent of G (must also work on the setup screen,
   before a game exists), so it's its own bit of state and doesn't route
   through LOCAL_UI.modal / closeModal() like every other modal here. */
let settingsOpen = false;
function openSettingsModal() { settingsOpen = true; renderLocal(); }
function closeSettingsModal() { settingsOpen = false; renderLocal(); }
function toggleMusicEnabled() {
  const nowEnabled = Music.toggleEnabled();
  renderLocal();
  return nowEnabled;
}
function setMusicVolume(v) { Music.setVolume(Number(v) / 100); }
function renderSettingsModal() {
  if (!settingsOpen) return '';
  return `
    <div class="modal-overlay">
      <div class="modal">
        <h3>⚙️ ${t('settingsTitle')}</h3>
        <div class="choice-list">
          <button class="choice-btn" onclick="toggleSfx()">${Sfx.isMuted() ? t('menuSoundOff') : t('menuSoundOn')}</button>
          <button class="choice-btn" onclick="toggleMusicEnabled()">${Music.isEnabled() ? t('menuMusicOn') : t('menuMusicOff')}</button>
          <div class="settings-volume-row">
            <span>${t('musicVolume')}</span>
            <input type="range" min="0" max="100" value="${Math.round(Music.getVolume() * 100)}"
              oninput="setMusicVolume(this.value)" ${Music.isEnabled() ? '' : 'disabled'} />
          </div>
        </div>
        <div class="footer-actions"><button class="btn-secondary" onclick="closeSettingsModal()">${t('close')}</button></div>
      </div>
    </div>
  `;
}
function openMainMenu() { LOCAL_UI.mainMenuOpen = 'menu'; renderLocal(); }
function closeMainMenu() { LOCAL_UI.mainMenuOpen = false; renderLocal(); }
function askConfirm(kind) { LOCAL_UI.mainMenuOpen = kind; renderLocal(); } // 'confirmRestart' | 'confirmExit'
function restartSameGame() {
  if (G.online && !ONLINE.isHost) return; // only the host may reshuffle/redeal
  const names = G.players.map(p => p.name);
  const isBotFlags = G.players.map(p => p.isBot);
  const avatars = G.players.map(p => p.avatar || '');
  const difficulty = G.players[0] && G.players[0].difficulty;
  if (G.online) ONLINE.syncing = true;
  newGame(names, { vsBots: G.vsBots, isBotFlags, avatars, difficulty, online: G.online });
}
function exitToSetup() {
  if (ONLINE) onlineLeaveRoom();
  G = null;
  LOCAL_UI = { modal: null, mainMenuOpen: false, handGrouped: false, burgerReveal: null, burgerRevealTimer: null, logToasts: [], lastLogSeq: undefined, logToastTimer: null, animatedIds: new Set(), logHistoryOpen: false, avatarModal: null };
  render();
}
function menuButtonHtml() {
  return `<button class="menu-fab" onclick="openMainMenu()" title="${t('menuTooltip')}">☰</button>`;
}
function renderMainMenuModal() {
  if (!G || !LOCAL_UI.mainMenuOpen) return '';
  const state = LOCAL_UI.mainMenuOpen;

  if (state === 'confirmRestart') {
    return wrapModal(t('confirmRestartTitle'), `
      <div class="subtitle">${t('confirmRestartBody')}</div>
      <div class="footer-actions" style="justify-content:center; gap:10px;">
        <button class="btn-secondary" onclick="closeMainMenu()">${t('cancel')}</button>
        <button class="btn-danger" onclick="restartSameGame()">${t('yesRestart')}</button>
      </div>
    `, false);
  }
  if (state === 'confirmExit') {
    return wrapModal(t('confirmExitTitle'), `
      <div class="subtitle">${t('confirmExitBody')}</div>
      <div class="footer-actions" style="justify-content:center; gap:10px;">
        <button class="btn-secondary" onclick="closeMainMenu()">${t('cancel')}</button>
        <button class="btn-danger" onclick="exitToSetup()">${t('yesExit')}</button>
      </div>
    `, false);
  }

  const canRestart = !G.online || (ONLINE && ONLINE.isHost);
  return wrapModal(t('menuTitle'), `
    <div class="choice-list">
      <button class="choice-btn" onclick="closeMainMenu(); openRules();">${t('menuRules')}</button>
      <button class="choice-btn" onclick="toggleLang()">${t('menuLang')}</button>
      <button class="choice-btn" onclick="closeMainMenu(); openSettingsModal();">⚙️ ${t('settingsTitle')}</button>
      ${canRestart ? `<button class="choice-btn" onclick="askConfirm('confirmRestart')">${t('menuRestart')}</button>` : ''}
      <button class="choice-btn" onclick="askConfirm('confirmExit')">${G.online ? t('leaveRoom') : t('menuExit')}</button>
    </div>
    <div class="footer-actions"><button class="btn-secondary" onclick="closeMainMenu()">${t('close')}</button></div>
  `, false);
}

function endTurn() {
  const nextIndex = (G.currentPlayerIndex + 1) % G.players.length;
  addLog(t('turnEnded', currentPlayer().name));
  goToPassCover(nextIndex, 'startTurn');
}

/* =========================================================
   RENDERING
   ========================================================= */

const app = document.getElementById('app');

/* render() is the entry point every action calls after mutating G. In
   online mode there's nothing to render locally-only — instead the new
   state is pushed to Firebase, and the actual screen update happens when
   the realtime listener fires back (for every connected device, including
   this one). In hotseat/bots mode it renders straight away as before. */
function render() {
  if (ONLINE && ONLINE.syncing) { pushStateToFirebase(); return; }
  renderLocal();
}

/* For UI-only changes that never touch shared game state (opening/closing a
   modal, picking an option before confirming, toggling hand view) — renders
   immediately on this device without waiting on a Firebase round-trip, and
   without pushing anything for other connected players to see. */
function renderLocal() {
  doLocalRender();
  if (settingsOpen) app.insertAdjacentHTML('beforeend', renderSettingsModal());
}

function doLocalRender() {
  if (!G) {
    if (ONLINE) { renderOnlineLobby(); return; }
    renderSetup(); return;
  }
  if (G.phase === 'end') { renderEnd(); return; }
  if (G.phase === 'pass') {
    if (G.vsBots) { resolvePassAutomatically(); return; }
    if (G.online) {
      // Only the host resolves this transition (draws cards, advances the
      // turn) — every device's listener sees the same 'pass' snapshot, so
      // if all of them ran the resolver they'd race and double-draw.
      if (ONLINE.isHost) { resolvePassAutomatically(); return; }
      renderOnlineWaiting(t('waitingTitle')); return;
    }
    renderPassCover(); return;
  }
  if (G.phase === 'tradeRespond') {
    if (G.vsBots) { resolveTradeRespondAutomatically(); return; }
    if (G.online) { renderOnlineTradeRespond(); return; }
    renderTradeRespond(); return;
  }
  if (G.phase === 'sayNoRespond') {
    if (G.vsBots) { resolveSayNoRespondAutomatically(); return; }
    if (G.online) { renderOnlineSayNoRespond(); return; }
    renderSayNoRespond(); return;
  }
  if (G.online) { renderOnlineGame(); return; }
  renderGame();
}

/* In solo-vs-bots mode there's only one human, and in online mode every
   player already has their own device, so hand-privacy "pass the device"
   screens are pointless either way — resolve them instantly instead. */
function resolvePassAutomatically() {
  const purpose = G.passPurpose;
  const idx = G.passTarget;
  if (purpose === 'startTurn') {
    G.currentPlayerIndex = idx;
    startTurnDraw();
    G.phase = 'game';
    render();
    const pl = G.players[idx];
    if (pl.isBot) setTimeout(() => botTakeTurn(pl), 700);
    return;
  }
  if (purpose === 'tradeRespond') {
    G.phase = 'tradeRespond';
    render();
    return;
  }
  if (purpose === 'sayNoRespond') {
    G.phase = 'sayNoRespond';
    render();
    return;
  }
  if (purpose === 'applyReaction') {
    applyReaction();
    return;
  }
  if (purpose === 'tradeBack' || purpose === 'backToGame') {
    G.phase = 'game';
    scheduleNewCardExpiry();
    resumeBotIfNeeded();
    render();
    return;
  }
  render();
}

function resolveSayNoRespondAutomatically() {
  const r = G.reaction;
  const target = G.players.find(p => p.id === r.targetId);
  if (target.isBot) {
    setTimeout(() => respondSayNo(botDecideSayNo()), 600);
    renderBotThinking(target, t('botConsideringSayNo', escapeHtml(target.name)));
    return;
  }
  renderSayNoRespond();
}

function resolveTradeRespondAutomatically() {
  const ts = G.tradeState;
  const target = G.players.find(p => p.id === ts.targetId);
  if (target.isBot) {
    setTimeout(() => respondTrade(botDecideTradeResponse(target)), 600);
    renderBotThinking(target, t('botConsideringTrade', escapeHtml(target.name)));
    return;
  }
  renderTradeRespond();
}

/* Minimal non-interactive placeholder while a bot is "thinking" — no action
   buttons, so the human can't accidentally poke game state mid-decision. */
function renderBotThinking(bot, message) {
  app.innerHTML = `
    ${menuButtonHtml()}
    <div class="screen board">
      <div class="top-row">
        <h2>🤖 ${escapeHtml(bot.name)}</h2>
      </div>
      ${renderTable(currentPlayer())}
      <div class="bot-thinking-banner">${message}</div>
    </div>
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
}

/* ---- Setup screen ---- */
let setupState = {
  mode: 'hotseat', // 'hotseat' | 'bots' | 'online'
  count: 4,
  names: ['', '', '', ''],
  avatars: ['', '', '', ''],
  yourName: '',
  yourAvatar: '',
  difficulty: 'medium',
  joinCode: '',
  onlineError: null,
};

function renderSetup() {
  while (setupState.names.length < setupState.count) setupState.names.push('');
  while (setupState.names.length > setupState.count) setupState.names.pop();
  while (setupState.avatars.length < setupState.count) setupState.avatars.push('');
  while (setupState.avatars.length > setupState.count) setupState.avatars.pop();

  app.innerHTML = `
    <div class="screen">
      <button class="menu-fab" onclick="openSettingsModal()" title="${t('settingsTitle')}">⚙️</button>
      <div class="card-emoji">🏕️</div>
      <h1 class="title">${t('appTitle')}</h1>
      <div class="subtitle">${t('appSubtitle', MIN_PLAYERS, MAX_PLAYERS)}</div>

      <div class="lang-picker">
        <button class="lang-btn ${LANG === 'uk' ? 'active' : ''}" onclick="setLang('uk')">🇺🇦 Українська</button>
        <button class="lang-btn ${LANG === 'en' ? 'active' : ''}" onclick="setLang('en')">🇬🇧 English</button>
      </div>

      <button class="btn-gold btn-block rules-cta" onclick="openRules()">${t('rulesBtn')}</button>

      <div class="mode-picker">
        <button class="lang-btn ${setupState.mode === 'hotseat' ? 'active' : ''}" onclick="setupSetMode('hotseat')">${t('modeHotseat')}</button>
        <button class="lang-btn ${setupState.mode === 'bots' ? 'active' : ''}" onclick="setupSetMode('bots')">${t('modeBots')}</button>
        <button class="lang-btn ${setupState.mode === 'online' ? 'active' : ''}" onclick="setupSetMode('online')">${t('modeOnline')}</button>
      </div>

      <div class="setup-card">
        ${setupState.mode === 'bots' ? renderSetupBots() : setupState.mode === 'online' ? renderSetupOnline() : renderSetupHotseat()}
      </div>

      <div class="info-banner">${setupState.mode === 'hotseat' ? t('passInfoBanner') : ''}</div>
    </div>
    ${renderRulesModal()}
    ${renderSetupAvatarPickerModal()}
  `;
}

function renderSetupOnline() {
  return `
    <h3>${t('yourName')}</h3>
    <div class="name-avatar-row">
      <button type="button" class="avatar-input avatar-input-sm" onclick="openSetupAvatarPicker('you')">${escapeHtml(setupState.yourAvatar) || '🙂'}</button>
      <input type="text" placeholder="${t('yourNamePlaceholder')}" value="${escapeHtml(setupState.yourName)}"
        oninput="setupSetYourName(this.value)" />
    </div>

    ${setupState.onlineError ? `<div class="info-banner online-error">${escapeHtml(setupState.onlineError)}</div>` : ''}

    <button class="btn-primary btn-block" onclick="setupCreateOnlineRoom()">${t('createRoomBtn')}</button>

    <div class="subtitle" style="margin:6px 0 0;">${t('orJoinLabel')}</div>
    <div class="name-list">
      <input type="text" class="room-code-input" placeholder="${t('roomCodePlaceholder')}" value="${escapeHtml(setupState.joinCode)}"
        oninput="setupSetJoinCode(this.value)" maxlength="5" />
    </div>
    <button class="btn-secondary btn-block" onclick="setupJoinOnlineRoom()">${t('joinRoomBtn')}</button>

    ${!firebaseReady() ? `<div class="info-banner">${t('onlineNotConfigured')}</div>` : ''}
  `;
}

function renderSetupHotseat() {
  return `
    <h3>${t('howManyPlayers')}</h3>
    <div class="stepper">
      <button onclick="setupChangeCount(-1)">−</button>
      <div class="count">${setupState.count}</div>
      <button onclick="setupChangeCount(1)">+</button>
    </div>

    <h3>${t('playerNames')}</h3>
    <div class="name-list">
      ${setupState.names.map((n, i) => `
        <div class="name-avatar-row">
          <button type="button" class="avatar-input avatar-input-sm" onclick="openSetupAvatarPicker(${i})">${escapeHtml(setupState.avatars[i] || SEAT_AVATARS[i % SEAT_AVATARS.length])}</button>
          <input type="text" placeholder="${t('playerPlaceholder', i + 1)}" value="${escapeHtml(n)}"
            oninput="setupSetName(${i}, this.value)" />
        </div>
      `).join('')}
    </div>

    <button class="btn-primary btn-block" onclick="setupStart()">${t('startGame')}</button>
  `;
}

function renderSetupBots() {
  return `
    <h3>${t('yourName')}</h3>
    <div class="name-avatar-row">
      <button type="button" class="avatar-input avatar-input-sm" onclick="openSetupAvatarPicker('you')">${escapeHtml(setupState.yourAvatar) || '🙂'}</button>
      <input type="text" placeholder="${t('yourNamePlaceholder')}" value="${escapeHtml(setupState.yourName)}"
        oninput="setupSetYourName(this.value)" />
    </div>

    <h3>${t('howManyTotal')}</h3>
    <div class="stepper">
      <button onclick="setupChangeCount(-1)">−</button>
      <div class="count">${setupState.count}</div>
      <button onclick="setupChangeCount(1)">+</button>
    </div>

    <h3>${t('difficultyLabel')}</h3>
    <div class="lang-picker">
      <button class="lang-btn ${setupState.difficulty === 'easy' ? 'active' : ''}" onclick="setupSetDifficulty('easy')">${t('diffEasy')}</button>
      <button class="lang-btn ${setupState.difficulty === 'medium' ? 'active' : ''}" onclick="setupSetDifficulty('medium')">${t('diffMedium')}</button>
      <button class="lang-btn ${setupState.difficulty === 'hard' ? 'active' : ''}" onclick="setupSetDifficulty('hard')">${t('diffHard')}</button>
    </div>

    <button class="btn-primary btn-block" onclick="setupStartVsBots()">${t('startVsBots')}</button>
  `;
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function setupSetMode(mode) { setupState.mode = mode; renderSetup(); }
function setupChangeCount(delta) {
  setupState.count = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, setupState.count + delta));
  renderSetup();
}
function setupSetName(i, val) { setupState.names[i] = val; }
function setupSetYourName(val) { setupState.yourName = val; }
function setupSetDifficulty(d) { setupState.difficulty = d; renderSetup(); }

/* Setup-screen avatar pick: click-to-choose only (no typing) — a single
   emoji symbol, picked from presets, same spirit as openAvatarPicker() but
   writing into setupState (before any G.players exist) instead of G. */
function openSetupAvatarPicker(target) {
  LOCAL_UI.setupAvatarPick = { target, draft: null };
  renderSetup();
}
function closeSetupAvatarPicker() { LOCAL_UI.setupAvatarPick = null; renderSetup(); }
function setSetupAvatarDraft(value) {
  LOCAL_UI.setupAvatarPick.draft = value;
  renderSetup();
}
function confirmSetupAvatarPick() {
  const m = LOCAL_UI.setupAvatarPick;
  const emoji = m.draft || '';
  if (!emoji) return;
  if (m.target === 'you') setupState.yourAvatar = emoji;
  else setupState.avatars[m.target] = emoji;
  LOCAL_UI.setupAvatarPick = null;
  renderSetup();
}
function setupStart() {
  const names = setupState.names.map((n, i) => n.trim() || t('playerPlaceholder', i + 1));
  newGame(names, { avatars: setupState.avatars });
}
function setupStartVsBots() {
  const human = setupState.yourName.trim() || t('yourNamePlaceholder');
  const botCount = setupState.count - 1;
  const botNames = pickRandomBotNames(botCount);
  const names = [human, ...botNames];
  const isBotFlags = [false, ...botNames.map(() => true)];
  const avatars = [setupState.yourAvatar, ...botNames.map(() => '')];
  newGame(names, { vsBots: true, isBotFlags, avatars, difficulty: setupState.difficulty });
}

function setupSetJoinCode(v) { setupState.joinCode = v.toUpperCase(); }
function setupCreateOnlineRoom() {
  setupState.onlineError = null;
  onlineCreateRoom(setupState.yourName.trim() || t('yourNamePlaceholder'), setupState.yourAvatar);
  renderSetup();
}
function setupJoinOnlineRoom() {
  setupState.onlineError = null;
  onlineJoinRoom(setupState.joinCode, setupState.yourName.trim() || t('yourNamePlaceholder'), setupState.yourAvatar);
  renderSetup();
}

/* ---- Online lobby / waiting room (shown once a room exists but the game hasn't started) ---- */
function renderOnlineLobby() {
  const data = ONLINE.roomData;
  const players = (data && data.players) || [];
  const canStart = ONLINE.isHost && players.length >= MIN_PLAYERS && players.length <= MAX_PLAYERS;

  app.innerHTML = `
    <div class="screen">
      <div class="card-emoji">🏕️</div>
      <h1 class="title">${t('appTitle')}</h1>

      <div class="setup-card">
        <h3>${t('roomCodeLabel')}</h3>
        <div class="room-code-display">${ONLINE.code}</div>
        <button class="btn-secondary btn-block" onclick="copyRoomLink()">${t('copyLink')}</button>

        <h3>${t('playersInRoom', players.length)}</h3>
        <div class="choice-list">
          ${players.map(p => `<div class="choice-btn lobby-player">${escapeHtml(p.name)}${p.id === 0 ? ' 👑' : ''}</div>`).join('')}
        </div>

        ${ONLINE.isHost
          ? `<button class="btn-primary btn-block" ${canStart ? '' : 'disabled'} onclick="onlineStartGame()">${t('startOnlineGame')}</button>
             ${!canStart ? `<div class="subtitle">${t('waitingForMorePlayers')}</div>` : ''}`
          : `<div class="subtitle">${t('waitingForHost')}</div>`}

        <button class="btn-secondary btn-block" onclick="exitToSetup()">${t('leaveRoom')}</button>
      </div>
    </div>
    ${renderRulesModal()}
  `;
}
function copyRoomLink() {
  const url = location.origin + location.pathname + '?join=' + ONLINE.code;
  if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
}

/* ---- Pass cover screen ---- */
function renderPassCover() {
  const target = G.players[G.passTarget];
  const purpose = G.passPurpose;
  let hint = t('passHintDefault');
  if (purpose === 'startTurn') hint = t('passHintStart');
  if (purpose === 'tradeRespond') hint = t('passHintTradeRespond', G.players.find(p => p.id === G.tradeState.fromId).name);
  if (purpose === 'tradeBack') hint = t('passHintTradeBack');

  app.innerHTML = `
    ${menuButtonHtml()}
    <div class="screen">
      <div class="pass-cover">
        <div class="icon">📱➡️</div>
        <div class="who">${t('passToPlayer', escapeHtml(target.name))}</div>
        <div class="hint">${hint}</div>
        <button class="btn-primary" onclick="confirmPassReveal()">${t('imPlayerShowHand', escapeHtml(target.name))}</button>
      </div>
    </div>
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
}

/* ---- Trade respond screen (target's private view) ---- */
function renderTradeRespond() {
  const ts = G.tradeState;
  const from = G.players.find(p => p.id === ts.fromId);
  const to = G.players.find(p => p.id === ts.targetId);
  const offeredCard = [...from.hand].find(c => c.id === ts.offeredCardId) || findCardAnywhereForDisplay(ts.offeredCardId, from);
  const requestedKind = ts.requestedKind || 'any';
  const hasMatch = to.hand.some(c => cardMatchesKind(c, requestedKind));

  app.innerHTML = `
    ${menuButtonHtml()}
    <div class="screen">
      <h2>${t('tradeOfferTitle')}</h2>
      <div class="subtitle">${t('tradeOffersYou', escapeHtml(from.name))}</div>
      <div class="hand">${renderCard(offeredCard, false)}</div>
      <div class="subtitle">${t('tradeWants', describeRequestedKind(requestedKind))}</div>
      <div class="subtitle">${hasMatch ? t('tradeChooseResponse') : t('tradeNoMatch')}</div>
      <div class="hand">
        ${to.hand.map(c => {
          const matches = cardMatchesKind(c, requestedKind);
          return renderCard(c, matches, matches ? `respondTrade('${c.id}')` : null, false, null, matches ? null : t('reasonTradeKindMismatch'));
        }).join('')}
      </div>
      <button class="btn-danger" onclick="respondTrade('DECLINE')">${t('declineTrade')}</button>
    </div>
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
}
function findCardAnywhereForDisplay(cardId, ownerGuess) {
  return ownerGuess.hand.find(c => c.id === cardId) || { id: cardId, type: 'ingredient', kind: 'bun' };
}

function reactionCardName(kind) {
  const meta = actMeta(kind);
  return meta ? mName(meta) : kind;
}

function renderSayNoRespond() {
  const r = G.reaction;
  const actor = G.players.find(p => p.id === r.actorId);
  const target = G.players.find(p => p.id === r.targetId);
  app.innerHTML = `
    ${menuButtonHtml()}
    <div class="screen">
      <h2>${escapeHtml(t('sayNoPromptTitle', actor.name, reactionCardName(r.kind)))}</h2>
      <div class="subtitle">${t('sayNoPromptBody')}</div>
      <div class="hand">${renderCard({ id: 'sayno-preview', type: 'action', kind: 'sayno' }, false)}</div>
      <button class="btn-gold btn-block" onclick="respondSayNo(true)">${t('sayNoConfirm')}</button>
      <button class="btn-secondary btn-block" onclick="respondSayNo(false)">${t('sayNoDecline')}</button>
    </div>
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
}

/* Online: only the actual reaction target's device shows the respond
   screen — everyone else just waits, same pattern as trade. */
function renderOnlineSayNoRespond() {
  const r = G.reaction;
  if (ONLINE.myId === r.targetId) { renderSayNoRespond(); return; }
  const target = G.players.find(p => p.id === r.targetId);
  renderOnlineWaiting(t('waitingForSayNoResponse', escapeHtml(target.name)));
}

/* Online: only the actual trade target's device shows the respond screen
   (it already reveals their hand + the offer) — everyone else just waits. */
function renderOnlineTradeRespond() {
  const ts = G.tradeState;
  if (ONLINE.myId === ts.targetId) { renderTradeRespond(); return; }
  const from = G.players.find(p => p.id === ts.fromId);
  const target = G.players.find(p => p.id === ts.targetId);
  renderOnlineWaiting(t('waitingForTradeResponse', escapeHtml(target.name), escapeHtml(from.name)));
}

/* Minimal non-interactive placeholder — table + log visible, no controls,
   so onlookers can follow along without being able to poke game state. */
function renderOnlineWaiting(message) {
  app.innerHTML = `
    ${menuButtonHtml()}
    <div class="screen board">
      <div class="top-row"><h2>⏳ ${t('waitingTitle')}</h2></div>
      ${renderTable(currentPlayer())}
      <div class="bot-thinking-banner">${message}</div>
    </div>
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
}

/* ---- Card rendering helper ---- */
/* The pop-in slide/scale should only ever play once per card — every
   render rebuilds the DOM from scratch, so without this a card sitting in
   G.newCardIds (true for ~2.2s after being drawn) would replay its entrance
   animation on every single re-render in that window, including ones
   triggered by something unrelated like opening a menu. The "NEW" badge
   itself is fine to keep redrawing — it's static, nothing to replay. */
function shouldPlayPopIn(cardId) {
  if (LOCAL_UI.animatedIds.has(cardId)) return false;
  LOCAL_UI.animatedIds.add(cardId);
  return true;
}
function renderCard(card, selectable, onclick, selected, fanStyle, reason, suppressNewBadge) {
  if (!card) return '';
  const meta = card.type === 'ingredient' ? ingMeta(card.kind) : actMeta(card.kind);
  const isNew = !suppressNewBadge && !!(G && G.newCardIds && G.newCardIds.has(card.id));
  const playPopIn = isNew && shouldPlayPopIn(card.id);
  const cls = ['card', 'card-art', card.type, card.kind, selected ? 'selected' : '', selectable ? '' : 'disabled', playPopIn ? 'card-new' : ''].join(' ');
  const clickAttr = onclick ? `onclick="${onclick}"` : '';
  const styleAttr = fanStyle ? `style="${fanStyle}"` : '';
  // Hover always shows what the card is/does (handy since the art has no
  // label for ingredients, and the baked-in action text can be tiny) — if
  // it's currently unusable, that reason replaces the description.
  const infoText = (!selectable && reason) ? reason : (card.type === 'action' ? `${mName(meta)} — ${mDesc(meta)}` : mName(meta));
  const tooltip = `<div class="card-tooltip">${escapeHtml(infoText)}</div>`;
  const badge = isNew ? `<div class="card-new-badge">${t('newBadge')}</div>` : '';
  return `<div class="${cls}" ${clickAttr} ${styleAttr}>
      <div class="card-art-clip">
        <img class="card-art-img" src="${cardArtSrc(card)}" alt="${escapeHtml(mName(meta))}" draggable="false" />
      </div>
      ${tooltip}
      ${badge}
    </div>`;
}

/* ---- Main game screen ---- */
/* Vs-bots and hotseat share this renderer now (hotseat's active player is
   always the viewer, so isMyTurn is always true there). During a bot's
   turn the human's own hand and table stay visible exactly as always —
   just dimmed/disabled — instead of swapping to a separate sparse
   "bot is thinking" screen that used to hide the hand and re-center the
   table on the bot. */
function renderGame() {
  const active = currentPlayer();
  const me = G.players[getViewerId()];
  const isMyTurn = active.id === me.id;

  app.innerHTML = `
    ${menuButtonHtml()}
    <div class="screen board">
      <div class="top-row">
        <h2>${isMyTurn ? t('yourTurn', escapeHtml(me.name)) : t('otherTurnBot', escapeHtml(active.name))}</h2>
        <div class="moves-indicator">
          ${[0, 1, 2].map(i => `<div class="dot ${i < (3 - G.movesLeft) ? 'used' : ''}"></div>`).join('')}
          <span>${t('movesLeft', G.movesLeft)}</span>
          <button class="log-history-btn" onclick="openLogHistory()" title="${t('logHistoryTitle')}">📜</button>
        </div>
      </div>

      ${renderTable(active)}

      <div class="actions-row">
        <button class="btn-secondary" ${isMyTurn && G.movesLeft > 0 ? '' : 'disabled'} onclick="openTradeModal()">${t('tradeBtn')}</button>
        <button class="btn-danger" ${isMyTurn ? '' : 'disabled'} onclick="endTurn()">${t('endTurnBtn')}</button>
      </div>

      <div class="hand-label-row">
        <div class="hand-label">${t('handLabel', me.hand.length)}</div>
        <button class="btn-sm btn-secondary" onclick="toggleHandGrouped()">${LOCAL_UI.handGrouped ? t('fanBtn') : t('groupBtn')}</button>
      </div>
      ${LOCAL_UI.handGrouped ? renderGroupedHand(me, !isMyTurn) : renderFanHand(me, !isMyTurn)}
    </div>
    ${isMyTurn ? renderModal() : ''}
    ${isMyTurn ? renderPendingReveal() : ''}
    ${renderBurgerReveal()}
    ${renderLogHistoryModal()}
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
  layoutHandRow();
  if (isMyTurn && !LOCAL_UI.handGrouped) setupHandDrag();
}

/* Online: everyone sees the same table, but only the active player's
   device gets working controls — everyone else sees their own hand
   (never someone else's) with cards dimmed/non-interactive and an
   "X's turn" banner instead of "your turn". */
function renderOnlineGame() {
  const me = G.players[ONLINE.myId];
  const active = currentPlayer();
  const isMyTurn = active.id === me.id;

  app.innerHTML = `
    ${menuButtonHtml()}
    <div class="screen board">
      <div class="top-row">
        <h2>${isMyTurn ? t('yourTurn', escapeHtml(me.name)) : t('otherTurn', escapeHtml(active.name))}</h2>
        <div class="moves-indicator">
          ${[0, 1, 2].map(i => `<div class="dot ${i < (3 - G.movesLeft) ? 'used' : ''}"></div>`).join('')}
          <span>${t('movesLeft', G.movesLeft)}</span>
          <button class="log-history-btn" onclick="openLogHistory()" title="${t('logHistoryTitle')}">📜</button>
        </div>
      </div>

      ${renderTable(active)}


      <div class="actions-row">
        <button class="btn-secondary" ${isMyTurn && G.movesLeft > 0 ? '' : 'disabled'} onclick="openTradeModal()">${t('tradeBtn')}</button>
        <button class="btn-danger" ${isMyTurn ? '' : 'disabled'} onclick="endTurn()">${t('endTurnBtn')}</button>
      </div>

      <div class="hand-label-row">
        <div class="hand-label">${t('handLabel', me.hand.length)}</div>
        <button class="btn-sm btn-secondary" onclick="toggleHandGrouped()">${LOCAL_UI.handGrouped ? t('fanBtn') : t('groupBtn')}</button>
      </div>
      ${LOCAL_UI.handGrouped ? renderGroupedHand(me, !isMyTurn) : renderFanHand(me, !isMyTurn)}
    </div>
    ${isMyTurn ? renderModal() : ''}
    ${isMyTurn ? renderPendingReveal() : ''}
    ${renderBurgerReveal()}
    ${renderLogHistoryModal()}
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
  layoutHandRow();
  if (isMyTurn && !LOCAL_UI.handGrouped) setupHandDrag();
}

function toggleHandGrouped() {
  LOCAL_UI.handGrouped = !LOCAL_UI.handGrouped;
  renderLocal();
}

function renderFanHand(p, forceDisabled) {
  const itemsHtml = p.hand.map(c => {
    const { usable, handler, reason } = forceDisabled
      ? { usable: false, handler: null, reason: t('notYourTurn') }
      : cardUsability(c, p);
    const cardHtml = renderCard(c, usable, usable && handler ? handler : null, false, null, reason);
    return `<div class="hcard-item${usable ? '' : ' disabled-item'}">${cardHtml}</div>`;
  }).join('');
  return `<div class="hand-row-outer"><div class="hand-row">${itemsHtml}</div></div>`;
}

/* Group identical cards into stacks (same type+kind), wraps to extra rows
   automatically via flex-wrap when the hand is too wide for one line. */
function computeHandGroups(hand) {
  const groups = [];
  const byKey = new Map();
  hand.forEach(c => {
    const key = c.type + ':' + c.kind;
    if (!byKey.has(key)) {
      const g = { key, type: c.type, kind: c.kind, cards: [] };
      byKey.set(key, g);
      groups.push(g);
    }
    byKey.get(key).cards.push(c);
  });
  return groups;
}

function renderGroupedHand(p, forceDisabled) {
  const groups = computeHandGroups(p.hand);
  const itemsHtml = groups.map(g => {
    const front = g.cards[g.cards.length - 1];
    const { usable } = forceDisabled ? { usable: false } : cardUsability(front, p);
    return `<div class="hcard-item${usable ? '' : ' disabled-item'}">${renderStackCard(g, p, forceDisabled)}</div>`;
  }).join('');
  return `<div class="hand-row-outer"><div class="hand-row">${itemsHtml}</div></div>`;
}

function renderStackCard(group, p, forceDisabled) {
  const front = group.cards[group.cards.length - 1];
  const { usable, handler, reason } = forceDisabled
    ? { usable: false, handler: null, reason: t('notYourTurn') }
    : cardUsability(front, p);
  const count = group.cards.length;
  const isNew = group.cards.some(c => G.newCardIds && G.newCardIds.has(c.id));
  // Every newly-added card in the group must go through shouldPlayPopIn
  // (it has a side effect marking it animated), so map() rather than some()
  // — a short-circuit would leave a later-checked new card unmarked and
  // able to trigger a stray repeat animation on some future render.
  const playPopIn = group.cards
    .filter(c => G.newCardIds && G.newCardIds.has(c.id))
    .map(c => shouldPlayPopIn(c.id))
    .some(Boolean);
  const cardHtml = renderCard(front, usable, usable && handler ? handler : null, false, null, reason, true);
  const depth = Math.min(count - 1, 3);
  const shadows = Array.from({ length: depth }, (_, i) =>
    `<div class="stack-shadow" style="transform:translate(${(i + 1) * 5}px, ${(i + 1) * 5}px);"></div>`
  ).join('');
  const countBadge = count > 1 ? `<div class="stack-count">×${count}</div>` : '';
  const newBadge = isNew ? `<div class="card-new-badge stack-new-badge">${t('newBadge')}</div>` : '';
  return `<div class="card-stack-wrap ${playPopIn ? 'card-new' : ''}">
      ${shadows}
      ${cardHtml}
      ${countBadge}
      ${newBadge}
    </div>`;
}

/* Shared usability/handler/reason logic for an action card kind — used by both
   the single fan card and the grouped stack (any card of that kind behaves the same). */
function cardUsability(c, p) {
  if (c.type === 'ingredient') {
    const usable = G.movesLeft > 0;
    return { usable, handler: usable ? `playIngredientToBuild('${c.id}')` : null, reason: usable ? null : t('reasonNoMoves') };
  }
  let handler = null;
  let usable = true;
  let reason = null;
  if (G.movesLeft <= 0) { usable = false; reason = t('reasonNoMoves'); }
  switch (c.kind) {
    case 'foodtruck': handler = 'playFoodTruck()'; break;
    case 'delivery': handler = 'openDeliveryModal()'; break;
    case 'grandma': handler = 'playGrandmaShortcut()'; break;
    case 'inspector':
      handler = 'openInspectorModal()';
      if (usable && !otherPlayers().some(pl => pl.hand.length > 0)) { usable = false; reason = t('reasonInspectorNoTargets'); }
      break;
    case 'shoplifter':
      handler = 'openShoplifterModal()';
      if (usable && !otherPlayers().some(pl => pl.builds.length > 0)) { usable = false; reason = t('reasonShoplifterNoTargets'); }
      break;
    case 'fly':
      handler = 'openFlyModal()';
      if (usable && !otherPlayers().some(pl => pl.burgers.length > 0)) { usable = false; reason = t('reasonFlyNoTargets'); }
      break;
    case 'swatter':
      handler = 'openSwatterModal()';
      if (usable && !p.burgers.some(b => b.fly)) { usable = false; reason = t('reasonNoFlyOnYours'); }
      break;
    case 'gust':
      handler = 'openGustModal()';
      if (usable && !p.burgers.some(b => b.fly)) { usable = false; reason = t('reasonNoFlyOnYours'); }
      break;
    case 'wild': handler = 'openWildModal()'; break;
    case 'forcedeal':
      handler = 'openForceDealModal()';
      if (usable && !p.hand.some(cc => cc.type === 'ingredient')) { usable = false; reason = t('reasonForceDealNoGive'); }
      else if (usable && !otherPlayers().some(pl => pl.builds.length > 0)) { usable = false; reason = t('reasonShoplifterNoTargets'); }
      break;
    case 'sayno':
      // Never directly playable from hand — only offered as a reaction prompt.
      usable = false; reason = t('reasonSayNoReactive');
      break;
  }
  return { usable, handler, reason };
}

/* ---------------- Hand row layout: dynamic overlap ----------------
   Cards sit in a fixed-width row with no background. Overlap between
   neighbors shrinks as the hand grows so it always fits the row without
   spilling past its bounds; with fewer cards each one shows more of
   itself. Positioning is computed here rather than in CSS because it
   depends on the actual rendered card count and container width. */
function layoutHandRow() {
  const row = app.querySelector('.hand-row');
  if (!row) return;
  const items = Array.from(row.children);
  if (!items.length) { row.style.height = ''; return; }
  const containerW = row.clientWidth;
  const cardRect = items[0].getBoundingClientRect();
  const cardW = cardRect.width, cardH = cardRect.height;
  const n = items.length;
  const available = Math.max(0, containerW - cardW);
  // Cards spread out to use the row's full width when there's room (up to
  // sitting fully apart, cardW itself), and only overlap once they no
  // longer fit — the more cards, the tighter that overlap gets.
  const minStep = cardW * 0.12;
  const step = n > 1 ? Math.max(minStep, Math.min(cardW, available / (n - 1))) : 0;
  const totalWidth = cardW + step * (n - 1);
  const startX = Math.max(0, (containerW - totalWidth) / 2);
  items.forEach((el, i) => {
    const x = startX + i * step;
    el.style.transform = `translateX(${x}px)`;
    el.style.zIndex = i;
    el.dataset.baseX = x;
  });
  row.style.height = cardH + 'px';
}
window.addEventListener('resize', () => { if (app.querySelector('.hand-row')) layoutHandRow(); });

/* ---------------- Drag-to-reorder hand (pointer events: works for mouse + touch) ---------------- */

function setupHandDrag() {
  const container = app.querySelector('.hand-row');
  if (!container) return;
  Array.from(container.children).forEach(el => {
    el.addEventListener('pointerdown', onHandCardPointerDown);
  });
}

function onHandCardPointerDown(e) {
  const el = e.currentTarget;
  const container = el.parentElement;
  const startIdx = Array.from(container.children).indexOf(el);
  const baseX = parseFloat(el.dataset.baseX) || 0;
  const startX = e.clientX, startY = e.clientY;
  let moved = false;

  function onMove(ev) {
    const dx = ev.clientX - startX, dy = ev.clientY - startY;
    if (!moved && Math.hypot(dx, dy) > 6) {
      moved = true;
      el.classList.add('dragging');
    }
    if (moved) {
      el.style.transform = `translate(${baseX + dx}px, ${dy}px) scale(1.1)`;
      ev.preventDefault();
    }
  }
  function onUp(ev) {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    if (moved) {
      el.classList.remove('dragging');
      const dropIdx = computeDropIndex(container, ev.clientX, el);
      reorderHand(startIdx, dropIdx);
    }
  }
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
}

function computeDropIndex(container, clientX, draggedEl) {
  const cards = Array.from(container.children);
  let dropIndex = cards.length - 1;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i] === draggedEl) continue;
    const rect = cards[i].getBoundingClientRect();
    if (clientX < rect.left + rect.width / 2) { dropIndex = i; break; }
  }
  return dropIndex;
}

function reorderHand(fromIdx, toIdx) {
  const p = currentPlayer();
  if (fromIdx === toIdx) { render(); return; }
  const [card] = p.hand.splice(fromIdx, 1);
  const insertAt = toIdx > fromIdx ? toIdx - 1 : toIdx;
  p.hand.splice(insertAt, 0, card);
  render();
}

/* ---- Round table with seats around the rim (dashed circle guide, no table prop) ---- */
const SEAT_AVATARS = [
  '🧑', '👩', '🧔', '👨', '👩‍🦱', '👨‍🦰', '🧑‍🦳', '👱',
  '🐶', '🐱', '🐵', '🦊', '🐼', '🐻', '🐯', '🦁', '🐰', '🐨', '🐷', '🐮', '🐸', '🦄',
  '🤡', '👽', '🤖', '🎃', '🥸', '😎', '🦖',
];

/* viewerId defaults to the active player (correct for hotseat/vs-bots,
   where only the current player ever sees this screen); online mode passes
   ONLINE.myId explicitly so every connected device sees itself at the
   bottom of the table regardless of whose turn it actually is. */
function renderTable(activePlayer, viewerId) {
  const N = G.players.length;
  const vId = viewerId != null ? viewerId : getViewerId();
  const viewerIdx = Math.max(0, G.players.findIndex(p => p.id === vId));
  const RX = 40, RY = 40; // matches .table-felt's inset:10% ring exactly, so avatars sit right on the dashed line
  const seats = G.players.map((pl, i) => {
    const rel = (i - viewerIdx + N) % N;
    const angle = (90 + rel * (360 / N)) * (Math.PI / 180); // 90° = bottom, where the viewer always sits
    const x = 50 + RX * Math.cos(angle);
    const y = 50 + RY * Math.sin(angle);
    return renderSeat(pl, pl.id === activePlayer.id, x, y, i, pl.id === vId);
  }).join('');

  pushLogToasts();
  return `
    <div class="table-region-flex">
      <div class="table-wrap">
        <div class="table-felt"></div>
        <div class="table-center">
          ${renderMiniPile('draw', G.drawPile.length, t('pileDraw'))}
          ${renderMiniPile('discard', G.discardPile.length, t('pileDiscard'), G.discardPile[G.discardPile.length - 1])}
          ${renderMiniPile('burger', G.burgerPile.length, t('pileBurgers'))}
        </div>
        ${seats}
        ${renderLogToasts()}
      </div>
    </div>
    ${renderEffectToast()}
  `;
}

/* ---------------- Dota-style transient move log (left side, self-fading) ----------------
   Purely local/per-device (LOCAL_UI, never synced) but driven by the shared
   G.log, so it reacts correctly whether THIS device caused the new entry or
   just received it via the Firebase sync — either way the toast appears
   here the moment the change shows up in a render. */
/* Each toast fades on its own timer (not a shared "clear everything at
   once" timeout) — since they're added in order and each lives the same
   ~4s, the oldest (bottom of the stack) always finishes first, giving the
   one-at-a-time bottom-to-top disappearance rather than a group wipe. */
/* Updates only the toast stack's own DOM node, never the full board —
   these fire off a timer with no user action involved, so a full
   renderLocal() here would rebuild (and visibly jump) the whole hand/table
   every few seconds even when the player isn't doing anything. */
function patchLogToastDOM() {
  const wrap = document.querySelector('.table-wrap');
  if (!wrap) return;
  const existing = wrap.querySelector('.log-toast-stack');
  const html = renderLogToasts();
  if (existing) existing.outerHTML = html || '';
  else if (html) wrap.insertAdjacentHTML('beforeend', html);
}
/* Marks/removes only THIS toast's own DOM node (classList/remove()) instead
   of rebuilding the whole stack via patchLogToastDOM() — that outerHTML
   swap was recreating every sibling toast line too, restarting their
   entrance animation and making the whole stack visibly flash/jerk every
   time any single toast expired. Falls back to a full patch only if the
   node can't be found (DOM out of sync with LOCAL_UI, e.g. right after an
   unrelated full render). */
function scheduleToastRemoval(key) {
  setTimeout(() => {
    const entry = LOCAL_UI.logToasts.find(t => t.key === key);
    if (!entry) return;
    entry.leaving = true;
    const el = document.querySelector(`.log-toast-line[data-key="${key}"]`);
    if (el) el.classList.add('leaving');
    else patchLogToastDOM();
    setTimeout(() => {
      LOCAL_UI.logToasts = LOCAL_UI.logToasts.filter(t => t.key !== key);
      const el2 = document.querySelector(`.log-toast-line[data-key="${key}"]`);
      if (el2) { el2.remove(); restackToastOpacities(); }
      else patchLogToastDOM();
    }, 400); // matches the log-toast-out CSS animation duration
  }, 4000);
}
function restackToastOpacities() {
  const stack = document.querySelector('.log-toast-stack');
  if (!stack) return;
  Array.from(stack.children).filter(el => !el.classList.contains('leaving')).forEach((el, i) => {
    el.style.opacity = Math.max(0.3, 1 - i * 0.16);
  });
}
function pushLogToasts() {
  if (!LOCAL_UI.logToasts) LOCAL_UI.logToasts = [];
  const seq = G.logSeq || 0;
  if (LOCAL_UI.lastLogSeq === undefined) { LOCAL_UI.lastLogSeq = seq; return; } // first render of a game: nothing "new" to announce
  const delta = seq - LOCAL_UI.lastLogSeq;
  if (delta <= 0) return;
  const count = Math.min(delta, G.log.length, 5); // safety cap if a lot changed at once
  LOCAL_UI.lastLogSeq = seq;
  G.log.slice(0, count).reverse().forEach(text => {
    const key = Date.now() + '-' + Math.random();
    LOCAL_UI.logToasts.push({ text, key });
    scheduleToastRemoval(key);
  });
  if (LOCAL_UI.logToasts.length > 6) LOCAL_UI.logToasts = LOCAL_UI.logToasts.slice(-6);
}
function renderLogToasts() {
  if (!LOCAL_UI.logToasts || !LOCAL_UI.logToasts.length) return '';
  const lines = LOCAL_UI.logToasts.slice().reverse().map((entry, i) =>
    `<div class="log-toast-line ${entry.leaving ? 'leaving' : ''}" style="opacity:${entry.leaving ? '' : Math.max(0.3, 1 - i * 0.16)}" data-key="${entry.key}">${escapeHtml(entry.text)}</div>`
  ).join('');
  return `<div class="log-toast-stack">${lines}</div>`;
}
/* Full history — the toasts fade away, but every line is still in G.log,
   scrollable here so a "what did I miss" moment doesn't need to be caught
   live. */
function openLogHistory() { LOCAL_UI.logHistoryOpen = true; renderLocal(); }
function closeLogHistory() { LOCAL_UI.logHistoryOpen = false; renderLocal(); }
function renderLogHistoryModal() {
  if (!LOCAL_UI.logHistoryOpen) return '';
  return wrapModal(t('logHistoryTitle'), `
    <div class="log-history-list">
      ${G.log.length ? G.log.map(l => `<div class="log-history-line">${escapeHtml(l)}</div>`).join('') : `<div class="log-history-empty">${t('logHistoryEmpty')}</div>`}
    </div>
    <div class="footer-actions"><button class="btn-secondary" onclick="closeLogHistory()">${t('close')}</button></div>
  `, false);
}

/* Mini card-stack visual for the three central piles. 'discard' gets a
   messier scattered look (random-ish fixed rotations), the others sit neat. */
function renderMiniPile(kind, count, label, topCard) {
  const backSrc = kind === 'burger' ? BACK_ART.burger : BACK_ART.generic;
  const shadowLayers = kind === 'discard'
    ? [{ r: -9, x: -5 }, { r: 7, x: 4 }]
    : [{ r: -2, x: -2 }, { r: 1, x: 1 }];
  const depth = count === 0 ? 0 : Math.min(2, Math.ceil(count / 12));
  const shadows = shadowLayers.slice(0, depth).map((l, i) =>
    `<div class="mini-card" style="transform:translate(${l.x}px, ${l.x}px) rotate(${l.r}deg); z-index:${i};">
      <img class="mini-card-img" src="${backSrc}" alt="" draggable="false" />
    </div>`
  ).join('');
  // The discard pile shows the actual last-discarded card face-up on top,
  // like a real tabletop discard pile — everything else stays face-down.
  const frontIsFaceUp = kind === 'discard' && topCard;
  const frontSrc = frontIsFaceUp ? cardArtSrc(topCard) : backSrc;
  const frontImg = frontSrc
    ? `<img class="mini-card-img" src="${frontSrc}" alt="" draggable="false" />`
    : '';
  const innerBadge = frontIsFaceUp ? '' : `<div class="mini-card-count">${count}</div>`;
  const outerBadge = frontIsFaceUp ? `<div class="mini-pile-count-badge">${count}</div>` : '';
  return `
    <div class="mini-pile">
      <div class="mini-card-stack">
        ${shadows}
        <div class="mini-card mini-card-front">
          ${frontImg}
          ${innerBadge}
        </div>
        ${outerBadge}
      </div>
      <div class="mini-pile-label">${label}</div>
    </div>
  `;
}

function renderSeat(pl, isActive, x, y, i, isViewerSeat) {
  const mine = isMe(pl.id);
  const validSum = pl.burgers.filter(b => !b.fly).reduce((s, b) => s + b.value, 0);
  const burgerStat = mine ? `<span>🏕️ ${t('burgerProgress', validSum, WIN_THRESHOLD)}</span>` : '';
  const avatarEmoji = pl.avatar || (pl.isBot ? '🤖' : SEAT_AVATARS[i % SEAT_AVATARS.length]);
  const avatarClick = mine ? `onclick="openAvatarPicker(${pl.id})"` : '';
  return `
    <div class="seat ${isActive ? 'active' : ''}" style="left:${x}%; top:${y}%;">
      ${renderSeatEffectToast(pl)}
      <div class="seat-avatar-ring ${mine ? 'pickable' : ''}" ${avatarClick} title="${mine ? escapeHtml(t('avatarPickerTitle')) : ''}">
        <div class="seat-avatar">${avatarEmoji}</div>
        ${isActive ? '<div class="seat-turn-badge">🔔</div>' : ''}
      </div>
      <div class="seat-info ${isViewerSeat ? 'seat-info-flip' : ''}">
        <div class="seat-name">${escapeHtml(pl.name)}</div>
        <div class="seat-stats">
          <span>🃏 ${pl.hand.length}</span>
          ${burgerStat}
        </div>
        <div class="burger-slots">
          ${pl.burgers.map(b => `<div class="burger-slot ${b.fly ? 'fly' : ''}">
              <img class="burger-slot-img" src="${BACK_ART.burger}" alt="" draggable="false" />
              ${mine ? `<div class="card-tooltip">${b.fly ? t('burgerTooltipFly', b.value) : t('burgerTooltip', b.value)}</div>` : ''}
              ${b.fly ? '<span class="burger-slot-fly">🐻</span>' : ''}
            </div>`).join('')}
        </div>
        ${renderBuildRow(pl)}
      </div>
    </div>
  `;
}

/* The in-progress build is deliberately public (everyone's table, not just
   "mine") — that's the whole point of building on the table instead of in
   hand: opponents can see what you're one ingredient away from finishing
   and target it (Shoplifter steals the single most-recent card across all
   piles, Force Deal can take any specific kind from any pile). A player
   can have several piles going at once — playing a kind you're already
   building elsewhere just opens a second one. */
function renderBuildRow(pl) {
  if (!pl.builds.length) return '';
  const top = findTopBuildCard(pl);
  return pl.builds.map(pile => {
    const target = pileTargetCount(pile);
    const chips = pile.cards.map(b => {
      const meta = ingMeta(b.kind);
      const isTop = top && top.card.id === b.id;
      return `<div class="build-chip ${b.isWild ? 'wild' : ''} ${isTop ? 'top' : ''}" title="${escapeHtml(mName(meta))}${b.isWild ? ' (' + t('wildLabel') + ')' : ''}">${meta.ic}</div>`;
    }).join('');
    return `<div class="build-row">${chips}<div class="build-count">${pile.cards.length}/${target}</div></div>`;
  }).join('');
}

function renderPendingReveal() {
  if (!G.pendingReveal) return '';
  const { title, cards } = G.pendingReveal;
  return `
    <div class="modal-overlay">
      <div class="modal">
        <h3>${title}</h3>
        <div class="reveal-box">${cards.map(c => renderCard(c, false)).join('')}</div>
        <div class="footer-actions"><button class="btn-primary" onclick="closeModal()">${t('gotIt')}</button></div>
      </div>
    </div>
  `;
}

/* Ungated (not part of LOCAL_UI.modal) so it can open on any player's turn,
   not just your own — see openAvatarPicker(). */
function renderAvatarPickerModal() {
  const m = LOCAL_UI.avatarModal;
  if (!m) return '';
  const target = G.players.find(pl => pl.id === m.playerId);
  const current = m.draft != null ? m.draft : (target ? target.avatar || '' : '');
  return wrapModal(t('avatarPickerTitle'), `
    <input class="avatar-input" type="text" maxlength="4" value="${escapeHtml(current)}"
      placeholder="🙂" oninput="setAvatarDraft(this.value)" />
    <div class="avatar-presets">
      ${SEAT_AVATARS.map(e => `<button class="avatar-preset ${current === e ? 'active' : ''}" onclick="setAvatarDraft('${e}')">${e}</button>`).join('')}
    </div>
    <button class="btn-gold btn-block" ${current ? '' : 'disabled'} onclick="confirmAvatarPick()">${t('avatarPickerConfirm')}</button>
    <div class="footer-actions"><button class="btn-secondary" onclick="closeAvatarPicker()">${t('cancel')}</button></div>
  `, false);
}

function renderSetupAvatarPickerModal() {
  const m = LOCAL_UI.setupAvatarPick;
  if (!m) return '';
  const existing = m.target === 'you' ? setupState.yourAvatar : setupState.avatars[m.target];
  const current = m.draft != null ? m.draft : (existing || '');
  return wrapModal(t('avatarPickerTitle'), `
    <div class="avatar-presets">
      ${SEAT_AVATARS.map(e => `<button class="avatar-preset ${current === e ? 'active' : ''}" onclick="setSetupAvatarDraft('${e}')">${e}</button>`).join('')}
    </div>
    <button class="btn-gold btn-block" ${current ? '' : 'disabled'} onclick="confirmSetupAvatarPick()">${t('avatarPickerConfirm')}</button>
    <div class="footer-actions"><button class="btn-secondary" onclick="closeSetupAvatarPicker()">${t('cancel')}</button></div>
  `, false);
}

function renderModal() {
  const m = LOCAL_UI.modal;
  if (!m) return '';
  const p = currentPlayer();

  if (m.type === 'tradeTarget') {
    return wrapModal(t('tradeTargetTitle'), `
      <div class="choice-list">
        ${otherPlayers().map(pl => `<button class="choice-btn" onclick="pickTradeTarget(${pl.id})">${t('playerCardsCount', escapeHtml(pl.name), pl.hand.length)}</button>`).join('')}
      </div>
    `, true);
  }

  if (m.type === 'tradeOffer') {
    const target = G.players.find(pl => pl.id === m.targetId);
    const kindChip = (kind, label) => `<button class="kind-chip ${m.requestedKind === kind ? 'active' : ''}" onclick="selectRequestedKind('${kind}')">${label}</button>`;
    return wrapModal(t('tradeOfferTitle2', escapeHtml(target.name)), `
      <div class="subtitle">${t('tradeChooseOffer')}</div>
      <div class="hand">
        ${p.hand.map(c => renderCard(c, true, `selectOfferCard('${c.id}')`, m.offeredCardId === c.id)).join('')}
      </div>
      <div class="subtitle">${t('tradeChooseWant')}</div>
      <div class="kind-picker">
        ${kindChip('any', '🤷 ' + t('wantAny'))}
        ${INGREDIENTS.map(ing => kindChip(ing.kind, `${ing.ic} ${mName(ing)}`)).join('')}
        ${kindChip('action', '🃏 ' + t('wantAction'))}
      </div>
      <button class="btn-primary btn-block" ${m.offeredCardId ? '' : 'disabled'} onclick="confirmOffer()">${t('proposeTrade')}</button>
    `, true);
  }

  if (m.type === 'delivery') {
    return wrapModal(t('deliveryTitle'), `
      <div class="choice-list">
        ${INGREDIENTS.map(i => `<button class="choice-btn" onclick="playDelivery('${i.kind}')">${i.ic} ${mName(i)}</button>`).join('')}
      </div>
    `, true);
  }

  if (m.type === 'inspectorTarget') {
    return wrapModal(t('inspectorTargetTitle'), `
      <div class="choice-list">
        ${otherPlayers().filter(pl => pl.hand.length > 0).map(pl => `<button class="choice-btn" onclick="pickInspectorTarget(${pl.id})">${t('playerCardsCount', escapeHtml(pl.name), pl.hand.length)}</button>`).join('')}
      </div>
    `, true);
  }

  if (m.type === 'inspectorView') {
    const target = G.players.find(pl => pl.id === m.targetId);
    return wrapModal(t('inspectorViewTitle', escapeHtml(target.name)), `
      <div class="hand">
        ${target.hand.map(c => renderCard(c, true, `toggleInspectorPick('${c.id}')`, m.picked.includes(c.id))).join('')}
      </div>
      <button class="btn-primary btn-block" ${m.picked.length === 2 ? '' : 'disabled'} onclick="confirmInspector()">${t('takeSelected', m.picked.length)}</button>
    `, true);
  }

  if (m.type === 'flyTarget') {
    const eligible = otherPlayers().filter(pl => pl.burgers.length > 0);
    return wrapModal(t('flyTargetTitle'), `
      <div class="choice-list">
        ${eligible.map(pl => `<button class="choice-btn" onclick="playFly(${pl.id})">${t('playerBurgersCount', escapeHtml(pl.name), pl.burgers.length)}</button>`).join('')}
      </div>
    `, true);
  }

  if (m.type === 'gustTarget') {
    return wrapModal(t('gustTargetTitle'), `
      <div class="choice-list">
        ${otherPlayers().map(pl => `<button class="choice-btn" onclick="playGust(${pl.id})">${escapeHtml(pl.name)}</button>`).join('')}
      </div>
    `, true);
  }

  if (m.type === 'shoplifterTarget') {
    const eligible = otherPlayers().filter(pl => pl.builds.length > 0);
    return wrapModal(t('shoplifterTargetTitle'), `
      <div class="choice-list">
        ${eligible.map(pl => `<button class="choice-btn" onclick="playShoplifter(${pl.id})">${t('playerBuildCount', escapeHtml(pl.name), totalBuildCards(pl))}</button>`).join('')}
      </div>
    `, true);
  }

  if (m.type === 'wildPick') {
    return wrapModal(t('wildPickTitle'), `
      <div class="choice-list">
        ${INGREDIENTS.map(i => `<button class="choice-btn" onclick="playWild('${i.kind}')">${i.ic} ${mName(i)}</button>`).join('')}
      </div>
    `, true);
  }

  if (m.type === 'forceDealGive') {
    return wrapModal(t('forceDealGiveTitle'), `
      <div class="hand">
        ${p.hand.filter(c => c.type === 'ingredient').map(c => renderCard(c, true, `pickForceDealGive('${c.id}')`)).join('')}
      </div>
    `, true);
  }

  if (m.type === 'forceDealTarget') {
    const eligible = otherPlayers().filter(pl => pl.builds.length > 0);
    return wrapModal(t('forceDealTargetTitle'), `
      <div class="choice-list">
        ${eligible.map(pl => `<button class="choice-btn" onclick="pickForceDealTarget(${pl.id})">${t('playerBuildCount', escapeHtml(pl.name), totalBuildCards(pl))}</button>`).join('')}
      </div>
    `, true);
  }

  if (m.type === 'forceDealTake') {
    const target = G.players.find(pl => pl.id === m.targetId);
    const takeable = [...new Set(target.builds.flatMap(pile => pile.cards.map(c => c.kind)))];
    return wrapModal(t('forceDealTakeTitle', escapeHtml(target.name)), `
      <div class="choice-list">
        ${takeable.map(k => `<button class="choice-btn" onclick="confirmForceDeal('${k}')">${ingMeta(k).ic} ${mName(ingMeta(k))}</button>`).join('')}
      </div>
    `, true);
  }

  return '';
}

function wrapModal(title, body, showClose) {
  return `
    <div class="modal-overlay">
      <div class="modal">
        <h3>${title}</h3>
        ${body}
        ${showClose ? `<div class="footer-actions"><button class="btn-secondary" onclick="closeModal()">${t('cancel')}</button></div>` : ''}
      </div>
    </div>
  `;
}

/* ---- End screen ---- */
/* Randomized per-piece via inline style since CSS alone can't vary position/
   timing/color across N elements without one rule per piece. */
function generateConfettiHtml(n) {
  const colors = ['#ffb703', '#fb8500', '#e63946', '#2a9d8f', '#a663cc', '#f4a261', '#e9c46a'];
  let html = '';
  for (let i = 0; i < n; i++) {
    const left = (Math.random() * 100).toFixed(1);
    const delay = (Math.random() * 1.2).toFixed(2);
    const duration = (2.2 + Math.random() * 1.6).toFixed(2);
    const color = colors[i % colors.length];
    const rotate = Math.floor(Math.random() * 360);
    const wide = i % 3 === 0;
    html += `<div class="confetti-piece" style="left:${left}%; animation-delay:${delay}s; animation-duration:${duration}s; background:${color}; transform:rotate(${rotate}deg); ${wide ? 'width:10px;height:10px;border-radius:50%;' : ''}"></div>`;
  }
  return html;
}

let lastEndRenderKey = null;
function renderEnd() {
  /* The end screen is static once shown (G.winner/endReason don't change
     after the game is over), but renderLocal() still gets called again for
     unrelated reasons (settings toggle, a stray timer from a card animation
     still in flight, an online-sync echo) — each one used to rebuild this
     whole screen from scratch with a fresh random confetti layout, which
     looked like the celebration animation restarting/stuttering a few
     times. Skip the rebuild only if NOTHING that should actually change the
     screen (winner, reason, language) has changed since last time — a
     language toggle, for instance, still needs to go through. */
  const endKey = G.winner.map(w => w.id).join(',') + '|' + G.endReason + '|' + LANG;
  if (app.querySelector('.confetti-container') && lastEndRenderKey === endKey) return;
  lastEndRenderKey = endKey;
  const winners = G.winner;
  const rows = [...G.players].sort((a, b) => {
    const sa = a.burgers.filter(x => !x.fly).reduce((s, x) => s + x.value, 0);
    const sb = b.burgers.filter(x => !x.fly).reduce((s, x) => s + x.value, 0);
    return sb - sa;
  });
  const headers = t('winnerTableHeaders');
  app.innerHTML = `
    <div class="confetti-container">${generateConfettiHtml(80)}</div>
    <div class="screen end-screen">
      <div class="end-card">
        <div class="card-emoji">🏆</div>
        <div class="winner-name">${winners.map(w => escapeHtml(w.name)).join(' & ')}</div>
        <div class="subtitle">${escapeHtml(G.endReason)}</div>
        <table class="final-table">
          <tr><th>${headers[0]}</th><th>${headers[1]}</th><th>${headers[2]}</th></tr>
          ${rows.map(pl => {
            const valid = pl.burgers.filter(b => !b.fly).reduce((s, b) => s + b.value, 0);
            const flies = pl.burgers.filter(b => b.fly).length;
            return `<tr><td>${escapeHtml(pl.name)}</td><td>${valid}</td><td>${flies}</td></tr>`;
          }).join('')}
        </table>
        <button class="btn-primary" onclick="location.reload()">${t('newGameBtn')}</button>
      </div>
    </div>
  `;
}

/* ---- boot ---- */
(function prefillJoinCodeFromUrl() {
  try {
    const code = new URLSearchParams(location.search).get('join');
    if (code) { setupState.mode = 'online'; setupState.joinCode = code.toUpperCase(); }
  } catch (e) {}
})();
render();
