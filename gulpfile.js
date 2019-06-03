const gulp = require(`gulp`);
const sass = require(`gulp-sass`);
const plumber = require(`gulp-plumber`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const csso = require(`gulp-csso`);
const rename = require(`gulp-rename`);
const del = require(`del`);
const sourcemaps = require(`gulp-sourcemaps`);
const rollup = require(`gulp-better-rollup`);
const rollupPluginCommonJS = require(`rollup-plugin-commonjs`);
const mocha = require(`gulp-mocha`);
const browsersync = require(`browser-sync`).create();

//  /////////////////////////////////////////////////////////////////////////////////
//
//  ОБРАБОТКА HTML: копирование, обновление etc.
//
//  /////////////////////////////////////////////////////////////////////////////////

const streamHTMLtoBuild = () => {
  return gulp.src(`*.html`)
             .pipe(gulp.dest(`build`))
             .pipe(browsersync.stream());
};

const updateBuildHTML = (done) => {
  streamHTMLtoBuild();

  browsersync.reload();
  done();
};

//  /////////////////////////////////////////////////////////////////////////////////
//
//  ОБРАБОТКА CSS: компиляция SASS, вендорные префиксы, оптимизация, обновление.
//
//  /////////////////////////////////////////////////////////////////////////////////

const streamStylesToBuild = () => {
  return gulp.src(`sass/style.scss`)
             .pipe(plumber())
             .pipe(sass({
               indentType: `space`,
               indentWidth: `2`,
               outputStyle: `expanded`
             }))
             .pipe(postcss([
               autoprefixer({
                 browsers: [
                   `last 1 version`,
                   `last 2 Chrome versions`,
                   `last 2 Firefox versions`,
                   `last 2 Opera versions`,
                   `last 2 Edge versions`
                 ]})
             ]))
             .pipe(gulp.dest(`build/css`))
             .pipe(csso({comments: false}))
             .pipe(rename({suffix: `.min`}))
             .pipe(gulp.dest(`build/css`))
             .pipe(browsersync.stream());
};

const updateBuildStyles = (done) => {
  del(`build/css`);
  streamStylesToBuild();

  browsersync.reload();
  done();
};

//  /////////////////////////////////////////////////////////////////////////////////
//
//  ОБРАБОТКА JAVASCRIPT:
//
//  /////////////////////////////////////////////////////////////////////////////////

const streamJStoBuild = () => {
  return gulp.src(`js/main.js`)
             .pipe(plumber())
             .pipe(sourcemaps.init())
             .pipe(rollup({}, `iife`))
             .pipe(sourcemaps.write(``))
             .pipe(gulp.dest(`build/js`))
             .pipe(browsersync.stream());
};

const updateBuildJS = (done) => {
  del(`build/js`);
  streamJStoBuild();

  browsersync.reload();
  done();
};

//  /////////////////////////////////////////////////////////////////////////////////
//
//  СБОРКА ПРОЕКТА.
//
//  /////////////////////////////////////////////////////////////////////////////////

const cleanBuild = () => del(`build`);

const streamBuildBasics = () => {
  return gulp.src([
    `fonts/**/*.{woff,woff2}`,
    `img/**`,
    `*.ico`,
    `*.png`,
    `*.svg`
  ], {
    base: `.`
  })
  .pipe(gulp.dest(`build`));
};

gulp.task(`build`, gulp.series(
    cleanBuild,

    streamBuildBasics,
    streamHTMLtoBuild,
    streamStylesToBuild,
    streamJStoBuild
));

//  /////////////////////////////////////////////////////////////////////////////////
//
//  LIVE-СЕРВЕР И ОБНОВЛЕНИЕ ДАННЫХ.
//
//  /////////////////////////////////////////////////////////////////////////////////

gulp.task(`browsersync`, () => {
  browsersync.init({
    server: `build/`,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch(`*.html`, updateBuildHTML);
  gulp.watch(`sass/**/*.{scss,sass}`, updateBuildStyles);
  gulp.watch(`js/*.js`, updateBuildJS);
});

//  /////////////////////////////////////////////////////////////////////////////////
//
//  НАСТРОЙКА ТЕСТИРОВАНИЯ.
//
//  /////////////////////////////////////////////////////////////////////////////////

gulp.task(`test`, () => {
  return gulp.src([`js/**/*.test.js`])
             .pipe(rollup({plugins: [rollupPluginCommonJS()]}, `cjs`))
             .pipe(gulp.dest(`build/test`))
             .pipe(mocha({
               reporter: `spec`
             }));
});
