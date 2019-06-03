import Application from '../application.js';
import GreetingContentView from './greeting-content-view.js';

/**
 * Presenter приветственного экрана.
 */
class GreetingPresenter {
  constructor() {
    // Контентная часть экрана.
    this._content = new GreetingContentView();
    this._content.onNextButtonClick = Application.renderRules;
  }

  /**
   * Выдача собранного компонента.
   *
   * @type {node}
   */
  get screen() {
    return this._content.view;
  }
}

export default GreetingPresenter;
