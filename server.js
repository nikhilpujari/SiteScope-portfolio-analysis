import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import fetch from "node-fetch";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("analytics.db");

db.run(`CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hashed_id TEXT,
  ip TEXT,
  country TEXT,
  city TEXT,
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  screen TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.post("/track", async (req, res) => {
  console.log("[TRACK]", req.body);

  const ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";
  const { url, referrer, ua, screen } = req.body;
  const hashed_id = crypto
    .createHash("sha256")
    .update(ip + ua)
    .digest("hex");

  let country = "Unknown",
    city = "Unknown";
  try {
    const geo = await fetch(`https://ipapi.co/${ip}/json`).then((res) =>
      res.json()
    );
    country = geo?.country_name || country;
    city = geo?.city || city;
  } catch {}

  db.run(
    `INSERT INTO visits (hashed_id, ip, country, city, url, referrer, user_agent, screen)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [hashed_id, ip, country, city, url, referrer, ua, screen]
  );

  res.sendStatus(200);
});

app.get("/analytics", (req, res) => {
  db.all(`SELECT * FROM visits ORDER BY timestamp DESC`, (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.get("/stats", (req, res) => {
  try {
    db.serialize(() => {
      db.get(`SELECT COUNT(*) as total_views FROM visits`, (err, total) => {
        if (err || !total)
          return res.status(500).send(err?.message || "Total view error");

        db.get(
          `SELECT COUNT(DISTINCT hashed_id) as unique_visitors FROM visits`,
          (err, unique) => {
            if (err || !unique)
              return res
                .status(500)
                .send(err?.message || "Unique visitor error");

            db.all(
              `SELECT url, COUNT(*) as views FROM visits GROUP BY url ORDER BY views DESC LIMIT 5`,
              (err, topPages = []) => {
                if (err) topPages = [];

                db.all(
                  `SELECT referrer, COUNT(*) as count FROM visits WHERE referrer != '' GROUP BY referrer ORDER BY count DESC LIMIT 5`,
                  (err, referrers = []) => {
                    if (err) referrers = [];

                    db.all(
                      `SELECT country, city, COUNT(*) as views FROM visits WHERE country != 'Unknown' GROUP BY country, city ORDER BY views DESC LIMIT 5`,
                      (err, locations = []) => {
                        if (err) locations = [];

                        const result = {
                          total_views: total.total_views,
                          unique_visitors: unique.unique_visitors,
                          top_pages: topPages || [],
                          referrers: referrers || [],
                          top_locations: locations || [],
                        };

                        console.log("[STATS]", result);
                        res.json(result);
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  } catch (e) {
    res.status(500).send("Unexpected error in stats.");
  }
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(express.static(path.join(__dirname, 'public')));

app.use("/track.js", express.static(path.join(__dirname, "track.js")));

app.listen(3000, () => console.log("Analytics server running on port 3000"));
