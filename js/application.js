import {
  cleanUpWorkspace,
  fadeOutElement,
  fadeInElement,
  startImagesLoading,
  saveImagesNaturalSizes
} from './utils.js';

import ServerLoader from './server-loader.js';
import adaptGameLevels from './adapt-game-levels.js';
import getGameResult from './get-game-result.js';

import PreloaderView from './preloader/preloader-view.js';
import IntroPresenter from './intro/intro-presenter.js';
import GreetingPresenter from './greeting/greeting-presenter.js';
import RulesPresenter from './rules/rules-presenter.js';
import LevelPresenter from './level/level-presenter.js';
import StatisticPresenter from './statistic/statistic-presenter.js';

import ErrorModalView from './error-modal/error-modal-view.js';
import ConfirmModalView from './confirm-modal/confirm-modal-view.js';

/**
 * Главная рабочая область приложения.
 *
 * @constant
 */
const WORKSPACE = document.querySelector(`.central`);

/**
 * Время анимации fade в милисекундах (0.9 секунды).
 *
 * @constant
 */
const FADE_ANIMATION_TIME = 900;

/**
 * Данные игровых уровней (заполняются в ходе запроса на сервер).
 */
let gameLevels = null;

/**
 * Главный роутер приложения.
 */
class Application {
  /**
   * Инициализация приложения.
   *
   * Создание и отрисовка Intro экрана и Preloader оверлея.
   * Загрузка и адаптация данных игровых уровней.
   * Предзагрузка игровых изображений.
   * Удаление Preloader.
   * Вывод сообщения об ошибке (если произошла).
   *
   * @static
   * @method start
   */
  static start() {
    const preloader = new PreloaderView();
    const intro = new IntroPresenter();
    WORKSPACE.append(preloader.view, intro.screen);

    // Загрузка и адаптация данных игровых уровней.
    // Предзагрузка игровых изображений.
    ServerLoader.downloadGameLevels()
                .then((untouchedLevels) => adaptGameLevels(untouchedLevels))
                .then((adaptedLevels) => {
                  gameLevels = adaptedLevels;
                })
                .then(() => startImagesLoading(gameLevels))
                .then((loadedImages) => saveImagesNaturalSizes(loadedImages, gameLevels))
                .then(() => {
                  fadeOutElement(WORKSPACE);

                  const uselessPreloader = WORKSPACE.querySelector(`.preloader`);
                  setTimeout(() => uselessPreloader.remove(), FADE_ANIMATION_TIME);
                })
                .then(() => {
                  setTimeout(() => {
                    fadeInElement(WORKSPACE);
                    Application.renderGreeting();
                  }, FADE_ANIMATION_TIME);
                })
                .catch(Application.renderErrorModal);

  }

  /**
   * Создание и отрисовка приветственного экрана.
   *
   * @static
   * @method renderGreeting
   */
  static renderGreeting() {
    const greeting = new GreetingPresenter();

    // На момент вставки контента — рабочая область не пуста.
    // Очистка рабочей области от всего, кроме статичного Footer.
    // Вставка контента перед Footer.
    cleanUpWorkspace(WORKSPACE, true);
    WORKSPACE.prepend(greeting.screen);
  }

  /**
   * Создание и отрисовка экрана с правилами игры.
   *
   * @static
   * @method renderRules
   */
  static renderRules() {
    const rules = new RulesPresenter();

    // На момент вставки контента — рабочая область не пуста.
    // Прямая замена отработанной части на актуальный контент.
    WORKSPACE.firstChild.replaceWith(rules.screen);
  }

  /**
   * Создание и отрисовка игрового экрана.
   *
   * @static
   * @method renderLevel
   * @param {object} player — профиль игрока (ответы, жизни, etc)
   */
  static renderLevel(player) {
    const level = new LevelPresenter(player, gameLevels);
    level.startCountdown();

    // На момент вставки контента — рабочая область не пуста.
    // Очистка рабочей области от всего, кроме статичного Footer.
    // Вставка контента перед Footer.
    cleanUpWorkspace(WORKSPACE, true);
    WORKSPACE.prepend(level.screen);
  }

  /**
   * Создание и отрисовка экрана статистики.
   *
   * @static
   * @method renderStatistic
   * @param {object} player — профиль игрока (ответы, жизни, etc)
   */
  static renderStatistic(player) {
    // Создание и отрисовка preloader.
    const preloader = new PreloaderView();
    cleanUpWorkspace(WORKSPACE);
    WORKSPACE.append(preloader.view);

    // Получение детальной статистики текущей игры.
    const playerName = player.name;
    const gameResult = getGameResult(player);

    ServerLoader.uploadGameResult(gameResult)
                                  .then(() => ServerLoader.downloadGameRecords(playerName))
                                  .then((gameRecords) => {
                                    const statistic = new StatisticPresenter(gameRecords.reverse());
                                    WORKSPACE.prepend(statistic.screen);

                                    const uselessPreloader = WORKSPACE.querySelector(`.preloader`);
                                    fadeOutElement(uselessPreloader);
                                    setTimeout(() => uselessPreloader.remove(), FADE_ANIMATION_TIME);
                                  })
                                  .catch(Application.renderErrorModal);
  }

  /**
   * Создание и отрисовка модального окна с ошибкой.
   *
   * @static
   * @method renderErrorModal
   * @param {object} errorData — данные произошедшей ошибки
   */
  static renderErrorModal(errorData) {
    const errorModal = new ErrorModalView(errorData);

    // Если на странице отрисован схожий по стилизации preloader — он удаляется.
    // Далеее отрисовывается модальное окно ошибки.
    const uselessPreloader = WORKSPACE.querySelector(`.preloader`);
    if (uselessPreloader) {
      uselessPreloader.remove();
    }
    document.body.append(errorModal.view);
  }

  /**
   * Создание и отрисовка модального окна с подтверждением сброса игры.
   *
   * @static
   * @method renderConfirmModal
   */
  static renderConfirmModal() {
    const renderedConfirmModal = document.querySelector(`.modal-confirm`);
    if (!renderedConfirmModal) {
      const confirmModal = new ConfirmModalView();
      document.body.append(confirmModal.view);
    }
  }
}

export default Application;
