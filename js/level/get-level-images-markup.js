import {LevelType, ZERO_INDEX_SHIFT} from '../constant.js';

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

export default getLevelImagesMarkup;
