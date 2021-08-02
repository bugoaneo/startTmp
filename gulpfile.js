const gulp = require('gulp');
const gulpPlumber = require('gulp-plumber');
const gulpSass = require('gulp-sass');
const gulpApfr = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const replace = require('gulp-replace');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();

let isBuild = false

function sass2css() {
  return gulp.src('sass/main.scss')
    .pipe(gulpPlumber())
    .pipe(gulpSass())
    .pipe(gulpApfr())
    .pipe(cleanCSS({
      level: 2,
      format: 'beautify'
    }))

    .pipe(gulpPlumber.stop())
    .pipe(browserSync.stream())

    .pipe(gulp.dest('css'));
}

function imageMin() {
  return gulp.src("img/dist/**/*.{jpg,png,svg}", "!img/dist/sprite/**/*")
    .pipe(gulpIf(isBuild, imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: false },
          { cleanupIDs: false },
          { removeDimensions: true },
          { convertStyleToAttrs: true }
        ]
      })
    ]))
    )
    .pipe(gulp.dest('img'))
}

function svgSpriteBuild() {
  return gulp.src("img/sprite/*.svg")
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "sprite.svg",
        }
      }
    }))
    .pipe(gulp.dest("img"));
};

function buildMode(redyMode) {
  return cb => {
    isBuild = redyMode;
    cb()
  }
}


function watch() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  gulp.watch("sass/**/*.scss", sass2css);
  gulp.watch("css/*.css").on('change', browserSync.reload);
  gulp.watch("[img/dist/*.{jpg,png,svg}, !img/sprite/**/*]", imageMin);
  gulp.watch("img/sprite/**/*.svg", svgSpriteBuild);
  gulp.watch("*.html").on('change', browserSync.reload);
}

const dev = gulp.parallel(sass2css, imageMin, svgSpriteBuild)

exports.default = gulp.series(dev, watch);
exports.build = gulp.series(buildMode(true), dev);
