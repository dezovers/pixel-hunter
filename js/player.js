import {copyDeep} from './utils.js';
import {Limit} from './constant.js';
import Timer from './timer.js';

/**
 * Профиль игрока (шаблон).
 *
 * @constant
 */
const INITIAL_PLAYER_STATE = Object.freeze({
  /** Ответы игрока. */
  answers: [],

  /** Текущий уровень игрока. */
  level: 0,

  /** Оставшиеся жизни игрока. */
  lives: 3
});

/**
 * Профиль игрока (модель данных).
 */
class Player {
  /**
   * @param {string} playerName — имя игрока
   */
  constructor(playerName) {
    this.name = playerName;
    this._reset();
  }

  /**
   * Получение текущего уровня игрока.
   *
   * @type {number}
   */
  get level() {
    return this._state.level;
  }

  /**
   * Получение ответа: есть ли уровни в запасе.
   *
   * @type {boolean}
   */
  get hasNextLevel() {
    return this._state.level !== Limit.MAX_LEVEL;
  }

  /**
   * Получение количества жизней игрока.
   *
   * @type {number}
   */
  get lives() {
    return this._state.lives;
  }

  /**
   * Получение ответа: остались ли у игрока жизни.
   *
   * @type {boolean}
   */
  get isAlive() {
    return this._state.lives !== Limit.LIVES_WASTED;
  }

  /**
   * Получение списка ответов игрока.
   *
   * @type {array}
   */
  get answers() {
    return this._state.answers;
  }

  /**
   * Получение таймера игрока.
   *
   * @type {object}
   */
  get timer() {
    return this._timer;
  }

  /**
   * Запись ответа в профиль игрока.
   *
   * @method saveAnswer
   * @param {string} answer — маркировка ответа
   */
  saveAnswer(answer) {
    this._state.answers.push(answer);
  }

  /**
   * Увеличение уровня игрока.
   *
   * @method levelUp
   */
  levelUp() {
    this._state.level++;
  }

  /**
   * Снятие жизни за ошибку.
   *
   * @method decreaseLives
   */
  decreaseLives() {
    this._state.lives--;
  }

  /**
   * Сброс профиля игрока к настройкам по умолчанию.
   *
   * @method _reset
   */
  _reset() {
    this._state = null;
    this._state = copyDeep(INITIAL_PLAYER_STATE);
    this._timer = new Timer(Limit.MAX_LEVEL_TIME);
  }
}

export default Player;
