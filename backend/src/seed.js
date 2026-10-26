import mongoose from "mongoose";
import { env } from "./config/env.js";
import { User } from "./models/User.js";
import { Route } from "./models/Route.js";
import { Shipment } from "./models/Shipment.js";
import { Booking } from "./models/Booking.js";

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    await Booking.deleteMany({});
    await Route.deleteMany({});
    await Shipment.deleteMany({});
    await User.deleteMany({});

    const driver1 = await User.create({
      name: "Rajesh Kumar (Driver)",
      email: "rajesh@trucksy.demo",
      contact: "+91 98765 43210",
      password: "Password123",
      role: "driver"
    });

    const driver2 = await User.create({
      name: "Amit Singh (Driver)",
      email: "amit@trucksy.demo",
      contact: "+91 98111 22233",
      password: "Password123",
      role: "driver"
    });

    const business1 = await User.create({
      name: "Metro Retailers (Business)",
      email: "metro@trucksy.demo",
      contact: "+91 99222 33445",
      password: "Password123",
      role: "business"
    });

    const business2 = await User.create({
      name: "Apex Logistics Ltd (Business)",
      email: "apex@trucksy.demo",
      contact: "+91 99333 44556",
      password: "Password123",
      role: "business"
    });

    const targetDate = "2026-11-15";
    const targetEndDate = "2026-11-16";

    await Route.create({
      driver: driver1._id,
      from: "Delhi",
      to: "Jaipur",
      stops: ["Gurgaon", "Kotputli"],
      date: targetDate,
      endDate: targetEndDate,
      capacity: 1000,
      space: 10,
      status: "open"
    });

    await Route.create({
      driver: driver2._id,
      from: "Mumbai",
      to: "Pune",
      stops: ["Navi Mumbai", "Lonavala"],
      date: targetDate,
      endDate: targetEndDate,
      capacity: 2500,
      space: 25,
      status: "open"
    });

    await Shipment.create({
      business: business1._id,
      from: "Delhi",
      to: "Jaipur",
      date: targetDate,
      weight: 700,
      space: 7,
      status: "open"
    });

    await Shipment.create({
      business: business2._id,
      from: "Delhi",
      to: "Jaipur",
      date: targetDate,
      weight: 600,
      space: 6,
      status: "open"
    });

    await Shipment.create({
      business: business2._id,
      from: "Mumbai",
      to: "Pune",
      date: targetDate,
      weight: 1200,
      space: 12,
      status: "open"
    });

    console.log("Database seeded successfully!");
    console.log("-----------------------------------------");
    console.log("DEMO CREDENTIALS (password: Password123):");
    console.log("Driver 1: rajesh@trucksy.demo");
    console.log("Driver 2: amit@trucksy.demo");
    console.log("Business 1: metro@trucksy.demo");
    console.log("Business 2: apex@trucksy.demo");
    console.log("-----------------------------------------");
    console.log("Capacity Race Demo Setup:");
    console.log("Route capacity: 1000kg. Shipment 1: 700kg. Shipment 2: 600kg.");
    console.log("Both match initially. Accepting Shipment 1 leaves 300kg, causing Shipment 2 accept to be rejected with 409.");
    console.log("-----------------------------------------");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
