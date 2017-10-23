var gulp = require('gulp');
var pug = require('gulp-pug');
var posthtml = require('gulp-posthtml');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');

var saveAssets = require('../assets/saveAssets');

gulp.task('html', function () {
  return gulp.src('src/[^_]*.pug')
    .pipe(plumber({ errorHandler: require('../assets/errorHandler') }))
    .pipe(pug({ pretty: true }))
    .pipe(posthtml([
      function copyAssets(tree) {
        const promises = [];
        tree.match({ tag: /\w+/ }, function (node) {
          if (node.attrs) {
            for (var name in node.attrs) {
              var value = node.attrs[name];
              var savePromise = saveAssets(name, value);
              savePromise.then(function (newValue) {node.attrs[name] = newValue;});
              promises.push(savePromise);
            }
          }
          return node;
        });
        return Promise.all(promises).then(function () {return tree;});
      }
    ]))
    .pipe(gulp.dest('build/'));
});

gulp.task('html:watch', function () {
  watch('src/**/*.pug', function () {
    gulp.run('html');
  });
});
