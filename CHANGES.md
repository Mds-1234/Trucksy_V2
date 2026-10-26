# Project Changes: Trucksy MERN Architecture Rebuild

## 1. Summary of the New Architecture
Trucksy has been re-architected from a client-heavy React + Firebase application into a pure MERN (MongoDB, Express, React, Node.js) production-grade system.
- **Client (Frontend)**: React 19 with Vite, React Router v7, and Axios. The frontend acts solely as a presentation and interaction layer. It maintains JWT authentication state in `localStorage` and communicates via REST API endpoints with the Express server.
- **Server (Backend)**: Node.js and Express server with Mongoose ODM connected to MongoDB. All business rules, route-shipment matching, capacity reservation, authorization checks, and booking state transitions are handled exclusively on the server.
- **Security & Middleware**: Protected with Helmet headers, CORS limited to client domain, request body size limits (100kb), rate limiting on authentication routes, and central error handling with Zod schema validation.
- **Atomic Concurrency**: Route capacity reservations are guaranteed atomic via single-operation MongoDB queries (`findOneAndUpdate` with `$inc`), eliminating overbooking race conditions.

---

## 2. Files Created
### Backend
- `backend/package.json`: Server package definition with production dependencies and test/seed scripts.
- `backend/.env.example`: Server environment template.
- `backend/src/config/env.js`: Environment configuration and validation loader.
- `backend/src/config/db.js`: Mongoose connection manager.
- `backend/src/models/User.js`: User schema with bcrypt password hashing, role enforcement, and JSON password stripping.
- `backend/src/models/Route.js`: Route schema with normalized path keys, segment capacity arrays, stops validation, and status tracking.
- `backend/src/models/Shipment.js`: Shipment schema with normalized origin/destination keys and status lifecycle.
- `backend/src/models/Booking.js`: Booking schema with segment indices, snapshot weights, status transition guards, and partial unique compound index.
- `backend/src/utils/normalise.js`: Pure helper function for trimming, lowercasing, and whitespace-collapsing city strings.
- `backend/src/utils/token.js`: JSON Web Token generation and verification helper.
- `backend/src/utils/capacity.js`: Pure helpers for atomic route filter generation and segment capacity decrement calculations.
- `backend/src/utils/matching.js`: Pure server-side matching engine and match counter for dashboard summaries.
- `backend/src/schemas/validation.js`: Zod validation schemas for auth, routes, shipments, and bookings.
- `backend/src/middleware/auth.js`: JWT authentication verification and role-based authorization guard middleware.
- `backend/src/middleware/errorHandler.js`: Central error handler mapping Zod, Mongoose, CastError, duplicate keys (409), and 500 status codes.
- `backend/src/routes/authRoutes.js`: Auth endpoints for user signup, login, and profile retrieval.
- `backend/src/routes/routeRoutes.js`: Route creation, driver route listing, route deletion, stop completion, and route completion endpoints.
- `backend/src/routes/shipmentRoutes.js`: Shipment creation, business shipment listing, and shipment deletion endpoints.
- `backend/src/routes/matchRoutes.js`: Server-side route matching endpoints for businesses and dashboard match summary counts for drivers.
- `backend/src/routes/bookingRoutes.js`: Booking creation, user booking retrieval, atomic booking acceptance, rejection, and cancellation endpoints.
- `backend/src/app.js`: Express application configuration with Helmet, CORS, Morgan, JSON parsing, rate limiting, and route mounting.
- `backend/src/index.js`: Server entrypoint initiating database connection and starting HTTP listener.
- `backend/src/seed.js`: Database seeding script creating 2 drivers, 2 businesses, sample routes, and race-condition shipment pairs.
- `backend/src/tests/matching.test.js`: Built-in Node test suite verifying pure matching rules, path ordering, date matching, and edge cases.
- `backend/src/tests/capacity.test.js`: Unit and integration test suite verifying atomic capacity reservation and race condition rejection.

### Frontend
- `frontend/src/services/api.js`: Axios instance configured with base URL, JWT request interceptor, and 401 unauthenticated redirect handling.
- `frontend/.env.example`: Frontend environment template.
- `frontend/vercel.json`: Single Page Application (SPA) routing rewrite configuration for Vercel deployment.

