import {LevelType, levelTypeToFormClass} from '../constant.js';
import GenericView from '../generic-view.js';
import getLevelImagesMarkup from './get-level-images-markup.js';
import getProgressbarMarkup from '../shared/get-progressbar-markup.js';
import {resizeImage} from '../utils.js';

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

export default LevelContentView;
