import express from 'express';
import cors from 'cors';
import * as store from './booksStore.js';
import { isPlainObject, parseId, parseListQuery, pickFields, validateBook } from './validate.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';


app.use(cors({ origin: CLIENT_ORIGIN, exposedHeaders: ['Location'] }));
app.use(express.json());

const sendError = (res, status, message) => res.status(status).json({ error: message });


function getId(req, res) {
  const id = parseId(req.params.id);
  if (id === null) sendError(res, 400, '"id" must be a positive integer');
  return id;
}

function compareBooks(sort, order) {
  const direction = order === 'desc' ? -1 : 1;
  return (a, b) => {
    if (sort === 'rating') {
      // Unrated books always sort last, in both directions.
      if (a.rating === null && b.rating === null) return a.id - b.id;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
    }
    const result =
      sort === 'title' || sort === 'author' ? a[sort].localeCompare(b[sort]) : a[sort] - b[sort];
    return result === 0 ? a.id - b.id : result * direction;
  };
}

app.get('/api/books', async (req, res) => {
  const parsed = parseListQuery(req.query);
  if (parsed.error) return sendError(res, 400, parsed.error);
  const { genre, read, q, sort, order, limit, page } = parsed.value;

  const all = await store.getAll();
  const filtered = all.filter(
    (b) =>
      (genre === null || b.genre === genre) &&
      (read === null || b.read === read) &&
      (q === '' || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
  );
  const sorted = [...filtered].sort(compareBooks(sort, order)); // sort a copy
  const start = (page - 1) * limit;
  res.json(sorted.slice(start, start + limit));
});

app.get('/api/books/:id', async (req, res) => {
  const id = getId(req, res);
  if (id === null) return;
  const book = await store.getById(id);
  if (!book) return sendError(res, 404, `Book ${id} not found`);
  res.json(book);
});

app.post('/api/books', async (req, res) => {
  if (!isPlainObject(req.body)) return sendError(res, 400, 'Request body must be a JSON object');
  const result = validateBook(pickFields(req.body));
  if (result.errors) return sendError(res, 400, result.errors.join('; '));

  if (await store.findDuplicate(result.value)) {
    return sendError(res, 409, 'A book with this title and author already exists');
  }
  const book = await store.create(result.value);
  res.status(201).location(`/api/books/${book.id}`).json(book);
});

app.put('/api/books/:id', async (req, res) => {
  const id = getId(req, res);
  if (id === null) return;
  if (!isPlainObject(req.body)) return sendError(res, 400, 'Request body must be a JSON object');
  const result = validateBook(pickFields(req.body));
  if (result.errors) return sendError(res, 400, result.errors.join('; '));

  if (!(await store.getById(id))) return sendError(res, 404, `Book ${id} not found`);
  if (await store.findDuplicate(result.value, id)) {
    return sendError(res, 409, 'A book with this title and author already exists');
  }
  const updated = await store.replace(id, result.value);
  if (!updated) return sendError(res, 404, `Book ${id} not found`);
  res.json(updated);
});

app.patch('/api/books/:id', async (req, res) => {
  const id = getId(req, res);
  if (id === null) return;
  if (!isPlainObject(req.body)) return sendError(res, 400, 'Request body must be a JSON object');

  const existing = await store.getById(id);
  if (!existing) return sendError(res, 404, `Book ${id} not found`);


   const { id: _existingId, ...current } = existing;
  const merged = { ...current, ...pickFields(req.body) };
  const result = validateBook(merged);
  if (result.errors) return sendError(res, 400, result.errors.join('; '));

  if (await store.findDuplicate(result.value, id)) {
    return sendError(res, 409, 'A book with this title and author already exists');
  }
  const updated = await store.replace(id, result.value);
  if (!updated) return sendError(res, 404, `Book ${id} not found`);
  res.json(updated);
});

app.delete('/api/books/:id', async (req, res) => {
  const id = getId(req, res);
  if (id === null) return;
  const removed = await store.remove(id);
  if (!removed) return sendError(res, 404, `Book ${id} not found`);
  res.status(204).end();
});

app.get('/api/stats', async (req, res) => {
  const books = await store.getAll();
  const rated = books.filter((b) => b.rating !== null);
  const readCount = books.filter((b) => b.read).length;
  const byGenre = {};
  for (const b of books) byGenre[b.genre] = (byGenre[b.genre] ?? 0) + 1;

  res.json({
    total: books.length,
    read: readCount,
    unread: books.length - readCount,
    averageRating:
      rated.length === 0
        ? null
        : Math.round((rated.reduce((sum, b) => sum + b.rating, 0) / rated.length) * 100) / 100,
    byGenre,
  });
});


app.get('/api/crash', async () => {
  await store.getAll();
  throw new Error('Deliberate crash for testing');
});

app.use('/api', (req, res) => sendError(res, 404, 'Not found'));


app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Malformed JSON in request body');
  }
  next(err);
});


app.use((err, req, res, next) => {
  console.error(err);
  sendError(res, 500, 'Something went wrong');
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (allowed origin: ${CLIENT_ORIGIN})`);
});