### Root
- `.env.example`: Unified environment variable example for local deployment.
- `CHANGES.md`: Comprehensive documentation of the architectural transition.

---

## 3. Files Deleted
- `frontend/src/services/firebase.js`: Legacy Firebase client initialization and Firestore/Auth instance exports.
- `frontend/src/services/authService.js`: Legacy Firebase client auth helper methods.
- `frontend/src/services/check.js`: Legacy Firestore date migration maintenance script.
- `frontend/src/services/cleanup.js`: Legacy Firestore completed trip deletion script.
- `frontend/src/utils/matching.js`: Legacy client-side matching algorithm that downloaded all database records into the browser.

---

## 4. Files Modified
- `frontend/package.json`: Uninstalled `firebase` dependency; added `axios`; removed obsolete npm scripts (`migrate:dates`, `migrate:dates:dry`, `cleanup:completed`).
- `frontend/package-lock.json`: Synchronized dependency tree reflecting total removal of Firebase and addition of Axios.
- `frontend/eslint.config.js`: Removed references to deleted migration scripts; updated linting rules for React 19.
- `frontend/vite.config.js`: Removed commented URLs and verified standard Vite build configuration.
- `frontend/src/App.jsx`: Added role props to `ProtectedRoute` to restrict `/my-routes` strictly to drivers and `/my-shipments` strictly to businesses.
- `frontend/src/context/AuthContext.jsx`: Completely removed Firebase Auth and Firestore queries; rewired to store JWT token in `localStorage`, restore session via `GET /api/auth/me`, and expose `{ user, loginUser, signupUser, logout, loading }`.
- `frontend/src/services/routeService.js`: Replaced Firestore collection queries with Axios REST API calls (`/api/routes`, `/api/routes/mine`, `/api/routes/:id`, `/api/routes/:id/stops/:index/complete`, `/api/routes/:id/complete`).
- `frontend/src/services/shipmentService.js`: Replaced Firestore collection queries with Axios REST API calls (`/api/shipments`, `/api/shipments/mine`, `/api/shipments/:id`).
- `frontend/src/services/bookingService.js`: Replaced Firestore collection queries with Axios REST API calls (`/api/bookings`, `/api/bookings/mine`, `/api/bookings/:id/accept`, `/api/bookings/:id/reject`, `/api/bookings/:id/cancel`, `/api/matches`, `/api/matches/summary`).
- `frontend/src/components/RouteForm.jsx`: Removed client-provided `uid`, `driverName`, and `contact` (now inferred from JWT); replaced `alert()` with inline success and server error messaging; added request-in-flight button disabling.
- `frontend/src/components/ShipmentForm.jsx`: Removed client-provided `uid`, `businessName`, and `contact`; replaced `alert()` with inline success and server error messaging; added request-in-flight button disabling.
- `frontend/src/pages/Dashboard.jsx`: Streamlined role-based view switching between Driver and Business dashboards.
- `frontend/src/pages/BusinessDashboard.jsx`: Replaced client-side match calculation with `GET /api/matches`; retained dashboard banner highlighting unbooked matches.
- `frontend/src/pages/DriverDashBoard.jsx`: Replaced client-side match and pending calculations with `GET /api/matches/summary` and `GET /api/bookings/mine`; retained action and match banners.
- `frontend/src/pages/Bookings.jsx`: Completely refactored. Removed client-side auto-reject effects, client-side route node string parsing, client-side capacity checks, and client-side deletion of routes/shipments. Integrated API data shapes (`booking.route`, `booking.shipment`), orderly stop completions with disabled checkboxes for subsequent stops, grouped active trips, and server error handling with auto-refetch.
- `frontend/src/pages/History.jsx`: Updated to display completed bookings from `GET /api/bookings/mine` without relying on string splits or client-side deletions.
- `frontend/src/pages/MyRoutes.jsx`: Updated to consume `GET /api/routes/mine`; added route status indicator and a Delete button with server 409 conflict handling.
- `frontend/src/pages/MyShipments.jsx`: Updated to consume `GET /api/shipments/mine`; added shipment status indicator and a Delete button with server 409 conflict handling.
- `frontend/src/pages/Login.jsx`: Updated to use backend auth service with clear server error messages.
- `frontend/src/pages/Signup.jsx`: Updated to submit user details to backend `/api/auth/signup` and render Zod server validation error details.
- `frontend/src/routes/ProtectedRoute.jsx`: Enhanced with optional `role` check to restrict access by user role (`driver` or `business`).
- `.gitignore`: Updated at repository root to ignore `node_modules`, `.env`, `dist`, and `logs`.

