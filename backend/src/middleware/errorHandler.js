export const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      error: {
        message: "Validation error",
        details: err.message
      }
    });
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern || {}).join(", ") || "field";
    return res.status(409).json({
      message: "Duplicate entry",
      error: {
        message: "Duplicate entry",
        details: `A record with this ${fields} already exists`
      }
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
      error: {
        message: "Invalid ID format",
        details: `Invalid ${err.path}: ${err.value}`
      }
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? "Internal server error" : (err.message || "Request failed");

  return res.status(statusCode).json({
    message,
    error: {
      message,
      details: err.details
    }
  });
};
