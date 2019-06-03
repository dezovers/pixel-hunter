import {LevelType} from './constant.js';

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

export default adaptGameLevels;
