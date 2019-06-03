import GenericView from '../generic-view.js';
import Application from '../application.js';

/**
 * Конструктор Confirm Modal View.
 * Модальное окно с подтверждением обнуления игры.
 *
 * @extends GenericView
 */
class ConfirmModalView extends GenericView {
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
      <section class="modal-confirm  modal-confirm__wrap">
        <form class="modal-confirm__inner">

          <button class="modal-confirm__close" type="button">Закрыть</button>

          <h2 class="modal-confirm__title">Подтверждение</h2>
          <p class="modal-confirm__text">Вы уверены что хотите начать игру заново?</p>

          <div class="modal-confirm__btn-wrap">
            <button class="modal-confirm__btn" data-purpose="ok">Ок</button>
            <button class="modal-confirm__btn" data-purpose="cancel">Отмена</button>
          </div>

        </form>
      </section>`;
  }

  /**
   * Подписка на события внутри View.
   *
   * @method subscribe
   */
  subscribe() {
    // Сохранение текущего модального окна для возможности последующего закрытия.
    this._modal = this._view.querySelector(`.modal-confirm`);

    // Отлов нажатия на кнопки "Закрыть модальное окно" и "Отмена".
    const closeButton = this._view.querySelector(`.modal-confirm__close`);
    const cancelButton = this._view.querySelector(`.modal-confirm__btn[data-purpose="cancel"]`);
    closeButton.addEventListener(`click`, (evt) => this.onCancel(evt));
    cancelButton.addEventListener(`click`, (evt) => this.onCancel(evt));

    // Отлов нажатия на кнопку "Ок" — согласие на обнуление игры.
    const confirmButton = this._view.querySelector(`.modal-confirm__btn[data-purpose="ok"]`);
    confirmButton.autofocus = true;
    confirmButton.addEventListener(`click`, (evt) => this.onConfirm(evt));
  }

  /**
   * Закрытие модального окна (удаление из DOM).
   *
   * @method _removeModal
   */
  _removeModal() {
    this._modal.remove();
  }

  /**
   * По клику на кнопке "Ok" — сброс игры.
   *
   * @method onConfirm
   * @param {object} evt — объект события
   */
  onConfirm(evt) {
    evt.preventDefault();

    Application.renderGreeting();
    this._removeModal();
  }

  /**
   * По клику на кнопках "Закрыть" и "Отмена" —
   * закрытие модального окна (удаление из DOM).
   *
   * @method onCancel
   * @param {object} evt — объект события
   */
  onCancel(evt) {
    evt.preventDefault();

    this._removeModal();
  }
}

export default ConfirmModalView;
