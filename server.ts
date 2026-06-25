import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === "production";

  // Database setup
  const db = new Database("rsvps.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      attending TEXT NOT NULL,
      guests INTEGER,
      allergies TEXT,
      other_allergies TEXT,
      song TEXT,
      transport TEXT,
      message TEXT,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration for existing databases
  try {
    db.exec("ALTER TABLE rsvps ADD COLUMN location TEXT");
  } catch (e) {
    // Column already exists
  }

  app.use(express.json());

  // Simple admin auth middleware
  const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const password = req.headers['x-admin-password'];
    if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
      next();
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  };

  // API routes
  app.post("/api/rsvp", (req, res) => {
    try {
      const { 
        name, 
        email, 
        attending, 
        guests, 
        allergies, 
        other_allergies, 
        song, 
        transport, 
        message,
        location
      } = req.body;

      const stmt = db.prepare(`
        INSERT INTO rsvps (name, email, attending, guests, allergies, other_allergies, song, transport, message, location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        name, 
        email, 
        attending, 
        guests, 
        JSON.stringify(allergies), 
        other_allergies, 
        song, 
        transport, 
        message,
        location ? JSON.stringify(location) : null
      );

      res.status(201).json({ success: true, message: "RSVP received! Thank you." });
    } catch (error) {
      console.error("RSVP Error:", error);
      res.status(500).json({ success: false, message: "Failed to save RSVP." });
    }
  });

  // Get all RSVPs (protected)
  app.get("/api/admin/rsvps", adminAuth, (req, res) => {
    const rows = db.prepare("SELECT * FROM rsvps ORDER BY created_at DESC").all();
    res.json(rows);
  });

  // Delete an RSVP (protected)
  app.delete("/api/admin/rsvps/:id", adminAuth, (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM rsvps WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
