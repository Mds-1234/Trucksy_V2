import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Validation error",
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message
        }))
      }
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: {
        message: "Validation error",
        details: err.message
      }
    });
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || {}).join(", ") || "field";
    return res.status(409).json({
      error: {
        message: "Duplicate entry",
        details: `A record with this ${fields} already exists`
      }
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: {
        message: "Invalid ID format",
        details: `Invalid ${err.path}: ${err.value}`
      }
    });
  }

  if (err.statusCode || err.status) {
    const statusCode = err.statusCode || err.status;
    return res.status(statusCode).json({
      error: {
        message: err.message || "Request failed",
        details: err.details
      }
    });
  }

  return res.status(500).json({
    error: {
      message: "Internal server error"
    }
  });
};
