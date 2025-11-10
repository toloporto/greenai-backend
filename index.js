require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/greenai"
});

// Crear tablas
pool.query(`
  CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    area REAL,
    cover TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);

// Rutas
app.get("/", (req, res) => {
  res.json({ 
    message: "GreenAI Control Backend - EN VIVO!", 
    time: new Date().toISOString(),
    docs: "/api/zones"
  });
});

app.get("/api/zones", async (req, res) => {
  const result = await pool.query("SELECT * FROM zones ORDER BY created_at DESC");
  res.json(result.rows);
});

app.post("/api/zones", async (req, res) => {
  const { name, area = 100, cover = "plástico" } = req.body;
  const result = await pool.query(
    "INSERT INTO zones (name, area, cover) VALUES ($1, $2, $3) RETURNING *",
    [name, area, cover]
  );
  res.json(result.rows[0]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend en http://localhost:${PORT}`);
});
