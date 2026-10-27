# Project Changes: Trucksy MERN Architecture Rebuild

## 1. Summary of the New Architecture
Trucksy has been re-architected from a client-heavy React + Firebase application into a MERN (MongoDB, Express, React, Node.js) system with Tailwind CSS v4.
- **Client (Frontend)**: React 19 with Vite, Tailwind CSS v4, React Router v7, and Axios. The frontend acts as a presentation and interaction layer. It maintains JWT authentication in `localStorage` and communicates via REST API endpoints with the Express server.
- **Server (Backend)**: Node.js and Express server with Mongoose ODM connected to MongoDB. All business rules, route-shipment matching, capacity reservations, authorization checks, and booking state transitions are handled exclusively on the server.
- **Security & Middleware**: Protected with CORS limited to client origins, JSON body parsing, and centralized error handling mapping Mongoose errors to standard HTTP status codes.
- **Atomic Concurrency**: Route capacity reservations are atomic via single-operation MongoDB queries (`findOneAndUpdate` with `$inc`), eliminating overbooking race conditions.

---

## 2. Files Created
### Backend
- `backend/package.json`: Server package definition with production dependencies and test scripts.
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
- `backend/src/utils/scope.js`: Pure helper functions for filtering active items from archived history.
- `backend/src/middleware/auth.js`: JWT verification and role authorization middleware.
- `backend/src/middleware/errorHandler.js`: Central error handler mapping Mongoose validation, CastError, duplicate keys (409), and 500 status codes.
- `backend/src/routes/authRoutes.js`: User registration, authentication, and profile endpoints.
- `backend/src/routes/routeRoutes.js`: Driver route creation, retrieval, stop progression, deletion, and completion endpoints.
- `backend/src/routes/shipmentRoutes.js`: Business shipment creation, retrieval, and deletion endpoints.
- `backend/src/routes/matchRoutes.js`: Match queries for driver and business dashboards.
- `backend/src/routes/bookingRoutes.js`: Booking request, atomic acceptance, rejection, and cancellation endpoints.
- `backend/api/index.js`: Serverless function entrypoint for Vercel deployment exporting an async handler.
- `backend/vercel.json`: Vercel routing configuration rewriting `/(.*)` to `/api`.
- `backend/src/app.js`: Express application configuration with CORS, JSON parsing, and route mounting.
- `backend/src/index.js`: Server entrypoint initiating database connection and starting HTTP listener.
- `backend/src/tests/matching.test.js`: Built-in Node test suite verifying pure matching rules, path ordering, date matching, and edge cases.
- `backend/src/tests/capacity.test.js`: Unit and integration test suite verifying atomic capacity reservation and race condition rejection.
- `backend/src/tests/routes.test.js`: Built-in Node test suite verifying Route schema end date defaults, departure date validation, and order constraints.
- `backend/src/tests/scope.test.js`: Built-in Node test suite verifying active-scope filtering pure functions.

### Frontend
- `frontend/src/components/Button.jsx`: Reusable button supporting multiple variants and disabled states during requests.
- `frontend/src/components/Badge.jsx`: Color-coded status badge component.
- `frontend/src/components/Card.jsx`: Structured card component suite (`Card`, `CardHeader`, `CardBody`, `CardFooter`).
- `frontend/src/components/Alert.jsx`: Contextual alert banners for info, success, warning, and error messages.
- `frontend/src/components/Input.jsx`: Form input component with labels, helper text, and validation error display.
- `frontend/src/components/Select.jsx`: Form select component with label and error binding.
- `frontend/src/components/EmptyState.jsx`: Reusable component for zero-data views with action support.
- `frontend/src/components/PageHeader.jsx`: Standard page heading with action slot.
- `frontend/src/components/RouteStepper.jsx`: Progress stepper tracking truck location along route stops.
- `frontend/src/pages/Home.jsx`: Public landing page with feature cards and onboarding CTAs.
- `frontend/src/services/api.js`: Axios instance configured with base URL, JWT request interceptor, and 401 unauthenticated redirect handling.
- `frontend/.env.example`: Frontend environment template.
- `frontend/vercel.json`: Single Page Application (SPA) routing rewrite configuration for Vercel deployment.

