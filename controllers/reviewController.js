const Review = require("../models/Review");
const Book = require("../models/Book");

async function getAll(req, res) {
  const reviews = await Review.find().sort({ createdAt: -1 }).lean();
  res.json(reviews);
}

async function getOne(req, res) {
  try {
    const review = await Review.findById(req.params.id).lean();
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
}

async function create(req, res) {
  try {
    const { bookId, username, text, stars } = req.body || {};
    if (!bookId || !username || !text || stars === undefined) {
      return res.status(400).json({ error: "Required: bookId, username, text, stars" });
    }

    const bookExists = await Book.findById(bookId).lean();
    if (!bookExists) return res.status(404).json({ error: "Book for review not found" });

    const created = await Review.create({
      bookId,
      username: String(username).trim(),
      text: String(text).trim(),
      stars: Number(stars)
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function update(req, res) {
  try {
    const { bookId, username, text, stars } = req.body || {};
    if (!bookId || !username || !text || stars === undefined) {
      return res.status(400).json({ error: "Required: bookId, username, text, stars" });
    }

    const bookExists = await Book.findById(bookId).lean();
    if (!bookExists) return res.status(404).json({ error: "Book for review not found" });

    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      { bookId, username: String(username).trim(), text: String(text).trim(), stars: Number(stars) },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Review not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message || "Invalid id" });
  }
}

async function remove(req, res) {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch {
    res.status(400).json({ error: "Invalid id" });
  }
}

module.exports = { getAll, getOne, create, update, remove };