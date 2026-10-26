import { Router } from "express";
import { User } from "../models/User.js";
import { generateToken } from "../utils/token.js";
import { signupSchema, loginSchema } from "../schemas/validation.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const validated = signupSchema.parse(req.body);
    const existing = await User.findOne({ email: validated.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        error: {
          message: "Email already registered",
          details: "An account with this email address already exists"
        }
      });
    }

    const user = await User.create(validated);
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
    const validated = loginSchema.parse(req.body);
    const user = await User.findOne({ email: validated.email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        error: {
          message: "Invalid email or password",
          details: "The provided credentials do not match our records"
        }
      });
    }

    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      return res.status(401).json({
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
