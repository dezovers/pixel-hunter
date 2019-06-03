/**
 * Уникальный идентификатор приложения.
 *
 * @constant
 */
const APP_ID = `666`;

/**
 * HTTP Status Codes: Success. Диапазон кодов типа "Success".
 *
 * @enum {number}
 */
const HTTPSuccessCode = {
  FIRST: 200,
  LAST: 299
};

/**
 * URL сервера.
 *
 * @enum {string}
 */
const ServerURL = {
  /** URL сервера для получения игровых данных. */
  GAME_LEVELS: `https://es.dump.academy/pixel-hunter/questions`,

  /** URL сервера для отгрузки текущего результата игры и загрузки истории игр. */
  STATISTIC: `https://es.dump.academy/pixel-hunter/stats/:appId-:username`
};

/**
 * Плейсхолдеры для подстановки данных в Server Upload URL
 *
 * @enum {string}
 */
const URLPlaceholder = {
  /** Место в Server Upload URL для подстановки ID приложения. */
  APP_ID: `:appId`,

  /** Место в Server Upload URL для подстановки имени игрока. */
  USERNAME: `:username`
};

/**
 * Проверка статуса запроса к серверу.
 *
 * @function checkFetchStatus
 * @param {object} response — объект, ответ на запрос
 * @return {object} — возврат успешного ответа либо выброс ошибки
 */
const checkFetchStatus = (response) => {
  if (response.status >= HTTPSuccessCode.FIRST && response.status <= HTTPSuccessCode.LAST) {
    return response;
  } else {
    throw new Error(`При попытке обратиться к серверу произошла ошибка.
    Код ${response.status}: ${response.statusText}.`);
  }
};

/**
 * Загрузчик данных с сервера / на сервер.
 */
class ServerLoader {
  /**
   * Загрузка и преобразование в JSON всех игровых данных.
   *
   * @static
   * @method downloadGameLevels
   * @return {object} — promise с данными
   */
  static downloadGameLevels() {
    return window.fetch(ServerURL.GAME_LEVELS)
                       .then(checkFetchStatus)
                       .then((response) => response.json());
  }

  /**
   * Отправка на сервер результата последней игры.
   *
   * @static
   * @method uploadGameResult
   * @param {object} gameResult — детальная статистика прошедшей игры
   * @return {object} — promise с данными
   */
  static uploadGameResult(gameResult) {
    const playerName = gameResult.name;
    const serverURL = this._getStatisticServerURL(playerName);

    return window.fetch(serverURL, {
      method: `POST`,
      body: JSON.stringify(gameResult),
      headers: {
        'Content-Type': `application/json`
      }
    })
    .then(checkFetchStatus);
  }

  /**
   * Загрузка и преобразование в JSON игровой истории.
   *
   * @static
   * @method downloadGameRecords
   * @param {string} playerName — имя игрока
   * @return {object} — promise с данными
   */
  static downloadGameRecords(playerName) {
    const serverURL = this._getStatisticServerURL(playerName);

    return window.fetch(serverURL)
                        .then(checkFetchStatus)
                        .then((response) => response.json());
  }

  /**
   * Получение динамически вычисляемого URL сервера статистики.
   *
   * @static
   * @method _getStatisticServerURL
   * @param {string} playerName — имя игрока
   * @return {string} — актуальный URL сервера
   */
  static _getStatisticServerURL(playerName) {
    return ServerURL.STATISTIC
                      .replace(URLPlaceholder.APP_ID, () => APP_ID)
                      .replace(URLPlaceholder.USERNAME, () => playerName);
  }
}

export default ServerLoader;
