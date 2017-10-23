module.exports = function ( a, b )  {
  const minWidthRegexp = /\(min-width:(.*?)px\)/;
  const maxWidthRegexp = /\(max-width:(.*?)px\)/;

  const findMinA = minWidthRegexp.exec(a);
  const findMinB = minWidthRegexp.exec(b);
  // Сортировка по увелиичению min-width. Правила без min-width всегда нииже
  if (findMinA && !findMinB) return -1;
  if (findMinB && !findMinA) return 1;
  if (findMinA && findMinB && +findMinA[1] !== +findMinB[1] ) return +findMinA[1] > +findMinB[1] ? 1 : -1;

  const findMaxA = maxWidthRegexp.exec(a);
  const findMaxB = maxWidthRegexp.exec(b);
  // сортировка по убыванию max-width. Правила без max-width всегда выше.
  if (findMaxA && !findMaxB) return 1;
  if (findMaxB && !findMaxA) return -1;
  if (findMaxA && findMaxB && +findMaxA[1] !== +findMaxB[1] ) return +findMaxA[1] > +findMaxB[1] ? -1 : 1;
  // если не удалось сравнить min-width и max-width - не трогать
  return 0;
};