### Root
- `.env.example`: Unified environment variable example for local deployment.
- `CHANGES.md`: Documentation of architectural transition and modifications.

---

## 3. Files Deleted
- `frontend/src/services/firebase.js`: Legacy Firebase client initialization and Firestore/Auth instance exports.
- `frontend/src/services/authService.js`: Legacy Firebase client auth helper methods.
- `frontend/src/services/check.js`: Legacy Firestore date migration maintenance script.
- `frontend/src/services/cleanup.js`: Legacy Firestore completed trip deletion script.
- `frontend/src/utils/matching.js`: Legacy client-side matching algorithm that downloaded all database records into the browser.
- `frontend/src/App.css`: Legacy stylesheet removed in favor of Tailwind CSS v4.
- `vercel.json`: Legacy root multi-service configuration removed in favor of dedicated frontend and backend Vercel project configurations.

---

## 4. Files Modified
- `backend/package.json`: Updated test script to directory glob pattern for Windows compatibility.
- `backend/src/config/db.js`: Cached in-flight connection promise on `globalThis`, reused active connections (`readyState === 1`), cleared cache on error, and configured `serverSelectionTimeoutMS: 8000`.
- `backend/src/app.js`: Updated CORS origin validation to support a comma-separated list of origins in `CLIENT_URL`.
- `frontend/package.json`: Uninstalled `firebase` dependency; added `axios` and Tailwind CSS v4 Vite plugin; removed obsolete scripts.
- `frontend/src/index.css`: Replaced custom CSS rules with `@import "tailwindcss";` and minimalist base typography styles.
- `frontend/src/App.jsx`: Added landing page route (`/`) and protected role-restricted routes.
- `frontend/src/context/AuthContext.jsx`: Rewired from Firebase to JWT token management in `localStorage` and `GET /api/auth/me`.
- `frontend/src/services/routeService.js`: Replaced Firestore collection queries with Axios REST API calls.
- `frontend/src/services/shipmentService.js`: Replaced Firestore collection queries with Axios REST API calls.
- `frontend/src/services/bookingService.js`: Replaced Firestore collection queries with Axios REST API calls.
- `frontend/src/components/RouteForm.jsx`: Converted to Tailwind form components with server error handling.
- `frontend/src/components/ShipmentForm.jsx`: Converted to Tailwind form components with server error handling.
- `frontend/src/pages/Dashboard.jsx`: Streamlined role-based view switching.
- `frontend/src/pages/BusinessDashboard.jsx`: Modern card design, metric counters, and API-driven match summaries.
- `frontend/src/pages/DriverDashBoard.jsx`: Modern card design, active trip banner, and API-driven match summaries.
- `frontend/src/pages/Bookings.jsx`: Redesigned with segmented controls, visual route stepper, orderly stop checklists, and server error handling.
- `frontend/src/pages/History.jsx`: Clean list showing non-destructive completed trips from `GET /api/bookings/mine`.
- `frontend/src/pages/MyRoutes.jsx`: Responsive card grid showing active routes with deletion protection for non-open items.
- `frontend/src/pages/MyShipments.jsx`: Responsive card grid showing active shipments with deletion protection for non-open items.
- `frontend/src/pages/Login.jsx`: Redesigned centered card layout with server validation error alerts.
- `frontend/src/pages/Signup.jsx`: Redesigned role selector cards and registration form with server validation error alerts.

---

