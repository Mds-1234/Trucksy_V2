import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    if (typeof res.status === "function") {
      return res.status(500).json({ error: { message: "Database unavailable" } });
    }
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: { message: "Database unavailable" } }));
  }
  return app(req, res);
}
