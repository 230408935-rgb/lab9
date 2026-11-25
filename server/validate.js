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

