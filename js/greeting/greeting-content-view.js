import GenericView from '../generic-view.js';

/**
 * Конструктор Greeting Content View.
 * Контентная часть приветственного экрана.
 *
 * @extends GenericView
 */
class GreetingContentView extends GenericView {
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
      <div class="greeting central--blur">

        <div class="greeting__logo">
          <img src="img/logo_big.png" width="201" height="89" alt="Pixel Hunter">
        </div>

        <h1 class="greeting__asterisk">*</h1>

        <div class="greeting__challenge">
          <h3>Лучшие художники-фотореалисты бросают&nbsp;тебе&nbsp;вызов!</h3>

          <p>Правила игры просты.<br>
            Нужно отличить рисунок&nbsp;от фотографии и сделать выбор.<br>
            Задача кажется тривиальной, но не думай, что все так просто.<br>
            Фотореализм обманчив и коварен.<br>
            Помни, главное — смотреть очень внимательно.
          </p>
        </div>

        <div class="greeting__continue">
          <span>
            <img src="img/arrow_right.svg" width="64" height="64" alt="Next">
          </span>
        </div>

      </div>`;
  }

  /**
   * Подписка на события внутри View.
   *
   * @method subscribe
   */
  subscribe() {
    const nextButton = this._view.querySelector(`.greeting__continue`);
    nextButton.addEventListener(`click`, this.onNextButtonClick);
  }

  /**
   * Callback.
   * Вызывается по клику на кнопке "Вперед".
   *
   * @abstract
   * @method onNextButtonClick
   */
  onNextButtonClick() {}
}

export default GreetingContentView;
