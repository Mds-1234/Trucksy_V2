import { Router } from "express";
import { Route } from "../models/Route.js";
import { Booking } from "../models/Booking.js";
import { Shipment } from "../models/Shipment.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { getRouteMineFilter } from "../utils/scope.js";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("driver"), async (req, res, next) => {
  try {
    const existingActiveRoute = await Route.findOne({
      driver: req.user.id,
      status: { $in: ["open", "in_progress"] }
    });

    if (existingActiveRoute) {
      return res.status(409).json({
        message: "A driver can only do one trip at a time. Please complete your current trip first.",
        error: {
          message: "A driver can only do one trip at a time. Please complete your current trip first.",
          details: `Active trip: ${existingActiveRoute.from} ➔ ${existingActiveRoute.to} (${existingActiveRoute.status})`
        }
      });
    }

    const { from, to, stops, date, endDate, capacity, space } = req.body;

    if (!from || !to || !date || !endDate || capacity === undefined || space === undefined) {
      return res.status(400).json({
        message: "All fields are required",
        error: { message: "All fields are required" }
      });
    }

    if (endDate < date) {
      return res.status(400).json({
        message: "Trip end date cannot be earlier than start date",
        error: { message: "Trip end date cannot be earlier than start date" }
      });
    }

    const parsedCapacity = Number(capacity);
    const parsedSpace = Number(space);

    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({
        message: "Capacity must be greater than 0",
        error: { message: "Capacity must be greater than 0" }
      });
    }

    if (isNaN(parsedSpace) || parsedSpace < 0) {
      return res.status(400).json({
        message: "Space must be a non-negative number",
        error: { message: "Space must be a non-negative number" }
      });
    }

    const cleanStops = Array.isArray(stops)
      ? stops.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean)
      : [];

    if (cleanStops.length > 10) {
      return res.status(400).json({
        message: "Stops cannot exceed 10",
        error: { message: "Stops cannot exceed 10" }
      });
    }

    const route = await Route.create({
      from: from.trim(),
      to: to.trim(),
      stops: cleanStops,
      date,
      endDate: endDate || date,
      capacity: parsedCapacity,
      space: parsedSpace,
      driver: req.user.id
    });

    return res.status(201).json(route);
  } catch (err) {
    next(err);
  }
});

router.get("/mine", requireRole("driver"), async (req, res, next) => {
  try {
    const filter = getRouteMineFilter(req.user.id, req.query.scope);
    const routes = await Route.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(routes);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole("driver"), async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        message: "Route not found",
        error: {
          message: "Route not found"
        }
      });
    }

    if (route.driver.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden",
        error: {
          message: "Forbidden",
          details: "You do not own this route"
        }
      });
    }

    if (route.status !== "open") {
      return res.status(409).json({
        message: "Only routes with status open can be deleted",
        error: {
          message: "Only routes with status open can be deleted",
          details: `Route status is ${route.status}`
        }
      });
    }

    const activeBooking = await Booking.findOne({
      route: route._id,
      status: { $in: ["pending", "accepted"] }
    });

    if (activeBooking) {
      return res.status(409).json({
        message: "Cannot delete route with active bookings",
        error: {
          message: "Cannot delete route with active bookings",
          details: "There are pending or accepted bookings associated with this route. Resolve or cancel them first."
        }
      });
    }

    await Route.findByIdAndDelete(route._id);
    return res.status(200).json({ message: "Route deleted successfully" });
  } catch (err) {
    next(err);
  }
});

router.post("/:routeId/stops/:index/complete", requireRole("driver"), async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.routeId);
    if (!route) {
      return res.status(404).json({
        message: "Route not found",
        error: {
          message: "Route not found"
        }
      });
    }

    if (route.driver.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden",
        error: {
          message: "Forbidden",
          details: "You do not own this route"
        }
      });
    }

    const stopIndex = parseInt(req.params.index, 10);
    if (isNaN(stopIndex) || stopIndex < 0 || stopIndex >= route.stops.length) {
      return res.status(400).json({
        message: "Invalid stop index",
        error: {
          message: "Invalid stop index",
          details: `Index must be between 0 and ${route.stops.length - 1}`
        }
      });
    }

    if (route.completedStops.includes(stopIndex)) {
      return res.status(200).json({
        message: "Stop already completed",
        route
      });
    }

    if (stopIndex !== route.completedStops.length) {
      return res.status(400).json({
        message: "Stops must be completed in order",
        error: {
          message: "Stops must be completed in order",
          details: `Next stop to complete is index ${route.completedStops.length}`
        }
      });
    }

    route.completedStops.push(stopIndex);
    if (route.status === "open") {
      route.status = "in_progress";
    }
    await route.save();

    const nodeIndexReached = stopIndex + 1;
    await Booking.updateMany(
      {
        route: route._id,
        status: "accepted",
        toIdx: nodeIndexReached
      },
      {
        deliveryReached: true
      }
    );

    return res.status(200).json({
      message: "Stop completed successfully",
      route
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:routeId/complete", requireRole("driver"), async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.routeId);
    if (!route) {
      return res.status(404).json({
        message: "Route not found",
        error: {
          message: "Route not found"
        }
      });
    }

    if (route.driver.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden",
        error: {
          message: "Forbidden",
          details: "You do not own this route"
        }
      });
    }

    if (route.completedStops.length !== route.stops.length) {
      return res.status(400).json({
        message: "All stops must be completed before completing the route",
        error: {
          message: "All stops must be completed before completing the route",
          details: `${route.stops.length - route.completedStops.length} intermediate stops remaining`
        }
      });
    }

    route.status = "completed";
    await route.save();

    const acceptedBookings = await Booking.find({ route: route._id, status: "accepted" });
    for (const booking of acceptedBookings) {
      booking.status = "completed";
      booking.deliveryReached = true;
      await booking.save();
      await Shipment.findByIdAndUpdate(booking.shipment, { status: "delivered" });
    }

    const pendingBookings = await Booking.find({ route: route._id, status: "pending" });
    for (const booking of pendingBookings) {
      booking.status = "rejected";
      await booking.save();
    }

    return res.status(200).json({
      message: "Route completed successfully",
      route
    });
  } catch (err) {
    next(err);
  }
});

export default router;
