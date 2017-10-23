var gulp = require('gulp');
var webpack = require('webpack');
var notify = require('gulp-notify');

var server = require('./server');
var config = require('../config');
var webpackConfig = require('../assets/webpack.config').createConfig;

function handler(err, stats, cb) {
  var errors = stats.compilation.errors;

  if (err) throw new gutil.PluginError('webpack', err);

  if (errors.length > 0) {
    notify.onError({
      title:   'Webpack Error',
      message: '<%= error.message %>',
      sound:   'Submarine'
    }).call(null, errors[0]);
  }

  server.reload();
  if (typeof cb === 'function') cb();
}

gulp.task('js', function (cb) {
  webpack(webpackConfig(config.env)).run(function (err, stats) {
    handler(err, stats, cb);
  });
});

gulp.task('js:watch', function () {
  webpack(webpackConfig(config.env)).watch({
    aggregateTimeout: 100,
    poll:             false
  }, handler);
});