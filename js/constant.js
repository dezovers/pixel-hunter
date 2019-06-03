/**
* Маркировка ответа игрока.
* Проставляется игроку "штампом" в профиль после каждого ответа.
*
* @enum {string}
*/
const AnswerType = {
  /** FAST — быстрый правильный ответ. */
  FAST: `FAST`,

  /** STANDARD — стандартный правильный ответ. */
  STANDARD: `STANDARD`,

  /** SLOW — медленный правильный ответ. */
  SLOW: `SLOW`,

  /** WRONG — неверный ответ. */
  WRONG: `WRONG`,

  /** UNKNOWN — статус ответа неизвестен (игрок еще не дал ответ). */
  UNKNOWN: `UNKNOWN`
};

/**
 * Маркировка достижения (верный ответ, быстрый ответ, сохраненная жизнь, etc) ==>
 * HTML класс-модификатор подходящей иконки progressbar.
 *
 * @type {Map.<string, string>}
 */
const AchievementToIconClass = {
  [AnswerType.FAST]: `stats__result--fast`,
  [AnswerType.STANDARD]: `stats__result--correct`,
  [AnswerType.SLOW]: `stats__result--slow`,
  [AnswerType.WRONG]: `stats__result--wrong`,
  [AnswerType.UNKNOWN]: `stats__result--unknown`,
  SAVED_LIFE: `stats__result--alive`
};

/**
 * Маркировки игровых уровней.
 * Человекочитаемый тип уровня ==> маркировка по базе данных.
 *
 * @enum {string}
 */
const LevelType = {
  /** Тип уровня: 1 изображение — tinder like */
  ONE_IMAGE: `tinder-like`,

  /** Тип уровня: 2 изображения — two of two */
  TWO_IMAGES: `two-of-two`,

  /** Тип уровня: 3 изображения — one of three */
  THREE_IMAGES: `one-of-three`
};

/**
 * Тип уровня ==> HTML класс-модификатор формы игрового контента.
 *
 * @type {Map.<string, string>}
 */
const levelTypeToFormClass = {
  [LevelType.ONE_IMAGE]: `game__content--wide`,
  [LevelType.TWO_IMAGES]: ``,
  [LevelType.THREE_IMAGES]: `game__content--triple`
};

/**
 * Крайние ситуации для игрока.
 *
 * @enum {number}
 */
const Limit = {
  /** MAX LIVES — Максимальное количество жизней игрока. */
  MAX_LIVES: 3,

  /** LIVES WASTED — Все жизни потрачены. */
  LIVES_WASTED: -1,

  /** MAX LEVEL — Последний допустимый уровень (10-ый). */
  MAX_LEVEL: 10,

  /** MAX LEVEL TIME — Максимально допустимое время прохождение уровня. */
  MAX_LEVEL_TIME: 30
};

/**
 * Вознаграждения или штрафы, назначаемые игроку за ответы.
 *
 * @enum {number}
 */
const Rate = {
  /** STANDARD REWARD за стандартный по скорости ответ: +100 баллов. */
  STANDARD_REWARD: 100,

  /** FAST SPEED BONUS за быстрый ответ: +50 баллов */
  FAST_SPEED_BONUS: 50,

  /** SAVED LIFE BONUS за сохраненную единицу жизни: +50 баллов. */
  SAVED_LIFE_BONUS: 50,

  /** SLOW_SPEED_PENALTY за медлительность: -50 очков. */
  SLOW_SPEED_PENALTY: -50
};

/**
 * Необходимое количество ответов для успешного прохождения игры.
 *
 * @constant
 */
const REQUIRED_ANSWERS_NUMBER = 10;

/**
 * Счет.
 *
 * @enum {number}
 */
const Score = {
  /** ZERO — исходный счет либо просто ноль очков. */
  ZERO: 0,

  /** NEGATIVE — счет отрицательный, игра проиграна. */
  NEGATIVE: -1
};

/**
 * Сдвиг индекса, чтобы счет шел не с нуля, а с единицы.
 *
 * @constant
 */
const ZERO_INDEX_SHIFT = 1;

export {
  AnswerType,
  AchievementToIconClass,
  LevelType,
  levelTypeToFormClass,
  Limit,
  Rate,
  REQUIRED_ANSWERS_NUMBER,
  Score,
  ZERO_INDEX_SHIFT
};
