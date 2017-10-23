import { getOrderList } from '../../js/api';
import Auth from '../../js/Auth';

const $logout = $('.profile__logout');
const $table = $('#profile-table');
const $rows = $table.find('.table__rows');
const $pagination = $('.pagination');

$logout.on('click', (e) => {
  Auth.logout();
});

const l10nStatus = {
  CREATION:   'Создан',
  // DRAFT:              'Черновик',
  // VERIFICATION:       'Ожидает проверки документов',
  // WAIT_CUSTOMER_DATA: 'Ожидает исправления документов покупателем',
  INSPECTION: 'Назначен осмотр',
  // EXPERT_IN_PROGRESS: 'Осмотр проведен',
  DONE:       'Выполнен',
};
const statuses = Object.keys(l10nStatus);

const l10nTypes = {
  TECHNICAL_DOCUMENT: 'Технические документы',
  LEGAL_DOCUMENT:     'Правоустанавливающие документы'
};
const types = Object.keys(l10nTypes);

if ($table.length) {
  Auth.getProfile().then(
    (profile) => {
      $('.profile__name').html(`${profile.surname} ${profile.name}`);
      $('.profile__bonus').html(profile.bonus);
    },
    () => (window.location = $logout.attr('href'))
  );

  const template = $('.table__template').html();
  const $summary = $('.profile__stats tbody');
  const renderSummary = (status, count) => $(`<tr><td>${status}</td><td class="profile__count">${count}</td></tr>`);
  const renderRow = (data) => template.replace(/{{(.*?)}}/g, (placeholder, field) => data[field]);

  const summary = statuses.reduce((obj, key) => {
    obj[key] = 0;
    return obj;
  }, {});

  getOrderList(Auth.token).done((items) => {
    $rows.html('');
    $pagination.html('');
    items
      .map((item, i) => ({
        index:     i + 1,
        address:   `${item.address} кв. ${item.flat}`,
        status:    l10nStatus[item.status] || '',
        paid:      item.paid ? ' Оплачено' : 'Не оплачено',
        documents: generateDocuments(item.attachedFileList)
      }))
      .forEach((item, i) => $rows.append(renderRow(item)));

    items.forEach(item => summary[item.status]++);
    statuses.forEach((status) => $summary.append(renderSummary(l10nStatus[status], summary[status])))
  });

  function generateDocuments (fileList) {
    if (!Array.isArray(fileList)) return '';
    const docs = {};
    let result = '';

    fileList.forEach((file) => {
      const {fileType, originalFilename} = file;
      if(!docs[fileType]) docs[fileType] = [];
      docs[fileType].push(originalFilename);
    });

    types.forEach((type) => {
      if(!docs[type]) return;
      result += type + '<br>';
      docs[type].forEach(filename => result += filename + '<br>');
    })
    return result;
  }
}
