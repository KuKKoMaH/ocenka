import stringify from 'qs/lib/stringify';

export default function fetch({ method = 'GET', url, data, options = {} }) {
  const upperMethod = method.toString().toUpperCase();
  let fullUrl = API_URL + url;

  const params = {
    method: upperMethod,
  };

  if (upperMethod === 'GET' || upperMethod === 'DELETE') {
    const strBody = stringify(data);
    if (strBody.length) {
      fullUrl += `?${stringify(data)}`;
    }
  } else if (typeof data === 'object' && data !== null) {
    params.data = JSON.stringify(data);
  } else {
    params.data = data;
  }

  params.headers = {
    'Content-Type': 'application/json',
  };
  if(options.token) params.headers.token = options.token;
  params.url = fullUrl;

  return $.ajax(params);
}
