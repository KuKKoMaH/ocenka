const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

gulp.task('images', () =>
  gulp.src('build/img/*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imageminMozjpeg({ quality: 90 }),
      imageminPngquant({ quality: '65-80' }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          // { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ], { verbose: true }))
    .pipe(gulp.dest('build/img/'))
);