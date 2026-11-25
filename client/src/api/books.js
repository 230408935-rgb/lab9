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

 if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }
  return data;
}

export function listBooks(filters, signal) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null && value !== undefined) params.set(key, value);
  }
  const query = params.toString();
  return request(query ? `/books?${query}` : '/books', { signal });
}

export const getStats = (signal) => request('/stats', { signal });
export const createBook = (book) => request('/books', { method: 'POST', body: book });
export const replaceBook = (id, book) => request(`/books/${id}`, { method: 'PUT', body: book });
export const patchBook = (id, changes) =>
  request(`/books/${id}`, { method: 'PATCH', body: changes });
export const deleteBook = (id) => request(`/books/${id}`, { method: 'DELETE' });