import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const configuredOrigins = env.CLIENT_URL
  ? env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json());

app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/bookings", bookingRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Resource not found",
    error: {
      message: "Resource not found",
      details: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

app.use(errorHandler);

export default app;
