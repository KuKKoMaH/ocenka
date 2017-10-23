var gulp   = require('gulp');
var config = require('../config.js');

gulp.task('copy:img', function() {
  return gulp
    .src('src/**/*.{jpg,png,jpeg,svg,gif}')
    .pipe(gulp.dest('build/img'));
});

gulp.task('copy:fonts', function() {
  return gulp
    .src(config.src.fonts + '/*.{ttf,eot,woff,woff2}')
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('copy', [
  'copy:img',
  'copy:fonts'
]);
gulp.task('copy:watch', function() {
  gulp.watch('src/**/*.{jpg,png,jpeg,svg,gif}', ['copy']);
});