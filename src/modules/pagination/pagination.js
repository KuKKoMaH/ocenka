const prevTemplate = (isActive) => `<a class="pagination__prev${isActive ? ' pagination__visible' : ''}">Пред.</a>`;
const nextTemplate = (isActive) => `<a class="pagination__next${isActive ? ' pagination__visible' : ''}">След.</a>`;
const pageTemplate = (i, isActive) => `<a class="pagination__page${isActive ? ' pagination__page--active' : ''}">${i}</a>`;

export default ({ total, itemPerPage, currentPage, onClick }) => {
  const totalPages = Math.ceil(total / itemPerPage);
  const result = [];

  result.push($(prevTemplate(currentPage > 0)).on('click', () => onClick(currentPage - 1)));
  for (let i = 0; i < totalPages; i++) {
    result.push($(pageTemplate(i + 1, i === currentPage)).on('click', () => onClick(i)));
  }
  result.push($(nextTemplate(currentPage < totalPages - 1)).on('click', () => onClick(currentPage + 1)));
  return result;
};
