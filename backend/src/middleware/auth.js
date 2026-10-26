import { verifyToken } from "../utils/token.js";
import { User } from "../models/User.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
        details: "Missing or malformed Bearer token"
      }
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: {
          message: "User not found",
          details: "The account associated with this token no longer exists"
        }
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        message: "Invalid or expired token",
        details: err.message
      }
    });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        error: {
          message: "Forbidden",
          details: `Access restricted to ${role}`
        }
      });
    }
    next();
  };
};
