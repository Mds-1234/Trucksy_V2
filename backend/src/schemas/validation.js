import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  contact: z.string().trim().min(1, "Contact is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["driver", "business"], {
    errorMap: () => ({ message: "Role must be either 'driver' or 'business'" })
  })
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export const createRouteSchema = z.object({
  from: z.string().trim().min(1, "Origin city is required"),
  to: z.string().trim().min(1, "Destination city is required"),
  stops: z.array(z.string().trim().min(1, "Stop city cannot be empty")).max(10, "Stops cannot exceed 10").optional().default([]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  capacity: z.coerce.number().positive("Capacity must be greater than 0"),
  space: z.coerce.number().nonnegative("Space must be a non-negative number")
});

export const createShipmentSchema = z.object({
  from: z.string().trim().min(1, "Origin city is required"),
  to: z.string().trim().min(1, "Destination city is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  weight: z.coerce.number().positive("Weight must be greater than 0"),
  space: z.coerce.number().nonnegative("Space must be a non-negative number")
});

export const createBookingSchema = z.object({
  routeId: z.string().trim().min(1, "routeId is required"),
  shipmentId: z.string().trim().min(1, "shipmentId is required")
});
