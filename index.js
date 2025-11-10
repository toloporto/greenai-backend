# Recrear index.js sin BOM
$indexContent = @'
require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Crear tabla
pool.query(`
  CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    area REAL DEFAULT 100,
    cover TEXT DEFAULT 'plástico',
    created_at TIMESTAMP DEFAULT NOW()
  );
`).catch(() => {});

app.get("/", (req, res) => {
  res.json({ 
    message: "GreenAI Backend EN VIVO", 
    api: "/api/zones"
  });
});

app.get("/api/zones", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM zones ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend en puerto ${PORT}`);
});
'@

$indexContent | Out-File -FilePath "index.js" -Encoding ASCII