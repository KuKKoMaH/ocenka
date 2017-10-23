import { setParam, getParam } from '../../js/history';
import { getCertificates } from '../../js/api';
import renderPagination from '../pagination/pagination';

const $table = $('#registry-table');
const $rows = $table.find('.table__rows');
const $pagination = $('.pagination');

if ($table.length) {

  const template = $('.table__template').html();
  const renderRow = (data, i, offset) => template.replace(/{{(.*?)}}/g, (placeholder, field) => field === 'i' ? i + offset + 1 : data[field]);
  const setSearch = $.debounce(value => {
    setParam('query', value);
    setParam('offset', 0);
  }, 1000);

  const loadItems = (search, page) => getCertificates(search, ITEMS_PER_PAGE, page).done((items) => {
    $rows.html('');
    $pagination.html('');
    $pagination.append(renderPagination({
      total:       items.totalElements,
      itemPerPage: ITEMS_PER_PAGE,
      currentPage: page,
      onClick:     (nextPage) => {
        loadItems(search, nextPage);
        setParam('offset', nextPage);
      }
    }));

    items.content.forEach((item, i) => $rows.append(renderRow(item, i, ITEMS_PER_PAGE * page)));
  });

  loadItems(getParam('query') || '', +getParam('offset') || 0);

  $('#registry-search').on('input', e => {
    const value = e.target.value;
    loadItems(value, 0);
    setSearch(value);
  }).val(getParam('query'));
}