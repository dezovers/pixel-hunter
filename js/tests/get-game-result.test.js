import {expect} from 'chai';
import {AnswerType} from '../constant.js';
import getGameResult from '../get-game-result.js';

// Варианты тестовых кейсов.
const testCases = [
  // CASE 1
  {
    legend: `CASE 1.
      Ответов 4 из 10. Жизней 0 из 3. Игра провалена.
      Функция возвращает STATE_GAMEOVER: -1\n`,
    answers: Array(4).fill(AnswerType.WRONG),
    lives: 3,
    expectedScore: -1
  },

  // CASE 2
  {
    legend: `CASE 2.
      Ответов 10 из 10, 10 верных, в среднем темпе. Жизней 3 из 3.
      +1000 за 10 стандартных ответов.
      +150 бонус за 3 сохраненные жизни.
      Суммарно: 1150 очков.\n`,
    answers: Array(10).fill(AnswerType.STANDARD),
    lives: 3,
    expectedScore: 1150
  },

  // CASE 3
  {
    legend: `CASE 3.
      Ответов 10 из 10, 8 верных, в среднем темпе. Жизней 1 из 3.
      +800 за 8 стандартных ответов.
      +50 бонус за 1 сохраненную жизнь.
      Суммарно: 850 очков.\n`,
    answers: [
      ...Array(2).fill(AnswerType.WRONG),
      ...Array(8).fill(AnswerType.STANDARD)
    ],
    lives: 1,
    expectedScore: 850
  },

  // CASE 4
  {
    legend: `CASE 4.
      Ответов 10 из 10, 7 верных, в среднем темпе. Жизней 0 из 3.
      +700 за 7 стандартных ответов.
      Суммарно: 700 очков.\n`,
    answers: [
      ...Array(3).fill(AnswerType.WRONG),
      ...Array(7).fill(AnswerType.STANDARD)
    ],
    lives: 0,
    expectedScore: 700
  },

  // CASE 5
  {
    legend: `CASE 5.
      Ответов 10 из 10, 10 верных, в быстром темпе. Жизней 3 из 3.
      +1500 за 10 быстрых ответов.
      +150 бонус за 3 сохраненные жизни.
      Суммарно: 1650 очков.\n`,
    answers: Array(10).fill(AnswerType.FAST),
    lives: 3,
    expectedScore: 1650
  },

  // CASE 6
  {
    legend: `CASE 6.
      Ответов 10 из 10, 10 верных, в медленом темпе. Жизней 3 из 3.
      +500 за 10 медленных ответов.
      +150 бонус за 3 сохраненные жизни.
      Суммарно: 650 очков.\n`,
    answers: Array(10).fill(AnswerType.SLOW),
    lives: 3,
    expectedScore: 650
  },

  // CASE 7
  {
    legend: `CASE 7.
      Ответов 10 из 10, 9 верных, в смешанном темпе. Жизней 2 из 3.
      +300 за 2 быстрых ответа.
      +400 за 4 стандартных ответа.
      +150 за 3 медленных ответы.
      +100 бонус за 2 сохраненные жизни.
      Суммарно: 950 очков.\n`,
    answers: [
      `WRONG`,
      ...Array(2).fill(AnswerType.FAST),
      ...Array(4).fill(AnswerType.STANDARD),
      ...Array(3).fill(AnswerType.SLOW)
    ],
    lives: 2,
    expectedScore: 950
  }
];

describe(`Алгоритм подсчета очков:\n`, () => {
  testCases.forEach((test) => {

    it(test.legend, () => {
      const simulatedPlayerState = {
        name: `Test`,
        answers: test.answers,
        lives: test.lives
      };
      const simulatedResult = getGameResult(simulatedPlayerState);
      expect(simulatedResult.totalScore).to.equal(test.expectedScore);
    });

  });
});
