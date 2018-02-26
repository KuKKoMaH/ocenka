import fetch from './fetch';

export const login = (phone) => {
  return fetch({ method: 'POST', url: 'customer/findOrCreate', data: { phone } });
};

export const sendCode = (id, phone) => {
  return fetch({ method: 'GET', url: 'customer/resetPassword', data: { id, phone } });
};

export const confirm = (id, code) => {
  return fetch({ method: 'GET', url: 'customer/checkcode', data: { id, code } });
};

export const getProfile = (token) => {
  return fetch({ method: 'GET', url: 'customer/profile', options: { token } });
};

export const getOrder = (orderId, token) => {
  return fetch({ method: 'GET', url: `order/${orderId}`, options: { token } });
};

export const getDraft = (orderId, token) => {
  return fetch({ method: 'GET', url: `order/draft/${orderId}`, options: { token } });
};

export const deleteFile = (filePath, token) => {
  return fetch({ method: 'DELETE', url: `order/file/${filePath}`, options: { token } });
};

export const getOrderList = (token) => {
  return fetch({ method: 'GET', url: `order/list`, options: { token } });
};

export const getOrdersStat = (token) => {
  return fetch({ method: 'GET', url: `order/stat`, options: { token } });
};

export const createOrder = (draftId, token) => {
  return fetch({ method: 'POST', url: `order/${draftId}`, options: { token } });
};

export const createDraft = (data, token) => {
  return fetch({ method: 'POST', url: 'order/draft', data: { ...data }, options: { token } });
};

export const updateDraft = (data, token) => {
  return fetch({ method: 'PUT', url: `order/draft/${data.id}`, data: { ...data }, options: { token } });
};

export const changePayStatus = (draftId, data, token) => {
  return fetch({ method: 'PUT', url: `order/${draftId}/changePayStatus`, data: { ...data }, options: { token } })
};

export const payWithInvoice = (draftId, token) => {
  return fetch({ method: 'PUT', url: `order/${draftId}/payByInvoice`, options: { token } })
};

export const updateOrder = (data, token) => {
  return fetch({ method: 'POST', url: `order/${data.id}/appendDetails`, data, options: { token } });
};

export const payBonusOrder = (id, token) => {
  return fetch({ method: 'POST', url: `order/${id}/payWithBonus`, options: { token } });
};

export const payOrder = (id, returnUrl, failUrl, token) => {
  return fetch({
    method:  'GET',
    url:     `order/${id}/payWithCard`,
    data:    { returnUrl, failUrl },
    options: { token }
  });
};

export const confirmPayment = (id, operation, reference, status, token) => {
  return fetch({
    method:  'GET',
    url:     `order/updatePayStatus`,
    data:    { id, operation, reference, status },
    options: { token }
  });
};

export const confirmOrder = (data, token) => {
  return fetch({ method: 'POST', url: `order/updateListDetailsAndSendOrderToSRG`, data, options: { token } });
};

export const cancelOrder = (orderId, token) => {
  return fetch({ method: 'POST', url: `order/${orderId}/cancel`, options: { token } });
};

export const getCertificates = (address, size, page) => {
  return fetch({ method: 'GET', url: 'certificate/list', data: { address, size, page } });
};

export const getCompaniesList = (address, bankId) => {
  return fetch({ method: 'GET', url: 'order/select/appraisalCompany', data: { ...address, bankId } });
};

export const getBanksList = () => {
  return fetch({ method: 'GET', url: 'order/select/bank' }).then(banks => Object.keys(banks).map((bankId) => ({
    id:   bankId,
    name: banks[bankId],
  })));
};

export const getOrderInvoice = (orderId, token) => {
  return fetch({ method: 'GET', url: `order/${orderId}/invoice`, options: { token } });
};

export const getTypes = (token) => {
  return fetch({ method: 'GET', url: `order/select/type`, options: { token } }).then(types => {
    return Object.keys(types).map((typeId) => ({
      id:   typeId,
      name: types[typeId],
    }));
  });
};

export const getReport = (orderId, token) => {
  return fetch({ method: 'GET', url: `order/${orderId}/report`, options: { token } });
};
