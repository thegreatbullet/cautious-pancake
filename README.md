# Pokémon Backend API

[![Node.js](https://img.shields.io/badge/node-v24+-green?logo=node.js&style=flat-square)](https://nodejs.org/)
[![CI](https://github.com/yourusername/pokemon-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/pokemon-backend/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-0%25-red?style=flat-square)](https://github.com/yourusername/pokemon-backend/actions)
[![ESLint](https://img.shields.io/badge/eslint-passing-brightgreen?style=flat-square)](https://eslint.org/)

A Node.js backend API for managing Pokémon data, rolls, and admin operations.  
Built with **Express**, **MongoDB**, and **Mongoose**, with **Jest** tests and logging via **Winston**.

---

## Table of Contents

- [Pokémon Backend API](#pokémon-backend-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Install Dependencies](#install-dependencies)

---

## Features

- Add, view, and delete Pokémon (admin-only routes)  
- Roll Pokémon and track roll history  
- Input validation with Mongoose schema  
- Centralized logging via Winston  
- Health check endpoint (`/health`)  

---

## Tech Stack

- **Node.js**  
- **Express**  
- **MongoDB + Mongoose**  
- **Jest + Supertest** for testing  
- **ESLint + Prettier** for code quality  
- **Winston** for logging  

---

## Getting Started

### Prerequisites

- Node.js v24+  
- MongoDB instance running locally or via cloud  

### Install Dependencies

```bash
npm install
