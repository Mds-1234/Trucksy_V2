# Trucksy

## Problem Statement
Logistics coordination between commercial truck drivers and businesses often suffers from inefficient space utilization and fragmented scheduling. Independent and fleet drivers regularly operate trips with substantial unutilized cargo capacity and cubic space across different segments of their journey. Concurrently, small and medium enterprises struggle to secure cost-effective shipping for partial loads without paying full-vehicle rates. Previous client-side matching prototypes suffered from security vulnerabilities, data leakage, race conditions in capacity bookings, and uncoordinated status management.

## Target Users
- **Commercial Truck Drivers**: Logistics operators and independent truckers seeking to maximize revenue by offering remaining capacity along scheduled origin, intermediate, and destination routes.
- **Business Shippers**: Companies, manufacturers, and merchants requiring reliable, segment-aware freight transport for shipments of specified weights and volume.

## Solution
Trucksy provides a multi-tenant logistics matching and booking platform engineered on the pure MERN stack (MongoDB, Express, React, Node.js). The application matches open shipments to routes based on schedule dates, normalized path topology, and multi-segment remaining capacities. Transactions are protected by atomic MongoDB reservation updates, preventing double-booking and capacity races. Drivers manage sequential stop progressions in real-time, while businesses track cargo transit status and maintain full delivery history without data destruction.

## Key Features
- **Server-Side Spatial & Segment Matching**: Evaluates path topology and calculates available capacity across all intermediary route segments.
- **Atomic Capacity Reservation**: Employs single-operation MongoDB updates (`findOneAndUpdate` with `$inc`) ensuring two concurrent businesses cannot overbook the last available capacity.
- **Strict Role-Based Security**: Restricts access and capabilities across drivers and businesses using JWT authentication, role guards, and resource ownership checks.
- **Sequential Route Execution**: Drivers progress through intermediate stops in strict order, automatically updating destination milestone indicators for relevant shippers.
- **Non-Destructive Lifecycle Tracking**: Full historical records for trips and shipments are preserved with comprehensive audit details.
- **Robust Client Interface**: React 19 single-page application with responsive layouts, inline validation alerts, in-flight action locks, and clean role-based dashboards.

## Tech Stack
- **Client**: React 19, Vite, React Router v7, Axios, CSS Modules / Pure CSS.
- **Server**: Node.js, Express 4, Mongoose 8, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`.
- **Testing**: Node.js built-in test runner (`node:test`, `node:assert`).
- **Database**: MongoDB (Mongoose ODM).

## Architecture

### System Architecture
```mermaid
flowchart LR
    Client["React 19 Client (Vite + Axios)"]
    API["Express 4 REST API (Node.js)"]
    Auth["JWT & Role Authorization Guard"]
    Engine["Pure Matching & Capacity Engine"]
    DB[("MongoDB Database (Mongoose)")]

    Client -->|"HTTP Requests + Bearer JWT"| API
    API --> Auth
    Auth --> Engine
    Engine -->|"Atomic Queries & Aggregations"| DB
    DB -->|"Populated Documents"| API
    API -->|"JSON Response"| Client
```

### Booking Status State Machine
```mermaid
stateDiagram-v2
    [*] --> pending: Business books matching route
    pending --> accepted: Driver accepts (Atomic capacity reserved)
    pending --> rejected: Driver rejects or capacity exhausted
    pending --> cancelled: Business cancels request
    accepted --> completed: Driver completes all stops & trip
    rejected --> [*]
    cancelled --> [*]
    completed --> [*]
```

## Local Setup

### Prerequisites
- Node.js (v20.x or v22.x recommended)
- A running MongoDB instance (Local MongoDB server or MongoDB Atlas cluster connection string)

### 1. Clone & Structure Overview
The project is structured into two primary directories:
- `backend/`: Express server, Mongoose models, and test suite.
- `frontend/`: React single-page client built with Vite.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Configure your `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/trucksy?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
# Server will listen on http://localhost:5000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
```
Ensure `frontend/.env` contains:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
# Vite client will run on http://localhost:5173
```

## Environment Variables

