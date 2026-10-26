import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true
    },
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    fromIdx: {
      type: Number,
      required: true,
      min: 0
    },
    toIdx: {
      type: Number,
      required: true,
      min: 1
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
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending"
    },
    deliveryReached: {
      type: Boolean,
      default: false
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

bookingSchema.index(
  { route: 1, shipment: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "accepted"] }
    }
  }
);

bookingSchema.post("init", function () {
  this.$locals.originalStatus = this.status;
});

bookingSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("status")) {
    const originalStatus = this.$locals?.originalStatus;
    if (originalStatus) {
      const allowedTransitions = {
        pending: ["accepted", "rejected", "cancelled"],
        accepted: ["completed"],
        rejected: [],
        completed: [],
        cancelled: []
      };
      const allowed = allowedTransitions[originalStatus] || [];
      if (!allowed.includes(this.status)) {
        const error = new Error(`Illegal booking status transition from ${originalStatus} to ${this.status}`);
        error.statusCode = 409;
        return next(error);
      }
    }
  }
  next();
});

export const Booking = mongoose.model("Booking", bookingSchema);
