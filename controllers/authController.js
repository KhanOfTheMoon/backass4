const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

async function register(req, res) {
  const { email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (exists) return res.status(409).json({ error: "Email already exists" });

  const hash = await bcrypt.hash(String(password), 10);

  const user = await User.create({
    email: String(email).toLowerCase().trim(),
    password: hash,
    role: role === "admin" ? "admin" : "user"
  });

  res.status(201).json({ message: "Registered", id: user._id, email: user.email, role: user.role });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(String(password), user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  res.json({ token, role: user.role });
}

module.exports = { register, login };