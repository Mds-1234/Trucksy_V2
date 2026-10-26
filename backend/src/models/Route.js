import mongoose from "mongoose";
import { normaliseCity } from "../utils/normalise.js";

const segmentRemainingSchema = new mongoose.Schema(
  {
    weight: {
      type: Number,
      required: true,
      min: 0
    },
    space: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    driver: {
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
    stops: {
      type: [String],
      default: []
    },
    pathKeys: {
      type: [String],
      default: []
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    endDate: {
      type: String,
      required: [true, "Trip end date is required"],
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    capacity: {
      type: Number,
      required: true,
      min: 0
    },
    space: {
      type: Number,
      required: true,
      min: 0
    },
    segmentRemaining: {
      type: [segmentRemainingSchema],
      default: []
    },
    completedStops: {
      type: [Number],
      default: []
    },
    status: {
      type: String,
      required: true,
      enum: ["open", "in_progress", "completed", "cancelled"],
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

routeSchema.index({ status: 1, date: 1, pathKeys: 1 });

routeSchema.pre("validate", function (next) {
  if (!this.endDate) {
    return next(new Error("Trip end date is required"));
  }
  if (this.endDate < this.date) {
    return next(new Error("Trip end date cannot be earlier than start date"));
  }

  const normFrom = normaliseCity(this.from);
  const normTo = normaliseCity(this.to);

  if (!normFrom || !normTo) {
    return next(new Error("Origin and destination cities cannot be empty"));
  }
  if (normFrom === normTo) {
    return next(new Error("Origin and destination cannot be identical"));
  }
  if (this.stops && this.stops.length > 10) {
    return next(new Error("Stops cannot exceed 10"));
  }

  const rawStops = this.stops || [];
  for (const stop of rawStops) {
    if (!normaliseCity(stop)) {
      return next(new Error("Stop names cannot be empty"));
    }
  }

  this.pathKeys = [normFrom, ...rawStops.map(normaliseCity), normTo];

  const segmentCount = this.pathKeys.length - 1;
  if (!this.segmentRemaining || this.segmentRemaining.length === 0) {
    this.segmentRemaining = Array.from({ length: segmentCount }, () => ({
      weight: Number(this.capacity) || 0,
      space: Number(this.space) || 0
    }));
  }
  next();
});

export const Route = mongoose.model("Route", routeSchema);
