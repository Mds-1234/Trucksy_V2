import { Router } from "express";
import { Shipment } from "../models/Shipment.js";
import { Booking } from "../models/Booking.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { getShipmentMineFilter } from "../utils/scope.js";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("business"), async (req, res, next) => {
  try {
    const { from, to, date, weight, space } = req.body;

    if (!from || !to || !date || weight === undefined || space === undefined) {
      return res.status(400).json({
        message: "All fields are required",
        error: { message: "All fields are required" }
      });
    }

    const parsedWeight = Number(weight);
    const parsedSpace = Number(space);

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({
        message: "Weight must be greater than 0",
        error: { message: "Weight must be greater than 0" }
      });
    }

    if (isNaN(parsedSpace) || parsedSpace < 0) {
      return res.status(400).json({
        message: "Space must be a non-negative number",
        error: { message: "Space must be a non-negative number" }
      });
    }

    const shipment = await Shipment.create({
      from: from.trim(),
      to: to.trim(),
      date,
      weight: parsedWeight,
      space: parsedSpace,
      business: req.user.id
    });

    return res.status(201).json(shipment);
  } catch (err) {
    next(err);
  }
});

router.get("/mine", requireRole("business"), async (req, res, next) => {
  try {
    const filter = getShipmentMineFilter(req.user.id, req.query.scope);
    const shipments = await Shipment.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(shipments);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRole("business"), async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        message: "Shipment not found",
        error: {
          message: "Shipment not found"
        }
      });
    }

    if (shipment.business.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden",
        error: {
          message: "Forbidden",
          details: "You do not own this shipment"
        }
      });
    }

    if (shipment.status !== "open") {
      return res.status(409).json({
        message: "Only shipments with status open can be deleted",
        error: {
          message: "Only shipments with status open can be deleted",
          details: `Shipment status is ${shipment.status}`
        }
      });
    }

    const activeBooking = await Booking.findOne({
      shipment: shipment._id,
      status: { $in: ["pending", "accepted"] }
    });

    if (activeBooking) {
      return res.status(409).json({
        message: "Cannot delete shipment with active bookings",
        error: {
          message: "Cannot delete shipment with active bookings",
          details: "There are pending or accepted bookings associated with this shipment. Cancel them first."
        }
      });
    }

    await Shipment.findByIdAndDelete(shipment._id);
    return res.status(200).json({ message: "Shipment deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
