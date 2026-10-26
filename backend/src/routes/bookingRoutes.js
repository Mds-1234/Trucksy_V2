import { Router } from "express";
import { Booking } from "../models/Booking.js";
import { Route } from "../models/Route.js";
import { Shipment } from "../models/Shipment.js";
import { createBookingSchema } from "../schemas/validation.js";
import { checkRouteShipmentMatch } from "../utils/matching.js";
import { buildCapacityFilterAndUpdate } from "../utils/capacity.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("business"), async (req, res, next) => {
  try {
    const validated = createBookingSchema.parse(req.body);

    const shipment = await Shipment.findById(validated.shipmentId);
    if (!shipment) {
      return res.status(404).json({
        error: {
          message: "Shipment not found"
        }
      });
    }

    if (shipment.business.toString() !== req.user.id) {
      return res.status(403).json({
        error: {
          message: "Forbidden",
          details: "You do not own this shipment"
        }
      });
    }

    if (shipment.status !== "open") {
      return res.status(409).json({
        error: {
          message: "Shipment is not open for booking",
          details: `Current shipment status is ${shipment.status}`
        }
      });
    }

    const route = await Route.findById(validated.routeId);
    if (!route) {
      return res.status(404).json({
        error: {
          message: "Route not found"
        }
      });
    }

    if (route.status !== "open") {
      return res.status(409).json({
        error: {
          message: "Route is not open for booking",
          details: `Current route status is ${route.status}`
        }
      });
    }

    const existingBooking = await Booking.findOne({
      route: route._id,
      shipment: shipment._id,
      status: { $in: ["pending", "accepted"] }
    });

    if (existingBooking) {
      return res.status(409).json({
        error: {
          message: "Booking already exists",
          details: "A booking request for this route and shipment is already active"
        }
      });
    }

    const matchResult = checkRouteShipmentMatch(route, shipment);
    if (!matchResult.isMatch) {
      return res.status(409).json({
        error: {
          message: "Shipment does not match route criteria",
          details: matchResult.reason
        }
      });
    }

    const booking = await Booking.create({
      route: route._id,
      shipment: shipment._id,
      driver: route.driver,
      business: req.user.id,
      fromIdx: matchResult.fromIdx,
      toIdx: matchResult.toIdx,
      weight: shipment.weight,
      space: shipment.space,
      status: "pending",
      deliveryReached: false
    });

    const populated = await Booking.findById(booking._id)
      .populate("route")
      .populate("shipment")
      .populate("driver", "name contact email")
      .populate("business", "name contact email");

    return res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

router.get("/mine", async (req, res, next) => {
  try {
    const query = req.user.role === "driver"
      ? { driver: req.user.id }
      : { business: req.user.id };

    const bookings = await Booking.find(query)
      .populate("route")
      .populate("shipment")
      .populate("driver", "name contact email")
      .populate("business", "name contact email")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/accept", requireRole("driver"), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found"
        }
      });
    }

    if (booking.driver.toString() !== req.user.id) {
      return res.status(403).json({
        error: {
          message: "Forbidden",
          details: "You do not own the route for this booking"
        }
      });
    }

    if (booking.status !== "pending") {
      return res.status(409).json({
        error: {
          message: "Illegal transition",
          details: `Cannot accept booking with status ${booking.status}`
        }
      });
    }

    const { filter, update } = buildCapacityFilterAndUpdate(
      booking.route,
      booking.fromIdx,
      booking.toIdx,
      booking.weight,
      booking.space
    );

    const updatedRoute = await Route.findOneAndUpdate(filter, update, { new: true });
    if (!updatedRoute) {
      booking.status = "rejected";
      await booking.save();

      return res.status(409).json({
        error: {
          message: "Insufficient capacity on route segments",
          details: "The booking was rejected because required segment capacity is no longer available"
        }
      });
    }

    booking.status = "accepted";
    await booking.save();

    await Shipment.findByIdAndUpdate(booking.shipment, { status: "booked" });

    const populated = await Booking.findById(booking._id)
      .populate("route")
      .populate("shipment")
      .populate("driver", "name contact email")
      .populate("business", "name contact email");

    return res.status(200).json({
      message: "Booking accepted successfully",
      booking: populated
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/reject", requireRole("driver"), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found"
        }
      });
    }

    if (booking.driver.toString() !== req.user.id) {
      return res.status(403).json({
        error: {
          message: "Forbidden",
          details: "You do not own the route for this booking"
        }
      });
    }

    if (booking.status !== "pending") {
      return res.status(409).json({
        error: {
          message: "Illegal transition",
          details: `Cannot reject booking with status ${booking.status}`
        }
      });
    }

    booking.status = "rejected";
    await booking.save();

    return res.status(200).json({
      message: "Booking rejected",
      booking
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/cancel", requireRole("business"), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found"
        }
      });
    }

    if (booking.business.toString() !== req.user.id) {
      return res.status(403).json({
        error: {
          message: "Forbidden",
          details: "You do not own this booking"
        }
      });
    }

    if (booking.status !== "pending") {
      return res.status(409).json({
        error: {
          message: "Illegal transition",
          details: `Cannot cancel booking with status ${booking.status}`
        }
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled",
      booking
    });
  } catch (err) {
    next(err);
  }
});

export default router;
