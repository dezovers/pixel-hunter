import {expect} from 'chai';
import Timer from '../timer.js';

// Варианты тестовых кейсов.
const testCases = [
  // CASE 1
  {
    legend: `CASE 1.
      Таймер заведен на 3 секунды, не использовался.
      Осталось времени: 3 секунды.
      Таймер продолжает работу.\n`,
    timer: new Timer(3),
    timeToTick: 0,
    expected: {
      time: 3,
      finishState: false
    }
  },

  // CASE 2
  {
    legend: `CASE 2.
      Таймер заведен на 3 секунды, снята 1 секунда.
      Осталось времени: 2 секунды.
      Таймер продолжает работу.\n`,
    timer: new Timer(3),
    timeToTick: 1,
    expected: {
      time: 2,
      finishState: false
    }
  },

  // CASE 3
  {
    legend: `CASE 3.
      Таймер заведен на 3 секунды, сняты 2 секунды.
      Осталось времени: 1 секунда.
      Таймер продолжает работу.\n`,
    timer: new Timer(3),
    timeToTick: 2,
    expected: {
      time: 1,
      finishState: false
    }
  },

  // CASE 4
  {
    legend: `CASE 4.
      Таймер заведен на 3 секунды, сняты 3 секунды.
      Осталось времени: 0 секунд.
      Таймер завершил работу.\n`,
    timer: new Timer(3),
    timeToTick: 3,
    expected: {
      time: 0,
      finishState: true
    }
  },

  // CASE 5
  {
    legend: `CASE 5.
      Таймер заведен на 3 секунды, попытка снять 5 секунд.
      Осталось времени: 0 секунд.
      Таймер завершил работу.\n`,
    timer: new Timer(3),
    timeToTick: 5,
    expected: {
      time: 0,
      finishState: true
    }
  },

  // CASE 6
  {
    legend: `CASE 6.
      Попытка установить таймер без указания времени.
      Блокировка действия с выводом ошибки.\n`,
    getTimer: () => new Timer(),
    expected: {
      error: `Таймеру необходимо задать время работы.`
    }
  },

  // CASE 7
  {
    legend: `CASE 7.
      Попытка установить таймер на undefined значение времени.
      Блокировка действия с выводом ошибки.\n`,
    getTimer: () => new Timer(undefined),
    expected: {
      error: `Таймеру необходимо задать время работы.`
    }
  },

  // CASE 8
  {
    legend: `CASE 8.
      Попытка установить таймер на null значение времени.
      Блокировка действия с выводом ошибки.\n`,
    getTimer: () => new Timer(null),
    expected: {
      error: `Таймеру необходимо задать время работы.`
    },
  },

  // CASE 9
  {
    legend: `CASE 9.
      Попытка установить таймер на отрицательное значение времени.
      Блокировка действия с выводом ошибки.\n`,
    getTimer: () => new Timer(-5),
    expected: {
      error: `Время таймера должно быть числом больше нуля.`
    }
  },

  // CASE 10
  {
    legend: `CASE 10.
      Попытка установить таймер на строковое значение времени.
      Блокировка действия с выводом ошибки.\n`,
    getTimer: () => new Timer(`время`),
    expected: {
      error: `Время таймера должно быть числом больше нуля.`
    }
  }
];

describe(`Работа таймера:\n`, () => {
  testCases.forEach((test) => {

    it(test.legend, () => {
      // Тестирование на соответствие значению и состоянию.
      if (test.expected.hasOwnProperty(`time`) && test.expected.hasOwnProperty(`finishState`)) {
        test.timer.tick(test.timeToTick);
        expect(test.timer.time).to.equal(test.expected.time);
        expect(test.timer.isFinished).to.equal(test.expected.finishState);
      }

      // Тестирование на выброс необходимых ошибок.
      if (test.expected.hasOwnProperty(`error`)) {
        expect(test.getTimer).to.throw(test.expected.error);
      }
    });

  });
});
