# Pokémon Backend API

A **production-ready backend service** for managing Pokémon data and roll mechanics. 

---

## Project Architecture

The project follows a **Layered Architecture** pattern to ensure the codebase remains maintainable and scalable.

* **API Layer:** Express routes and controllers handling HTTP logic.
* **Service Layer:** Core business logic (e.g., the probability logic for Pokémon rolls).
* **Data Layer:** Mongoose models defining the schema and interfacing with MongoDB.
* **Middleware:** Global handlers for Auth, Rate Limiting, and Error Catching.

---

## API Highlights

All primary endpoints are versioned under `/api/v1`.

### Core Endpoints
* `GET /api/v1/pokemon` — List Pokémon (supports pagination/filtering).
* `POST /api/v1/pokemon` — Create Pokémon (**Admin Only**).
* `POST /api/v1/pokemon/roll` — Roll for a random Pokémon (**Rate-limited**).
* `GET /api/v1/roll/history` — Global roll history tracking.

### Operations & Health
* `GET /health` — Liveness and readiness probe for orchestration (K8s/Docker).
* `GET /metrics` — Exposes Prometheus-formatted metrics (Request duration, error rates).

---

## Testing Strategy

The system is built for **Test-Driven Development (TDD)**:
* **Zero-Dependency Testing:** Uses `mongodb-memory-server` to spin up a fresh DB instance in RAM.
* **High Coverage:** Tests cover edge cases like duplicate entries, unauthorized access, and rate-limit triggers.
* **Command:** `npm test`

---

## Tech Stack

| Category              | Tools                                    |
| :-------------------- | :--------------------------------------- |
| **Runtime/Framework** | Node.js (ESM), Express                   |
| **Database**          | MongoDB + Mongoose                       |
| **Security**          | JWT, Helmet, Express-Rate-Limit          |
| **Testing**           | Jest, Supertest, MongoDB Memory Server   |
| **Observability**     | Winston (Logging), Prom-client (Metrics) |
| **Validation**        | Joi                                      |

---

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Production build and run

```bash
npm run build
npm start
```
## Deployment & Production

To ensure this API is production-ready, consider the following:

* **Logging:** Logs are streamed to `stdout` in JSON format for easy ingestion by ELK or Datadog.
* **Rate Limiting:** Protects against DDoS and brute-force on the `/roll` and `/login` endpoints.
* **Security Headers:** Managed via `Helmet` to prevent common web vulnerabilities (XSS, Clickjacking).
* **Dockerization:** Use the provided `Dockerfile` to containerize the service.

---

## License

This project is licensed under the **MIT License**
