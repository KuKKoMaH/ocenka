import fetch from './fetch';
import Auth from './Auth';

const doRequest = (params) => {
  return fetch(params).catch((err) => {
    const skipCheckExpired = params.options && params.options.skipCheckExpired;
    if (!skipCheckExpired && err.responseJSON.message === 'Token expired') {
      return Auth.showLoginPopup().then(
        () => fetch({ ...params, options: { token: Auth.token } }),
        () => (window.location = '.')
      );
    }
    throw(err);
  })
};

export const login = (phone) => {
  return doRequest({ method: 'POST', url: 'customer/findOrCreate', data: { phone } });
};

export const sendCode = (id, phone) => {
  return doRequest({ method: 'GET', url: 'customer/resetPassword', data: { id, phone } });
};

export const confirm = (id, code) => {
  return doRequest({ method: 'GET', url: 'customer/checkcode', data: { id, code } });
};

export const getProfile = (token, skipCheckExpired) => {
  return doRequest({ method: 'GET', url: 'customer/profile', options: { token, skipCheckExpired } });
};

export const getOrder = (orderId, token) => {
  return doRequest({ method: 'GET', url: `order/${orderId}`, options: { token } });
};

export const getDraft = (orderId, token) => {
  return doRequest({ method: 'GET', url: `order/draft/${orderId}`, options: { token } });
};

export const deleteFile = (filePath, token) => {
  return doRequest({ method: 'DELETE', url: `order/file/${filePath}`, options: { token } });
};

export const getOrderList = (token) => {
  return doRequest({ method: 'GET', url: `order/list`, options: { token } });
};

export const getOrdersStat = (token) => {
  return doRequest({ method: 'GET', url: `order/stat`, options: { token } });
};

export const createOrder = (draftId, token) => {
  return doRequest({ method: 'POST', url: `order/${draftId}`, options: { token } });
};

export const createDraft = (data, token) => {
  return doRequest({ method: 'POST', url: 'order/draft', data: { ...data }, options: { token } });
};

export const updateDraft = (data, token) => {
  return doRequest({ method: 'PUT', url: `order/draft/${data.id}`, data: { ...data }, options: { token } });
};

export const changePayStatus = (draftId, data, token) => {
  return doRequest({ method: 'PUT', url: `order/${draftId}/changePayStatus`, data: { ...data }, options: { token } })
};

export const payWithInvoice = (draftId, token) => {
  return doRequest({ method: 'PUT', url: `order/${draftId}/payByInvoice`, options: { token } })
};

export const updateOrder = (data, token) => {
  return doRequest({ method: 'POST', url: `order/${data.id}/appendDetails`, data, options: { token } });
};

export const payBonusOrder = (id, token) => {
  return doRequest({ method: 'POST', url: `order/${id}/payWithBonus`, options: { token } });
};

export const payOrder = (id, returnUrl, failUrl, token) => {
  return doRequest({
    method:  'GET',
    url:     `order/${id}/payWithCard`,
    data:    { returnUrl, failUrl },
    options: { token }
  });
};

export const confirmPayment = (id, operation, reference, status, token) => {
  return doRequest({
    method:  'GET',
    url:     `order/updatePayStatus`,
    data:    { id, operation, reference, status },
    options: { token }
  });
};

export const confirmOrder = (data, token) => {
  return doRequest({ method: 'POST', url: `order/updateListDetailsAndSendOrderToSRG`, data, options: { token } });
};

export const cancelOrder = (orderId, token) => {
  return doRequest({ method: 'POST', url: `order/${orderId}/cancel`, options: { token } });
};

export const getCertificates = (address, size, page) => {
  return doRequest({ method: 'GET', url: 'certificate/list', data: { address, size, page } });
};

export const getCompaniesList = (address, bankId) => {
  return doRequest({ method: 'GET', url: 'order/select/appraisalCompany', data: { ...address, bankId } });
};

export const getBanksList = () => {
  return doRequest({ method: 'GET', url: 'order/select/bank' }).then(banks => Object.keys(banks).map((bankId) => ({
    id:   bankId,
    name: banks[bankId],
  })));
};

export const getOrderInvoice = (orderId, token) => new Promise((resolve) => {
  const request = new XMLHttpRequest();
  request.open("GET", API_URL + `order/${orderId}/invoice/png`, true);
  request.responseType = "blob";
  request.setRequestHeader('token', token);

  request.onload = () => resolve(request);

  request.send();

});
// return doRequest({ method: 'GET', url: `order/${orderId}/invoice/png`, options: { token } });

export const getTypes = (token) => {
  return doRequest({ method: 'GET', url: `order/select/type`, options: { token } }).then(types => {
    return Object.keys(types).map((typeId) => ({
      id:   typeId,
      name: types[typeId],
    }));
  });
  {}
};

export const getReport = (orderId, token, onProgress, onDone) => {
  const request = new XMLHttpRequest();
  request.open("GET", API_URL + `order/${orderId}/report`, true);
  request.responseType = "arraybuffer";
  request.setRequestHeader('token', token);

  request.onprogress = onProgress;
  request.onload = () => onDone(request);

  request.send();
  // return doRequest({ method: 'GET', url: `order/${orderId}/report`, options: { token, file: true } });
};

export const changeCompany = (orderId, token) => {
  return doRequest({ method: 'GET', url: `order/${orderId}/changeAc`, options: { token } });
};
