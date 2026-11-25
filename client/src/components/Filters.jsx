const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

export default function Filters({ filters, onChange }) {
  const handle = (e) => onChange({ ...filters, [e.target.name]: e.target.value });

  return (
    <section>
      <h2>Search and filter</h2>
      <input name="q" placeholder="Search title or author" value={filters.q} onChange={handle} />
      <select name="genre" value={filters.genre} onChange={handle}>
        <option value="">All genres</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <select name="read" value={filters.read} onChange={handle}>
        <option value="">Read and unread</option>
        <option value="true">Read</option>
        <option value="false">Unread</option>
      </select>
      <select name="sort" value={filters.sort} onChange={handle}>
        <option value="">Sort: default</option>
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="year">Year</option>
        <option value="rating">Rating</option>
      </select>
      <select name="order" value={filters.order} onChange={handle}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </section>
  );
}