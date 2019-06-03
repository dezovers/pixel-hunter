/**
 * Конструктор таймера.
 */
class Timer {
  /**
   * @param {number} timerTime — время, на которое установлен таймер (в секундах)
   */
  constructor(timerTime) {
    if (!timerTime) {
      throw new Error(`Таймеру необходимо задать время работы.`);
    }

    if (typeof timerTime !== `number` || timerTime <= 0) {
      throw new Error(`Время таймера должно быть числом больше нуля.`);
    }

    // Рабочее поле с временем таймера, изменяется.
    this._time = timerTime;

    // Резервное поле, неизменно.
    // Хранит настройку таймера по умолчанию, отдает при сбросе.
    this._timeBackup = timerTime;
  }

  /**
   * Получение запаса времени таймера.
   *
   * @type {number}
   */
  get time() {
    return this._time;
  }

  /**
   * Получение статуса таймера: отработал или нет.
   * Таймер считается отработавшим, когда в запасе остается 0 (ноль) секунд.
   *
   * @type {boolean} — таймер отработал? true || false
   */
  get isFinished() {
    return this._time === 0;
  }

  /**
   * Уменьшение запаса таймера на n-секунд (по умолчанию — на 1 секунду).
   * Блокировка, когда запас времени доходит до 0 (нуля) секунд.
   *
   * @method tick
   * @param {number} seconds — количество секунд, на которое уменьшается запас таймера
   */
  tick(seconds = 1) {
    this._time = (this._time - seconds > 0) ? this._time -= seconds : 0;
  }

  /**
   * Сброс таймера к исходной установке времени.
   *
   * @method reset
   */
  reset() {
    this._time = this._timeBackup;
  }
}

export default Timer;
