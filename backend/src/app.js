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

app.use(
  cors({
    origin: env.CLIENT_URL,
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
