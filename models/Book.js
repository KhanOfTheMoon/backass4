const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    reviewsCount: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);