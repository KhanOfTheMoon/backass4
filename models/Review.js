const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    username: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    stars: { type: Number, required: true, min: 1, max: 5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);