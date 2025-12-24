Pokémon Backend API

A production-ready backend API for managing Pokémon data, roll mechanics, and administrative operations.
Built using Node.js, Express, and MongoDB, with a strong focus on correctness, security, observability, and testability.

Overview

This project demonstrates the design and implementation of a real-world backend service rather than a simple CRUD application.
It includes proper request validation, authentication, rate limiting, structured logging, metrics, and comprehensive automated testing.

The API is versioned, environment-aware, and designed to be deployable to staging or production environments.

Key Features

RESTful, versioned API (/api/v1)

Pokémon creation, retrieval, and deletion

Pokémon roll system with history tracking

Role-based access control (admin vs public)

Input validation and schema enforcement

Global and route-level rate limiting

Centralized error handling

Structured logging

Prometheus-compatible metrics

Health check endpoint

Full integration test suite with in-memory database

Tech Stack

Node.js (ES Modules)

Express

MongoDB with Mongoose

Jest & Supertest (testing)

mongodb-memory-server (isolated test database)

Winston (logging)

Joi (request validation)

Prometheus / prom-client (metrics)

Helmet (security headers)

express-rate-limit

API Endpoints
Public Endpoints
Method	Endpoint	Description
GET	/api/v1/pokemon	Get all Pokémon
POST	/api/v1/pokemon	Create a Pokémon
POST	/api/v1/pokemon/roll	Roll a random Pokémon (rate-limited)
GET	/api/v1/pokemon/roll/history	Get roll history
GET	/health	Health check
GET	/metrics	Prometheus metrics
Admin Endpoints
Method	Endpoint	Description
DELETE	/api/v1/pokemon/:id	Delete Pokémon
DELETE	/api/v1/pokemon/roll/history/:id	Delete roll history

Admin endpoints require a valid JWT with the admin role.

Data Models
Pokémon

number (unique, indexed)

name

type (array)

imageUrl

Automatic timestamps

Roll History

pokemonId

name

Timestamped entries

Indexes and constraints are enforced at the database level.

Validation & Error Handling

All incoming requests are validated before reaching controllers

Invalid payloads return HTTP 400 with descriptive messages

Duplicate key errors (e.g. Pokémon number) are handled explicitly

Centralized error middleware ensures consistent error responses

Errors are logged with request context for debugging

Authentication & Authorization

JWT-based authentication

Role-based authorization

Admin-only routes protected via middleware

Public routes remain accessible without authentication

Rate Limiting

Global API rate limiting to prevent abuse

Additional stricter limits on Pokémon roll endpoint

Proper HTTP 429 responses when limits are exceeded

Logging & Observability
Logging

Structured logging via Winston

Includes request metadata and error context

Designed for easy integration with log aggregation systems

Metrics

Prometheus-compatible metrics

HTTP request counters labeled by method, route, and status

Default Node.js performance metrics enabled

Testing Strategy

Full integration tests using Jest and Supertest

Isolated test environment with mongodb-memory-server

No dependency on external MongoDB instances during tests

Coverage includes:

Successful API flows

Validation failures

Duplicate data handling

Authorization checks

Rate limiting behavior

Error handling paths

Tests are designed to reflect real production behavior.

Environment Configuration

The application supports multiple environments:

Development

Test

Staging / Production

Behavior is controlled via environment variables:

Database connection

JWT secrets

CORS configuration

Server port

Logging behavior

The server does not auto-connect to the database when running tests.

Getting Started
Prerequisites

Node.js (v18+ recommended)

MongoDB instance (local or cloud)

Installation
npm install

Development
npm run dev

Testing
npm test

Production / Staging
npm start

Project Goals

This project was built to demonstrate:

End-to-end backend system design

Clean API architecture

Defensive programming and validation

Security-conscious middleware usage

Observability and monitoring

Automated testing at integration level

Production deployment readiness

License

MIT License
