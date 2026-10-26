import { Router } from "express";
import { Shipment } from "../models/Shipment.js";
import { Route } from "../models/Route.js";
import { Booking } from "../models/Booking.js";
import { findMatches, countMatchesForRoutes } from "../utils/matching.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", requireRole("business"), async (req, res, next) => {
  try {
    const shipments = await Shipment.find({ business: req.user.id, status: "open" });
    if (shipments.length === 0) {
      return res.status(200).json([]);
    }

    const routes = await Route.find({ status: "open" }).populate("driver", "name contact");
    const activeBookings = await Booking.find({ status: { $in: ["pending", "accepted"] } });

    const matches = findMatches(shipments, routes, activeBookings);
    return res.status(200).json(matches);
  } catch (err) {
    next(err);
  }
});

router.get("/summary", requireRole("driver"), async (req, res, next) => {
  try {
    const routes = await Route.find({ driver: req.user.id, status: "open" });
    if (routes.length === 0) {
      return res.status(200).json({ count: 0 });
    }

    const shipments = await Shipment.find({ status: "open" });
    const activeBookings = await Booking.find({ status: { $in: ["pending", "accepted"] } });

    const count = countMatchesForRoutes(routes, shipments, activeBookings);
    return res.status(200).json({ count });
  } catch (err) {
    next(err);
  }
});

export default router;
