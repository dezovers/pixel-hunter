import GenericView from '../generic-view.js';

/**
 * Конструктор Rules Content View.
 * Контентная часть экрана с правилами игры.
 *
 * @extends GenericView
 */
class RulesContentView extends GenericView {
  constructor() {
    super();
  }

  /**
   * Получение html разметки View.
   *
   * @type {string}
   */
  get markup() {
    return `
      <div class="rules">
        <h1 class="rules__title">Правила</h1>

        <p class="rules__description">
          Угадай 10 раз для каждого изображения фото <img src="img/photo_icon.png" width="16" height="16">
          или рисунок <img src="img/paint_icon.png" width="16" height="16" alt="">.<br>
          Фотографиями или рисунками могут быть оба изображения.<br>
          На каждую попытку отводится 30 секунд.<br>
          Ошибиться можно не более 3 раз.<br><br>
          Готовы?
        </p>

        <form class="rules__form">
          <input class="rules__input" type="text" placeholder="Ваше Имя">
          <button class="rules__button  continue" type="submit" disabled>Go!</button>
        </form>
      </div>`;
  }

  /**
   * Подписка на события внутри View.
   *
   * @method subscribe
   */
  subscribe() {
    // Начало игры невозможно до тех пор, пока
    // в поле "Ваше имя" не будет введено какое-либо значение.
    const playerNameInput = this._view.querySelector(`input.rules__input`);
    const startButton = this._view.querySelector(`button.rules__button`);
    playerNameInput.addEventListener(`input`, () => {
      startButton.disabled = (playerNameInput.value) ? false : true;
    });

    // Инициализация игры.
    const form = this._view.querySelector(`form.rules__form`);
    form.addEventListener(`submit`, (evt) => {
      evt.preventDefault();

      this.onGameStart(playerNameInput.value);
    });
  }

  /**
   * Callback.
   * Вызывается при инициализации новой игры.
   *
   * @abstract
   * @method onGameStart
   */
  onGameStart() {}
}

export default RulesContentView;
