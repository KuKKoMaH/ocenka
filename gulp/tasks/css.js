var gulp = require('gulp');
var path = require('path');
var decl = require('postcss').decl;
var sourcemaps = require('gulp-sourcemaps');
var stylus = require('gulp-stylus');
var postcss = require('gulp-postcss');
var mqpacker = require('css-mqpacker');
var cssnano = require('cssnano');
var cssnext = require('postcss-cssnext');
var gulpif = require('gulp-if');
var sprites = require('postcss-sprites');
var updateRule = require('postcss-sprites/lib/core').updateRule;
var copy = require('postcss-copy');
var watch = require('gulp-watch');
var atImport = require('postcss-import');

var config = require('../config');

var extensions = {
  images: ['.jpg', '.jpeg', '.gif', '.png', '.svg'],
  fonts:  ['.eot', '.woff', '.woff2']
};

// stylus.stylus.define('url', stylus.stylus.url({ paths: [__dirname + '/public'] }))

gulp.task('css', function () {
  var plugins = [
    atImport(),
    sprites({
      stylesheetPath: 'build',
      spritePath:     'build/img',
      filterBy:       function (info) {
        return new Promise(function (resolve, reject) {
          if (info.url.indexOf(path.sep + 'sprite-') !== -1) {
            resolve(info.path);
          } else {
            reject();
          }
        });
      },
      hooks:          {
        onUpdateRule: function (rule, token, image) {
          // Use built-in logic for background-image & background-position
          updateRule(rule, token, image);

          ['width', 'height'].forEach(function (prop) {
            rule.insertAfter(rule.last, decl({
              prop:  prop,
              value: image.coords[prop] + 'px'
            }));
          });
        }
      }
    }),
    copy({
      src:      'src',
      dest:     'build',
      template: 'img/[name].[ext][query]',
      ignore:   'img/sprite.svg',
    })
  ];

  if (config.production) {
    plugins = plugins.concat([
      cssnext({ browsers: ['last 10 versions', 'IE > 8'] }),
      mqpacker({ sort: require('../assets/sortMediaQueries') }),
      cssnano()
    ]);
  }

  return gulp
    .src('src/*.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus({ define: { url: stylus.stylus.resolver() } }))
    .on('error', require('../assets/errorHandler'))
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'));
});

gulp.task('css:watch', function () {
  watch('src/**/*.styl', function () {
    gulp.run('css');
  });
});