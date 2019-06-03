import GenericView from '../generic-view.js';
import getStatisticTableMarkup from './get-statistic-table-markup.js';

/**
 * Результирующее сообщение финального экрана.
 *
 * "Победа" или "Поражение"
 * @enum {string}
 */
const ResultMessage = {
  /** Сообщение о победе. */
  WIN: `Победа!`,

  /** Сообщение о поражении. */
  FAIL: `Поражение!`
};

/**
 * Конструктор Statistic Content View.
 * Контентная часть экрана статистики.
 *
 * @extends GenericView
 */
class StatisticContentView extends GenericView {
  /**
   * @param {array} gameRecords — список с результатами прошедших игр
   */
  constructor(gameRecords) {
    super();

    this._gameRecords = gameRecords;
    this._lastGame = gameRecords[0];
  }

  /**
   * Получение html разметки View.
   *
   * @type {string}
   */
  get markup() {
    const resultMessage = (this._lastGame.hasPlayerWon) ? ResultMessage.WIN : ResultMessage.FAIL;
    const statisticTable = getStatisticTableMarkup(this._gameRecords);

    return `
      <div class="result">
        <h1>
          ${resultMessage}
        </h1>

        <table class="result__table">
          ${statisticTable}
        </table>
      </div>`;
  }
}

export default StatisticContentView;
