import GenericView from '../generic-view.js';

/**
 * Конструктор Error View.
 * Модальное окно с отображением ошибки.
 *
 * @extends GenericView
 */
class ErrorModalView extends GenericView {
  /**
   * @param {object} errorData — данные произошедшей ошибки
   */
  constructor(errorData) {
    super();

    // Данные ошибки.
    this._errorData = errorData;
  }

  /**
   * Получение html разметки View.
   *
   * @type {string}
   */
  get markup() {
    return `
      <section class="modal-error  modal-error__wrap">
        <div class="modal-error__inner">

          <h2 class="modal-error__title">Произошла ошибка!</h2>
          <p class="modal-error__text">${this._errorData.message}</p>

        </div>
      </section>`;
  }
}

export default ErrorModalView;
