require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// CONEXIÓN A POSTGRESQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// PRUEBA DE CONEXIÓN
pool.connect((err) => {
  if (err) {
    console.error("DB Connection failed:", err.message);
  } else {
    console.log("DB connected successfully");
  }
});

// RUTA RAÍZ
app.get("/", (req, res) => {
  res.json({ 
    message: "GreenAI Backend EN VIVO!",
    db: "PostgreSQL en Railway",
    api: "/api/zones",
    port: process.env.PORT || 4000
  });
});

// CREAR TABLA Y OBTENER ZONAS
app.get("/api/zones", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS zones (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        area REAL DEFAULT 100,
        cover TEXT DEFAULT 'plástico',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    const result = await pool.query("SELECT * FROM zones ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (e) {
    console.error("Query error:", e);
    res.status(500).json({ error: e.message });
  }
});

// AÑADIR ZONA
app.post("/api/zones", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    const result = await pool.query(
      "INSERT INTO zones (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.json(result.rows[0]);
  } catch (e) {
    console.error("Insert error:", e);
    res.status(500).json({ error: e.message });
  }
});

// PUERTO DINÁMICO (RAILWAY)
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});