### Server (`backend/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | HTTP port for the Express application | `5000` |
| `MONGODB_URI` | MongoDB connection URI string | `mongodb+srv://user:pass@cluster.mongodb.net/trucksy` |
| `JWT_SECRET` | Secret key for signing authorization tokens | `super_secret_jwt_key` |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `CLIENT_URL` | Allowed origin for CORS validation | `http://localhost:5173` |

### Client (`frontend/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `VITE_API_URL` | Base endpoint URL for the backend API | `http://localhost:5000/api` |

## Seed Data and Demo Logins
To populate your MongoDB database with demo drivers, businesses, routes, and shipments:
```bash
cd backend
npm run seed
```

### Demo Accounts
All seed accounts use the default password: `Password123`

| Role | Name | Email | Password |
|---|---|---|---|
| Driver | Rajesh Kumar | `rajesh@trucksy.demo` | `Password123` |
| Driver | Amit Singh | `amit@trucksy.demo` | `Password123` |
| Business | Metro Retailers | `metro@trucksy.demo` | `Password123` |
| Business | Apex Logistics Ltd | `apex@trucksy.demo` | `Password123` |

### Capacity Race Condition Demo
The seed script configures a route for Driver 1 (`Delhi ➔ Jaipur`) with **1000 kg** capacity.
- **Shipment 1** (`Metro Retailers`): 700 kg
- **Shipment 2** (`Apex Logistics Ltd`): 600 kg

Both shipments match initially. When Driver 1 accepts Shipment 1, the remaining capacity decreases to 300 kg. When attempting to accept Shipment 2, the atomic update fails, immediately marking Shipment 2 as rejected with a `409 Conflict: Insufficient capacity on route segments`.

## Running Tests
Tests are implemented using Node's built-in `node:test` runner with no extra testing dependencies.

```bash
cd backend
npm test
```

### Test Scope
- **Pure Matching Logic (`src/tests/matching.test.js`)**:
  - Validates forward path ordering (`fromIdx < toIdx`).
  - Rejects reverse or disordered route segments.
  - Verifies multi-segment remaining capacity limits.
  - Detects schedule date mismatches.
  - Tests case-insensitive and whitespace-normalized city strings.
  - Verifies support for zero-space shipments.
  - Filters out active/pending bookings.
- **Atomic Capacity Reservation (`src/tests/capacity.test.js`)**:
  - Validates that accepting an initial booking exhausts capacity and causes subsequent accepts to be rejected.
  - Tests atomic query and increment builder calculations.
  - Integration test suite for concurrent `findOneAndUpdate` execution (executed when `MONGODB_URI_TEST` is configured).

## Deployment

### 1. MongoDB Database (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write permissions.
3. Allow network access from anywhere (`0.0.0.0/0`) or configure specific provider IP addresses.
4. Copy the connection string to `MONGODB_URI`.

### 2. Backend Deployment (Render)
1. Connect your Git repository to [Render](https://render.com/).
2. Create a new **Web Service**.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node src/index.js`.
6. Add the following Environment Variables in the Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI.
   - `JWT_SECRET`: A secure 64-character random string.
   - `JWT_EXPIRES_IN`: `7d`.
   - `CLIENT_URL`: Your deployed frontend URL (e.g. `https://your-trucksy.vercel.app`).
   - `PORT`: `10000` (or leave default for Render).

### 3. Frontend Deployment (Vercel)
1. Import your Git repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Add the Environment Variable:
   - `VITE_API_URL`: The deployed Render backend URL (e.g. `https://your-trucksy-api.onrender.com/api`).
6. Deploy. The included `frontend/vercel.json` ensures SPA routes redirect correctly to `index.html`.

## Project History
Trucksy originally originated as a client-side prototype built on React, Vite, and Firebase (Google Cloud Firestore and Firebase Authentication). In that initial version, all core business logic—including route matching, capacity tracking, and status transitions—executed directly inside the user's browser. While suitable for early proof-of-concept testing, this design suffered from critical limitations: entire database collections had to be downloaded by clients, matching failed on minor city name discrepancies, concurrent bookings caused capacity races, and users could modify arbitrary records without server-side validation.

The project was fully re-architected into a pure MERN application with a custom Node.js and Express backend. All logic has been migrated to server-side services with atomic concurrency controls, schema validation, and relational integrity.
