import {AchievementToIconClass, AnswerType, Rate, ZERO_INDEX_SHIFT} from '../constant.js';
import getProgressbarMarkup from '../shared/get-progressbar-markup.js';

/**
 * Получение разметки детализированной статистики.
 *
 * @function getStatisticTableMarkup
 * @param {array} gameRecords — список со статистикой прошедших игр
 * @return {string} — строка с разметкой
 */
const getStatisticTableMarkup = (gameRecords) => {
  const gamesNumber = gameRecords.length;

  const markup = new Array(gamesNumber)
                      .fill()
                      .map((record, i) => {
                        // Если игрок победил:
                        // Контейнер статистики заполняется информацией из данного блока.
                        if (gameRecords[i].hasPlayerWon) {
                          // Подсчет количества баллов за все верные ответы.
                          const correctAnswersStatistic = `
                            <tr>
                              <td class="result__number">${i + ZERO_INDEX_SHIFT}.</td>
                              <td colspan="2">
                                ${getProgressbarMarkup(gameRecords[i].allAnswers)}
                              </td>
                              <td class="result__points">×&nbsp;${Rate.STANDARD_REWARD}</td>
                              <td class="result__total">
                                ${gameRecords[i].correctAnswers * Rate.STANDARD_REWARD}
                              </td>
                            </tr>`;

                          // Бонусная статистика по быстрым ответам.
                          const fastAnswersStatistic = ``.replace(``, () => {
                            if (gameRecords[i].fastAnswers) {
                              return `
                                <tr>
                                  <td></td>
                                  <td class="result__extra">Бонус за скорость:</td>
                                  <td class="result__extra">
                                   ${gameRecords[i].fastAnswers}&nbsp;
                                   <span class="stats__result ${AchievementToIconClass[AnswerType.FAST]}"></span>
                                  </td>
                                  <td class="result__points">×&nbsp;${Rate.FAST_SPEED_BONUS}</td>
                                  <td class="result__total">
                                   ${gameRecords[i].fastAnswers * Rate.FAST_SPEED_BONUS}
                                  </td>
                                </tr>`;
                            }

                            return ``;
                          });

                          // Бонусная статистика по сохраненным жизням.
                          const savedLivesStatistic = ``.replace(``, () => {
                            if (gameRecords[i].savedLives) {
                              return `
                                <tr>
                                  <td></td>
                                  <td class="result__extra">Бонус за жизни:</td>
                                  <td class="result__extra">
                                    ${gameRecords[i].savedLives}&nbsp;
                                    <span class="stats__result ${AchievementToIconClass.SAVED_LIFE}"></span>
                                  </td>
                                  <td class="result__points">×&nbsp;${Rate.SAVED_LIFE_BONUS}</td>
                                  <td class="result__total">
                                    ${gameRecords[i].savedLives * Rate.SAVED_LIFE_BONUS}
                                  </td>
                                </tr>`;
                            }

                            return ``;
                          });

                          // Бонусная статистика по штрафам за медлительность.
                          const slowAnswersStatistic = ``.replace(``, () => {
                            if (gameRecords[i].slowAnswers) {
                              return `
                                <tr>
                                  <td></td>
                                  <td class="result__extra">Штраф за медлительность:</td>
                                  <td class="result__extra">
                                    ${gameRecords[i].slowAnswers}&nbsp;
                                    <span class="stats__result ${AchievementToIconClass[AnswerType.SLOW]}"></span>
                                  </td>
                                  <td class="result__points">
                                    ×&nbsp;${String(Rate.SLOW_SPEED_PENALTY).replace(/-/, () => ``)}
                                  </td>
                                  <td class="result__total">
                                    ${gameRecords[i].slowAnswers * Rate.SLOW_SPEED_PENALTY}
                                  </td>
                                </tr>`;
                            }

                            return ``;
                          });

                          return `
                            <table class="result__table">
                              ${correctAnswersStatistic}
                              ${fastAnswersStatistic}
                              ${savedLivesStatistic}
                              ${slowAnswersStatistic}

                              <tr>
                                <td colspan="5" class="result__total  result__total--final">
                                  ${gameRecords[i].totalScore}
                                </td>
                              </tr>
                            </table>`;
                        }

                        // Если игрок проиграл:
                        // Контейнер статистики заполняется информацией из данного блока.
                        return `
                          <table class="result__table">
                            <tr>
                              <td class="result__number">${i + ZERO_INDEX_SHIFT}.</td>
                              <td colspan="2">
                                ${getProgressbarMarkup(gameRecords[i].allAnswers)}
                              </td>
                              <td class="result__total"></td>
                              <td class="result__total  result__total--final">fail</td>
                            </tr>
                          </table>`;
                      }).join(``);

  return markup;
};

export default getStatisticTableMarkup;
