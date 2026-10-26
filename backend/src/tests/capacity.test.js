import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { applyCapacityDecrement, buildCapacityFilterAndUpdate } from "../utils/capacity.js";
import { Route } from "../models/Route.js";

test("capacity - second accept is rejected when first accept consumes last capacity", () => {
  const initialSegments = [
    { weight: 1000, space: 10 },
    { weight: 1000, space: 10 }
  ];

  const firstAccept = applyCapacityDecrement(initialSegments, 0, 2, 1000, 10);
  assert.ok(firstAccept !== null);
  assert.equal(firstAccept[0].weight, 0);
  assert.equal(firstAccept[0].space, 0);
  assert.equal(firstAccept[1].weight, 0);
  assert.equal(firstAccept[1].space, 0);

  const secondAccept = applyCapacityDecrement(firstAccept, 0, 1, 100, 1);
  assert.equal(secondAccept, null);
});

test("capacity - builds exact atomic filter and inc for multi-segment route", () => {
  const routeId = new mongoose.Types.ObjectId();
  const { filter, update } = buildCapacityFilterAndUpdate(routeId, 1, 3, 400, 4);

  assert.equal(filter._id, routeId);
  assert.deepEqual(filter["segmentRemaining.1.weight"], { $gte: 400 });
  assert.deepEqual(filter["segmentRemaining.1.space"], { $gte: 4 });
  assert.deepEqual(filter["segmentRemaining.2.weight"], { $gte: 400 });
  assert.deepEqual(filter["segmentRemaining.2.space"], { $gte: 4 });

  assert.equal(update.$inc["segmentRemaining.1.weight"], -400);
  assert.equal(update.$inc["segmentRemaining.1.space"], -4);
  assert.equal(update.$inc["segmentRemaining.2.weight"], -400);
  assert.equal(update.$inc["segmentRemaining.2.space"], -4);
});

test("capacity - atomic findOneAndUpdate race condition integration test", async (t) => {
  const testUri = process.env.MONGODB_URI_TEST;
  if (!testUri) {
    t.skip("MONGODB_URI_TEST not set, skipping database integration test");
    return;
  }

  await mongoose.connect(testUri);

  const dummyDriverId = new mongoose.Types.ObjectId();
  const route = await Route.create({
    driver: dummyDriverId,
    from: "Delhi",
    to: "Mumbai",
    stops: ["Jaipur"],
    date: "2026-12-01",
    capacity: 500,
    space: 5
  });

  const { filter: f1, update: u1 } = buildCapacityFilterAndUpdate(route._id, 0, 2, 500, 5);
  const { filter: f2, update: u2 } = buildCapacityFilterAndUpdate(route._id, 0, 2, 500, 5);

  const [res1, res2] = await Promise.all([
    Route.findOneAndUpdate(f1, u1, { new: true }),
    Route.findOneAndUpdate(f2, u2, { new: true })
  ]);

  const successCount = (res1 ? 1 : 0) + (res2 ? 1 : 0);
  assert.equal(successCount, 1);

  await Route.findByIdAndDelete(route._id);
  await mongoose.disconnect();
});