---

## 5. API Endpoints Added
All API endpoints are prefixed with `/api` and require a `Bearer <token>` in the `Authorization` header, except `/api/auth/signup` and `/api/auth/login`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Registers a new user with hashed password; returns JWT and user profile. |
| `POST` | `/api/auth/login` | Public | Authenticates credentials; returns JWT and user profile. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves the authenticated user's profile. |
| `POST` | `/api/routes` | Driver | Creates a new route with initial segment capacities and normalized path keys. |
| `GET` | `/api/routes/mine` | Driver | Lists routes owned by the driver, sorted newest first. |
| `DELETE` | `/api/routes/:id` | Driver (Owner) | Deletes a route; blocked with 409 if pending or accepted bookings exist. |
| `POST` | `/api/routes/:routeId/stops/:index/complete` | Driver (Owner) | Marks a stop complete in sequential order; triggers `deliveryReached` on qualifying bookings. |
| `POST` | `/api/routes/:routeId/complete` | Driver (Owner) | Marks all route stops completed, delivers accepted shipments, and rejects pending bookings. |
| `POST` | `/api/shipments` | Business | Creates a new shipment with normalized origin and destination keys. |
| `GET` | `/api/shipments/mine` | Business | Lists shipments owned by the business, sorted newest first. |
| `DELETE` | `/api/shipments/:id` | Business (Owner) | Deletes a shipment; blocked with 409 if active bookings exist. |
| `GET` | `/api/matches` | Business | Returns open routes that accommodate open shipments owned by the caller. |
| `GET` | `/api/matches/summary` | Driver | Returns total count of open shipments fitting the driver's open routes. |
| `POST` | `/api/bookings` | Business (Owner) | Validates match on server, snapshots weights/space, and creates pending booking. |
| `GET` | `/api/bookings/mine` | Authenticated | Retrieves bookings for caller (driver or business) populated with route and shipment details. |
| `PATCH` | `/api/bookings/:id/accept` | Driver (Owner) | Atomically reserves capacity via `findOneAndUpdate`; rejects booking with 409 if full. |
| `PATCH` | `/api/bookings/:id/reject` | Driver (Owner) | Rejects a pending booking. |
| `PATCH` | `/api/bookings/:id/cancel` | Business (Owner) | Cancels a pending booking. |
| `GET` | `/health` | Public | Returns `{ status: "ok" }`. |

---

## 6. Data Model Changes (Firestore to MongoDB Mapping)

### User Entity
- **Firestore**: Stored in `users` collection with document fields `{ uid, role, name, contact }` and Firebase Auth authentication record.
- **MongoDB (`User` schema)**: Centralized user document with `{ name, contact, email (unique, lowercase), password (bcrypt hash, select:false), role ("driver" | "business"), timestamps }`. Password is automatically excluded from JSON serialization.

### Route Entity
- **Firestore**: `{ uid, driverName, contact, from, to, date, capacity, space, stops }`.
- **MongoDB (`Route` schema)**: `{ driver (ref User), from, to, stops: [String], pathKeys: [String] (computed normalized path array), date, capacity, space, segmentRemaining: [{ weight, space }], completedStops: [Number], status ("open" | "in_progress" | "completed" | "cancelled"), timestamps }`. Compound index on `(status, date, pathKeys)`.

### Shipment Entity
- **Firestore**: `{ uid, businessName, contact, from, to, date, weight, space }`.
- **MongoDB (`Shipment` schema)**: `{ business (ref User), from, to, fromKey (normalized), toKey (normalized), date, weight, space, status ("open" | "booked" | "delivered" | "cancelled"), timestamps }`.

