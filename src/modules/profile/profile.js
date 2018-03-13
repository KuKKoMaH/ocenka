import * as API from "../../js/api";
import Auth from '../../js/Auth';
import dateFormatter from "../../js/dateFormatter";

const $logout = $('.profile__logout');
const $table = $('#profile-table');
const $rows = $table.find('.profile-table__body');
const $pagination = $('.pagination');

$logout.on('click', (e) => {
  Auth.logout();
});

const l10nTimeBlock = {
  FROM_9_TO_12:  "с 9 до 12",
  FROM_12_TO_16: "с 12 до 16",
  FROM_16_TO_19: "с 16 до 19",
};

const l10nTypes = {
  TECHNICAL_DOCUMENT: 'Технические документы',
  LEGAL_DOCUMENT:     'Правоустанавливающие документы'
};
const types = Object.keys(l10nTypes);

if ($table.length) {
  Auth.getProfile()
    .then(process)
    .catch(() => {
      Auth.showLoginPopup().then(
        () => Auth.getProfile().then(process),
        () => (window.location = '.')
      );
    });

  function process(profile) {
    $('.profile__name').html(`${profile.surname || ''} ${profile.name || ''}`);
    loadOrders();
  }

  function loadOrders() {
    const template = $('.profile-table__template').html();
    const $summary = $('.profile__stats');
    const renderSummary = (status, count) => $(`
      <div class="profile__stat-row">
        <span class="profile__stat">${status}</span>
        <span class="profile__count">${count}</span>
      </div>
    `);
    const renderRow = (data) => template.replace(/{{(.*?)}}/g, (placeholder, field) => data[field]);

    API.getOrdersStat(Auth.token).then(stat => {
      $summary.html('');
      for (let i in stat) $summary.append(renderSummary(i, stat[i]));
    });

    API.getOrderList(Auth.token).done((items) => {
      $rows.html('');
      $pagination.html('');
      items
        .map((item, i) => ({
          id:               item.id,
          index:            item.id,
          date:             '',
          // show:             `${dateFormatter(item.realInspectionDateTime || item.inspectionDate)} ${l10nTimeBlock[item.timeBlock] || ''}`,
          show:             item.realInspectionDateTime || item.inspectionTime,
          address:          `${item.address} кв. ${item.flat}`,
          status:           item.status,
          paid:             item.paid,
          documents:        generateDocuments(item.attachedFileList),
          bank:             item.bankName || '',
          comment:          item.comment || '',
          appraisalCompany: item.appraisalCompanyName || '',
        }))
        .forEach((item, i) => {
          const $row = $(renderRow(item));
          $rows.append($row);
        });
    });
  }

  function generateDocuments(fileList) {
    if (!Array.isArray(fileList)) return '';
    const docs = {};
    let result = '';

    fileList.forEach((file) => {
      const { fileType, originalFilename } = file;
      if (!docs[fileType]) docs[fileType] = [];
      docs[fileType].push(originalFilename);
    });

    types.forEach((type) => {
      if (!docs[type]) return;
      result += `<b>${l10nTypes[type]}:</b><br>`;
      docs[type].forEach(filename => result += filename + '<br>');
    });

    return result;
  }

}
