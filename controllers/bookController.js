const Book = require("../models/Book");

async function getAll(req, res) {
  const books = await Book.find().sort({ createdAt: -1 }).lean();
  res.json(books);
}

async function getOne(req, res) {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
}

async function create(req, res) {
  try {
    const { title, author, price, description, reviewsCount, rating } = req.body || {};
    if (!title || !author || price === undefined || !description || reviewsCount === undefined || rating === undefined) {
      return res.status(400).json({ error: "Required: title, author, price, description, reviewsCount, rating" });
    }

    const created = await Book.create({
      title: String(title).trim(),
      author: String(author).trim(),
      price: Number(price),
      description: String(description).trim(),
      reviewsCount: Number(reviewsCount),
      rating: Number(rating)
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function update(req, res) {
  try {
    const { title, author, price, description, reviewsCount, rating } = req.body || {};
    if (!title || !author || price === undefined || !description || reviewsCount === undefined || rating === undefined) {
      return res.status(400).json({ error: "Required: title, author, price, description, reviewsCount, rating" });
    }

    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title: String(title).trim(),
        author: String(author).trim(),
        price: Number(price),
        description: String(description).trim(),
        reviewsCount: Number(reviewsCount),
        rating: Number(rating)
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Book not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message || "Invalid id" });
  }
}

async function remove(req, res) {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Book not found" });
    res.json({ message: "Book deleted successfully" });
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
}

module.exports = { getAll, getOne, create, update, remove };