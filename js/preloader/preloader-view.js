import GenericView from '../generic-view.js';

/**
 * Конструктор Preloader View.
 * Вид предзагрузчика данных.
 *
 * @extends GenericView
 */
class PreloaderView extends GenericView {
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
      <div class="preloader">
        <svg class="preloader__image" xmlns="http://www.w3.org/2000/svg" width="150px"  height="150px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style="background: none;">
          <circle cx="50" cy="50" fill="none" stroke-linecap="round" r="40" stroke-width="5" stroke="#eab02b"     stroke-dasharray="62.83185307179586 62.83185307179586" transform="rotate(250.5 50 50)">
            <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="4s" begin="0s" repeatCount="indefinite"></animateTransform>
          </circle>
          <circle cx="50" cy="50" fill="none" stroke-linecap="round" r="34" stroke-width="5" stroke="#de1f1f"     stroke-dasharray="53.40707511102649 53.40707511102649" stroke-dashoffset="53.40707511102649" transform="rotate(-250.5 50   50)">
            <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;-360 50 50" keyTimes="0;1" dur="4s" begin="0s" repeatCount="indefinite"></animateTransform>
          </circle>
        </svg>

        <p class="preloader__message">Идет загрузка данных...</p>
      </div>`;
  }
}

export default PreloaderView;
