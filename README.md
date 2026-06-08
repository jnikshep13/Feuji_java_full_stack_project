# Smart Auth Connector

A full-stack healthcare prior-authorization platform that connects providers and payers with an AI-powered Copilot review engine. Built with Angular 17 (frontend) and Spring Boot 3 (backend).

---

## Overview

Prior authorization is one of the most time-consuming workflows in healthcare. This platform streamlines the process by:

- Allowing **providers** to build and submit authorization requests
- Running an **AI Copilot review** (powered by Claude via Anthropic API) that scores readiness and flags clinical gaps before submission
- Giving **payers** a review queue to adjudicate requests (approve / deny / request more info)
- Generating **FHIR-compliant** claim bundles for each request
- Sending **real-time notifications** to both sides at every status change

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, TypeScript, RxJS |
| Backend | Spring Boot 3.3, Java 17 |
| Database | H2 (in-memory, zero setup) — MySQL / PostgreSQL also supported |
| AI Copilot | Anthropic Claude API (falls back to built-in rules engine if no key) |
| API Standard | FHIR R4 (Claim / ClaimResponse bundles) |

---

## Project Structure

```
smart-auth-connector/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/connector/auth/
│   │   ├── domain/           # JPA entities
│   │   ├── dto/              # Request/response DTOs
│   │   ├── web/              # REST controllers
│   │   ├── service/          # Business logic + Copilot client
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── mapper/           # FHIR bundle mapper
│   │   └── config/           # CORS configuration
│   └── src/main/resources/
│       ├── application.yml   # App config
│       ├── schema.sql        # DB schema
│       └── data.sql          # Seed data
│
└── frontend/                 # Angular application
    └── src/app/
        ├── components/
        │   ├── provider/     # Authorization request builder + Copilot review
        │   ├── payer/        # Review queue + adjudication
        │   ├── tracking/     # Request tracking across both sides
        │   └── fhir-viewer/  # FHIR bundle viewer
        ├── services/         # API service (HTTP client)
        └── models/           # TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 22+ and npm
- Maven (or use the included `mvnw` wrapper)

---

### 1. Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on **http://localhost:8081**

- H2 Console (inspect DB): http://localhost:8081/h2-console
  - JDBC URL: `jdbc:h2:mem:authdb`
  - Username: `sa` | Password: *(leave blank)*

---

### 2. Run the Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:4200**

---

### 3. Enable AI Copilot (Optional)

By default the platform uses the built-in clinical rules engine. To enable live AI reviews via Claude:

```powershell
# Windows PowerShell
$env:ANTHROPIC_API_KEY = "sk-ant-your-key-here"

# Then restart the backend
./mvnw spring-boot:run
```

Get an API key at https://console.anthropic.com

---

## Features

### Provider Portal (`/provider`)
- Build authorization requests with patient, coverage, provider, diagnosis (ICD-10), and service line (CPT) details
- Run AI Copilot pre-review to get a readiness score and fix clinical gaps before submitting
- Resubmit requests when a payer asks for additional information

### Payer Portal (`/payer`)
- Review queue showing all pending authorization requests with AI readiness scores
- Full clinical detail view including Copilot assessment
- One-click Approve / Deny / Request Info with rationale and auth number

### Tracking (`/tracking`)
- Full audit trail of every request and status change visible to both sides

### Notifications
- Real-time notification panel for both provider and payer roles
- Color-coded alerts (success / warning / danger / info)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/provider/copilot/review` | Run AI pre-review on a draft request |
| POST | `/api/provider/requests` | Submit a new authorization request |
| POST | `/api/provider/requests/{id}/resubmit` | Resubmit with additional documentation |
| GET | `/api/payer/queue` | Get all pending requests |
| POST | `/api/payer/requests/{id}/decision` | Record approve / deny / info decision |
| GET | `/api/requests` | Get all requests (tracking) |
| GET | `/api/requests/{id}/fhir` | Get FHIR R4 bundle for a request |
| GET | `/api/notifications` | Get notifications for a recipient |

---

## Database

The app ships with H2 in-memory database — no setup needed. Data resets on each restart.

To switch to a persistent database, edit `backend/src/main/resources/application.yml` and uncomment the MySQL or PostgreSQL block.

---

## Configuration

Key settings in `backend/src/main/resources/application.yml`:

| Setting | Default | Description |
|---------|---------|-------------|
| `server.port` | `8081` | Backend port |
| `copilot.model` | `claude-sonnet-4-20250514` | Claude model used for reviews |
| `copilot.api-key` | *(empty)* | Set `ANTHROPIC_API_KEY` env var to enable |
| `cors.allowed-origins` | `http://localhost:4200` | Frontend origin allowed by CORS |
