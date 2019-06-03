import {AnswerType, Rate, REQUIRED_ANSWERS_NUMBER, Score} from './constant.js';

/**
 * Расчет результатов игры.
 *
 * @function getGameResult
 * @param {object} player — профиль игрока (ответы, жизни, etc)
 * @return {object} — детальная результирующая статистика
 */
const getGameResult = (player) => {
  // Получение имени игрока, маркировки ответов и оставшегося количества жизней.
  const [playerName, playerAnswers, playerLives] = [player.name, player.answers, player.lives];

  // Генерация результирующей статистики
  const result = {
    name: playerName,
    hasPlayerWon: null,
    allAnswers: playerAnswers,
    totalScore: null
  };

  // Если игрок ответил не на все вопросы — Game Over.
  if (playerAnswers.length < REQUIRED_ANSWERS_NUMBER) {
    result.hasPlayerWon = false;
    result.totalScore = Score.NEGATIVE;
    return result;
  }

  // Если игрок ответил на вопросы — подсчет результатов.
  result.hasPlayerWon = true;
  result.correctAnswers = 0;
  result.fastAnswers = 0;
  result.slowAnswers = 0;
  result.savedLives = playerLives;

  result.totalScore = playerAnswers.reduce((accumulator, answer) => {
    switch (answer) {
      case AnswerType.FAST:
        result.correctAnswers++;
        result.fastAnswers++;
        return accumulator + Rate.STANDARD_REWARD + Rate.FAST_SPEED_BONUS;

      case AnswerType.SLOW:
        result.correctAnswers++;
        result.slowAnswers++;
        return accumulator + Rate.STANDARD_REWARD + Rate.SLOW_SPEED_PENALTY;

      case AnswerType.STANDARD:
        result.correctAnswers++;
        return accumulator + Rate.STANDARD_REWARD;

      default: // подразумевается — AnswerType.WRONG
        return accumulator;
    }
  }, Score.ZERO);

  // Надбавка бонуса за сохраненные жизни.
  result.totalScore += (playerLives) ? playerLives * Rate.SAVED_LIFE_BONUS : Score.ZERO;

  return result;
};

export default getGameResult;
