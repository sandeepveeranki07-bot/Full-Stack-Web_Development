
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

app.get("/", (req, res) => {
  res.send("CORRECT SERVER FILE IS RUNNING - TEST 123");
});
app.get("/api/auth/test", (req, res) => {
  res.json({ message: "Auth routes are reachable" });
});

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}
console.log("SIGNUP ROUTE REGISTERED");

// SIGNUP: Create a new user account
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        error: "Enter a name, valid email, and password of at least 8 characters"
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [cleanName, cleanEmail, passwordHash]
    );

    const user = {
      id: result.insertId,
      name: cleanName,
      email: cleanEmail
    };

    res.status(201).json({
      message: "Signup successful",
      user,
      token: createToken(user)
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "An account with this email already exists"
      });
    }

    console.error(error.message);
    res.status(500).json({ error: "Signup failed" });
  }
});

// LOGIN: Verify email and password
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (
      rows.length === 0 ||
      !(await bcrypt.compare(password, rows[0].password_hash))
    ) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email
    };

    res.json({
      message: "Login successful",
      user,
      token: createToken(user)
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// Middleware: Verify a JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: "Authentication token required"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
    if (error) {
      return res.status(401).json({
        error: "Invalid or expired token"
      });
    }

    req.user = payload;
    next();
  });
}

// PROTECTED: Check the logged-in user's profile
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not retrieve profile" });
  }
});


// READ: Get all students
app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM students ORDER BY id"
    );
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not retrieve students" });
  }
});

// CREATE: Add a student
app.post("/api/students", authenticateToken, async (req, res) => {
  try {
    const { name, email, course } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof course !== "string" || !course.trim()
    ) {
      return res.status(400).json({
        error: "Name, email, and course are required"
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO students (name, email, course) VALUES (?, ?, ?)",
      [name.trim(), email.trim(), course.trim()]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      email: email.trim(),
      course: course.trim()
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "That email address already exists"
      });
    }

    console.error(error.message);
    res.status(500).json({ error: "Could not add student" });
  }
});

// UPDATE: Change a student
app.put("/api/students", authenticateToken, async (req, res) => {
  try {
    const { name, email, course } = req.body;
    const id = Number(req.params.id);

    if (
      !Number.isSafeInteger(id) || id < 1 ||
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof course !== "string" || !course.trim()
    ) {
      return res.status(400).json({
        error: "Provide a valid ID, name, email, and course"
      });
    }

    const [result] = await pool.execute(
      "UPDATE students SET name = ?, email = ?, course = ? WHERE id = ?",
      [name.trim(), email.trim(), course.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student updated successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "That email address already exists"
      });
    }

    console.error(error.message);
    res.status(500).json({ error: "Could not update student" });
  }
});

// DELETE: Remove a student
app.delete("/api/students", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const [result] = await pool.execute(
      "DELETE FROM students WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Could not delete student" });
  }
});


async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL connection successful");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running at http://localhost:5000");
    });
  } catch (error) {
    console.error("Could not connect to MySQL:", error.message);
  }
}

startServer();
