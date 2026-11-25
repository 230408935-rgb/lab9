import { useState } from 'react';

const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

function toFormState(book) {
  return {
    title: book?.title ?? '',
    author: book?.author ?? '',
    year: book ? String(book.year) : '',
    genre: book?.genre ?? 'fiction',
    read: book?.read ?? false,
    rating: book?.rating == null ? '' : String(book.rating),
  };
}

export default function BookForm({ initial, onSubmit, onCancel, busy, error }) {
  const [form, setForm] = useState(() => toFormState(initial));

  const handle = (e) => {
    const { name, type, checked, value } = e.target;
    const next = type === 'checkbox' ? checked : value;
    setForm((f) => {
      const updated = { ...f, [name]: next };
      if (name === 'read' && !checked) updated.rating = '';
      return updated;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title,
      author: form.author,
      year: Number(form.year),
      genre: form.genre,
      read: form.read,
      rating: form.read && form.rating !== '' ? Number(form.rating) : null,
    });
  };

  return (
    <form onSubmit={submit}>
      <h2>{initial ? `Edit book #${initial.id}` : 'Add a book'}</h2>
      <input name="title" placeholder="Title" value={form.title} onChange={handle} required />
      <input name="author" placeholder="Author" value={form.author} onChange={handle} required />
      <input name="year" placeholder="Year" value={form.year} onChange={handle} required />
      <select name="genre" value={form.genre} onChange={handle}>
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <label>
        <input type="checkbox" name="read" checked={form.read} onChange={handle} /> Read
      </label>
      <select name="rating" value={form.rating} onChange={handle} disabled={!form.read}>
        <option value="">No rating</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <button type="submit" disabled={busy}>
        {busy ? 'Saving…' : initial ? 'Save changes' : 'Add book'}
      </button>
      {initial && (
        <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
      )}
      {error && <p role="alert">Error: {error}</p>}
    </form>
  );
}