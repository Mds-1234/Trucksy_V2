import { Router } from "express";
import { Shipment } from "../models/Shipment.js";
import { Booking } from "../models/Booking.js";
import { createShipmentSchema } from "../schemas/validation.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", requireRole("business"), async (req, res, next) => {
  try {
    const validated = createShipmentSchema.parse(req.body);
    const shipment = await Shipment.create({
      ...validated,
      business: req.user.id
    });
    return res.status(201).json(shipment);
  } catch (err) {
    next(err);
  }
});

router.get("/mine", requireRole("business"), async (req, res, next) => {
  try {
    const shipments = await Shipment.find({ business: req.user.id }).sort({ createdAt: -1 });
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

    const activeBooking = await Booking.findOne({
      shipment: shipment._id,
      status: { $in: ["pending", "accepted"] }
    });

    if (activeBooking) {
      return res.status(409).json({
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
