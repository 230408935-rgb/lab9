export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
const FIELDS = ['title', 'author', 'year', 'genre', 'read', 'rating'];

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function pickFields(body) {
  const out = {};
  for (const field of FIELDS) {
    if (Object.hasOwn(body, field)) out[field] = body[field];
  }
  return out;
}

export function validateBook(input) {
  const errors = [];

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (title.length < 1 || title.length > 100) {
    errors.push('"title" must be a string of 1 to 100 characters');
  }

  const author = typeof input.author === 'string' ? input.author.trim() : '';
  if (author.length < 1 || author.length > 100) {
    errors.push('"author" must be a string of 1 to 100 characters');
  }

  const maxYear = new Date().getFullYear();
  if (!Number.isInteger(input.year) || input.year < 1000 || input.year > maxYear) {
    errors.push(`"year" must be an integer between 1000 and ${maxYear}`);
  }

  if (!GENRES.includes(input.genre)) {
    errors.push(`"genre" must be one of: ${GENRES.join(', ')}`);
  }

  const read = input.read === undefined ? false : input.read;
  if (typeof read !== 'boolean') {
    errors.push('"read" must be true or false');
  }

  const rating = input.rating === undefined ? null : input.rating;
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    errors.push('"rating" must be an integer from 1 to 5, or null');
  } else if (rating !== null && read !== true) {
    errors.push('"rating" is only allowed when "read" is true');
  }

  if (errors.length > 0) return { errors };
  return { value: { title, author, year: input.year, genre: input.genre, read, rating } };
}

export function parseId(text) {
  if (!/^[1-9]\d*$/.test(text)) return null;
  const id = Number(text);
  return Number.isSafeInteger(id) ? id : null;
}



const LIST_PARAMS = ['genre', 'read', 'q', 'sort', 'order', 'limit', 'page'];
const SORT_FIELDS = ['title', 'author', 'year', 'rating'];

export function parseListQuery(query) {
  for (const name of LIST_PARAMS) {
    if (query[name] !== undefined && typeof query[name] !== 'string') {
      return { error: `"${name}" must be given only once` };
    }
  }

  const value = { genre: null, read: null, q: '', sort: 'id', order: 'asc', limit: 50, page: 1 };

  if (query.genre !== undefined) {
    if (!GENRES.includes(query.genre)) {
      return { error: `"genre" must be one of: ${GENRES.join(', ')}` };
    }
    value.genre = query.genre;
  }

  if (query.read !== undefined) {
    if (query.read !== 'true' && query.read !== 'false') {
      return { error: '"read" must be "true" or "false"' };
    }
    value.read = query.read === 'true';
  }

  if (query.q !== undefined) value.q = query.q.trim().toLowerCase();

  if (query.sort !== undefined) {
    if (!SORT_FIELDS.includes(query.sort)) {
      return { error: `"sort" must be one of: ${SORT_FIELDS.join(', ')}` };
    }
    value.sort = query.sort;
  }

  if (query.order !== undefined) {
    if (query.order !== 'asc' && query.order !== 'desc') {
      return { error: '"order" must be "asc" or "desc"' };
    }
    value.order = query.order;
  }

  if (query.limit !== undefined) {
    const limit = /^\d+$/.test(query.limit) ? Number(query.limit) : NaN;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return { error: '"limit" must be an integer from 1 to 50' };
    }
    value.limit = limit;
  }

  if (query.page !== undefined) {
    const page = /^\d+$/.test(query.page) ? Number(query.page) : NaN;
    if (!Number.isSafeInteger(page) || page < 1) {
      return { error: '"page" must be a positive integer' };
    }
    value.page = page;
  }

  return { value };
}
