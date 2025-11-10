# Estás en C:\greenai-backend
# Borra el archivo roto
Remove-Item "index.js" -Force

# Crea NUEVO index.js CORRECTO (100% JavaScript)
$indexContent = @'
require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  console.log("DB connected");
} catch (e) {
  console.error("DB Connection failed:", e.message);
}

app.get("/", (req, res) => {
  res.json({ 
    message: "GreenAI Backend EN VIVO!", 
    dbConnected: !!pool,
    api: "/api/zones"
  });
});

app.get("/api/zones", async (req, res) => {
  if (!pool) return res.status(503).json({ error: "DB not connected" });
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
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/zones", async (req, res) => {
  if (!pool) return res.status(503).json({ error: "DB not connected" });
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

Write-Host "index.js CORREGIDO (sin comentarios PowerShell)!" -ForegroundColor Green