### Booking Entity
- **Firestore**: Flat document with stringified paths `{ routeId, shipmentId, driverUid, businessUid, routeDetails: "A ➔ B", shipDetails: "A ➔ B", routeCapacity, shipWeight, completedStops: [] }`.
- **MongoDB (`Booking` schema)**: Relational references with snapshot metrics: `{ route (ref Route), shipment (ref Shipment), driver (ref User), business (ref User), fromIdx, toIdx, weight, space, status ("pending" | "accepted" | "rejected" | "completed" | "cancelled"), deliveryReached: Boolean, timestamps }`. Partial unique index on `(route, shipment)` for active statuses.

---

## 7. Bugs and Weaknesses Fixed
1. **Client-Side Heavy Computation**: In the old application, matching was performed by querying and downloading all routes, shipments, and bookings into every browser. This leaked full platform data and caused severe performance degradation. Matching is now executed server-side with efficient queries and pure algorithms.
2. **Brittle String-Based City Matching**: City matching previously required exact string equality, failing for minor differences in case or spacing (e.g. `"Delhi"` vs `"delhi "`). Normalization now trims, lowercases, and collapses inner whitespace.
3. **Capacity Calculation by String Parsing**: Previously, remaining capacity was computed by parsing `"A ➔ B"` strings. Route segments are now stored as structured arrays with explicit `weight` and `space` values per segment.
4. **Capacity Race Condition (Overbooking)**: Previously, concurrent businesses could book the last remaining capacity simultaneously without backend validation. The accept endpoint now uses an atomic `Route.findOneAndUpdate` with conditional checks on every traversed segment (`$gte`) and decrements (`$inc`), ensuring that the second concurrent accept fails and is marked rejected with a 409 Conflict.
5. **Lack of Authorization and Security**: In the old version, any authenticated user could modify any booking or delete records directly via client Firestore methods. All endpoints now enforce strict token authentication, role validation, and resource ownership on the server.
6. **Destructive Completion Logic**: Previously, completing a trip permanently deleted the route and shipment documents from Firestore, erasing historical data. Routes and shipments now transition through lifecycle states (`completed`, `delivered`) and persist for history.
7. **React Effect Auto-Rejection Bug**: Previous versions ran side-effects inside React components that auto-rejected bookings if they appeared impossible in the client state. This created race conditions and unpredictable state updates. All validation and status management are now handled by explicit server actions.
8. **Sequential Stop Progression**: Stop progress was uncoordinated and stored redundantly on individual bookings. Completed stop indices are now stored strictly on the Route entity, must be checked off in sequential order, and automatically update destination arrival flags (`deliveryReached`) for qualifying bookings.

---

## 8. Dependencies Added and Removed
### Frontend
- **Removed**: `firebase` (`^12.12.0`)
- **Added**: `axios` (`^1.20.0`)

### Backend
- **Added**:
  - `express` (`^4.21.2`): HTTP web server.
  - `mongoose` (`^8.9.5`): MongoDB object modeling.
  - `jsonwebtoken` (`^9.0.2`): JWT creation and verification.
  - `bcryptjs` (`^2.4.3`): Secure password hashing.
  - `zod` (`^3.24.1`): Type and schema validation.
  - `helmet` (`^8.0.0`): HTTP security headers.
  - `cors` (`^2.8.5`): Cross-Origin Resource Sharing control.
  - `express-rate-limit` (`^7.5.0`): Brute-force and rate limit protection on auth routes.
  - `dotenv` (`^16.4.7`): Environment variable management.
  - `morgan` (`^1.10.0`): HTTP request logging.

---

## 9. Environment Variables
### Server (`backend/.env`)
- `PORT`: Port on which the Express server listens (default: `5000`).
- `MONGODB_URI`: MongoDB connection connection string (required).
- `JWT_SECRET`: Secret key used for signing and verifying JWT tokens (required).
- `JWT_EXPIRES_IN`: Token validity window (default: `7d`).
- `CLIENT_URL`: Allowed origin for CORS headers (default: `http://localhost:5173`).

### Client (`frontend/.env`)
- `VITE_API_URL`: Backend API base URL (e.g. `http://localhost:5000/api`).

---

## 10. Known Limitations
- Real-time updates rely on user action refetching rather than WebSockets, per architectural rules prohibiting Socket.IO.
- Intermediate stop tracking assumes a linear path order without geographic waypoint rerouting or dynamic GPS coordinate mapping.
