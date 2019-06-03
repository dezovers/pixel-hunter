(function () {
  'use strict';

  /**
   * Композиция рабочей области, в которой Footer — единственный элемент.
   *
   * @constant
   */
  const FOOTER_ONLY_COMPOSITION = 1;

  /**
   * Очистка рабочей области.
   *
   * Если параметр shouldSaveFooter === true, тогда Footer сохраняется.
   *
   * @function cleanUpWorkspace
   * @param {node} workspace — область для очистки
   * @param {boolean} shouldSaveFooter — сохранять или нет Footer
   */
  const cleanUpWorkspace = (workspace, shouldSaveFooter = false) => {
    switch (shouldSaveFooter) {
      case true:
        while (workspace.children.length > FOOTER_ONLY_COMPOSITION) {
          workspace.firstChild.remove();
        }
        break;

      case false:
        workspace.innerHTML = ``;
        break;
    }
  };

  /**
   * Наложение эффекта "затухания" на выбранный DOM элемент.
   *
   * @function fadeOutElement
   * @param {node} element — DOM элемент
   */
  const fadeOutElement = (element) => {
    element.style.transition = `opacity 0.8s ease-in`;
    element.style.opacity = `0`;
  };

  /**
   * Наложение эффекта "появления" на выбранный DOM элемент.
   *
   * @function fadeInElement
   * @param {node} element — DOM элемент
   */
  const fadeInElement = (element) => {
    element.style.transition = `opacity 0.8s ease-in`;
    element.style.opacity = `1`;
  };

  /**
   * Копирование всех типов данных.
   * Сложные типы копируются по значению (на выходе глубокая и независимая копия).
   *
   * @function copyDeep
   * @param {object|array|number|string|boolean|null|undefined|symbol} source — источник данных
   * @return {object|array|number|string|boolean|null|undefined|symbol} — копия данных
   */
  const copyDeep = (source) => {
    // Если источник — примитив.
    if (!source || typeof source !== `object`) {
      return source;
    }

    // Если источник — массив.
    if (source.constructor === Array) {
      const copiedItems = [];

      for (let i = 0; i < source.length; i++) {
        copiedItems[i] = copyDeep(source[i]);
      }

      return copiedItems;
    }

    // Если источник — объект.
    const copiedObject = {};

    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        copiedObject[key] = copyDeep(source[key]);
      }
    }

    return copiedObject;
  };

  /**
   * Предзагрузка изображений игровых уровней.
   *
   * @function startImagesLoading
   * @param {array} gameLevels — данные игровых уровней
   * @return {object} — Promise.all свертка всех загрузок
   */
  const startImagesLoading = (gameLevels) => {
    // Заполнение сета URL-адресами уникальных изображений.
    const uniqueImagesSRC = new Set();

    gameLevels.forEach((level) => {
      level.images.forEach((image) => {
        uniqueImagesSRC.add(image.src);
      });
    });

    // Отправка выбранных изображений на предзагрузку.
    const imagesLoaders = [];

    uniqueImagesSRC.forEach((imageSRC) => {
      const loader = new Promise((onLoad) => {
        const image = new Image();
        image.src = imageSRC;
        image.addEventListener(`load`, () => onLoad(image));
        image.addEventListener(`error`, () => {
          throw new Error(`Во время загрузки изображений произошла ошибка.`);
        });
      });

      imagesLoaders.push(loader);
    });

    // Свертка всех загружаемых изображений в одну единую задачу.
    // Возврат результата.
    return Promise.all(imagesLoaders);
  };

  /**
   * Сохранение в игровую базу реальных размеров изображений.
   *
   * Размеры снимаются с предзагруженных изображений, у которых
   * на этом этапе можно определить Natural Width и Natural Height.
   *
   * @function saveImagesNaturalSizes
   * @param {array} loadedImages — предзагруженные изображения
   * @param {array} gameLevels — данные игровых уровней
   */
  const saveImagesNaturalSizes = (loadedImages, gameLevels) => {
    gameLevels.forEach((levelData) => {
      levelData.images.forEach((imageData) => {

        const relatedLoadedImage = loadedImages.find((it) => imageData.src === it.src);
        imageData.naturalSize.width = relatedLoadedImage.naturalWidth;
        imageData.naturalSize.height = relatedLoadedImage.naturalHeight;

      });
    });
  };

  /**
   * Масштабирование изображения под размеры контейнера.
   *
   * @function resizeImage
   * @param {object} containerSize — размеры контейнера (width, height)
   * @param {object} imageSize — размеры изображения (width, height)
   * @return {object} — размеры изображения после масштабирования
   */
  const resizeImage = (containerSize, imageSize) => {
    const ratio = Math.min(containerSize.width / imageSize.width, containerSize.height / imageSize.height);

    return {
      width: imageSize.width * ratio,
      height: imageSize.height * ratio
    };
  };

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

  /**
  * Маркировка ответа игрока.
  * Проставляется игроку "штампом" в профиль после каждого ответа.
  *
  * @enum {string}
  */
  const AnswerType = {
    /** FAST — быстрый правильный ответ. */
    FAST: `FAST`,

    /** STANDARD — стандартный правильный ответ. */
    STANDARD: `STANDARD`,

    /** SLOW — медленный правильный ответ. */
    SLOW: `SLOW`,

    /** WRONG — неверный ответ. */
    WRONG: `WRONG`,

    /** UNKNOWN — статус ответа неизвестен (игрок еще не дал ответ). */
    UNKNOWN: `UNKNOWN`
  };

  /**
   * Маркировка достижения (верный ответ, быстрый ответ, сохраненная жизнь, etc) ==>
   * HTML класс-модификатор подходящей иконки progressbar.
   *
   * @type {Map.<string, string>}
   */
  const AchievementToIconClass = {
    [AnswerType.FAST]: `stats__result--fast`,
    [AnswerType.STANDARD]: `stats__result--correct`,
    [AnswerType.SLOW]: `stats__result--slow`,
    [AnswerType.WRONG]: `stats__result--wrong`,
    [AnswerType.UNKNOWN]: `stats__result--unknown`,
    SAVED_LIFE: `stats__result--alive`
  };

  /**
   * Маркировки игровых уровней.
   * Человекочитаемый тип уровня ==> маркировка по базе данных.
   *
   * @enum {string}
   */
  const LevelType = {
    /** Тип уровня: 1 изображение — tinder like */
    ONE_IMAGE: `tinder-like`,

    /** Тип уровня: 2 изображения — two of two */
    TWO_IMAGES: `two-of-two`,

    /** Тип уровня: 3 изображения — one of three */
    THREE_IMAGES: `one-of-three`
  };

  /**
   * Тип уровня ==> HTML класс-модификатор формы игрового контента.
   *
   * @type {Map.<string, string>}
   */
  const levelTypeToFormClass = {
    [LevelType.ONE_IMAGE]: `game__content--wide`,
    [LevelType.TWO_IMAGES]: ``,
    [LevelType.THREE_IMAGES]: `game__content--triple`
  };

  /**
   * Крайние ситуации для игрока.
   *
   * @enum {number}
   */
  const Limit = {
    /** MAX LIVES — Максимальное количество жизней игрока. */
    MAX_LIVES: 3,

    /** LIVES WASTED — Все жизни потрачены. */
    LIVES_WASTED: -1,

    /** MAX LEVEL — Последний допустимый уровень (10-ый). */
    MAX_LEVEL: 10,

    /** MAX LEVEL TIME — Максимально допустимое время прохождение уровня. */
    MAX_LEVEL_TIME: 30
  };

  /**
   * Вознаграждения или штрафы, назначаемые игроку за ответы.
   *
   * @enum {number}
   */
  const Rate = {
    /** STANDARD REWARD за стандартный по скорости ответ: +100 баллов. */
    STANDARD_REWARD: 100,

    /** FAST SPEED BONUS за быстрый ответ: +50 баллов */
    FAST_SPEED_BONUS: 50,

    /** SAVED LIFE BONUS за сохраненную единицу жизни: +50 баллов. */
    SAVED_LIFE_BONUS: 50,

    /** SLOW_SPEED_PENALTY за медлительность: -50 очков. */
    SLOW_SPEED_PENALTY: -50
  };

  /**
   * Необходимое количество ответов для успешного прохождения игры.
   *
   * @constant
   */
  const REQUIRED_ANSWERS_NUMBER = 10;

  /**
   * Счет.
   *
   * @enum {number}
   */
  const Score = {
    /** ZERO — исходный счет либо просто ноль очков. */
    ZERO: 0,

    /** NEGATIVE — счет отрицательный, игра проиграна. */
    NEGATIVE: -1
  };

  /**
   * Сдвиг индекса, чтобы счет шел не с нуля, а с единицы.
   *
   * @constant
   */
  const ZERO_INDEX_SHIFT = 1;

  /**
   * Состояние, когда изображение определенного типа представлено
   * в единственном числе, например 1 фото к 2-м картинам или 1 картина к 2-м фото.
   *
   * @constant
   */
  const SINGLE_REPRESENTATIVE = 1;

  /**
   * Адаптация серверной структуры данных на более удобную для работы.
   *
   * @function adaptGameLevels
   * @param {array} untouchedLevels — данные с сервера в исходном виде
   * @return {object} — игровые данные, адаптированные под фронденд
   */
  const adaptGameLevels = (untouchedLevels) => {
    const adaptedLevels = untouchedLevels.map((level) => {
      return {
        type: level.type,
        task: level.question,
        images: level.answers.map((image) => {
          // Смена формата хранения правильных ответов на более удобный.
          let correctAnswer = null;
          if (level.type === LevelType.ONE_IMAGE || level.type === LevelType.TWO_IMAGES) {
            correctAnswer = image.type;
          } else {
            const thisImageTypeRepresentatives = level.answers.filter((it) => it.type === image.type).length;
            correctAnswer = thisImageTypeRepresentatives === SINGLE_REPRESENTATIVE;
          }

          // Смена формата хранения размеров изображения на более удобный.
          return {
            src: image.image.url,
            naturalSize: {
              width: null,
              height: null
            },
            correctAnswer
          };
        })

      };
    });

    return adaptedLevels;
  };

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

  /**
   * Конструктор Intro Content View.
   * Контентная часть Intro экрана.
   *
   * @extends GenericView
   */
  class IntroContentView extends GenericView {
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
      <div id="main" class="central__content">
        <div id="intro" class="intro">

          <h1 class="intro__asterisk">*</h1>

          <p class="intro__motto">
            <sup>*</sup>
            Это не фото. Это рисунок маслом нидерландского художника-фотореалиста Tjalf Sparnaay.
          </p>

        </div>
      </div>`;
    }
  }

  /**
   * Конструктор Footer View.
   * Footer всех экранов.
   *
   * @extends GenericView
   */
  class FooterView extends GenericView {
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
      <footer class="footer">
        <a href="https://htmlacademy.ru" class="social-link social-link--academy">HTML Academy</a>

        <span class="footer__made-in">
          Сделано в <a href="https://htmlacademy.ru" class="footer__link">HTML Academy</a> &copy; 2016
        </span>

        <div class="footer__social-links">
          <a href="https://twitter.com/htmlacademy_ru" class="social-link  social-link--tw">Твиттер</a>
          <a href="https://www.instagram.com/htmlacademy/" class="social-link  social-link--ins">Инстаграм</a>
          <a href="https://www.facebook.com/htmlacademy" class="social-link  social-link--fb">Фэйсбук</a>
          <a href="https://vk.com/htmlacademy" class="social-link  social-link--vk">Вконтакте</a>
        </div>
      </footer>`;
    }
  }

  /**
   * Presenter Intro экрана.
   */
  class IntroPresenter {
    constructor() {
      // Контентная часть экрана.
      this._content = new IntroContentView();

      // Footer экрана.
      this._footer = new FooterView();

      // Сборка компонентов в контейнер.
      this._screen = document.createDocumentFragment();
      this._screen.append(this._content.view, this._footer.view);
    }

    /**
     * Выдача собранного компонента.
     *
     * @type {node}
     */
    get screen() {
      return this._screen;
    }
  }

  /**
   * Конструктор Greeting Content View.
   * Контентная часть приветственного экрана.
   *
   * @extends GenericView
   */
  class GreetingContentView extends GenericView {
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
      <div class="greeting central--blur">

        <div class="greeting__logo">
          <img src="img/logo_big.png" width="201" height="89" alt="Pixel Hunter">
        </div>

        <h1 class="greeting__asterisk">*</h1>

        <div class="greeting__challenge">
          <h3>Лучшие художники-фотореалисты бросают&nbsp;тебе&nbsp;вызов!</h3>

          <p>Правила игры просты.<br>
            Нужно отличить рисунок&nbsp;от фотографии и сделать выбор.<br>
            Задача кажется тривиальной, но не думай, что все так просто.<br>
            Фотореализм обманчив и коварен.<br>
            Помни, главное — смотреть очень внимательно.
          </p>
        </div>

        <div class="greeting__continue">
          <span>
            <img src="img/arrow_right.svg" width="64" height="64" alt="Next">
          </span>
        </div>

      </div>`;
    }

    /**
     * Подписка на события внутри View.
     *
     * @method subscribe
     */
    subscribe() {
      const nextButton = this._view.querySelector(`.greeting__continue`);
      nextButton.addEventListener(`click`, this.onNextButtonClick);
    }

    /**
     * Callback.
     * Вызывается по клику на кнопке "Вперед".
     *
     * @abstract
     * @method onNextButtonClick
     */
    onNextButtonClick() {}
  }

  /**
   * Presenter приветственного экрана.
   */
  class GreetingPresenter {
    constructor() {
      // Контентная часть экрана.
      this._content = new GreetingContentView();
      this._content.onNextButtonClick = Application.renderRules;
    }

    /**
     * Выдача собранного компонента.
     *
     * @type {node}
     */
    get screen() {
      return this._content.view;
    }
  }

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

  /**
   * Профиль игрока (шаблон).
   *
   * @constant
   */
  const INITIAL_PLAYER_STATE = Object.freeze({
    /** Ответы игрока. */
    answers: [],

    /** Текущий уровень игрока. */
    level: 0,

    /** Оставшиеся жизни игрока. */
    lives: 3
  });

  /**
   * Профиль игрока (модель данных).
   */
  class Player {
    /**
     * @param {string} playerName — имя игрока
     */
    constructor(playerName) {
      this.name = playerName;
      this._reset();
    }

    /**
     * Получение текущего уровня игрока.
     *
     * @type {number}
     */
    get level() {
      return this._state.level;
    }

    /**
     * Получение ответа: есть ли уровни в запасе.
     *
     * @type {boolean}
     */
    get hasNextLevel() {
      return this._state.level !== Limit.MAX_LEVEL;
    }

    /**
     * Получение количества жизней игрока.
     *
     * @type {number}
     */
    get lives() {
      return this._state.lives;
    }

    /**
     * Получение ответа: остались ли у игрока жизни.
     *
     * @type {boolean}
     */
    get isAlive() {
      return this._state.lives !== Limit.LIVES_WASTED;
    }

    /**
     * Получение списка ответов игрока.
     *
     * @type {array}
     */
    get answers() {
      return this._state.answers;
    }

    /**
     * Получение таймера игрока.
     *
     * @type {object}
     */
    get timer() {
      return this._timer;
    }

    /**
     * Запись ответа в профиль игрока.
     *
     * @method saveAnswer
     * @param {string} answer — маркировка ответа
     */
    saveAnswer(answer) {
      this._state.answers.push(answer);
    }

    /**
     * Увеличение уровня игрока.
     *
     * @method levelUp
     */
    levelUp() {
      this._state.level++;
    }

    /**
     * Снятие жизни за ошибку.
     *
     * @method decreaseLives
     */
    decreaseLives() {
      this._state.lives--;
    }

    /**
     * Сброс профиля игрока к настройкам по умолчанию.
     *
     * @method _reset
     */
    _reset() {
      this._state = null;
      this._state = copyDeep(INITIAL_PLAYER_STATE);
      this._timer = new Timer(Limit.MAX_LEVEL_TIME);
    }
  }

  /**
   * Конструктор Rules Content View.
   * Контентная часть экрана с правилами игры.
   *
   * @extends GenericView
   */
  class RulesContentView extends GenericView {
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
      <div class="rules">
        <h1 class="rules__title">Правила</h1>

        <p class="rules__description">
          Угадай 10 раз для каждого изображения фото <img src="img/photo_icon.png" width="16" height="16">
          или рисунок <img src="img/paint_icon.png" width="16" height="16" alt="">.<br>
          Фотографиями или рисунками могут быть оба изображения.<br>
          На каждую попытку отводится 30 секунд.<br>
          Ошибиться можно не более 3 раз.<br><br>
          Готовы?
        </p>

        <form class="rules__form">
          <input class="rules__input" type="text" placeholder="Ваше Имя">
          <button class="rules__button  continue" type="submit" disabled>Go!</button>
        </form>
      </div>`;
    }

    /**
     * Подписка на события внутри View.
     *
     * @method subscribe
     */
    subscribe() {
      // Начало игры невозможно до тех пор, пока
      // в поле "Ваше имя" не будет введено какое-либо значение.
      const playerNameInput = this._view.querySelector(`input.rules__input`);
      const startButton = this._view.querySelector(`button.rules__button`);
      playerNameInput.addEventListener(`input`, () => {
        startButton.disabled = (playerNameInput.value) ? false : true;
      });

      // Инициализация игры.
      const form = this._view.querySelector(`form.rules__form`);
      form.addEventListener(`submit`, (evt) => {
        evt.preventDefault();

        this.onGameStart(playerNameInput.value);
      });
    }

    /**
     * Callback.
     * Вызывается при инициализации новой игры.
     *
     * @abstract
     * @method onGameStart
     */
    onGameStart() {}
  }

  /**
   * Иконки жизней игрока, их виды.
   *
   * @enum {string}
   */
  const LifeIcon = {
    /** WASTED — Потраченная жизнь, контур сердца. */
    WASTED: `<img class="game__heart" src="img/heart__empty.svg" width="32" height="32" alt="Life">`,

    /** SAVED — Сохраненная жизнь, сердце в сплошной заливке. */
    SAVED: `<img class="game__heart" src="img/heart__full.svg" width="32" height="32" alt="Life">`
  };

  /**
   * Время в секундах, при котором плейсхолдер таймера начинает мигать.
   *
   * @constant
   */
  const TIMER_BLINK_TIME = 5;

  /**
   * Класс-модификатор, задающий плейсхолдеру таймера анимацию мигания.
   * Модификация добавлена в ./sass/game.scss для класса .game__timer
   *
   * @constant
   */
  const TIMER_BLINK_CLASS_MODIFIER = `game__timer--blink`;

  /**
   * Конструктор Header View.
   * Header всех экранов.
   *
   * @extends GenericView
   */
  class HeaderView extends GenericView {
    /**
     * @param {number|undefined} playerLives — количество жизней игрока (опционально)
     * @param {object|undefined} timer — таймер (опционально)
     */
    constructor(playerLives, timer) {
      super();

      this._playerLives = (typeof playerLives !== void 0) ? playerLives : undefined;
      this._timer = (typeof timer !== void 0) ? timer : undefined;
    }

    /**
     * Получение html разметки View.
     *
     * @type {string}
     */
    get markup() {
      let [livesIndicator, timerIndicator] = [``, ``];

      if (this._playerLives !== void 0 && this._timer !== void 0) {
        // Если передан таймер — он будет отрисован.
        timerIndicator = `<h1 class="game__timer">${this._timer.time}</h1>`;

        // Если передано количество жизней игрока — оно будет отрисовано.
        const livesIcons = [
          ...new Array(Limit.MAX_LIVES - this._playerLives).fill(LifeIcon.WASTED),
          ...new Array(this._playerLives).fill(LifeIcon.SAVED)
        ].join(``);
        livesIndicator = `<div class="game__lives">${livesIcons}</div>`;
      }

      return `
      <header class="header">
        <div class="header__back">
          <button class="back">
            <img src="img/arrow_left.svg" width="45" height="45" alt="Back">
            <img src="img/logo_small.svg" width="101" height="44">
          </button>
        </div>

        ${timerIndicator} ${livesIndicator}
      </header>`;
    }

    /**
     * Подписка на события внутри View.
     *
     * @method subscribe
     */
    subscribe() {
      // Сохранение плейсхолдера таймера.
      // Он используется для точечного обновления времени на экране.
      this._timerPlaceholder = this._view.querySelector(`.game__timer`);

      const backButton = this._view.querySelector(`button.back`);
      backButton.addEventListener(`click`, this.onBackButtonClick);
    }

    /**
     * При обновлении таймера — обновление плейсхолдера таймера на экране.
     * За n-секунд до конца таймера у плейсхолдера включается анимация мигания.
     *
     * @method updateTimerPlaceholder
     * @param {number} time — время таймера
     */
    updateTimerPlaceholder(time) {
      if (time === TIMER_BLINK_TIME) {
        this._timerPlaceholder.classList.add(TIMER_BLINK_CLASS_MODIFIER);
      }

      this._timerPlaceholder.textContent = time;
    }

    /**
     * Callback.
     * Вызывается по клику на кнопке "Назад".
     *
     * @abstract
     * @method onBackButtonClick
     */
    onBackButtonClick() {}
  }

  /**
   * Presenter экрана с правилами игры.
   */
  class RulesPresenter {
    constructor() {
      // Header экрана.
      this._header = new HeaderView();
      this._header.onBackButtonClick = Application.renderConfirmModal;

      // Контентная часть экрана.
      this._content = new RulesContentView();
      this._content.onGameStart = (playerName) => {
        // Создание игрового профиля, сброс к значениям по умолчанию.
        const player = new Player(playerName);
        Application.renderLevel(player);
      };

      // Сборка компонентов в контейнер.
      this._screen = document.createDocumentFragment();
      this._screen.append(this._header.view, this._content.view);
    }

    /**
     * Выдача собранного компонента.
     *
     * @type {node}
     */
    get screen() {
      return this._screen;
    }
  }

  /**
   * Тип уровня ==> Классы-модификаторы для label опций.
   *
   * @type {Map.<string, object>}
   */
  const levelTypeToOptionClass = {
    [LevelType.ONE_IMAGE]: {
      PHOTO: `game__answer--photo`,
      PAINTING: `game__answer--paint`
    },
    [LevelType.TWO_IMAGES]: {
      PHOTO: `game__answer--photo`,
      PAINTING: `game__answer--wide  game__answer--paint`
    }
  };

  /**
   * Получение разметки изображений-заданий игрового уровня.
   *
   * @function getLevelImagesMarkup
   * @param {object} levelData — данные игрового уровня
   * @return {string} — разметка изображений
   */
  const getLevelImagesMarkup = (levelData) => {
    let markup = null;

    // Если тип уровня — 1 или 2 изображения:
    // Игровой контейнер заполнится изображениями из данного блока.
    if (levelData.type === LevelType.ONE_IMAGE || levelData.type === LevelType.TWO_IMAGES) {
      markup = levelData.images.map((image, i) => {
        const optionClassModifier = levelTypeToOptionClass[levelData.type];

        return `
        <div class="game__option">
          <img src="${image.src}" alt="Option ${i + ZERO_INDEX_SHIFT}">
          <label class="game__answer ${optionClassModifier.PHOTO}">
            <input name="question${i + ZERO_INDEX_SHIFT}" type="radio" value="photo">
            <span>Фото</span>
          </label>
          <label class="game__answer ${optionClassModifier.PAINTING}">
            <input name="question${i + ZERO_INDEX_SHIFT}" type="radio" value="painting">
            <span>Рисунок</span>
          </label>
        </div>`;
      }).join(``);
    }

    // Если тип уровня — 3 изображения:
    // Игровой контейнер заполнится изображениями из данного блока.
    if (levelData.type === LevelType.THREE_IMAGES) {
      markup = levelData.images.map((image, i) => {
        return `
        <div class="game__option">
          <img src="${image.src}" alt="Option ${i + ZERO_INDEX_SHIFT}">
        </div>`;
      }).join(``);
    }

    return markup;
  };

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

  /**
   * Тип уровня ==> Размер изображения по умолчанию (100% размера контейнера).
   *
   * @type {Map.<string, object>}
   */
  const levelTypeToImageContainerSize = {
    [LevelType.ONE_IMAGE]: {
      width: 705,
      height: 455
    },
    [LevelType.TWO_IMAGES]: {
      width: 468,
      height: 455
    },
    [LevelType.THREE_IMAGES]: {
      width: 304,
      height: 455
    }
  };

  /**
   * Необходимое количество отмеченных вариантов ответа.
   * Используется при валидации 2 типа уровня.
   *
   * @constant
   */
  const REQUIRED_SELECTIONS_NUMBER = 2;

  /**
   * Конструктор Level Content View.
   * Контентная часть игрового экрана.
   *
   * @extends GenericView
   */
  class LevelContentView extends GenericView {
    /**
     * @param {array} playerAnswers — статистика ответов игрока.
     * @param {object} levelData — игровые данные уровня
     */
    constructor(playerAnswers, levelData) {
      super();

      this._playerAnswers = playerAnswers;
      this._levelData = levelData;
    }

    /**
     * Получение html разметки View.
     *
     * @type {string}
     */
    get markup() {
      const levelImages = getLevelImagesMarkup(this._levelData);
      const progressbar = getProgressbarMarkup(this._playerAnswers);

      return `
      <div class="game">
        <p class="game__task">${this._levelData.task}</p>

        <form class="game__content ${levelTypeToFormClass[this._levelData.type]}">
          ${levelImages}
        </form>

        <div class="stats">
          ${progressbar}
        </div>
      </div>`;
    }

    /**
     * Подписка на события внутри View.
     *
     * @method subscribe
     */
    subscribe() {
      const form = this._view.querySelector(`form.game__content`);

      // Масшабирование предзагруженных изображений под размеры контейнеров.
      const levelImages = this._view.querySelectorAll(`.game__option img`);
      levelImages.forEach((image, i) => {
        const containerSize = levelTypeToImageContainerSize[this._levelData.type];
        const naturalImageSize = {
          width: this._levelData.images[i].naturalSize.width,
          height: this._levelData.images[i].naturalSize.height
        };
        const scaledImageSize = resizeImage(containerSize, naturalImageSize);

        image.width = scaledImageSize.width;
        image.height = scaledImageSize.height;
      });

      // Если тип уровня 1 изображение — валидация выбранной опции ответа.
      if (this._levelData.type === LevelType.ONE_IMAGE) {
        form.addEventListener(`change`, () => {
          const selectedOption = form.querySelector(`input[type="radio"]:checked`);

          const isAnswerCorrect = selectedOption.value === this._levelData.images[0].correctAnswer;
          this.onAnswer(isAnswerCorrect);
        });
      }

      // Если тип уровня 2 изображения — валидация выбранных опций ответа.
      if (this._levelData.type === LevelType.TWO_IMAGES) {
        form.addEventListener(`change`, () => {
          const selectedOptions = Array.from(form.querySelectorAll(`input[type="radio"]:checked`));

          if (selectedOptions.length === REQUIRED_SELECTIONS_NUMBER) {
            const isAnswerCorrect = selectedOptions.every((selection, i) => {
              return selection.value === this._levelData.images[i].correctAnswer;
            });

            this.onAnswer(isAnswerCorrect);
          }
        });
      }

      // Если тип уровня 3 изображения — валидация выбранной опции ответа.
      if (this._levelData.type === LevelType.THREE_IMAGES) {
        form.addEventListener(`click`, (evt) => {
          const selectedOption = evt.target.closest(`.game__option`);

          if (selectedOption) {
            selectedOption.classList.add(`game__option--selected`);

            const selectedOptionIndex = Array.from(form.querySelectorAll(`.game__option`))
                                              .findIndex((option) => {
                                                return option.classList.contains(`game__option--selected`);
                                              });

            const isAnswerCorrect = this._levelData.images[selectedOptionIndex].correctAnswer;
            this.onAnswer(isAnswerCorrect);
          }
        });
      }
    }

    /**
     * Callback.
     * Вызывается после обработки ответа игрока.
     *
     * @abstract
     * @method onAnswer
     */
    onAnswer() {}
  }

  /**
   * Лимиты понятий "быстрый ответ" / "медленный ответ".
   *
   * @enum {number}
   */
  const AnswerTimeLimit = {
    /**
     * Время, на котором заканчивается "быстрый ответ".
     * 0 - 9 секунд включительно.
     */
    MAX_FOR_FAST: 9,

    /**
     * Время, с которого начинается "медленный ответ".
     * 21 - 30 секунд включительно.
     */
    MIN_FOR_SLOW: 21
  };

  /**
   * Шаг обновления таймера: 1000 милисекунд === 1 секунда.
   *
   * @constant
   */
  const ONE_SECOND = 1000;

  /**
   * Presenter игрового экрана.
   */
  class LevelPresenter {
    /**
     * @param {object} player — профиль игрока (ответы, жизни, etc)
     * @param {object} gameLevels — игровые данные
     */
    constructor(player, gameLevels) {
      // Локальное храниение профиля и игровых данных.
      this._player = player;
      this._gameLevels = gameLevels;

      // Получение данных текущего уровня, сброс таймера к настройке по умолчанию (30 секунд).
      this._levelData = gameLevels[player.level];
      this._player.timer.reset();

      // Header экрана.
      this._header = new HeaderView(this._player.lives, this._player.timer);
      this._header.onBackButtonClick = Application.renderConfirmModal;

      // Контентная часть экрана.
      this._content = new LevelContentView(this._player.answers, this._levelData);
      this._content.onAnswer = (isAnswerCorrect) => this._changeLevel(isAnswerCorrect);

      // Сборка компонентов в контейнер.
      this._screen = document.createDocumentFragment();
      this._screen.append(this._header.view, this._content.view);
    }

    /**
     * Выдача собранного компонента.
     *
     * @type {node}
     */
    get screen() {
      return this._screen;
    }

    /**
     * Отсчет времени, отведенного на ответ.
     * Синхронизация времени с плейсхолдером таймера на экране.
     *
     * Когда в запасе остается 5 секунд — у плейсхолдера включается анимация мигания.
     * Когда время таймера истекло — игроку засчитывается ошибка и экран переключается.
     *
     * @method startCountdown
     */
    startCountdown() {
      this._countdown = setInterval(() => {
        this._player.timer.tick();

        this._header.updateTimerPlaceholder(this._player.timer.time);

        if (this._player.timer.isFinished) {
          const isAnswerCorrect = false;
          this._changeLevel(isAnswerCorrect);
        }
      }, ONE_SECOND);
    }

    /**
     * Прекращение отсчета времени, отведенного на ответ.
     *
     * @method _stopCountdown
     */
    _stopCountdown() {
      clearInterval(this._countdown);
    }

    /**
     * Обновление профиля игрока и смена игрового уровня.
     *
     * Уровень меняется на один из двух возможных:
     * 1. На другой игровой уровень, если игроку позволяют условия.
     * 2. На экран финальной статистики.
     *
     * @method _changeLevel
     * @param {boolean} isAnswerCorrect — вердикт по последнему ответу, корректный или нет
     */
    _changeLevel(isAnswerCorrect) {
      this._stopCountdown();
      this._updatePlayerState(isAnswerCorrect);

      if (this._player.isAlive && this._player.hasNextLevel) {
        Application.renderLevel(this._player, this._gameLevels);
      } else {
        Application.renderStatistic(this._player);
      }
    }

    /**
     * Обновление профиля игрока:
     * 1. Оценка корректности и скорости ответа.
     * 2. Снятие жизни за неверный ответ.
     * 3. Увеличение игрового уровня.
     *
     * @method _updatePlayerState
     * @param {boolean} isAnswerCorrect — статус последнего ответа, верный или нет
     */
    _updatePlayerState(isAnswerCorrect) {
      switch (isAnswerCorrect) {
        case true:
          const answerTime = Limit.MAX_LEVEL_TIME - this._player.timer.time;

          if (answerTime <= AnswerTimeLimit.MAX_FOR_FAST) {
            this._player.saveAnswer(AnswerType.FAST);
          } else if (answerTime >= AnswerTimeLimit.MIN_FOR_SLOW) {
            this._player.saveAnswer(AnswerType.SLOW);
          } else {
            this._player.saveAnswer(AnswerType.STANDARD);
          }
          break;

        case false:
          this._player.saveAnswer(AnswerType.WRONG);
          this._player.decreaseLives();
          break;
      }

      this._player.levelUp();
    }
  }

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

  /**
   * Presenter экрана статистики.
   */
  class StatisticPresenter {
    /**
     * @param {array} gameRecords — список с результатами прошедших игр
     */
    constructor(gameRecords) {
      this._gameRecords = gameRecords;

      // Header экрана.
      this._header = new HeaderView();
      this._header.onBackButtonClick = Application.renderConfirmModal;

      // Контентная часть экрана.
      this._content = new StatisticContentView(this._gameRecords);

      // Footer экрана.
      this._footer = new FooterView();

      // Сборка компонентов в контейнер.
      this._screen = document.createDocumentFragment();
      this._screen.append(this._header.view, this._content.view, this._footer.view);
    }

    /**
     * Выдача собранного компонента.
     *
     * @type {node}
     */
    get screen() {
      return this._screen;
    }
  }

  /**
   * Конструктор Error View.
   * Модальное окно с отображением ошибки.
   *
   * @extends GenericView
   */
  class ErrorModalView extends GenericView {
    /**
     * @param {object} errorData — данные произошедшей ошибки
     */
    constructor(errorData) {
      super();

      // Данные ошибки.
      this._errorData = errorData;
    }

    /**
     * Получение html разметки View.
     *
     * @type {string}
     */
    get markup() {
      return `
      <section class="modal-error  modal-error__wrap">
        <div class="modal-error__inner">

          <h2 class="modal-error__title">Произошла ошибка!</h2>
          <p class="modal-error__text">${this._errorData.message}</p>

        </div>
      </section>`;
    }
  }

  /**
   * Конструктор Confirm Modal View.
   * Модальное окно с подтверждением обнуления игры.
   *
   * @extends GenericView
   */
  class ConfirmModalView extends GenericView {
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
      <section class="modal-confirm  modal-confirm__wrap">
        <form class="modal-confirm__inner">

          <button class="modal-confirm__close" type="button">Закрыть</button>

          <h2 class="modal-confirm__title">Подтверждение</h2>
          <p class="modal-confirm__text">Вы уверены что хотите начать игру заново?</p>

          <div class="modal-confirm__btn-wrap">
            <button class="modal-confirm__btn" data-purpose="ok">Ок</button>
            <button class="modal-confirm__btn" data-purpose="cancel">Отмена</button>
          </div>

        </form>
      </section>`;
    }

    /**
     * Подписка на события внутри View.
     *
     * @method subscribe
     */
    subscribe() {
      // Сохранение текущего модального окна для возможности последующего закрытия.
      this._modal = this._view.querySelector(`.modal-confirm`);

      // Отлов нажатия на кнопки "Закрыть модальное окно" и "Отмена".
      const closeButton = this._view.querySelector(`.modal-confirm__close`);
      const cancelButton = this._view.querySelector(`.modal-confirm__btn[data-purpose="cancel"]`);
      closeButton.addEventListener(`click`, (evt) => this.onCancel(evt));
      cancelButton.addEventListener(`click`, (evt) => this.onCancel(evt));

      // Отлов нажатия на кнопку "Ок" — согласие на обнуление игры.
      const confirmButton = this._view.querySelector(`.modal-confirm__btn[data-purpose="ok"]`);
      confirmButton.autofocus = true;
      confirmButton.addEventListener(`click`, (evt) => this.onConfirm(evt));
    }

    /**
     * Закрытие модального окна (удаление из DOM).
     *
     * @method _removeModal
     */
    _removeModal() {
      this._modal.remove();
    }

    /**
     * По клику на кнопке "Ok" — сброс игры.
     *
     * @method onConfirm
     * @param {object} evt — объект события
     */
    onConfirm(evt) {
      evt.preventDefault();

      Application.renderGreeting();
      this._removeModal();
    }

    /**
     * По клику на кнопках "Закрыть" и "Отмена" —
     * закрытие модального окна (удаление из DOM).
     *
     * @method onCancel
     * @param {object} evt — объект события
     */
    onCancel(evt) {
      evt.preventDefault();

      this._removeModal();
    }
  }

  /**
   * Главная рабочая область приложения.
   *
   * @constant
   */
  const WORKSPACE = document.querySelector(`.central`);

  /**
   * Время анимации fade в милисекундах (0.9 секунды).
   *
   * @constant
   */
  const FADE_ANIMATION_TIME = 900;

  /**
   * Данные игровых уровней (заполняются в ходе запроса на сервер).
   */
  let gameLevels = null;

  /**
   * Главный роутер приложения.
   */
  class Application {
    /**
     * Инициализация приложения.
     *
     * Создание и отрисовка Intro экрана и Preloader оверлея.
     * Загрузка и адаптация данных игровых уровней.
     * Предзагрузка игровых изображений.
     * Удаление Preloader.
     * Вывод сообщения об ошибке (если произошла).
     *
     * @static
     * @method start
     */
    static start() {
      const preloader = new PreloaderView();
      const intro = new IntroPresenter();
      WORKSPACE.append(preloader.view, intro.screen);

      // Загрузка и адаптация данных игровых уровней.
      // Предзагрузка игровых изображений.
      ServerLoader.downloadGameLevels()
                  .then((untouchedLevels) => adaptGameLevels(untouchedLevels))
                  .then((adaptedLevels) => {
                    gameLevels = adaptedLevels;
                  })
                  .then(() => startImagesLoading(gameLevels))
                  .then((loadedImages) => saveImagesNaturalSizes(loadedImages, gameLevels))
                  .then(() => {
                    fadeOutElement(WORKSPACE);

                    const uselessPreloader = WORKSPACE.querySelector(`.preloader`);
                    setTimeout(() => uselessPreloader.remove(), FADE_ANIMATION_TIME);
                  })
                  .then(() => {
                    setTimeout(() => {
                      fadeInElement(WORKSPACE);
                      Application.renderGreeting();
                    }, FADE_ANIMATION_TIME);
                  })
                  .catch(Application.renderErrorModal);

    }

    /**
     * Создание и отрисовка приветственного экрана.
     *
     * @static
     * @method renderGreeting
     */
    static renderGreeting() {
      const greeting = new GreetingPresenter();

      // На момент вставки контента — рабочая область не пуста.
      // Очистка рабочей области от всего, кроме статичного Footer.
      // Вставка контента перед Footer.
      cleanUpWorkspace(WORKSPACE, true);
      WORKSPACE.prepend(greeting.screen);
    }

    /**
     * Создание и отрисовка экрана с правилами игры.
     *
     * @static
     * @method renderRules
     */
    static renderRules() {
      const rules = new RulesPresenter();

      // На момент вставки контента — рабочая область не пуста.
      // Прямая замена отработанной части на актуальный контент.
      WORKSPACE.firstChild.replaceWith(rules.screen);
    }

    /**
     * Создание и отрисовка игрового экрана.
     *
     * @static
     * @method renderLevel
     * @param {object} player — профиль игрока (ответы, жизни, etc)
     */
    static renderLevel(player) {
      const level = new LevelPresenter(player, gameLevels);
      level.startCountdown();

      // На момент вставки контента — рабочая область не пуста.
      // Очистка рабочей области от всего, кроме статичного Footer.
      // Вставка контента перед Footer.
      cleanUpWorkspace(WORKSPACE, true);
      WORKSPACE.prepend(level.screen);
    }

    /**
     * Создание и отрисовка экрана статистики.
     *
     * @static
     * @method renderStatistic
     * @param {object} player — профиль игрока (ответы, жизни, etc)
     */
    static renderStatistic(player) {
      // Создание и отрисовка preloader.
      const preloader = new PreloaderView();
      cleanUpWorkspace(WORKSPACE);
      WORKSPACE.append(preloader.view);

      // Получение детальной статистики текущей игры.
      const playerName = player.name;
      const gameResult = getGameResult(player);

      ServerLoader.uploadGameResult(gameResult)
                                    .then(() => ServerLoader.downloadGameRecords(playerName))
                                    .then((gameRecords) => {
                                      const statistic = new StatisticPresenter(gameRecords.reverse());
                                      WORKSPACE.prepend(statistic.screen);

                                      const uselessPreloader = WORKSPACE.querySelector(`.preloader`);
                                      fadeOutElement(uselessPreloader);
                                      setTimeout(() => uselessPreloader.remove(), FADE_ANIMATION_TIME);
                                    })
                                    .catch(Application.renderErrorModal);
    }

    /**
     * Создание и отрисовка модального окна с ошибкой.
     *
     * @static
     * @method renderErrorModal
     * @param {object} errorData — данные произошедшей ошибки
     */
    static renderErrorModal(errorData) {
      const errorModal = new ErrorModalView(errorData);

      // Если на странице отрисован схожий по стилизации preloader — он удаляется.
      // Далеее отрисовывается модальное окно ошибки.
      const uselessPreloader = WORKSPACE.querySelector(`.preloader`);
      if (uselessPreloader) {
        uselessPreloader.remove();
      }
      document.body.append(errorModal.view);
    }

    /**
     * Создание и отрисовка модального окна с подтверждением сброса игры.
     *
     * @static
     * @method renderConfirmModal
     */
    static renderConfirmModal() {
      const renderedConfirmModal = document.querySelector(`.modal-confirm`);
      if (!renderedConfirmModal) {
        const confirmModal = new ConfirmModalView();
        document.body.append(confirmModal.view);
      }
    }
  }

  // Инициализация игры.
  Application.start();

}());

//# sourceMappingURL=main.js.map
