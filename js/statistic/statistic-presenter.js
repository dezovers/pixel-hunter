import Application from '../application.js';
import HeaderView from '../shared/header-view.js';
import FooterView from '../shared/footer-view.js';
import StatisticContentView from './statistic-content-view.js';

/**
 * Presenter экрана статистики.
 */
class StatisticPresenter {
  /**
   * @param {array} gameRecords — список с результатами прошедших игр
   */
  constructor(gameRecords) {
    this._gameRecords = gameRecords;

    // Header экрана.
    this._header = new HeaderView();
    this._header.onBackButtonClick = Application.renderConfirmModal;

    // Контентная часть экрана.
    this._content = new StatisticContentView(this._gameRecords);

    // Footer экрана.
    this._footer = new FooterView();

    // Сборка компонентов в контейнер.
    this._screen = document.createDocumentFragment();
    this._screen.append(this._header.view, this._content.view, this._footer.view);
  }

  /**
   * Выдача собранного компонента.
   *
   * @type {node}
   */
  get screen() {
    return this._screen;
  }
}

export default StatisticPresenter;
