import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database Setup
const db = new sqlite3.Database("buildsouq.db", (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to SQLite database.");
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      role TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      registrationDate TEXT,
      phone TEXT,
      businessName TEXT,
      supplierId TEXT
    )`);

    // Categories Table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`);

    // Suppliers Table
    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      joinedAt TEXT
    )`);

    // Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      supplierId TEXT,
      name TEXT NOT NULL,
      price REAL,
      categoryId TEXT,
      stock INTEGER,
      lowStockThreshold INTEGER,
      description TEXT,
      FOREIGN KEY(supplierId) REFERENCES suppliers(id),
      FOREIGN KEY(categoryId) REFERENCES categories(id)
    )`);

    // Orders Table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT,
      date TEXT,
      status TEXT,
      total REAL,
      paymentMethod TEXT,
      items TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    // Seed initial data if empty
    db.get("SELECT count(*) as count FROM categories", (err, row: any) => {
      if (row.count === 0) {
        const cats = [
          ['cat1', 'Cement & Concrete'],
          ['cat2', 'Tiles & Flooring'],
          ['cat3', 'Paints & Finishes'],
          ['cat4', 'Plumbing & Pipes'],
          ['cat5', 'Electrical & Lighting'],
          ['cat6', 'Wood & Timber']
        ];
        const stmt = db.prepare("INSERT INTO categories (id, name) VALUES (?, ?)");
        cats.forEach(c => stmt.run(c));
        stmt.finalize();
      }
    });

    db.get("SELECT count(*) as count FROM users", (err, row: any) => {
      if (row.count === 0) {
        db.run("INSERT INTO users (id, name, email, role, verified, registrationDate) VALUES (?, ?, ?, ?, ?, ?)",
          ['u1', 'Admin One', 'admin@buildsouq.ae', 'superadmin', 1, new Date().toISOString()]);
        db.run("INSERT INTO users (id, name, email, password, role, verified, registrationDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
          ['u4', 'islam', 'islam', '123456', 'superadmin', 1, new Date().toISOString()]);
      }
    });
  });
}

// API Routes

// Auth
app.post("/api/login", (req, res) => {
  const { identifier, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ? OR name = ?", [identifier, identifier], (err, user: any) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.json(user);
  });
});

app.post("/api/register", (req, res) => {
  const { id, name, email, role, verified, registrationDate, phone, password, businessName, supplierId } = req.body;
  db.run(`INSERT INTO users (id, name, email, role, verified, registrationDate, phone, password, businessName, supplierId) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, email, role, verified ? 1 : 0, registrationDate, phone, password, businessName, supplierId],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id, name, email, role });
    }
  );
});

// Users
app.get("/api/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map((u: any) => ({ ...u, verified: !!u.verified })));
  });
});

app.patch("/api/users/:id/verify", (req, res) => {
  const { verified } = req.body;
  db.run("UPDATE users SET verified = ? WHERE id = ?", [verified ? 1 : 0, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Categories
app.get("/api/categories", (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/categories", (req, res) => {
  const { id, name } = req.body;
  db.run("INSERT INTO categories (id, name) VALUES (?, ?)", [id, name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name });
  });
});

app.put("/api/categories/:id", (req, res) => {
  const { name } = req.body;
  db.run("UPDATE categories SET name = ? WHERE id = ?", [name, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Suppliers
app.get("/api/suppliers", (req, res) => {
  db.all("SELECT * FROM suppliers", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map((s: any) => ({ ...s, active: !!s.active })));
  });
});

app.post("/api/suppliers", (req, res) => {
  const { id, name, active, joinedAt } = req.body;
  db.run("INSERT INTO suppliers (id, name, active, joinedAt) VALUES (?, ?, ?, ?)", 
    [id, name, active ? 1 : 0, joinedAt], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name, active });
  });
});

app.patch("/api/suppliers/:id/status", (req, res) => {
  const { active } = req.body;
  db.run("UPDATE suppliers SET active = ? WHERE id = ?", [active ? 1 : 0, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Products
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/products", (req, res) => {
  const { id, supplierId, name, price, categoryId, stock, lowStockThreshold, description } = req.body;
  db.run(`INSERT INTO products (id, supplierId, name, price, categoryId, stock, lowStockThreshold, description) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, supplierId, name, price, categoryId, stock, lowStockThreshold, description],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name });
    }
  );
});

app.put("/api/products/:id", (req, res) => {
  const { name, price, categoryId, stock, lowStockThreshold, description } = req.body;
  db.run(`UPDATE products SET name = ?, price = ?, categoryId = ?, stock = ?, lowStockThreshold = ?, description = ? 
          WHERE id = ?`,
    [name, price, categoryId, stock, lowStockThreshold, description, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete("/api/products/:id", (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Orders
app.get("/api/orders", (req, res) => {
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map((o: any) => ({ ...o, items: JSON.parse(o.items) })));
  });
});

app.post("/api/orders", (req, res) => {
  const { id, userId, date, status, total, paymentMethod, items } = req.body;
  db.run(`INSERT INTO orders (id, userId, date, status, total, paymentMethod, items) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, date, status, total, paymentMethod, JSON.stringify(items)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, status });
    }
  );
});

app.patch("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;
  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
