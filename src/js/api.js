import fetch from './fetch';

export const login = (phone) => {
  return fetch({ method: 'POST', url: 'customer/findOrCreate', data: { phone } });
};

export const sendCode = (id, phone) => {
  return fetch({ method: 'GET', url: 'customer/smscode', data: { id, phone } });
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

export const deleteFile = (filePath, token) => {
  return fetch({ method: 'DELETE', url: `order/file/${filePath}`, options: { token } });
};

export const getOrderList = (token) => {
  return fetch({ method: 'GET', url: `order/list`, options: { token } });
};

export const createOrder = (data, token) => {
  return fetch({ method: 'POST', url: 'order/create', data: { ...data }, options: { token } });
};

export const updateOrder = (data, token) => {
  return fetch({ method: 'POST', url: `order/${data.id}/appendDetails`, data, options: { token } });
};

export const payBonusOrder = (id, token) => {
  return fetch({ method: 'POST', url: `order/${id}/payWithBonus`, options: { token } });
};

export const payOrder = (id, url, token) => {
  return fetch({
    method:  'GET',
    url:     `order/${id}/payWithCard`,
    data:    { returnUrl: url, failUrl: url },
    options: { token }
  });
};

export const confirmPayment = (id, orderId, q, status, token) => {
  return fetch({ method: 'GET', url: `order/${id}/updatePayStatus`, data: { q, orderId, status }, options: { token } });
};

export const confirmOrder = (id, data, token) => {
  return fetch({ method: 'POST', url: `order/${id}/updateListDetailsAndSendOrderToSRG`, data, options: { token } });
};

export const getCertificates = (address, size, page) => {
  return fetch({ method: 'GET', url: 'certificate/list', data: { address, size, page } });
};
