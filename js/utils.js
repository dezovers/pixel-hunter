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

export {
  cleanUpWorkspace,
  copyDeep,
  fadeOutElement,
  fadeInElement,
  startImagesLoading,
  saveImagesNaturalSizes,
  resizeImage
};
