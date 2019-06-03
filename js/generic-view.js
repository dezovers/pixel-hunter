/**
 * Родительский класс всех View.
 */
class GenericView {
  /**
   * Получение html разметки View.
   *
   * @abstract
   * @type {string}
   */
  get markup() {}

  /**
   * Создание DOM элемента View на основе html разметки.
   *
   * @type {node}
   */
  get node() {
    const node = document.createElement(`template`);
    node.innerHTML = this.markup.trim();

    return node.content;
  }

  /**
   * Формирование законченного View, навешивание обработчиков.
   *
   * @type {node}
   */
  get view() {
    if (!this._view) {
      this._view = this.node;
      this.subscribe();
    }

    return this._view;
  }

  /**
   * Подписка на события внутри View.
   *
   * @abstract
   * @method subscribe
   */
  subscribe() {}
}

export default GenericView;
