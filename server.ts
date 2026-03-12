import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

type DBClient = {
  run: (sql: string, params?: any[]) => Promise<any>;
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  close?: () => Promise<void>;
};

const DB_TYPE =
  process.env.DB_TYPE || (process.env.DB_HOST ? "mysql" : "sqlite");

const createDb = async (): Promise<DBClient> => {
  if (DB_TYPE === "mysql") {
    const mysql = await import("mysql2/promise");
    const pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "buildsouq",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    return {
      run: async (sql, params = []) => {
        const [result] = await pool.execute(sql, params);
        return result;
      },
      get: async (sql, params = []) => {
        const [rows] = await pool.execute(sql, params);
        return Array.isArray(rows) ? (rows as any[])[0] : undefined;
      },
      all: async (sql, params = []) => {
        const [rows] = await pool.execute(sql, params);
        return Array.isArray(rows) ? (rows as any[]) : [];
      },
      close: async () => pool.end(),
    };
  }

  // Fallback to SQLite (local file) when MySQL config is not provided.
  const sqliteModule = await import("sqlite3");
  const sqlite3 = (sqliteModule as any).default ?? sqliteModule;
  const Database = sqlite3.Database || sqlite3;
  const db = new Database(process.env.SQLITE_FILE || "buildsouq.db");

  const run = (sql: string, params: any[] = []) =>
    new Promise<any>((resolve, reject) => {
      db.run(sql, params, function (err: any) {
        if (err) return reject(err);
        resolve(this);
      });
    });

  const get = (sql: string, params: any[] = []) =>
    new Promise<any>((resolve, reject) => {
      db.get(sql, params, (err: any, row: any) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

  const all = (sql: string, params: any[] = []) =>
    new Promise<any[]>((resolve, reject) => {
      db.all(sql, params, (err: any, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

  return {
    run,
    get,
    all,
    close: () => new Promise((resolve) => db.close(() => resolve(undefined))),
  };
};

const db = await createDb();

async function createTables() {
  // Users Table
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(64) NOT NULL,
    verified BOOLEAN DEFAULT 0,
    registrationDate VARCHAR(64),
    phone VARCHAR(64),
    businessName VARCHAR(255),
    supplierId VARCHAR(128),
    pfp TEXT
  )`);

  // Categories Table
  await db.run(`CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  )`);

  // Suppliers Table
  await db.run(`CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT 1,
    joinedAt VARCHAR(64)
  )`);

  // Products Table
  await db.run(`CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(128) PRIMARY KEY,
    supplierId VARCHAR(128),
    name VARCHAR(255) NOT NULL,
    price DOUBLE,
    categoryId VARCHAR(128),
    stock INTEGER,
    lowStockThreshold INTEGER,
    description TEXT,
    nonRefundable BOOLEAN DEFAULT 0
  )`);

  // Ensure new product columns exist (migration for older DBs)
  try {
    if (DB_TYPE === "mysql") {
      await db.run(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS nonRefundable BOOLEAN DEFAULT 0",
      );
    } else {
      await db.run(
        "ALTER TABLE products ADD COLUMN nonRefundable BOOLEAN DEFAULT 0",
      );
    }
  } catch (err) {
    // column already exists or not supported; safe to ignore
  }

  // Orders Table
  await db.run(`CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(128) PRIMARY KEY,
    userId VARCHAR(128),
    date VARCHAR(64),
    status VARCHAR(64),
    subtotal DOUBLE,
    deliveryFee DOUBLE,
    total DOUBLE,
    paymentMethod VARCHAR(32),
    items TEXT,
    deliveredAt VARCHAR(64),
    deliveredBy VARCHAR(255),
    refundedAt VARCHAR(64),
    disposedAt VARCHAR(64)
  )`);

  // Ensure profile picture column exists (migration for older DBs)
  try {
    if (DB_TYPE === "mysql") {
      await db.run("ALTER TABLE users ADD COLUMN IF NOT EXISTS pfp TEXT");
    } else {
      await db.run("ALTER TABLE users ADD COLUMN pfp TEXT");
    }
  } catch (err) {
    // column already exists or not supported; safe to ignore
  }

  // Ensure new order columns exist (migration for older DBs)
  try {
    if (DB_TYPE === "mysql") {
      await db.run(
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS deliveredAt VARCHAR(64)",
      );
      await db.run(
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS deliveredBy VARCHAR(255)",
      );
      await db.run(
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS refundedAt VARCHAR(64)",
      );
      await db.run("ALTER TABLE orders ADD COLUMN subtotal DOUBLE");
      await db.run("ALTER TABLE orders ADD COLUMN deliveryFee DOUBLE");
      await db.run("ALTER TABLE orders ADD COLUMN deliveredAt VARCHAR(64)");
      await db.run("ALTER TABLE orders ADD COLUMN deliveredBy VARCHAR(255)");
      await db.run("ALTER TABLE orders ADD COLUMN refundedAt VARCHAR(64)");
      await db.run("ALTER TABLE orders ADD COLUMN disposedAt VARCHAR(64)");
    } else {
      await db.run("ALTER TABLE orders ADD COLUMN subtotal DOUBLE");
      await db.run("ALTER TABLE orders ADD COLUMN deliveryFee DOUBLE");
      await db.run("ALTER TABLE orders ADD COLUMN deliveredAt VARCHAR(64)");
      await db.run("ALTER TABLE orders ADD COLUMN deliveredBy VARCHAR(255)");
      await db.run("ALTER TABLE orders ADD COLUMN refundedAt VARCHAR(64)");
      await db.run("ALTER TABLE orders ADD COLUMN disposedAt VARCHAR(64)");
    }
  } catch (err) {
    // column already exists or not supported; safe to ignore
  }

  // Seed initial data if empty
  const categoryCount = await db.get(
    "SELECT COUNT(*) as count FROM categories",
  );
  if (categoryCount?.count === 0) {
    const cats = [
      ["cat1", "Cement & Concrete"],
      ["cat2", "Tiles & Flooring"],
      ["cat3", "Paints & Finishes"],
      ["cat4", "Plumbing & Pipes"],
      ["cat5", "Electrical & Lighting"],
      ["cat6", "Wood & Timber"],
    ];
    for (const [id, name] of cats) {
      await db.run("INSERT INTO categories (id, name) VALUES (?, ?)", [
        id,
        name,
      ]);
    }
  }

  const userCount = await db.get("SELECT COUNT(*) as count FROM users");
  if (userCount?.count === 0) {
    await db.run(
      "INSERT INTO users (id, name, email, role, verified, registrationDate) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "u1",
        "Admin One",
        "admin@buildsouq.ae",
        "superadmin",
        1,
        new Date().toISOString(),
      ],
    );
    await db.run(
      "INSERT INTO users (id, name, email, password, role, verified, registrationDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        "u4",
        "islam",
        "islam",
        "123456",
        "superadmin",
        1,
        new Date().toISOString(),
      ],
    );
  }
}

await createTables();

// Multer for file uploads
const upload = multer({ dest: UPLOAD_DIR });

// API Routes

// Auth
app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await db.get(
      "SELECT * FROM users WHERE email = ? OR name = ?",
      [identifier, identifier],
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/register", async (req, res) => {
  const {
    id,
    name,
    email,
    role,
    verified,
    registrationDate,
    phone,
    password,
    businessName,
    supplierId,
  } = req.body;
  try {
    await db.run(
      `INSERT INTO users (id, name, email, role, verified, registrationDate, phone, password, businessName, supplierId) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        email,
        role,
        verified ? 1 : 0,
        registrationDate,
        phone,
        password,
        businessName,
        supplierId,
      ],
    );
    res.json({ id, name, email, role });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Users
app.get("/api/users", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM users");
    res.json(rows.map((u: any) => ({ ...u, verified: !!u.verified })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/users/:id/verify", async (req, res) => {
  const { verified } = req.body;
  try {
    await db.run("UPDATE users SET verified = ? WHERE id = ?", [
      verified ? 1 : 0,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/users/:id", async (req, res) => {
  const updates: Record<string, any> = {};
  const allowed = ["email", "phone", "pfp", "name"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No profile fields provided" });
  }

  const setClause = Object.keys(updates)
    .map((k) => `${k} = ?`)
    .join(", ");
  const params = [...Object.values(updates), req.params.id];

  try {
    await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, params);
    const updated = await db.get("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users/:id/pfp", upload.single("pfp"), async (req, res) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `/uploads/${file.filename}`;
  try {
    await db.run("UPDATE users SET pfp = ? WHERE id = ?", [
      fileUrl,
      req.params.id,
    ]);
    res.json({ pfp: fileUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Categories
app.get("/api/categories", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM categories");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/categories", async (req, res) => {
  const { id, name } = req.body;
  try {
    await db.run("INSERT INTO categories (id, name) VALUES (?, ?)", [id, name]);
    res.json({ id, name });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  const { name } = req.body;
  try {
    await db.run("UPDATE categories SET name = ? WHERE id = ?", [
      name,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Suppliers
app.get("/api/suppliers", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM suppliers");
    res.json(rows.map((s: any) => ({ ...s, active: !!s.active })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/suppliers", async (req, res) => {
  const { id, name, active, joinedAt } = req.body;
  try {
    await db.run(
      "INSERT INTO suppliers (id, name, active, joinedAt) VALUES (?, ?, ?, ?)",
      [id, name, active ? 1 : 0, joinedAt],
    );
    res.json({ id, name, active });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/suppliers/:id/status", async (req, res) => {
  const { active } = req.body;
  try {
    await db.run("UPDATE suppliers SET active = ? WHERE id = ?", [
      active ? 1 : 0,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products
app.get("/api/products", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM products");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  const {
    id,
    supplierId,
    name,
    price,
    categoryId,
    stock,
    lowStockThreshold,
    description,
    nonRefundable,
  } = req.body;
  try {
    await db.run(
      `INSERT INTO products (id, supplierId, name, price, categoryId, stock, lowStockThreshold, description, nonRefundable) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        supplierId,
        name,
        price,
        categoryId,
        stock,
        lowStockThreshold,
        description,
        nonRefundable ? 1 : 0,
      ],
    );
    res.json({ id, name });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  const {
    name,
    price,
    categoryId,
    stock,
    lowStockThreshold,
    description,
    nonRefundable,
  } = req.body;
  try {
    await db.run(
      `UPDATE products SET name = ?, price = ?, categoryId = ?, stock = ?, lowStockThreshold = ?, description = ?, nonRefundable = ? 
          WHERE id = ?`,
      [
        name,
        price,
        categoryId,
        stock,
        lowStockThreshold,
        description,
        nonRefundable ? 1 : 0,
        req.params.id,
      ],
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await db.run("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.get("/api/orders", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM orders");
    res.json(rows.map((o: any) => ({ ...o, items: JSON.parse(o.items) })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  const {
    id,
    userId,
    date,
    status,
    subtotal,
    deliveryFee,
    total,
    paymentMethod,
    items,
  } = req.body;
  try {
    await db.run(
      `INSERT INTO orders (id, userId, date, status, subtotal, deliveryFee, total, paymentMethod, items) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        date,
        status,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        JSON.stringify(items),
      ],
    );
    res.json({ id, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    await db.run("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/orders/:id", async (req, res) => {
  const { status, items, deliveredAt, deliveredBy, refundedAt, disposedAt } =
    req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (status !== undefined) {
    updates.push("status = ?");
    params.push(status);
  }
  if (items !== undefined) {
    updates.push("items = ?");
    params.push(JSON.stringify(items));
  }
  if (deliveredAt !== undefined) {
    updates.push("deliveredAt = ?");
    params.push(deliveredAt);
  }
  if (deliveredBy !== undefined) {
    updates.push("deliveredBy = ?");
    params.push(deliveredBy);
  }
  if (refundedAt !== undefined) {
    updates.push("refundedAt = ?");
    params.push(refundedAt);
  }
  if (disposedAt !== undefined) {
    updates.push("disposedAt = ?");
    params.push(disposedAt);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No updates provided" });
  }

  params.push(req.params.id);
  try {
    await db.run(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await db.get("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);
    if (updated) {
      updated.items = JSON.parse(updated.items);
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
  console.log(`Using ${DB_TYPE.toUpperCase()} database.`);
});
