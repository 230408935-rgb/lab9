let books = [
  { id: 1, title: 'Dune', author: 'Frank Herbert', year: 1965, genre: 'fiction', read: true, rating: 4 },
  { id: 2, title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937, genre: 'fantasy', read: true, rating: 5 },
  { id: 3, title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, genre: 'history', read: true, rating: 4 },
  { id: 4, title: 'A Brief History of Time', author: 'Stephen Hawking', year: 1988, genre: 'science', read: true, rating: 5 },
  { id: 5, title: 'The Name of the Wind', author: 'Patrick Rothfuss', year: 2007, genre: 'fantasy', read: false, rating: null },
  { id: 6, title: 'Educated', author: 'Tara Westover', year: 2018, genre: 'non-fiction', read: false, rating: null },
];
let nextId = 7;

const slow = () => new Promise((resolve) => setTimeout(resolve, 20));

export async function getAll() {
  await slow();
  return [...books];
}

export async function getById(id) {
  await slow();
  return books.find((b) => b.id === id) ?? null;
}

export async function findDuplicate({ title, author }, excludeId = null) {
  await slow();
  const t = title.trim().toLowerCase();
  const a = author.trim().toLowerCase();
  return (
    books.find(
      (b) => b.id !== excludeId && b.title.toLowerCase() === t && b.author.toLowerCase() === a,
    ) ?? null
  );
}

export async function create(data) {
  await slow();
  const book = { ...data, id: nextId };
  nextId += 1;
  books = [...books, book];
  return book;
}

