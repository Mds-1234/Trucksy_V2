import test from "node:test";
import assert from "node:assert/strict";
import {
  getRouteMineFilter,
  getShipmentMineFilter,
  isRouteActive,
  isShipmentActive,
  filterActiveRoutes,
  filterActiveShipments
} from "../utils/scope.js";

test("scope - getRouteMineFilter returns active filter by default", () => {
  const filter = getRouteMineFilter("driver123");
  assert.deepEqual(filter, {
    driver: "driver123",
    status: { $in: ["open", "in_progress"] }
  });
});

test("scope - getRouteMineFilter returns all items when scope is all", () => {
  const filter = getRouteMineFilter("driver123", "all");
  assert.deepEqual(filter, {
    driver: "driver123"
  });
});

test("scope - getShipmentMineFilter returns active filter by default", () => {
  const filter = getShipmentMineFilter("biz123");
  assert.deepEqual(filter, {
    business: "biz123",
    status: { $in: ["open", "booked"] }
  });
});

test("scope - getShipmentMineFilter returns all items when scope is all", () => {
  const filter = getShipmentMineFilter("biz123", "all");
  assert.deepEqual(filter, {
    business: "biz123"
  });
});

test("scope - isRouteActive identifies open and in_progress as active", () => {
  assert.equal(isRouteActive("open"), true);
  assert.equal(isRouteActive("in_progress"), true);
  assert.equal(isRouteActive("completed"), false);
  assert.equal(isRouteActive("cancelled"), false);
});

test("scope - isShipmentActive identifies open and booked as active", () => {
  assert.equal(isShipmentActive("open"), true);
  assert.equal(isShipmentActive("booked"), true);
  assert.equal(isShipmentActive("delivered"), false);
  assert.equal(isShipmentActive("cancelled"), false);
});

test("scope - filterActiveRoutes keeps only active routes", () => {
  const routes = [
    { id: "1", status: "open" },
    { id: "2", status: "in_progress" },
    { id: "3", status: "completed" },
    { id: "4", status: "cancelled" }
  ];
  const filtered = filterActiveRoutes(routes);
  assert.equal(filtered.length, 2);
  assert.deepEqual(filtered.map((r) => r.id), ["1", "2"]);
});

test("scope - filterActiveShipments keeps only active shipments", () => {
  const shipments = [
    { id: "1", status: "open" },
    { id: "2", status: "booked" },
    { id: "3", status: "delivered" },
    { id: "4", status: "cancelled" }
  ];
  const filtered = filterActiveShipments(shipments);
  assert.equal(filtered.length, 2);
  assert.deepEqual(filtered.map((s) => s.id), ["1", "2"]);
});
