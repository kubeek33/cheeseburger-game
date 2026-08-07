/* ===========================================================
   Cheeseburger: The Game / Чізбургер: Гра
   hotseat digital card game (adapted from
   "Nasi Lemak: The Game" by Faculty of Fun, re-themed)
   =========================================================== */

const INGREDIENTS = [
  { kind: 'bun',     ic: '🍞', name: { uk: 'Булочка', en: 'Bun' } },
  { kind: 'patty',   ic: '🥩', name: { uk: 'Котлета', en: 'Patty' } },
  { kind: 'cheese',  ic: '🧀', name: { uk: 'Сир',     en: 'Cheese' } },
  { kind: 'lettuce', ic: '🥬', name: { uk: 'Салат',   en: 'Lettuce' } },
  { kind: 'tomato',  ic: '🍅', name: { uk: 'Помідор', en: 'Tomato' } },
];

const ACTIONS = [
  { kind: 'foodtruck',  ic: '🚚',
    name: { uk: 'Фудтрак', en: 'Food Truck' },
    desc: { uk: 'Відкрий верхні 3 карти колоди й забери всі інгредієнти з них.', en: 'Reveal the top 3 cards of the draw pile and take all the ingredients.' } },
  { kind: 'delivery',   ic: '📦',
    name: { uk: "Кур'єр", en: 'Delivery Guy' },
    desc: { uk: 'Оголоси інгредієнт — всі інші гравці віддають тобі всі такі карти.', en: 'Call an ingredient — all other players give you every card of that kind.' } },
  { kind: 'grandma',    ic: '👵',
    name: { uk: 'Бабусин рецепт', en: "Grandma's Recipe" },
    desc: { uk: 'Приготуй чізбургер лише з 3 різних інгредієнтів замість 5.', en: 'Make a cheeseburger with only 3 different ingredients instead of 5.' } },
  { kind: 'inspector',  ic: '🕵️',
    name: { uk: 'Санінспектор', en: 'Health Inspector' },
    desc: { uk: 'Подивись руку одного гравця і візьми собі 2 карти.', en: "Look through one player's hand and take 2 cards for yourself." } },
  { kind: 'shoplifter', ic: '🥷',
    name: { uk: 'Крадій', en: 'Shoplifter' },
    desc: { uk: 'Вкради по 1 випадковій карті у всіх інших гравців.', en: 'Steal 1 random card from every other player.' } },
  { kind: 'fly',        ic: '🪰',
    name: { uk: 'Муха', en: 'Fly' },
    desc: { uk: 'Постав муху на чізбургер іншого гравця — він недійсний, поки муху не приберуть.', en: "Place a fly on another player's burger — it doesn't count until the fly is removed." } },
  { kind: 'swatter',    ic: '🏏',
    name: { uk: 'Мухобійка', en: 'Fly Swatter' },
    desc: { uk: 'Прибери муху зі свого чізбургера.', en: 'Remove a fly from your own burger.' } },
  { kind: 'gust',       ic: '🌬️',
    name: { uk: 'Порив вітру', en: 'Gust of Wind' },
    desc: { uk: 'Здуй свою муху на чізбургер іншого гравця.', en: "Blow your fly onto another player's burger." } },
];

/* Final physical print spec — fixed 108-card deck for 2–6 players:
   60 ingredients (12x5) + 30 action cards + 18 burger cards */
const ACTION_COUNTS = { foodtruck: 4, delivery: 4, grandma: 3, inspector: 4, shoplifter: 4, fly: 5, swatter: 3, gust: 3 };
const INGREDIENT_COUNT_PER_KIND = 12;
const BURGER_PILE_SINGLES = 10; // value-1 cards
const BURGER_PILE_DOUBLES = 8;  // value-2 cards
const WIN_THRESHOLD = 5;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

