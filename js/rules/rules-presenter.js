import Application from '../application.js';
import Player from '../player.js';
import RulesContentView from './rules-content-view.js';
import HeaderView from '../shared/header-view.js';

/**
 * Presenter экрана с правилами игры.
 */
class RulesPresenter {
  constructor() {
    // Header экрана.
    this._header = new HeaderView();
    this._header.onBackButtonClick = Application.renderConfirmModal;

    // Контентная часть экрана.
    this._content = new RulesContentView();
    this._content.onGameStart = (playerName) => {
      // Создание игрового профиля, сброс к значениям по умолчанию.
      const player = new Player(playerName);
      Application.renderLevel(player);
    };

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
}

export default RulesPresenter;
