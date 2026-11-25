const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = 'GET', body, signal } = {}) {
  const options = { method, signal };
  if (body !== undefined) {
     options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  if (response.status === 204) return null; // no body to parse

  let data = null;
  try {
    data = await response.json();
  } catch {

}