## 5. API Endpoints Added
All API endpoints are prefixed with `/api` and require a `Bearer <token>` in the `Authorization` header, except `/api/auth/signup`, `/api/auth/login`, and `/api/health`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Registers a new user with hashed password; returns JWT and user profile. |
| `POST` | `/api/auth/login` | Public | Authenticates credentials; returns JWT and user profile. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves the authenticated user's profile. |
| `POST` | `/api/routes` | Driver | Creates a new route with segment capacities and normalized path keys. |
| `GET` | `/api/routes/mine` | Driver | Lists driver routes. Defaults to active items; supports `?scope=all`. |
| `DELETE` | `/api/routes/:id` | Driver (Owner) | Deletes a route; blocked with 409 if status is not `open` or live bookings exist. |
| `POST` | `/api/routes/:routeId/stops/:index/complete` | Driver (Owner) | Marks a stop complete in sequential order; triggers delivery flags on qualifying bookings. |
| `POST` | `/api/routes/:routeId/complete` | Driver (Owner) | Completes all route stops, delivers accepted shipments, and rejects pending bookings. |
| `POST` | `/api/shipments` | Business | Creates a new shipment with normalized origin and destination keys. |
| `GET` | `/api/shipments/mine` | Business | Lists business shipments. Defaults to active items; supports `?scope=all`. |
| `DELETE` | `/api/shipments/:id` | Business (Owner) | Deletes a shipment; blocked with 409 if status is not `open` or live bookings exist. |
| `GET` | `/api/matches` | Business | Returns open routes that accommodate open shipments owned by the caller. |
| `GET` | `/api/matches/summary` | Driver | Returns total count of open shipments fitting the driver's open routes. |
| `POST` | `/api/bookings` | Business (Owner) | Validates match on server, snapshots weights/space, and creates pending booking. |
| `GET` | `/api/bookings/mine` | Authenticated | Retrieves bookings for caller populated with route and shipment details. |
| `PATCH` | `/api/bookings/:id/accept` | Driver (Owner) | Atomically reserves capacity via `findOneAndUpdate`; rejects booking with 409 if full. |
| `PATCH` | `/api/bookings/:id/reject` | Driver (Owner) | Rejects a pending booking. |
| `PATCH` | `/api/bookings/:id/cancel` | Business (Owner) | Cancels a pending booking. |
| `GET` | `/api/health` | Public | Returns `{ status: "ok" }` (also responds at `/health`). |

---

## 6. Data Model Changes (Firestore to MongoDB Mapping)

### User Entity
- **Firestore**: Stored in `users` collection with document fields `{ uid, role, name, contact }` and Firebase Auth authentication record.
- **MongoDB (`User` schema)**: Centralized user document with `{ name, contact, email (unique, lowercase), password (bcrypt hash, select:false), role ("driver" | "business"), timestamps }`. Password is automatically excluded from JSON serialization.

### Route Entity
- **Firestore**: `{ uid, driverName, contact, from, to, date, capacity, space, stops }`.
- **MongoDB (`Route` schema)**: `{ driver (ref User), from, to, stops: [String], pathKeys: [String] (computed normalized path array), date, endDate, capacity, space, segmentRemaining: [{ weight, space }], completedStops: [Number], status ("open" | "in_progress" | "completed" | "cancelled"), timestamps }`. Compound index on `(status, date, pathKeys)`.

### Shipment Entity
- **Firestore**: `{ uid, businessName, contact, from, to, date, weight, space }`.
- **MongoDB (`Shipment` schema)**: `{ business (ref User), from, to, fromKey (normalized), toKey (normalized), date, weight, space, status ("open" | "booked" | "delivered" | "cancelled"), timestamps }`.

### Booking Entity
- **Firestore**: Flat document with stringified paths `{ routeId, shipmentId, driverUid, businessUid, routeDetails: "A ➔ B", shipDetails: "A ➔ B", routeCapacity, shipWeight, completedStops: [] }`.
- **MongoDB (`Booking` schema)**: Relational references with snapshot metrics: `{ route (ref Route), shipment (ref Shipment), driver (ref User), business (ref User), fromIdx, toIdx, weight, space, status ("pending" | "accepted" | "rejected" | "completed" | "cancelled"), deliveryReached: Boolean, timestamps }`. Partial unique index on `(route, shipment)` for active statuses.

---

