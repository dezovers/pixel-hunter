import {AnswerType, Limit} from '../constant.js';
import Application from '../application.js';
import HeaderView from '../shared/header-view.js';
import LevelContentView from './level-content-view.js';

/**
 * Лимиты понятий "быстрый ответ" / "медленный ответ".
 *
 * @enum {number}
 */
const AnswerTimeLimit = {
  /**
   * Время, на котором заканчивается "быстрый ответ".
   * 0 - 9 секунд включительно.
   */
  MAX_FOR_FAST: 9,

  /**
   * Время, с которого начинается "медленный ответ".
   * 21 - 30 секунд включительно.
   */
  MIN_FOR_SLOW: 21
};

/**
 * Шаг обновления таймера: 1000 милисекунд === 1 секунда.
 *
 * @constant
 */
const ONE_SECOND = 1000;

/**
 * Presenter игрового экрана.
 */
class LevelPresenter {
  /**
   * @param {object} player — профиль игрока (ответы, жизни, etc)
   * @param {object} gameLevels — игровые данные
   */
  constructor(player, gameLevels) {
    // Локальное храниение профиля и игровых данных.
    this._player = player;
    this._gameLevels = gameLevels;

    // Получение данных текущего уровня, сброс таймера к настройке по умолчанию (30 секунд).
    this._levelData = gameLevels[player.level];
    this._player.timer.reset();

    // Header экрана.
    this._header = new HeaderView(this._player.lives, this._player.timer);
    this._header.onBackButtonClick = Application.renderConfirmModal;

    // Контентная часть экрана.
    this._content = new LevelContentView(this._player.answers, this._levelData);
    this._content.onAnswer = (isAnswerCorrect) => this._changeLevel(isAnswerCorrect);

    // Сборка компонентов в контейнер.
    this._screen = document.createDocumentFragment();
    this._screen.append(this._header.view, this._content.view);
  }

  /**
   * Выдача собранного компонента.
   *
   * @type {node}
   */
  get screen() {
    return this._screen;
  }

  /**
   * Отсчет времени, отведенного на ответ.
   * Синхронизация времени с плейсхолдером таймера на экране.
   *
   * Когда в запасе остается 5 секунд — у плейсхолдера включается анимация мигания.
   * Когда время таймера истекло — игроку засчитывается ошибка и экран переключается.
   *
   * @method startCountdown
   */
  startCountdown() {
    this._countdown = setInterval(() => {
      this._player.timer.tick();

      this._header.updateTimerPlaceholder(this._player.timer.time);

      if (this._player.timer.isFinished) {
        const isAnswerCorrect = false;
        this._changeLevel(isAnswerCorrect);
      }
    }, ONE_SECOND);
  }

  /**
   * Прекращение отсчета времени, отведенного на ответ.
   *
   * @method _stopCountdown
   */
  _stopCountdown() {
    clearInterval(this._countdown);
  }

  /**
   * Обновление профиля игрока и смена игрового уровня.
   *
   * Уровень меняется на один из двух возможных:
   * 1. На другой игровой уровень, если игроку позволяют условия.
   * 2. На экран финальной статистики.
   *
   * @method _changeLevel
   * @param {boolean} isAnswerCorrect — вердикт по последнему ответу, корректный или нет
   */
  _changeLevel(isAnswerCorrect) {
    this._stopCountdown();
    this._updatePlayerState(isAnswerCorrect);

    if (this._player.isAlive && this._player.hasNextLevel) {
      Application.renderLevel(this._player, this._gameLevels);
    } else {
      Application.renderStatistic(this._player);
    }
  }

  /**
   * Обновление профиля игрока:
   * 1. Оценка корректности и скорости ответа.
   * 2. Снятие жизни за неверный ответ.
   * 3. Увеличение игрового уровня.
   *
   * @method _updatePlayerState
   * @param {boolean} isAnswerCorrect — статус последнего ответа, верный или нет
   */
  _updatePlayerState(isAnswerCorrect) {
    switch (isAnswerCorrect) {
      case true:
        const answerTime = Limit.MAX_LEVEL_TIME - this._player.timer.time;

        if (answerTime <= AnswerTimeLimit.MAX_FOR_FAST) {
          this._player.saveAnswer(AnswerType.FAST);
        } else if (answerTime >= AnswerTimeLimit.MIN_FOR_SLOW) {
          this._player.saveAnswer(AnswerType.SLOW);
        } else {
          this._player.saveAnswer(AnswerType.STANDARD);
        }
        break;

      case false:
        this._player.saveAnswer(AnswerType.WRONG);
        this._player.decreaseLives();
        break;
    }

    this._player.levelUp();
  }
}

export default LevelPresenter;
