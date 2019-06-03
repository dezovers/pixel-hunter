import {Limit} from '../constant.js';
import GenericView from '../generic-view.js';

/**
 * Иконки жизней игрока, их виды.
 *
 * @enum {string}
 */
const LifeIcon = {
  /** WASTED — Потраченная жизнь, контур сердца. */
  WASTED: `<img class="game__heart" src="img/heart__empty.svg" width="32" height="32" alt="Life">`,

  /** SAVED — Сохраненная жизнь, сердце в сплошной заливке. */
  SAVED: `<img class="game__heart" src="img/heart__full.svg" width="32" height="32" alt="Life">`
};

/**
 * Время в секундах, при котором плейсхолдер таймера начинает мигать.
 *
 * @constant
 */
const TIMER_BLINK_TIME = 5;

/**
 * Класс-модификатор, задающий плейсхолдеру таймера анимацию мигания.
 * Модификация добавлена в ./sass/game.scss для класса .game__timer
 *
 * @constant
 */
const TIMER_BLINK_CLASS_MODIFIER = `game__timer--blink`;

/**
 * Конструктор Header View.
 * Header всех экранов.
 *
 * @extends GenericView
 */
class HeaderView extends GenericView {
  /**
   * @param {number|undefined} playerLives — количество жизней игрока (опционально)
   * @param {object|undefined} timer — таймер (опционально)
   */
  constructor(playerLives, timer) {
    super();

    this._playerLives = (typeof playerLives !== void 0) ? playerLives : undefined;
    this._timer = (typeof timer !== void 0) ? timer : undefined;
  }

  /**
   * Получение html разметки View.
   *
   * @type {string}
   */
  get markup() {
    let [livesIndicator, timerIndicator] = [``, ``];

    if (this._playerLives !== void 0 && this._timer !== void 0) {
      // Если передан таймер — он будет отрисован.
      timerIndicator = `<h1 class="game__timer">${this._timer.time}</h1>`;

      // Если передано количество жизней игрока — оно будет отрисовано.
      const livesIcons = [
        ...new Array(Limit.MAX_LIVES - this._playerLives).fill(LifeIcon.WASTED),
        ...new Array(this._playerLives).fill(LifeIcon.SAVED)
      ].join(``);
      livesIndicator = `<div class="game__lives">${livesIcons}</div>`;
    }

    return `
      <header class="header">
        <div class="header__back">
          <button class="back">
            <img src="img/arrow_left.svg" width="45" height="45" alt="Back">
            <img src="img/logo_small.svg" width="101" height="44">
          </button>
        </div>

        ${timerIndicator} ${livesIndicator}
      </header>`;
  }

  /**
   * Подписка на события внутри View.
   *
   * @method subscribe
   */
  subscribe() {
    // Сохранение плейсхолдера таймера.
    // Он используется для точечного обновления времени на экране.
    this._timerPlaceholder = this._view.querySelector(`.game__timer`);

    const backButton = this._view.querySelector(`button.back`);
    backButton.addEventListener(`click`, this.onBackButtonClick);
  }

  /**
   * При обновлении таймера — обновление плейсхолдера таймера на экране.
   * За n-секунд до конца таймера у плейсхолдера включается анимация мигания.
   *
   * @method updateTimerPlaceholder
   * @param {number} time — время таймера
   */
  updateTimerPlaceholder(time) {
    if (time === TIMER_BLINK_TIME) {
      this._timerPlaceholder.classList.add(TIMER_BLINK_CLASS_MODIFIER);
    }

    this._timerPlaceholder.textContent = time;
  }

  /**
   * Callback.
   * Вызывается по клику на кнопке "Назад".
   *
   * @abstract
   * @method onBackButtonClick
   */
  onBackButtonClick() {}
}

export default HeaderView;
