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