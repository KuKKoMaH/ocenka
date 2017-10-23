const path = require('path');
const fs = require('fs');

/**
 * Копирует файл из исходников в директорию сборки и возвращает промис с новым путем, если файл был скопирован, или
 * src если такого файла не существует
 * @param {String} src - путь до файла, относительно config.basePath
 * @return {Promise<String>}
 */
function saveAsset(src) {
  if (
    src.indexOf('http') === 0 || // пропустить все внешние изображения
    src.indexOf('data:') === 0 ||
    src.indexOf('#') === 0 ||
    src.indexOf('.') === -1 // если в атрибуте файл - то в пути должна быть точка
  ) return Promise.resolve(src);

  var srcPath = path.resolve('src', src);

  return new Promise(function (res) {
    fs.stat(srcPath, function (err, stats) {
      if (err || !stats.isFile()) return res(src);

      var name = src.replace(new RegExp(path.sep, 'g'), '-');
      var destPath = path.resolve('build/img', name);
      var destUrl = path.relative('build', destPath);
      var rd = fs.createReadStream(srcPath);
      var wr = fs.createWriteStream(destPath);
      wr.on('close', function () {res(destUrl);});
      rd.pipe(wr);
    });
  });
};

/**
 * Ищет в value ссылки на файлы и сохраняет их
 * @param {String} name - имя параметра
 * @param {String} value - значение параметра
 * @return {Promise<String>} - новое значение параметра
 */
module.exports = function (name, value) {
  if (name === 'style' && value.indexOf('url(') !== -1) {
    var urlRegex = /url\((.*?)\)/g;
    var promises = [];
    var urls = value.match(urlRegex);
    urls.map(function (url) {
      const normalUrl = url.replace(/["']/g, '').trim().slice(4, -1).trim(); // обрезаем все лишнее из урла
      const savePromise = saveAsset(normalUrl);
      promises.push(savePromise);
    });
    return Promise.all(promises).then(function (urls) {
      var i = 0;
      return value.replace(urlRegex, function () { return 'url(' + urls[i++] + ')';});
    });
  } else {
    return saveAsset(value);
  }
};