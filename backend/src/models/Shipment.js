import mongoose from "mongoose";
import { normaliseCity } from "../utils/normalise.js";

const shipmentSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    from: {
      type: String,
      required: true,
      trim: true
    },
    to: {
      type: String,
      required: true,
      trim: true
    },
    fromKey: {
      type: String,
      required: true
    },
    toKey: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    weight: {
      type: Number,
      required: true,
      min: 0
    },
    space: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "booked", "delivered", "cancelled"],
      default: "open"
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

shipmentSchema.pre("validate", function (next) {
  const normFrom = normaliseCity(this.from);
  const normTo = normaliseCity(this.to);

  if (!normFrom || !normTo) {
    return next(new Error("Origin and destination cities cannot be empty"));
  }
  if (normFrom === normTo) {
    return next(new Error("Origin and destination cannot be identical"));
  }

  this.fromKey = normFrom;
  this.toKey = normTo;
  next();
});

export const Shipment = mongoose.model("Shipment", shipmentSchema);
