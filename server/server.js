import express from 'express';
import cors from 'cors';
import * as store from './booksStore.js';
import { isPlainObject, parseId, parseListQuery, pickFields, validateBook } from './validate.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';


app.use(cors({ origin: CLIENT_ORIGIN, exposedHeaders: ['Location'] }));
app.use(express.json());