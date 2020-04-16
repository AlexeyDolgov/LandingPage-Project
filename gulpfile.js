var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var pug = require('gulp-pug');
var sass = require('gulp-sass');
var spritesmith = require('gulp.spritesmith');
var rimraf = require('rimraf');
var rename = require('gulp-rename');
var cleancss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

/* -------- Initialize server --------- */
gulp.task('server', function() {
  browserSync.init({
    server: {
      port: 9000,
      baseDir: "build"
    }
  });

  gulp.watch("build/**/*").on('change', browserSync.reload);
});

/* -------- Templates compile --------- */
gulp.task('templates:compile', function buildHTML() {
  return gulp.src('source/templates/index.pug')
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest('build'))
});

/* -------- Styles compile --------- */
gulp.task('styles:compile', function () {
  return gulp.src('source/styles/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename({ suffix: '.min', prefix : '' }))
    .pipe(autoprefixer(['last 15 versions']))
    .pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/css'));
});

/* -------- Scripts compile --------- */
gulp.task('scripts:compile', function() {
  return gulp.src('source/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/js'));
});

/* -------- Sprites build --------- */
gulp.task('sprites:build', function(cb) {
  var spriteData = gulp.src('source/images/icons/*.png')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      imgPath: '../images/sprite.png',
      cssName: 'sprite.scss'
    }));
  
  spriteData.img.pipe(gulp.dest('build/images/'));
  spriteData.css.pipe(gulp.dest('source/styles/global/'));
  cb();
});
  
/* -------- Clean build folder --------- */
gulp.task('clean', function del(cb) {
  return rimraf('build', cb);
});
  
/* -------- Copy fonts --------- */
gulp.task('copy:fonts', function() {
  return gulp.src('./source/fonts/**/*.*')
    .pipe(gulp.dest('build/fonts'));
});
  
/* -------- Copy images --------- */
gulp.task('copy:images', function() {
  return gulp.src('./source/images/**/*.*')
    .pipe(gulp.dest('build/images'));
});
  
/* -------- Copy files --------- */
gulp.task('copy', gulp.parallel('copy:fonts', 'copy:images'));

/* -------- Initialize Watchers --------- */
gulp.task('watch', function() {
  gulp.watch('source/templates/**/*.pug', gulp.series('templates:compile'));
  gulp.watch('source/styles/**/*.scss', gulp.series('styles:compile'));
  gulp.watch('source/js/**/*.js', gulp.series('scripts:compile'));
});
  
/* -------- Initialize Gulp on Default --------- */
gulp.task('default', gulp.series(
  'clean',
  gulp.parallel('templates:compile', 'styles:compile', 'scripts:compile', 'sprites:build', 'copy'),
  gulp.parallel('watch', 'server')
));