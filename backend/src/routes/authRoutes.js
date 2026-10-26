import { Router } from "express";
import { User } from "../models/User.js";
import { generateToken } from "../utils/token.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { name, contact, email, password, role } = req.body;

    if (!name || !contact || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
        error: { message: "All fields are required" }
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
        error: { message: "Password must be at least 8 characters" }
      });
    }

    if (!["driver", "business"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'driver' or 'business'",
        error: { message: "Role must be either 'driver' or 'business'" }
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        message: "Email already registered",
        error: {
          message: "Email already registered",
          details: "An account with this email address already exists"
        }
      });
    }

    const user = await User.create({
      name: name.trim(),
      contact: contact.trim(),
      email: normalizedEmail,
      password,
      role
    });

    const token = generateToken({ id: user.id, role: user.role });

    return res.status(201).json({
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        error: { message: "Email and password are required" }
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        error: {
          message: "Invalid email or password",
          details: "The provided credentials do not match our records"
        }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        error: {
          message: "Invalid email or password",
          details: "The provided credentials do not match our records"
        }
      });
    }

    const token = generateToken({ id: user.id, role: user.role });
    const userJson = user.toJSON();

    return res.status(200).json({
      token,
      user: userJson
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, async (req, res) => {
  return res.status(200).json(req.user);
});

export default router;