const BOT_NAMES = {
  uk: [
    'Кетчапалка 9000', 'Ґрильотермінатор', 'Бургербот Валентин', 'Смажений Інтелект',
    'МайонезМайстер', 'Сирна Матриця', 'Фритюрний Оракул', 'ХрумТрон',
    'Цибулькова Загроза', 'Соус Термоядерний', 'Дідусь Гриль', 'Капітан Кома',
  ],
  en: [
    'Ketchup-9000', 'Grillinator X', 'Sir Mix-a-Sauce', 'The Fry Cook Prime',
    'MayoMcBot', 'Cheese Overlord', 'Deep Fryer Deluxe', 'CrunchTron',
    'Pickle Menace', 'Sauce Boss 5000', 'Grandpa Grill', 'Captain Combo',
  ],
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
    appTitle: 'ЧІЗБУРГЕР',
    appSubtitle: (min, max) => `Настільна карткова гра для ${min}–${max} гравців · hotseat`,
    howManyPlayers: 'Скільки гравців?',
    playerNames: 'Імена гравців',
    playerPlaceholder: (i) => `Гравець ${i}`,
    startGame: 'Почати гру 🍔',
    rulesBtn: '📖 Правила гри',
    rulesTooltip: 'Правила',
    menuTooltip: 'Меню',
    langToggle: 'EN',
    modeHotseat: '👥 З друзями',
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
    startOnlineGame: 'Почати гру 🍔',
    waitingForMorePlayers: `Чекаємо ще гравців (мінімум ${MIN_PLAYERS})...`,
    waitingForHost: 'Очікуємо, поки хост розпочне гру...',
    leaveRoom: '🚪 Вийти з кімнати',
    otherTurn: (name) => `⏳ Хід гравця ${name}`,
    notYourTurn: 'Зараз не твій хід',
    waitingForTradeResponse: (target, from) => `⏳ ${target} обмірковує пропозицію обміну від ${from}...`,
    waitingTitle: 'Очікування',
    howManyTotal: 'Скільки гравців разом з тобою?',
    difficultyLabel: 'Рівень складності ботів',
    diffEasy: '😌 Легкий',
    diffMedium: '🙂 Середній',
    diffHard: '😈 Важкий',
    startVsBots: 'Почати гру 🤖',
    botPlaying: 'грає...',
    botConsideringTrade: (name) => `🤖 ${name} обмірковує твою пропозицію обміну...`,
    fxBurger: 'Чізбургер готовий!',
    fxSwat: 'Муху знищено!',
    fxFly: 'Муха!',
    fxGust: 'Здуло!',
    fxSteal: 'Крадіжка!',
    fxTruck: 'Фудтрак!',
    fxDelivery: 'Доставка!',
    fxInspect: 'Перевірка!',
    fxTrade: 'Обмін!',
    passInfoBanner: 'Пристрій передається по колу. Перед кожним ходом на екрані буде заставка «Передай пристрій...» — це знак віддати телефон/ноутбук наступному гравцю.',
    rulesTitle: '📖 Правила гри «Чізбургер»',
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
    yourTurn: (name) => `🍔 ${name} — твій хід`,
    movesLeft: (n) => `${n} з 3 ходів залишилось`,
    pileDraw: '🍞 Колода',
    pileDiscard: '🗑️ Скид',
    pileBurgers: '🍔 Стос',
    makeBurgerBtn: '🍔 Приготувати бургер',
    tradeBtn: '🔄 Обмін',
    endTurnBtn: '➡️ Завершити хід',
    handLabel: (n) => `Твоя рука (${n} карт) — торкнись картки дії, щоб зіграти її`,
    cardsShort: (n) => `${n} карт(и)`,
    burgersReady: (n) => `${n} 🍔`,
    foodTruckRevealTitle: 'Фудтрак — відкриті карти:',
    makeBurgerModalTitle: '🍔 Приготувати чізбургер',
    classicOption: (ok) => `Класичний рецепт — усі 5 інгредієнтів ${ok ? '✅' : '❌ (бракує інгредієнтів)'}`,
    grandmaHint: '👵 Бабусин рецепт — обери рівно 3 різні інгредієнти:',
    grandmaConfirm: (n) => `Приготувати за бабусиним рецептом (${n}/3)`,
    grandmaModalTitle: '👵 Бабусин рецепт',
    tradeTargetTitle: '🔄 Обмін — обери гравця',
    playerCardsCount: (name, n) => `${name} (${n} карт)`,
    tradeOfferTitle2: (name) => `🔄 Обмін з ${name}`,
    tradeChooseOffer: 'Обери одну свою карту, яку пропонуєш:',
    proposeTrade: 'Запропонувати обмін',
    deliveryTitle: "📦 Кур'єр — оголоси інгредієнт",
    inspectorTargetTitle: '🕵️ Санінспектор — обери гравця',
    inspectorViewTitle: (name) => `🕵️ Рука гравця ${name} — обери 2 карти`,
    takeSelected: (n) => `Забрати обрані карти (${n}/2)`,
    flyTargetTitle: '🪰 Муха — обери жертву',
    playerBurgersCount: (name, n) => `${name} (${n} бургер(и))`,
    gustTargetTitle: '🌬️ Порив вітру — здути муху на когось',
    cancel: 'Скасувати',
    menuTitle: '☰ Меню',
    menuRules: '📖 Правила гри',
    menuLang: '🌐 Switch to English',
    menuRestart: '🔁 Почати заново (ті самі гравці)',
    menuExit: '🚪 Вийти в головне меню',
    close: 'Закрити',
    confirmRestartTitle: '🔁 Почати заново?',
    confirmRestartBody: 'Поточний прогрес гри буде втрачено. Гравці лишаться ті самі, карти роздадуться наново.',
    yesRestart: 'Так, почати заново',
    confirmExitTitle: '🚪 Вийти в головне меню?',
    confirmExitBody: 'Поточний прогрес гри буде втрачено.',
    yesExit: 'Так, вийти',
    winnerTableHeaders: ['Гравець', '🍔 Чізбургерів', '🪰 З мухою'],
    newGameBtn: 'Нова гра',
    gameStarted: 'Гру розпочато! Кожен гравець отримав по 7 карт.',
    reshuffled: 'Колоду скидів перетасовано назад у колоду для взяття карт.',
    drawCards: (name, n) => `${name} бере ${n} карт(и) з колоди.`,
    burgerPileEmpty: 'Стос чізбургерів порожній!',
    madeClassic: (name) => `🍔 ${name} готує чізбургер (5 інгредієнтів)!`,
    madeGrandma: (name) => `🍔 ${name} готує чізбургер за бабусиним рецептом (3 інгредієнти)!`,
    tradeDeclined: (to, from) => `${to} відхилив(ла) пропозицію обміну від ${from}.`,
    tradeAccepted: (from, to) => `🤝 ${from} та ${to} успішно обмінялися картами.`,
    playedFoodTruck: (name, kept) => `🚚 ${name} грає Фудтрак і забирає ${kept} інгредієнт(и).`,
    playedDelivery: (name, ing, total) => `📦 ${name} грає Кур'єра: оголосив "${ing}" і отримав ${total} карт(и).`,
    playedInspector: (name, target) => `🕵️ ${name} грає Санінспектора проти ${target} і бере 2 карти.`,
    playedShoplifter: (name, count) => `🥷 ${name} грає Крадія і краде по 1 карті у ${count} гравців.`,
    playedFly: (name, target) => `🪰 ${name} підкидає муху на чізбургер гравця ${target}.`,
    playedSwatter: (name) => `🏏 ${name} вбиває муху на своєму чізбургері!`,
    playedGust: (name, target) => `🌬️ ${name} здуває муху на чізбургер гравця ${target}.`,
    turnEnded: (name) => `--- Хід гравця ${name} завершено ---`,
    winByThreshold: (name, n) => `${name} набрав ${n}+ чізбургерів і перемагає!`,
    pileDepleted: 'Стос чізбургерів вичерпано!',
    reasonNoMoves: 'Не залишилось ходів у цьому ході',
    reasonGrandmaIngredients: 'Потрібно щонайменше 3 різні інгредієнти в руці',
    reasonInspectorNoTargets: 'У жодного суперника немає карт на руках',
    reasonFlyNoTargets: 'У жодного суперника немає готового чізбургера',
    reasonNoFlyOnYours: 'На твоєму чізбургері немає мухи',
    newBadge: 'НОВА',
    groupBtn: '📚 Групувати',
    fanBtn: '🎴 Віялом',
  },
  en: {
    appTitle: 'CHEESEBURGER',
    appSubtitle: (min, max) => `A tabletop card game for ${min}–${max} players · hotseat`,
    howManyPlayers: 'How many players?',
    playerNames: 'Player names',
    playerPlaceholder: (i) => `Player ${i}`,
    startGame: 'Start Game 🍔',
    rulesBtn: '📖 Rules',
    rulesTooltip: 'Rules',
    menuTooltip: 'Menu',
    langToggle: 'UA',
    modeHotseat: '👥 With friends',
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
    startOnlineGame: 'Start Game 🍔',
    waitingForMorePlayers: `Waiting for more players (at least ${MIN_PLAYERS})...`,
    waitingForHost: 'Waiting for the host to start the game...',
    leaveRoom: '🚪 Leave room',
    otherTurn: (name) => `⏳ ${name}'s turn`,
    notYourTurn: "It's not your turn",
    waitingForTradeResponse: (target, from) => `⏳ ${target} is considering a trade offer from ${from}...`,
    waitingTitle: 'Waiting',
    howManyTotal: 'How many players total, including you?',
    difficultyLabel: 'Bot difficulty',
    diffEasy: '😌 Easy',
    diffMedium: '🙂 Medium',
    diffHard: '😈 Hard',
    startVsBots: 'Start Game 🤖',
    botPlaying: 'is playing...',
    botConsideringTrade: (name) => `🤖 ${name} is considering your trade offer...`,
    fxBurger: 'Cheeseburger ready!',
    fxSwat: 'Fly swatted!',
    fxFly: 'Fly!',
    fxGust: 'Blown away!',
    fxSteal: 'Stolen!',
    fxTruck: 'Food Truck!',
    fxDelivery: 'Delivery!',
    fxInspect: 'Inspected!',
    fxTrade: 'Traded!',
    passInfoBanner: 'The device is passed around the table. Before every turn you’ll see a "Pass the device..." screen — that’s the cue to hand the phone/laptop to the next player.',
    rulesTitle: '📖 Cheeseburger — Rules',
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
    yourTurn: (name) => `🍔 ${name} — your turn`,
    movesLeft: (n) => `${n} of 3 moves left`,
    pileDraw: '🍞 Draw',
    pileDiscard: '🗑️ Discard',
    pileBurgers: '🍔 Burgers',
    makeBurgerBtn: '🍔 Make a burger',
    tradeBtn: '🔄 Trade',
    endTurnBtn: '➡️ End turn',
    handLabel: (n) => `Your hand (${n} cards) — tap an action card to play it`,
    cardsShort: (n) => `${n} card(s)`,
    burgersReady: (n) => `${n} 🍔`,
    foodTruckRevealTitle: 'Food Truck — revealed cards:',
    makeBurgerModalTitle: '🍔 Make a cheeseburger',
    classicOption: (ok) => `Classic recipe — all 5 ingredients ${ok ? '✅' : '❌ (missing ingredients)'}`,
    grandmaHint: "👵 Grandma's Recipe — pick exactly 3 different ingredients:",
    grandmaConfirm: (n) => `Make it with Grandma's Recipe (${n}/3)`,
    grandmaModalTitle: "👵 Grandma's Recipe",
    tradeTargetTitle: '🔄 Trade — choose a player',
    playerCardsCount: (name, n) => `${name} (${n} cards)`,
    tradeOfferTitle2: (name) => `🔄 Trade with ${name}`,
    tradeChooseOffer: 'Choose one of your cards to offer:',
    proposeTrade: 'Propose trade',
    deliveryTitle: '📦 Delivery Guy — call an ingredient',
    inspectorTargetTitle: '🕵️ Health Inspector — choose a player',
    inspectorViewTitle: (name) => `🕵️ ${name}'s hand — pick 2 cards`,
    takeSelected: (n) => `Take selected cards (${n}/2)`,
    flyTargetTitle: '🪰 Fly — choose a victim',
    playerBurgersCount: (name, n) => `${name} (${n} burger(s))`,
    gustTargetTitle: '🌬️ Gust of Wind — blow the fly onto someone',
    cancel: 'Cancel',
    menuTitle: '☰ Menu',
    menuRules: '📖 Rules',
    menuLang: '🌐 Переключити на українську',
    menuRestart: '🔁 Restart (same players)',
    menuExit: '🚪 Exit to main menu',
    close: 'Close',
    confirmRestartTitle: '🔁 Restart the game?',
    confirmRestartBody: 'Current progress will be lost. Same players, cards will be reshuffled and redealt.',
    yesRestart: 'Yes, restart',
    confirmExitTitle: '🚪 Exit to main menu?',
    confirmExitBody: 'Current progress will be lost.',
    yesExit: 'Yes, exit',
    winnerTableHeaders: ['Player', '🍔 Cheeseburgers', '🪰 With fly'],
    newGameBtn: 'New game',
    gameStarted: 'Game started! Each player was dealt 7 cards.',
    reshuffled: 'The discard pile was reshuffled back into the draw pile.',
    drawCards: (name, n) => `${name} draws ${n} card(s) from the deck.`,
    burgerPileEmpty: 'The burger pile is empty!',
    madeClassic: (name) => `🍔 ${name} makes a cheeseburger (5 ingredients)!`,
    madeGrandma: (name) => `🍔 ${name} makes a cheeseburger with Grandma's Recipe (3 ingredients)!`,
    tradeDeclined: (to, from) => `${to} declined the trade offer from ${from}.`,
    tradeAccepted: (from, to) => `🤝 ${from} and ${to} successfully traded cards.`,
    playedFoodTruck: (name, kept) => `🚚 ${name} plays Food Truck and takes ${kept} ingredient(s).`,
    playedDelivery: (name, ing, total) => `📦 ${name} plays Delivery Guy: called "${ing}" and received ${total} card(s).`,
    playedInspector: (name, target) => `🕵️ ${name} plays Health Inspector on ${target} and takes 2 cards.`,
    playedShoplifter: (name, count) => `🥷 ${name} plays Shoplifter and steals a card from ${count} player(s).`,
    playedFly: (name, target) => `🪰 ${name} tosses a fly onto ${target}'s burger.`,
    playedSwatter: (name) => `🏏 ${name} swats the fly off their burger!`,
    playedGust: (name, target) => `🌬️ ${name} blows the fly onto ${target}'s burger.`,
    turnEnded: (name) => `--- ${name}'s turn ended ---`,
    winByThreshold: (name, n) => `${name} reached ${n}+ cheeseburgers and wins!`,
    pileDepleted: 'The burger pile ran out!',
    reasonNoMoves: 'No moves left this turn',
    reasonGrandmaIngredients: 'You need at least 3 different ingredients in hand',
    reasonInspectorNoTargets: 'No opponent has any cards in hand',
    reasonFlyNoTargets: 'No opponent has a finished burger',
    reasonNoFlyOnYours: "You don't have a fly on your burger",
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

function rulesHtml() {
  const uk = LANG === 'uk';
  const ingredientNames = INGREDIENTS.map(i => mName(i)).join(', ');
  const actionCountsLine = ACTIONS.map(a => `${mName(a)} ×${ACTION_COUNTS[a.kind]}`).join(', ');
  const actionListItems = ACTIONS.map(a => `<li><b>${a.ic} ${mName(a)}</b> — ${mDesc(a)}</li>`).join('');

  if (uk) {
    return `
      <p><b>${MIN_PLAYERS}–${MAX_PLAYERS} гравців · 15–30 хвилин</b></p>
      <p>У містечку, де живуть гравці, немає нічого крутішого за ідеальний чізбургер.
      Але потрібні інгредієнти рідкісні, тож усі стають за грилі й змагаються, хто
      приготує більше чізбургерів.</p>

      <h4>Компоненти (108 карток)</h4>
      <ul>
        <li><b>60 карт інгредієнтів</b> — по ${INGREDIENT_COUNT_PER_KIND} карток кожного з 5 видів: ${ingredientNames}.</li>
        <li><b>30 карт дій</b> — ${actionCountsLine}.</li>
        <li><b>18 карт чізбургерів</b> (окрема колода, сорочкою догори) — ${BURGER_PILE_SINGLES} карток вартістю 1 і ${BURGER_PILE_DOUBLES} карток вартістю 2.</li>
      </ul>

      <h4>Підготовка</h4>
      <ol>
        <li>Перетасуйте 18 карт чізбургерів окремо — це стос чізбургерів, кладіть його сорочкою догори в центр столу.</li>
        <li>Перетасуйте разом усі 60 карт інгредієнтів та 30 карт дій.</li>
        <li>Роздайте кожному гравцю по 7 карт.</li>
        <li>Решта карт — колода для взяття, кладіть поруч сорочкою догори.</li>
      </ol>

      <h4>Хід гравця</h4>
      <p>Ходи йдуть за годинниковою стрілкою. Хто останній їв чізбургер — ходить першим
      (або довільно, якщо невідомо). На своєму ході гравець:</p>
      <ol>
        <li>Бере 2 карти з колоди (це не рахується як хід).</li>
        <li>Робить <b>до 3 ходів</b> у будь-якому порядку й комбінації:</li>
      </ol>
      <ul>
        <li><b>Приготувати чізбургер</b> — зібрати по 1 картці кожного з 5 інгредієнтів, скинути їх і взяти верхню карту зі стосу чізбургерів.</li>
        <li><b>Обмін</b> — запропонувати одному гравцю обмін картами (1 на 1). Гравець може погодитись або відмовитись; відмова не рахується як витрачений хід.</li>
        <li><b>Зіграти карту дії</b> — розіграти одну з карт дій (описи нижче). Кожна зіграна карта дії — окремий хід.</li>
      </ul>
      <p>Коли колода для взяття закінчується, скид перетасовується і стає новою колодою.</p>

      <h4>Карти дій</h4>
      <ul>${actionListItems}</ul>
      <p>Бабусин рецепт: скинь картку + 3 різних інгредієнти замість 5 і одразу візьми чізбургер.</p>

      <h4>Муха на чізбургері</h4>
      <p>Картка «Муха» кладеться на один з готових чізбургерів суперника — така картка не
      рахується у фінальному підрахунку, поки муху не приберуть Мухобійкою (знищити) або
      Поривом вітру (передати іншому гравцю). Готові чізбургери кладуться перед гравцем
      сорочкою догори, поруч одна з одною (не в стос) — так усі бачать кількість карт,
      але не їхню вартість (1 чи 2).</p>

      <h4>Кінець гри</h4>
      <p>Гра закінчується, щойно сумарна вартість чізбургерів (без мух) одного гравця
      досягає <b>${WIN_THRESHOLD}</b> — він перемагає.</p>
      <p>Альтернативний варіант: якщо стос чізбургерів закінчився раніше — гра завершується
      одразу, перемагає гравець із найбільшою сумою (без мух); при нічиї — у кого більше карток чізбургерів.</p>
    `;
  }

  return `
    <p><b>${MIN_PLAYERS}–${MAX_PLAYERS} players · 15–30 minutes</b></p>
    <p>In a town where nothing beats a perfect cheeseburger, the ingredients are scarce
    and everyone's manning their own grill, racing to make more cheeseburgers than
    anyone else.</p>

    <h4>Components (108 cards)</h4>
    <ul>
      <li><b>60 ingredient cards</b> — ${INGREDIENT_COUNT_PER_KIND} of each of the 5 kinds: ${ingredientNames}.</li>
      <li><b>30 action cards</b> — ${actionCountsLine}.</li>
      <li><b>18 burger cards</b> (a separate face-down deck) — ${BURGER_PILE_SINGLES} cards worth 1 and ${BURGER_PILE_DOUBLES} cards worth 2.</li>
    </ul>

    <h4>Setup</h4>
    <ol>
      <li>Shuffle the 18 burger cards separately — this is the burger pile, place it face-down in the middle of the table.</li>
      <li>Shuffle all 60 ingredient cards and 30 action cards together.</li>
      <li>Deal 7 cards to each player.</li>
      <li>The rest becomes the draw pile — place it face-down nearby.</li>
    </ol>

    <h4>Turn overview</h4>
    <p>Turns go clockwise. Whoever last ate a cheeseburger goes first (or pick randomly
    if unknown). On their turn, a player:</p>
    <ol>
      <li>Draws 2 cards from the draw pile (this doesn't count as a move).</li>
      <li>Makes <b>up to 3 moves</b> in any order or combination:</li>
    </ol>
    <ul>
      <li><b>Make a cheeseburger</b> — collect 1 card of each of the 5 ingredients, discard them, and take the top card of the burger pile.</li>
      <li><b>Trade</b> — offer another player a 1-for-1 card trade. They can accept or decline; a decline doesn't cost you the move.</li>
      <li><b>Play an action card</b> — play one of the action cards (described below). Each action card played is a separate move.</li>
    </ul>
    <p>When the draw pile runs out, the discard pile is reshuffled and becomes the new draw pile.</p>

    <h4>Action cards</h4>
    <ul>${actionListItems}</ul>
    <p>Grandma's Recipe: discard the card plus 3 different ingredients instead of 5, and immediately take a burger card.</p>

    <h4>Fly on your burger</h4>
    <p>The Fly card is placed on one of an opponent's finished burger cards — that card
    doesn't count toward the final total until the fly is removed, either with a Fly
    Swatter (destroyed) or a Gust of Wind (passed to another player). Finished burgers
    are placed face-down in front of a player, side by side (not stacked) — so everyone
    can see how many cards a player has, but not their value (1 or 2).</p>

    <h4>Ending the game</h4>
    <p>The game ends the moment any player's cheeseburger total (excluding any with a
    fly on them) reaches <b>${WIN_THRESHOLD}</b> — that player wins.</p>
    <p>Alternative ending: if the burger pile runs out first, the game ends immediately
    and the player with the highest total (excluding flies) wins; ties are broken by
    whoever has more burger cards.</p>
  `;
}

function openRules() { rulesOpen = true; render(); }
function closeRules() { rulesOpen = false; render(); }
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
const CARD_ART = {
  ingredient: {
    bun: 'assets/cards/bun.svg',
    patty: 'assets/cards/patty.svg',
    cheese: 'assets/cards/cheese.svg',
    lettuce: 'assets/cards/lettuce.svg',
    tomato: 'assets/cards/tomato.svg',
  },
  action: {
    foodtruck: 'assets/cards/foodtruck.svg',
    delivery: 'assets/cards/delivery.svg',
    grandma: 'assets/cards/grandma.svg',
    inspector: 'assets/cards/inspector.svg',
    shoplifter: 'assets/cards/shoplifter.svg',
    fly: 'assets/cards/fly.svg',
    swatter: 'assets/cards/swatter.svg',
    gust: 'assets/cards/gust.svg',
  },
};
const BACK_ART = { generic: 'assets/cards/back-all.svg', burger: 'assets/cards/back-burger.svg' };
const BURGER_FRONT_ART = { 1: 'assets/cards/burger1.svg', 2: 'assets/cards/burger2.svg' };
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

function onlineCreateRoom(name) {
  if (!firebaseReady()) { setupState.onlineError = t('onlineNotConfigured'); renderSetup(); return; }
  const db = ensureFirebase();
  const code = genRoomCode();
  const roomRef = db.ref('rooms/' + code);
  roomRef.set({ players: [{ id: 0, name }], started: false, state: null, createdAt: Date.now() })
    .then(() => {
      ONLINE = { code, myId: 0, isHost: true, roomRef, roomData: null, syncing: false };
      subscribeOnlineRoom();
    })
    .catch(() => { setupState.onlineError = t('onlineConnectError'); renderSetup(); });
}

function onlineJoinRoom(codeRaw, name) {
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
      players.push({ id: players.length, name });
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
  ONLINE.syncing = true;
  newGame(names, { online: true });
  ONLINE.roomRef.child('started').set(true);
}

function onlineLeaveRoom() {
  if (ONLINE && ONLINE.roomRef) ONLINE.roomRef.off();
  ONLINE = null;
}

/* ---------------- Global state ---------------- */

let G = null;
let rulesOpen = false;

function currentPlayer() { return G.players[G.currentPlayerIndex]; }
function otherPlayers() { return G.players.filter(p => p.id !== currentPlayer().id); }
function addLog(msg) { G.log.unshift(msg); if (G.log.length > 40) G.log.pop(); }

function newGame(names, options) {
  options = options || {};
  const isBotFlags = options.isBotFlags || names.map(() => false);
  const difficulty = options.difficulty || 'medium';
  const vsBots = !!options.vsBots;
  const deck = shuffle(buildDeck());
  const burgerPile = shuffle(buildBurgerPile());
  const players = names.map((name, i) => ({ id: i, name, hand: [], burgers: [], isBot: !!isBotFlags[i], difficulty }));
  G = {
    players, drawPile: deck, discardPile: [], burgerPile,
    currentPlayerIndex: 0, movesLeft: 3,
    log: [], phase: 'pass', passTarget: 0, passPurpose: 'startTurn',
    ui: { modal: null, handGrouped: false },
    tradeState: null, pendingReveal: null, winner: null, endReason: null,
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
function renderSeatEffectToast(pl) {
  if (!G || !G.effect || G.effect.targetId !== pl.id) return '';
  return `<div class="fx-toast fx-toast-seat" data-key="${G.effect.key}">${fxToastHtml()}</div>`;
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
  G.ui.modal = null;
  render();
}

function confirmPassReveal() {
  const purpose = G.passPurpose;
  if (purpose === 'startTurn') {
    G.currentPlayerIndex = G.passTarget;
    startTurnDraw();
    G.phase = 'game';
  } else if (purpose === 'tradeRespond') {
    G.phase = 'tradeRespond';
  } else if (purpose === 'tradeBack' || purpose === 'backToGame') {
    G.phase = 'game';
    scheduleNewCardExpiry();
  }
  render();
}

/* ---------------- Burger making ---------------- */

function canMakeClassic(p) {
  const kinds = new Set(p.hand.filter(c => c.type === 'ingredient').map(c => c.kind));
  return INGREDIENTS.every(i => kinds.has(i.kind));
}
function hasGrandmaCard(p) { return p.hand.some(c => c.type === 'action' && c.kind === 'grandma'); }
function distinctIngredientKinds(p) {
  return [...new Set(p.hand.filter(c => c.type === 'ingredient').map(c => c.kind))];
}

function giveBurgerCard(p) {
  if (G.burgerPile.length === 0) { addLog(t('burgerPileEmpty')); return; }
  const card = G.burgerPile.pop();
  p.burgers.push({ id: card.id, value: card.value, fly: false });
}

function removeFromHand(p, predicate) {
  const idx = p.hand.findIndex(predicate);
  if (idx < 0) return null;
  return p.hand.splice(idx, 1)[0];
}

function doMakeClassic() {
  const p = currentPlayer();
  if (G.movesLeft <= 0 || !canMakeClassic(p)) return;
  INGREDIENTS.forEach(ing => {
    const card = removeFromHand(p, c => c.type === 'ingredient' && c.kind === ing.kind);
    G.discardPile.push(card);
  });
  giveBurgerCard(p);
  G.movesLeft--;
  addLog(t('madeClassic', p.name));
  triggerEffect('🍔✨', t('fxBurger'), p.id);
  afterBurgerMade();
}

function doMakeGrandma(overrideKinds) {
  const p = currentPlayer();
  const selectedKinds = overrideKinds || (G.ui.modal && G.ui.modal.selectedKinds);
  if (!selectedKinds || G.movesLeft <= 0) return;
  if (new Set(selectedKinds).size !== 3) return;
  const gcard = removeFromHand(p, c => c.type === 'action' && c.kind === 'grandma');
  if (!gcard) return;
  G.discardPile.push(gcard);
  selectedKinds.forEach(kind => {
    const card = removeFromHand(p, c => c.type === 'ingredient' && c.kind === kind);
    if (card) G.discardPile.push(card);
  });
  giveBurgerCard(p);
  G.movesLeft--;
  addLog(t('madeGrandma', p.name));
  triggerEffect('🍔✨', t('fxBurger'), p.id);
  closeModal();
  afterBurgerMade();
}

function afterBurgerMade() {
  const p = currentPlayer();
  const validSum = p.burgers.filter(b => !b.fly).reduce((s, b) => s + b.value, 0);
  if (validSum >= WIN_THRESHOLD) {
    G.phase = 'end';
    G.winner = [p];
    G.endReason = t('winByThreshold', p.name, WIN_THRESHOLD);
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
}

/* ---------------- Trade ---------------- */

function openTradeModal() {
  if (G.movesLeft <= 0) return;
  G.ui.modal = { type: 'tradeTarget' };
  render();
}
function pickTradeTarget(targetId) {
  G.ui.modal = { type: 'tradeOffer', targetId, offeredCardId: null };
  render();
}
function selectOfferCard(cardId) {
  G.ui.modal.offeredCardId = cardId;
  render();
}
function confirmOffer() {
  const { targetId, offeredCardId } = G.ui.modal;
  if (!offeredCardId) return;
  G.tradeState = { fromId: currentPlayer().id, targetId, offeredCardId, status: 'pending' };
  G.ui.modal = null;
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
  ensureDrawPile(3);
  const revealed = [];
  for (let i = 0; i < 3 && G.drawPile.length > 0; i++) revealed.push(drawOne());
  let kept = 0;
  const keptIds = [];
  revealed.forEach(c => {
    if (c.type === 'ingredient') { p.hand.push(c); kept++; keptIds.push(c.id); }
    else G.discardPile.push(c);
  });
  G.movesLeft--;
  addLog(t('playedFoodTruck', p.name, kept));
  triggerEffect('🚚', t('fxTruck'), p.id);
  markNewCards(keptIds);
  scheduleNewCardExpiry();
  G.pendingReveal = { title: t('foodTruckRevealTitle'), cards: revealed };
  G.ui.modal = null;
  render();
}

function openDeliveryModal() {
  if (G.movesLeft <= 0 || !currentPlayer().hand.some(c => c.type === 'action' && c.kind === 'delivery')) return;
  G.ui.modal = { type: 'delivery' };
  render();
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
  triggerEffect('📦', t('fxDelivery'), p.id);
  markNewCards(gainedIds);
  scheduleNewCardExpiry();
  closeModal();
}

function openInspectorModal() {
  if (G.movesLeft <= 0 || !currentPlayer().hand.some(c => c.type === 'action' && c.kind === 'inspector')) return;
  G.ui.modal = { type: 'inspectorTarget' };
  render();
}
function pickInspectorTarget(targetId) {
  G.ui.modal = { type: 'inspectorView', targetId, picked: [] };
  render();
}
function toggleInspectorPick(cardId) {
  const m = G.ui.modal;
  const idx = m.picked.indexOf(cardId);
  if (idx >= 0) m.picked.splice(idx, 1);
  else if (m.picked.length < 2) m.picked.push(cardId);
  render();
}
function confirmInspector() {
  const p = currentPlayer();
  const m = G.ui.modal;
  if (m.picked.length !== 2) return;
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'inspector');
  G.discardPile.push(card);
  const target = G.players.find(pl => pl.id === m.targetId);
  const taken = [];
  m.picked.forEach(cid => {
    const c = removeFromHand(target, cc => cc.id === cid);
    if (c) { p.hand.push(c); taken.push(c); }
  });
  G.movesLeft--;
  addLog(t('playedInspector', p.name, target.name));
  triggerEffect('🕵️', t('fxInspect'), target.id);
  markNewCards(taken.map(c => c.id));
  scheduleNewCardExpiry();
  closeModal();
}

function playShoplifter() {
  const p = currentPlayer();
  if (G.movesLeft <= 0) return;
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'shoplifter');
  if (!card) return;
  G.discardPile.push(card);
  let count = 0;
  const stolenIds = [];
  otherPlayers().forEach(other => {
    if (other.hand.length === 0) return;
    const idx = Math.floor(Math.random() * other.hand.length);
    const [stolen] = other.hand.splice(idx, 1);
    p.hand.push(stolen);
    stolenIds.push(stolen.id);
    count++;
  });
  G.movesLeft--;
  addLog(t('playedShoplifter', p.name, count));
  triggerEffect('🥷', t('fxSteal'), p.id);
  markNewCards(stolenIds);
  scheduleNewCardExpiry();
  render();
}

function openFlyModal() {
  if (G.movesLeft <= 0 || !currentPlayer().hand.some(c => c.type === 'action' && c.kind === 'fly')) return;
  const eligible = otherPlayers().filter(pl => pl.burgers.length > 0);
  if (eligible.length === 0) return;
  G.ui.modal = { type: 'flyTarget' };
  render();
}
function playFly(targetId) {
  const p = currentPlayer();
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'fly');
  if (!card) return;
  G.discardPile.push(card);
  const target = G.players.find(pl => pl.id === targetId);
  const slot = target.burgers.find(b => !b.fly);
  if (slot) slot.fly = true;
  G.movesLeft--;
  addLog(t('playedFly', p.name, target.name));
  triggerEffect('🪰', t('fxFly'), target.id);
  closeModal();
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
  triggerEffect('🏏💥', t('fxSwat'), p.id);
  render();
}

function openGustModal() {
  const p = currentPlayer();
  if (G.movesLeft <= 0) return;
  if (!p.hand.some(c => c.type === 'action' && c.kind === 'gust')) return;
  if (!p.burgers.some(b => b.fly)) return;
  G.ui.modal = { type: 'gustTarget' };
  render();
}
function playGust(targetId) {
  const p = currentPlayer();
  const card = removeFromHand(p, c => c.type === 'action' && c.kind === 'gust');
  if (!card) return;
  G.discardPile.push(card);
  const slot = p.burgers.find(b => b.fly);
  if (slot) slot.fly = false;
  const target = G.players.find(pl => pl.id === targetId);
  const newSlot = target.burgers.find(b => !b.fly);
  if (newSlot) newSlot.fly = true;
  else target.burgers.push({ id: 'ghost' + Date.now(), value: 0, fly: true });
  G.movesLeft--;
  addLog(t('playedGust', p.name, target.name));
  triggerEffect('🌬️', t('fxGust'), target.id);
  closeModal();
}

function openMakeBurgerModal() {
  const p = currentPlayer();
  if (G.movesLeft <= 0) return;
  G.ui.modal = { type: 'makeBurger', selectedKinds: [] };
  render();
}
function openGrandmaModal() {
  const p = currentPlayer();
  if (G.movesLeft <= 0 || !hasGrandmaCard(p) || distinctIngredientKinds(p).length < 3) return;
  G.ui.modal = { type: 'makeBurger', selectedKinds: [], direct: 'grandma' };
  render();
}
function toggleGrandmaKind(kind) {
  const m = G.ui.modal;
  const idx = m.selectedKinds.indexOf(kind);
  if (idx >= 0) m.selectedKinds.splice(idx, 1);
  else if (m.selectedKinds.length < 3) m.selectedKinds.push(kind);
  render();
}

function closeModal() { G.ui.modal = null; G.pendingReveal = null; render(); }

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

  if (canMakeClassic(bot)) { doMakeClassic(); return true; }

  if (hasGrandmaCard(bot) && distinctIngredientKinds(bot).length >= 3) {
    if (Math.random() < chance(0.3, 0.65, 0.9)) {
      doMakeGrandma(distinctIngredientKinds(bot).slice(0, 3));
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
    if (Math.random() < chance(0.35, 0.6, 0.85)) { playShoplifter(); return true; }
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
  const have = new Set(bot.hand.filter(c => c.type === 'ingredient').map(c => c.kind));
  const missing = INGREDIENTS.map(i => i.kind).filter(k => !have.has(k));
  if (!missing.length) return null;
  return missing[Math.floor(Math.random() * missing.length)];
}

function botPickRichestTarget(bot) {
  const candidates = otherPlayers().filter(pl => pl.hand.length > 0);
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.hand.length - a.hand.length);
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

/* Standalone Health Inspector effect for bots — doesn't rely on modal state
   like confirmInspector() does, since bots never open modals. */
function botPlayInspector(bot, target) {
  const card = removeFromHand(bot, c => c.type === 'action' && c.kind === 'inspector');
  if (!card) return;
  G.discardPile.push(card);
  const have = new Set(bot.hand.filter(c => c.type === 'ingredient').map(c => c.kind));
  const sorted = target.hand.slice().sort((a, b) => {
    const aScore = a.type === 'ingredient' && !have.has(a.kind) ? 1 : 0;
    const bScore = b.type === 'ingredient' && !have.has(b.kind) ? 1 : 0;
    return bScore - aScore;
  });
  const taken = [];
  for (let i = 0; i < 2 && sorted.length; i++) {
    const c = sorted.shift();
    removeFromHand(target, cc => cc.id === c.id);
    bot.hand.push(c);
    taken.push(c);
  }
  G.movesLeft--;
  addLog(t('playedInspector', bot.name, target.name));
  triggerEffect('🕵️', t('fxInspect'), target.id);
  markNewCards(taken.map(c => c.id));
  scheduleNewCardExpiry();
}

/* Bots never propose a trade to the human (would need extra UI to let the
   human respond asynchronously mid-bot-turn) — but hard-difficulty bots will
   negotiate with each other, resolved instantly with no UI since neither
   side needs privacy from the human observer. */
function botDecideTradeResponse(bot) {
  const ts = G.tradeState;
  const from = G.players.find(p => p.id === ts.fromId);
  const offered = findCardAnywhereForDisplay(ts.offeredCardId, from);
  const diff = bot.difficulty || 'medium';
  const acceptChance = { easy: 0.5, medium: 0.65, hard: 0.8 }[diff] ?? 0.6;
  const have = new Set(bot.hand.filter(c => c.type === 'ingredient').map(c => c.kind));
  const wantsOffered = offered.type === 'ingredient' && !have.has(offered.kind);
  if (!wantsOffered && Math.random() > acceptChance) return 'DECLINE';
  if (!bot.hand.length) return 'DECLINE';
  const counts = {};
  bot.hand.forEach(c => { counts[c.kind] = (counts[c.kind] || 0) + 1; });
  const give = bot.hand.slice().sort((a, b) => (counts[b.kind] - counts[a.kind]))[0];
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

function openMainMenu() { G.ui.mainMenuOpen = 'menu'; render(); }
function closeMainMenu() { if (G) { G.ui.mainMenuOpen = false; render(); } }
function askConfirm(kind) { G.ui.mainMenuOpen = kind; render(); } // 'confirmRestart' | 'confirmExit'
function restartSameGame() {
  if (G.online && !ONLINE.isHost) return; // only the host may reshuffle/redeal
  const names = G.players.map(p => p.name);
  const isBotFlags = G.players.map(p => p.isBot);
  const difficulty = G.players[0] && G.players[0].difficulty;
  if (G.online) ONLINE.syncing = true;
  newGame(names, { vsBots: G.vsBots, isBotFlags, difficulty, online: G.online });
}
function exitToSetup() {
  if (ONLINE) onlineLeaveRoom();
  G = null;
  render();
}
function menuButtonHtml() {
  return `<button class="menu-fab" onclick="openMainMenu()" title="${t('menuTooltip')}">☰</button>`;
}
function renderMainMenuModal() {
  if (!G || !G.ui.mainMenuOpen) return '';
  const state = G.ui.mainMenuOpen;

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
  doLocalRender();
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
  if (purpose === 'tradeBack' || purpose === 'backToGame') {
    G.phase = 'game';
    scheduleNewCardExpiry();
    render();
    return;
  }
  render();
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
      <div class="log-box">${G.log.slice(0, 6).map(l => `<div>${escapeHtml(l)}</div>`).join('')}</div>
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
  yourName: '',
  difficulty: 'medium',
  joinCode: '',
  onlineError: null,
};

function renderSetup() {
  while (setupState.names.length < setupState.count) setupState.names.push('');
  while (setupState.names.length > setupState.count) setupState.names.pop();

  app.innerHTML = `
    <div class="screen">
      <div class="card-emoji">🍔</div>
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
  `;
}

function renderSetupOnline() {
  return `
    <h3>${t('yourName')}</h3>
    <div class="name-list">
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
        <input type="text" placeholder="${t('playerPlaceholder', i + 1)}" value="${escapeHtml(n)}"
          oninput="setupSetName(${i}, this.value)" />
      `).join('')}
    </div>

    <button class="btn-primary btn-block" onclick="setupStart()">${t('startGame')}</button>
  `;
}

function renderSetupBots() {
  return `
    <h3>${t('yourName')}</h3>
    <div class="name-list">
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
function setupStart() {
  const names = setupState.names.map((n, i) => n.trim() || t('playerPlaceholder', i + 1));
  newGame(names);
}
function setupStartVsBots() {
  const human = setupState.yourName.trim() || t('yourNamePlaceholder');
  const botCount = setupState.count - 1;
  const botNames = pickRandomBotNames(botCount);
  const names = [human, ...botNames];
  const isBotFlags = [false, ...botNames.map(() => true)];
  newGame(names, { vsBots: true, isBotFlags, difficulty: setupState.difficulty });
}

function setupSetJoinCode(v) { setupState.joinCode = v.toUpperCase(); }
function setupCreateOnlineRoom() {
  setupState.onlineError = null;
  onlineCreateRoom(setupState.yourName.trim() || t('yourNamePlaceholder'));
  renderSetup();
}
function setupJoinOnlineRoom() {
  setupState.onlineError = null;
  onlineJoinRoom(setupState.joinCode, setupState.yourName.trim() || t('yourNamePlaceholder'));
  renderSetup();
}

/* ---- Online lobby / waiting room (shown once a room exists but the game hasn't started) ---- */
function renderOnlineLobby() {
  const data = ONLINE.roomData;
  const players = (data && data.players) || [];
  const canStart = ONLINE.isHost && players.length >= MIN_PLAYERS && players.length <= MAX_PLAYERS;

  app.innerHTML = `
    <div class="screen">
      <div class="card-emoji">🍔</div>
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

  app.innerHTML = `
    ${menuButtonHtml()}
    <div class="screen">
      <h2>${t('tradeOfferTitle')}</h2>
      <div class="subtitle">${t('tradeOffersYou', escapeHtml(from.name))}</div>
      <div class="hand">${renderCard(offeredCard, false)}</div>
      <div class="subtitle">${t('tradeChooseResponse')}</div>
      <div class="hand">
        ${to.hand.map(c => renderCard(c, true, `respondTrade('${c.id}')`)).join('')}
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
      <div class="log-box">${G.log.slice(0, 6).map(l => `<div>${escapeHtml(l)}</div>`).join('')}</div>
      <div class="bot-thinking-banner">${message}</div>
    </div>
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
}

/* ---- Card rendering helper ---- */
function renderCard(card, selectable, onclick, selected, fanStyle, reason, suppressNewBadge) {
  if (!card) return '';
  const meta = card.type === 'ingredient' ? ingMeta(card.kind) : actMeta(card.kind);
  const isNew = !suppressNewBadge && !!(G && G.newCardIds && G.newCardIds.has(card.id));
  const cls = ['card', 'card-art', card.type, card.kind, selected ? 'selected' : '', selectable ? '' : 'disabled', isNew ? 'card-new' : ''].join(' ');
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

/* Fan-of-cards inline style: rotate + arc lift, like holding cards by hand */
function fanCardStyle(index, total) {
  if (total <= 1) return '';
  const mid = (total - 1) / 2;
  const offset = index - mid;
  const maxRotate = 26; // total spread in degrees, clamped for large hands
  const step = Math.min(9, maxRotate / total);
  const rot = (offset * step).toFixed(2);
  const ty = Math.min(30, Math.pow(offset, 2) * 2.6).toFixed(1);
  return `--rot:${rot}deg; --ty:${ty}px; z-index:${index};`;
}

/* ---- Main game screen ---- */
function renderGame() {
  const p = currentPlayer();

  if (p.isBot) {
    renderBotThinking(p, `🤖 <b>${escapeHtml(p.name)}</b> ${t('botPlaying')}`);
    return;
  }

  app.innerHTML = `
    ${menuButtonHtml()}
    <div class="screen board">
      <div class="top-row">
        <h2>${t('yourTurn', escapeHtml(p.name))}</h2>
        <div class="moves-indicator">
          ${[0, 1, 2].map(i => `<div class="dot ${i < (3 - G.movesLeft) ? 'used' : ''}"></div>`).join('')}
          <span>${t('movesLeft', G.movesLeft)}</span>
        </div>
      </div>

      ${renderTable(p)}

      <div class="log-box">${G.log.slice(0, 6).map(l => `<div>${escapeHtml(l)}</div>`).join('')}</div>

      <div class="actions-row">
        <button class="btn-gold" ${G.movesLeft <= 0 ? 'disabled' : ''} onclick="openMakeBurgerModal()">${t('makeBurgerBtn')}</button>
        <button class="btn-secondary" ${G.movesLeft <= 0 ? 'disabled' : ''} onclick="openTradeModal()">${t('tradeBtn')}</button>
        <button class="btn-danger" onclick="endTurn()">${t('endTurnBtn')}</button>
      </div>

      <div class="hand-label-row">
        <div class="hand-label">${t('handLabel', p.hand.length)}</div>
        <button class="btn-sm btn-secondary" onclick="toggleHandGrouped()">${G.ui.handGrouped ? t('fanBtn') : t('groupBtn')}</button>
      </div>
      ${G.ui.handGrouped ? renderGroupedHand(p) : renderFanHand(p)}
    </div>
    ${renderModal()}
    ${renderPendingReveal()}
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
  if (!G.ui.handGrouped) setupHandDrag();
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
        </div>
      </div>

      ${renderTable(active)}

      <div class="log-box">${G.log.slice(0, 6).map(l => `<div>${escapeHtml(l)}</div>`).join('')}</div>

      <div class="actions-row">
        <button class="btn-gold" ${isMyTurn && G.movesLeft > 0 ? '' : 'disabled'} onclick="openMakeBurgerModal()">${t('makeBurgerBtn')}</button>
        <button class="btn-secondary" ${isMyTurn && G.movesLeft > 0 ? '' : 'disabled'} onclick="openTradeModal()">${t('tradeBtn')}</button>
        <button class="btn-danger" ${isMyTurn ? '' : 'disabled'} onclick="endTurn()">${t('endTurnBtn')}</button>
      </div>

      <div class="hand-label-row">
        <div class="hand-label">${t('handLabel', me.hand.length)}</div>
        <button class="btn-sm btn-secondary" onclick="toggleHandGrouped()">${G.ui.handGrouped ? t('fanBtn') : t('groupBtn')}</button>
      </div>
      ${G.ui.handGrouped ? renderGroupedHand(me, !isMyTurn) : renderFanHand(me, !isMyTurn)}
    </div>
    ${isMyTurn ? renderModal() : ''}
    ${isMyTurn ? renderPendingReveal() : ''}
    ${renderMainMenuModal()}
    ${renderRulesModal()}
  `;
  if (isMyTurn && !G.ui.handGrouped) setupHandDrag();
}

function toggleHandGrouped() {
  G.ui.handGrouped = !G.ui.handGrouped;
  render();
}

function renderFanHand(p, forceDisabled) {
  return `
    <div class="hand-scroll">
      <div class="hand fan-hand">
        ${p.hand.map((c, i) => forceDisabled
          ? renderCard(c, false, null, false, fanCardStyle(i, p.hand.length), t('notYourTurn'))
          : renderHandCard(c, p, i, p.hand.length)
        ).join('')}
      </div>
    </div>
  `;
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
  return `
    <div class="hand grouped-hand">
      ${groups.map(g => renderStackCard(g, p, forceDisabled)).join('')}
    </div>
  `;
}

function renderStackCard(group, p, forceDisabled) {
  const front = group.cards[group.cards.length - 1];
  const { usable, handler, reason } = forceDisabled
    ? { usable: false, handler: null, reason: t('notYourTurn') }
    : cardUsability(front, p);
  const count = group.cards.length;
  const isNew = group.cards.some(c => G.newCardIds && G.newCardIds.has(c.id));
  const cardHtml = renderCard(front, usable, usable && handler ? handler : null, false, null, reason, true);
  const depth = Math.min(count - 1, 3);
  const shadows = Array.from({ length: depth }, (_, i) =>
    `<div class="stack-shadow" style="transform:translate(${(i + 1) * 5}px, ${(i + 1) * 5}px);"></div>`
  ).join('');
  const countBadge = count > 1 ? `<div class="stack-count">×${count}</div>` : '';
  const newBadge = isNew ? `<div class="card-new-badge stack-new-badge">${t('newBadge')}</div>` : '';
  return `<div class="card-stack-wrap ${isNew ? 'card-new' : ''}">
      ${shadows}
      ${cardHtml}
      ${countBadge}
      ${newBadge}
    </div>`;
}

/* Shared usability/handler/reason logic for an action card kind — used by both
   the single fan card and the grouped stack (any card of that kind behaves the same). */
function cardUsability(c, p) {
  if (c.type === 'ingredient') return { usable: true, handler: null, reason: null };
  let handler = null;
  let usable = true;
  let reason = null;
  if (G.movesLeft <= 0) { usable = false; reason = t('reasonNoMoves'); }
  switch (c.kind) {
    case 'foodtruck': handler = 'playFoodTruck()'; break;
    case 'delivery': handler = 'openDeliveryModal()'; break;
    case 'grandma':
      handler = 'openGrandmaModal()';
      if (usable && distinctIngredientKinds(p).length < 3) { usable = false; reason = t('reasonGrandmaIngredients'); }
      break;
    case 'inspector':
      handler = 'openInspectorModal()';
      if (usable && !otherPlayers().some(pl => pl.hand.length > 0)) { usable = false; reason = t('reasonInspectorNoTargets'); }
      break;
    case 'shoplifter': handler = 'playShoplifter()'; break;
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
  }
  return { usable, handler, reason };
}

/* ---------------- Drag-to-reorder hand (pointer events: works for mouse + touch) ---------------- */

function setupHandDrag() {
  const container = app.querySelector('.fan-hand');
  if (!container) return;
  Array.from(container.children).forEach(el => {
    el.addEventListener('pointerdown', onHandCardPointerDown);
  });
}

function onHandCardPointerDown(e) {
  const el = e.currentTarget;
  const container = el.parentElement;
  const startIdx = Array.from(container.children).indexOf(el);
  const startX = e.clientX, startY = e.clientY;
  let moved = false;

  function onMove(ev) {
    const dx = ev.clientX - startX, dy = ev.clientY - startY;
    if (!moved && Math.hypot(dx, dy) > 6) {
      moved = true;
      el.classList.add('card-dragging');
    }
    if (moved) {
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
      ev.preventDefault();
    }
  }
  function onUp(ev) {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    if (moved) {
      el.classList.remove('card-dragging');
      el.style.transform = '';
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

function renderHandCard(c, p, index, total) {
  const fanStyle = fanCardStyle(index, total);
  const { usable, handler, reason } = cardUsability(c, p);
  return renderCard(c, usable, usable && handler ? handler : null, false, fanStyle, reason);
}

/* ---- Round table with seats around the rim (dashed circle guide, no table prop) ---- */
const SEAT_AVATARS = ['🧑', '👩', '🧔', '👨', '👩‍🦱', '👨‍🦰', '🧑‍🦳', '👱'];

function renderTable(activePlayer) {
  const N = G.players.length;
  const RX = 38, RY = 38; // radii in % of table-wrap box — leaves room for seat width so it doesn't clip on narrow screens
  const seats = G.players.map((pl, i) => {
    const angle = (-90 + i * (360 / N)) * (Math.PI / 180);
    const x = 50 + RX * Math.cos(angle);
    const y = 50 + RY * Math.sin(angle);
    return renderSeat(pl, pl.id === activePlayer.id, x, y, i);
  }).join('');

  return `
    <div class="table-wrap">
      <div class="table-felt"></div>
      <div class="table-center">
        ${renderMiniPile('draw', G.drawPile.length, t('pileDraw'))}
        ${renderMiniPile('discard', G.discardPile.length, t('pileDiscard'), G.discardPile[G.discardPile.length - 1])}
        ${renderMiniPile('burger', G.burgerPile.length, t('pileBurgers'))}
      </div>
      ${seats}
    </div>
    ${renderEffectToast()}
  `;
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
  const innerBadge = frontIsFaceUp ? '' : `<div class="mini-card-count">${count}</div><div class="mini-card-label">${label}</div>`;
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
      ${frontIsFaceUp ? `<div class="mini-pile-label">${label}</div>` : ''}
    </div>
  `;
}

function renderSeat(pl, isActive, x, y, i) {
  const validSum = pl.burgers.filter(b => !b.fly).reduce((s, b) => s + b.value, 0);
  const burgerLabel = validSum >= WIN_THRESHOLD ? t('burgersReady', validSum) : t('cardsShort', pl.burgers.length);
  return `
    <div class="seat ${isActive ? 'active' : ''}" style="left:${x}%; top:${y}%;">
      ${renderSeatEffectToast(pl)}
      <div class="seat-avatar-ring">
        <div class="seat-avatar">${pl.isBot ? '🤖' : SEAT_AVATARS[i % SEAT_AVATARS.length]}</div>
        ${isActive ? '<div class="seat-turn-badge">🔔</div>' : ''}
      </div>
      <div class="seat-name">${escapeHtml(pl.name)}</div>
      <div class="seat-stats">
        <span>🃏 ${pl.hand.length}</span>
        <span>🍔 ${burgerLabel}</span>
      </div>
      <div class="burger-slots">
        ${pl.burgers.map(b => `<div class="burger-slot ${b.fly ? 'fly' : ''}">
            <img class="burger-slot-img" src="${BACK_ART.burger}" alt="" draggable="false" />
            ${b.fly ? '<span class="burger-slot-fly">🪰</span>' : ''}
          </div>`).join('')}
      </div>
    </div>
  `;
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

function renderModal() {
  const m = G.ui.modal;
  if (!m) return '';
  const p = currentPlayer();

  if (m.type === 'makeBurger') {
    const canClassic = canMakeClassic(p);
    const hasG = hasGrandmaCard(p);
    const kinds = distinctIngredientKinds(p);

    const grandmaSection = `
      <div>
        <div class="hint" style="margin-bottom:6px;color:#d9c4a3;font-size:13px;">${t('grandmaHint')}</div>
        <div class="hand">
          ${kinds.map(k => `<div class="card ingredient ${k} ${m.selectedKinds.includes(k) ? 'selected' : ''}" onclick="toggleGrandmaKind('${k}')">
              <div class="ic">${ingMeta(k).ic}</div><div>${mName(ingMeta(k))}</div>
            </div>`).join('')}
        </div>
        <button class="btn-gold btn-block" ${m.selectedKinds.length === 3 ? '' : 'disabled'} onclick="doMakeGrandma()">
          ${t('grandmaConfirm', m.selectedKinds.length)}
        </button>
      </div>
    `;

    if (m.direct === 'grandma') {
      return wrapModal(t('grandmaModalTitle'), grandmaSection, true);
    }

    return wrapModal(t('makeBurgerModalTitle'), `
      <div class="choice-list">
        <button class="choice-btn" ${canClassic ? '' : 'disabled'} onclick="doMakeClassic(); closeModal();">
          ${t('classicOption', canClassic)}
        </button>
        ${hasG ? grandmaSection : ''}
      </div>
    `, true);
  }

  if (m.type === 'tradeTarget') {
    return wrapModal(t('tradeTargetTitle'), `
      <div class="choice-list">
        ${otherPlayers().map(pl => `<button class="choice-btn" onclick="pickTradeTarget(${pl.id})">${t('playerCardsCount', escapeHtml(pl.name), pl.hand.length)}</button>`).join('')}
      </div>
    `, true);
  }

  if (m.type === 'tradeOffer') {
    const target = G.players.find(pl => pl.id === m.targetId);
    return wrapModal(t('tradeOfferTitle2', escapeHtml(target.name)), `
      <div class="subtitle">${t('tradeChooseOffer')}</div>
      <div class="hand">
        ${p.hand.map(c => renderCard(c, true, `selectOfferCard('${c.id}')`, m.offeredCardId === c.id)).join('')}
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
function renderEnd() {
  const winners = G.winner;
  const rows = [...G.players].sort((a, b) => {
    const sa = a.burgers.filter(x => !x.fly).reduce((s, x) => s + x.value, 0);
    const sb = b.burgers.filter(x => !x.fly).reduce((s, x) => s + x.value, 0);
    return sb - sa;
  });
  const headers = t('winnerTableHeaders');
  app.innerHTML = `
    <div class="screen end-screen">
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
