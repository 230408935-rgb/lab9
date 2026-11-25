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

  useEffect(() => {
    const controller = new AbortController();
    getStats(controller.signal)
      .then(setStats)
      .catch((err) => {
        if (err.name !== 'AbortError') setLoadError(err.message);
      });
    return () => controller.abort();
  }, [reloadKey]);


  async function runAction(action) {
    setBusy(true);
    setActionError('');
    try {
      await action();
      setReloadKey((k) => k + 1);
      return true;
    } catch (err) {
      setActionError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(body) {
    const ok = await runAction(() =>
      editing ? replaceBook(editing.id, body) : createBook(body),
    );
    if (ok) {
      setEditing(null);
      setFormKey((k) => k + 1);
    }
  }

  const handleToggleRead = (book) =>
    runAction(() =>
      patchBook(book.id, book.read ? { read: false, rating: null } : { read: true }),
    );

  const handleRate = (book, value) =>
    runAction(() => patchBook(book.id, { rating: value === '' ? null : Number(value) }));

  const handleDelete = (book) => runAction(() => deleteBook(book.id));

  const startEdit = (book) => {
    setActionError('');
    setEditing(book);
    setFormKey((k) => k + 1);
  };

  const cancelEdit = () => {
    setActionError('');
    setEditing(null);
    setFormKey((k) => k + 1);
  };

  return (
    <main>
      <h1>Reading List</h1>
      <StatsPanel stats={stats} />
      <BookForm
        key={formKey}
        initial={editing}
        onSubmit={handleSubmit}
        onCancel={cancelEdit}
        busy={busy}
        error={actionError}
      />
      <Filters filters={filters} onChange={setFilters} />

      {loading && <p>Loading books…</p>}
      {loadError && <p role="alert">Error: {loadError}</p>}
      {!loading && !loadError && books.length === 0 && <p>No books match your filters.</p>}
      <BookList
        books={books}
        busy={busy}
        onToggleRead={handleToggleRead}
        onRate={handleRate}
        onEdit={startEdit}
        onDelete={handleDelete}
      />
    </main>
  );
}