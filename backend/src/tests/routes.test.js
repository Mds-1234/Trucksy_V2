import test from "node:test";
import assert from "node:assert/strict";
import { Route } from "../models/Route.js";

test("route - defaults endDate to date when not provided", async () => {
  const route = new Route({
    from: "Delhi",
    to: "Jaipur",
    date: "2026-11-20",
    capacity: 2000,
    space: 20,
    driver: "507f1f77bcf86cd799439011"
  });

  await route.validate();
  assert.equal(route.endDate, "2026-11-20");
});

test("route - rejects endDate earlier than departure date", async () => {
  const route = new Route({
    from: "Delhi",
    to: "Jaipur",
    date: "2026-11-20",
    endDate: "2026-11-19",
    capacity: 2000,
    space: 20,
    driver: "507f1f77bcf86cd799439011"
  });

  let error;
  try {
    await route.validate();
  } catch (err) {
    error = err;
  }
  assert.ok(error);
  assert.match(error.message, /Trip end date cannot be earlier than start date/);
});

test("route - accepts valid endDate later than start date", async () => {
  const route = new Route({
    from: "Delhi",
    to: "Jaipur",
    date: "2026-11-20",
    endDate: "2026-11-22",
    capacity: 2000,
    space: 20,
    driver: "507f1f77bcf86cd799439011"
  });

  await route.validate();
  assert.equal(route.endDate, "2026-11-22");
});
