var gulp = require('gulp');

gulp.task('watch', [
  'css:watch',
  'html:watch',
  'js:watch',
  // 'copy:watch'
]);