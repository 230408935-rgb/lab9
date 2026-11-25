import { useEffect, useState } from 'react';
import { createBook, deleteBook, getStats, listBooks, patchBook, replaceBook } from './api/books.js';
import BookForm from './components/BookForm.jsx';
import BookList from './components/BookList.jsx';
import Filters from './components/Filters.jsx';
import StatsPanel from './components/StatsPanel.jsx';

const INITIAL_FILTERS = { q: '', genre: '', read: '', sort: '', order: 'asc' };

export default function App() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [stats, setStats] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');


  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    listBooks(filters, controller.signal)
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // stale request: ignore
        setLoadError(err.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [filters, reloadKey]);