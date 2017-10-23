var gulp = require('gulp');
var del = require('del');
var util = require('gulp-util');

gulp.task('clean', function (cb) {
  return del([
    'build'
  ]).then(function (paths) {
    util.log('Deleted:', util.colors.magenta(paths.join('\n')));
  });
});