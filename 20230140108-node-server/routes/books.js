const express = require('express');
const router = express.Router();

let books = [
  { id: 1, title: 'Laskar Pelangi', author: 'Andrea Hirata' },
  { id: 2, title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer' },
];


router.get('/', (req, res) => {
  res.json(books);
});


router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});


router.post('/', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  const book = {
    id: books.length ? books[books.length - 1].id + 1 : 1,
    title,
    author
  };

  books.push(book);
  res.status(201).json(book);
});


router.put('/:id', (req, res) => {
  const { title, author } = req.body;
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  book.title = title;
  book.author = author;
  res.json(book);
});


router.delete('/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Book not found' });

  const deleted = books.splice(index, 1);
  res.json({ message: 'Book deleted successfully', deleted });
});

module.exports = router;