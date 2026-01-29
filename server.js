const express = require("express");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "local")));
app.use("/local", express.static(path.join(__dirname, "local")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "local", "index.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reviews", reviewRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

connectDB().then(() => {
  app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  });
});