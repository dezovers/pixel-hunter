import {AchievementToIconClass, AnswerType, REQUIRED_ANSWERS_NUMBER} from '../constant.js';

/**
 * Получение разметки — progressbar.
 *
 * @function getProgressbarMarkup
 * @param {array} playerAnswers — данные по ответам игрока
 * @return {string} — строка с разметкой
 */
const getProgressbarMarkup = (playerAnswers) => {
  // Заполнение progressbar иконками, отображающими ход игры.
  const progressIndicator = new Array(REQUIRED_ANSWERS_NUMBER)
                                    .fill()
                                    .map((indicator, i) => {
                                      const iconClass = AchievementToIconClass[playerAnswers[i] || AnswerType.UNKNOWN];
                                      return `<li class="stats__result ${iconClass}"></li>`;
                                    })
                                    .join(``);

  return `<ul class="stats">${progressIndicator}</ul>`;
};

export default getProgressbarMarkup;
