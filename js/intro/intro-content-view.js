import GenericView from '../generic-view.js';

/**
 * Конструктор Intro Content View.
 * Контентная часть Intro экрана.
 *
 * @extends GenericView
 */
class IntroContentView extends GenericView {
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
      <div id="main" class="central__content">
        <div id="intro" class="intro">

          <h1 class="intro__asterisk">*</h1>

          <p class="intro__motto">
            <sup>*</sup>
            Это не фото. Это рисунок маслом нидерландского художника-фотореалиста Tjalf Sparnaay.
          </p>

        </div>
      </div>`;
  }
}

export default IntroContentView;