## 7. Bugs and Weaknesses Fixed
1. **Client-Side Heavy Computation**: In the old application, matching was performed by querying and downloading all routes, shipments, and bookings into every browser. Matching is now executed server-side with efficient queries and pure algorithms.
2. **Brittle String-Based City Matching**: City matching previously required exact string equality, failing for minor differences in case or spacing. Normalization now trims, lowercases, and collapses inner whitespace.
3. **Capacity Calculation by String Parsing**: Previously, remaining capacity was computed by parsing `"A ➔ B"` strings. Route segments are now stored as structured arrays with explicit `weight` and `space` values per segment.
4. **Capacity Race Condition (Overbooking)**: Previously, concurrent businesses could book the last remaining capacity simultaneously without backend validation. The accept endpoint now uses an atomic `Route.findOneAndUpdate` with conditional checks on every traversed segment (`$gte`) and decrements (`$inc`), ensuring that the second concurrent accept fails and is marked rejected with a 409 Conflict.
5. **Lack of Authorization and Security**: All endpoints now enforce strict token authentication, role validation, and resource ownership on the server.
6. **Destructive Completion Logic**: Previously, completing a trip permanently deleted the route and shipment documents from Firestore. Routes and shipments now transition through lifecycle states (`completed`, `delivered`) and persist for history.
7. **React Effect Auto-Rejection Bug**: Previous versions ran side-effects inside React components that auto-rejected bookings if they appeared impossible in client state. All validation and status management are now handled by explicit server actions.
8. **Sequential Stop Progression**: Completed stop indices are now stored strictly on the Route entity, must be checked off in sequential order, and automatically update destination arrival flags (`deliveryReached`) for qualifying bookings.

---

## 8. UI Redesign with Tailwind CSS v4
The frontend was overhauled using Tailwind CSS v4 (`@tailwindcss/vite`):
- **Design System**: Slate/gray neutral tones, primary Indigo brand color, card containers with subtle borders and shadows, and clean typography.
- **Component Suite**: Shared components in `src/components/` (`Button`, `Badge`, `Card`, `Alert`, `Input`, `Select`, `EmptyState`, `PageHeader`, `RouteStepper`, `Navbar`).
- **Responsive Layout**: Fluid layouts tested across 375px (mobile), 768px (tablet), and 1280px (desktop) viewports, including a collapsible mobile navigation menu.
- **Visual Progress Tracking**: Integrated `RouteStepper` providing visual progress of origin, intermediate stops, truck position, and dropoff milestones.

---

## 9. Dependencies Added and Removed
### Frontend
- **Removed**: `firebase` (`^12.12.0`)
- **Added**: `axios` (`^1.20.0`), `@tailwindcss/vite` (`^4.0.0`), `tailwindcss` (`^4.0.0`)

### Backend
- **Added**:
  - `express` (`^4.21.2`): HTTP web server.
  - `mongoose` (`^8.9.5`): MongoDB object modeling.
  - `jsonwebtoken` (`^9.0.2`): JWT creation and verification.
  - `bcryptjs` (`^2.4.3`): Secure password hashing.
  - `cors` (`^2.8.5`): Cross-Origin Resource Sharing control.
  - `dotenv` (`^16.4.7`): Environment variable management.

---

## 10. Environment Variables
### Server (`backend/.env`)
- `PORT`: Port on which the Express server listens (default: `5000`).
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key used for signing and verifying JWT tokens.
- `JWT_EXPIRES_IN`: Token validity window (default: `7d`).
- `CLIENT_URL`: Allowed origin or comma-separated list of origins for CORS headers (e.g. `https://<frontend-url>.vercel.app,http://localhost:5173`).

### Client (`frontend/.env`)
- `VITE_API_URL`: Backend API base URL (e.g. `http://localhost:5000/api`).

---

## 11. Known Limitations
- Live updates rely on background periodic polling (20-second interval, skipped when tab is hidden) rather than WebSockets.
- Intermediate stop tracking assumes a linear path order without dynamic GPS waypoint routing.
- Drivers are restricted to one active trip (`open` or `in_progress`) at any given time.
- Cold starts may introduce brief latency on serverless hosting platforms.
- No payment processing integration is implemented.
