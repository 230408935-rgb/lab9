export default function BookList({ books, busy, onToggleRead, onRate, onEdit, onDelete }) {
  return (
    <ul>
      {books.map((book) => (
        <li key={book.id}>
          <strong>{book.title}</strong> by {book.author} ({book.year}, {book.genre}){' '}
          <label>
            <input
              type="checkbox"
              checked={book.read}
              disabled={busy}
              onChange={() => onToggleRead(book)}
            />{' '}
            read
          </label>{' '}
          <select
            value={book.rating ?? ''}
            disabled={busy || !book.read}
            onChange={(e) => onRate(book, e.target.value)}
          >
            <option value="">No rating</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>{' '}
          <button onClick={() => onEdit(book)} disabled={busy}>Edit</button>{' '}
          <button onClick={() => onDelete(book)} disabled={busy}>Delete</button>
        </li>
      ))}
    </ul>
  );
}