export default function StatsPanel({ stats }) {
  if (!stats) return <p>Loading statistics…</p>;
  return (
    <section>
      <h2>Statistics</h2>
      <p>
        Total: {stats.total} | Read: {stats.read} | Unread: {stats.unread} | Average rating:{' '}
        {stats.averageRating ?? 'no ratings yet'}
      </p>
      <ul>
        {Object.entries(stats.byGenre).map(([genre, count]) => (
          <li key={genre}>{genre}: {count}</li>
        ))}
      </ul>
    </section>
  );
}