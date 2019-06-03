import IntroContentView from './intro-content-view.js';
import FooterView from '../shared/footer-view.js';

/**
 * Presenter Intro экрана.
 */
class IntroPresenter {
  constructor() {
    // Контентная часть экрана.
    this._content = new IntroContentView();

    // Footer экрана.
    this._footer = new FooterView();

    // Сборка компонентов в контейнер.
    this._screen = document.createDocumentFragment();
    this._screen.append(this._content.view, this._footer.view);
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

export default IntroPresenter;
