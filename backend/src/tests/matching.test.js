import test from "node:test";
import assert from "node:assert/strict";
import { checkRouteShipmentMatch, findMatches, hasActiveBooking } from "../utils/matching.js";

test("matching - accepts valid path order", () => {
  const route = {
    status: "open",
    date: "2026-11-01",
    pathKeys: ["delhi", "agra", "jaipur"],
    segmentRemaining: [
      { weight: 2000, space: 20 },
      { weight: 2000, space: 20 }
    ]
  };

  const shipment = {
    status: "open",
    date: "2026-11-01",
    fromKey: "delhi",
    toKey: "jaipur",
    weight: 500,
    space: 5
  };

  const result = checkRouteShipmentMatch(route, shipment);
  assert.equal(result.isMatch, true);
  assert.equal(result.fromIdx, 0);
  assert.equal(result.toIdx, 2);
});

test("matching - rejects wrong path order", () => {
  const route = {
    status: "open",
    date: "2026-11-01",
    pathKeys: ["delhi", "agra", "jaipur"],
    segmentRemaining: [
      { weight: 2000, space: 20 },
      { weight: 2000, space: 20 }
    ]
  };

  const shipment = {
    status: "open",
    date: "2026-11-01",
    fromKey: "jaipur",
    toKey: "delhi",
    weight: 500,
    space: 5
  };

  const result = checkRouteShipmentMatch(route, shipment);
  assert.equal(result.isMatch, false);
  assert.equal(result.reason, "Invalid path order");
});

test("matching - checks capacity per segment along the journey", () => {
  const route = {
    status: "open",
    date: "2026-11-01",
    pathKeys: ["delhi", "agra", "jaipur"],
    segmentRemaining: [
      { weight: 1000, space: 10 },
      { weight: 300, space: 10 }
    ]
  };

  const shipment = {
    status: "open",
    date: "2026-11-01",
    fromKey: "delhi",
    toKey: "jaipur",
    weight: 500,
    space: 5
  };

  const result = checkRouteShipmentMatch(route, shipment);
  assert.equal(result.isMatch, false);
  assert.equal(result.reason, "Insufficient segment weight");
});

test("matching - rejects date mismatch", () => {
  const route = {
    status: "open",
    date: "2026-11-01",
    pathKeys: ["delhi", "agra"],
    segmentRemaining: [{ weight: 1000, space: 10 }]
  };

  const shipment = {
    status: "open",
    date: "2026-11-02",
    fromKey: "delhi",
    toKey: "agra",
    weight: 100,
    space: 1
  };

  const result = checkRouteShipmentMatch(route, shipment);
  assert.equal(result.isMatch, false);
  assert.equal(result.reason, "Date mismatch");
});

test("matching - normalises city case and inner whitespace", () => {
  const route = {
    status: "open",
    date: "2026-11-01",
    from: " New   Delhi ",
    stops: [" Agra  Cantt "],
    to: "Jaipur",
    segmentRemaining: [
      { weight: 1000, space: 10 },
      { weight: 1000, space: 10 }
    ]
  };

  const shipment = {
    status: "open",
    date: "2026-11-01",
    from: "new delhi",
    to: "agra cantt",
    weight: 200,
    space: 2
  };

  const result = checkRouteShipmentMatch(route, shipment);
  assert.equal(result.isMatch, true);
  assert.equal(result.fromIdx, 0);
  assert.equal(result.toIdx, 1);
});

test("matching - permits shipment with space 0", () => {
  const route = {
    status: "open",
    date: "2026-11-01",
    pathKeys: ["delhi", "agra"],
    segmentRemaining: [{ weight: 1000, space: 0 }]
  };

  const shipment = {
    status: "open",
    date: "2026-11-01",
    fromKey: "delhi",
    toKey: "agra",
    weight: 200,
    space: 0
  };

  const result = checkRouteShipmentMatch(route, shipment);
  assert.equal(result.isMatch, true);
});

test("matching - filters out active bookings", () => {
  const bookings = [
    {
      route: "route1",
      shipment: "ship1",
      status: "pending"
    }
  ];

  assert.equal(hasActiveBooking("route1", "ship1", bookings), true);
  assert.equal(hasActiveBooking("route1", "ship2", bookings), false);

  const shipments = [
    {
      id: "ship1",
      status: "open",
      date: "2026-11-01",
      fromKey: "delhi",
      toKey: "agra",
      weight: 100,
      space: 1
    }
  ];

  const routes = [
    {
      id: "route1",
      status: "open",
      date: "2026-11-01",
      pathKeys: ["delhi", "agra"],
      segmentRemaining: [{ weight: 1000, space: 10 }]
    }
  ];

  const matches = findMatches(shipments, routes, bookings);
  assert.equal(matches.length, 0);
});
