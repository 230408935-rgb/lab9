export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
const FIELDS = ['title', 'author', 'year', 'genre', 'read', 'rating'];

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}