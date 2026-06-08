# HealthConnectAI — Smart Healthcare Connector Platform

A full-stack intelligent healthcare authorization workflow platform powered by **AI**, **FHIR R4 standards**, **Angular 17**, **Spring Boot 3.2**, and **MySQL 8**.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────┐      ┌──────────────────────────────────┐
│   Angular 17 Frontend           │      │   Spring Boot 3.2 Backend         │
│   (Port 4200)                   │◄────►│   (Port 8080)                     │
│                                 │ REST │                                    │
│  • Provider Dashboard           │ API  │  • JWT Security                   │
│  • Payer Dashboard              │      │  • FHIR Resource Modeling         │
│  • AI Copilot Sidebar           │      │  • AI Copilot Engine              │
│  • Kanban Status Board          │      │  • WebSocket (Real-time Chat)     │
│  • Bidirectional Chat           │      │  • Authorization Workflow         │
│  • Notification Center          │      │  • Notification Engine            │
└─────────────────────────────────┘      └──────────────────────────────────┘
                                                          │
                                                          ▼
                                         ┌──────────────────────────────────┐
                                         │        MySQL 8 Database           │
                                         │  • users                          │
                                         │  • authorization_requests         │
                                         │  • communications                 │
                                         │  • notifications                  │
                                         └──────────────────────────────────┘
```

---

## ✨ Features

### 🏥 Provider Module
- **Dashboard** with KPI metrics (drafts, awaiting response, AI rate, action needed)
- **New Request form** with real-time AI Copilot validation
- **Active Cases** worklist with search, filter, sort
- **Case Detail** with FHIR resource inspector and timeline

### 🏢 Payer Module
- **Review Dashboard** with auto-adjudication stats
- **Split-screen Review Queue** (list + detail viewer)
- **Quick Approve/Reject/Clarify** actions
- **FHIR Resource Inspector** for clean field views

### 🤖 AI Copilot Engine
- Real-time scan as provider fills the form
- Validates: NPI, ICD-10 codes, clinical notes, CPT codes, demographics
- Risk scoring (0–100%) with GREEN/YELLOW/RED levels
- Auto-fix suggestions — attaches missing clinical documents
- Prevents rejection before submission

### 📊 Status Tracking (Kanban)
- Visual board with 5 FHIR-mapped columns:
  `Draft → Transmitted → Payer Review → Info Requested → Finalized`
- Color-coded cards with AI scores and urgency
- Expiry date warnings

### 💬 Bidirectional Communication
- In-case chat window (FHIR Communication resource)
- WebSocket support for real-time messaging
- No submission closure required — inline clarification

### 🔔 Notification Center
- Critical 🚨 / Warning 🟡 / Success ✅ / AI Insight ✨ alerts
- Unread badge count
- Mark all read

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+ & npm
- MySQL 8.0+
- Maven 3.8+

### 1. Database Setup
```sql
CREATE DATABASE healthcare_connector;
-- Tables auto-created by JPA (ddl-auto=update)
-- Demo data seeded on first startup
```

### 2. Backend Setup
```bash
cd backend

# Configure DB credentials in:
# src/main/resources/application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/healthcare_connector
# spring.datasource.username=root
# spring.datasource.password=your_password

mvn clean install
mvn spring-boot:run
```
Backend runs at: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs at: http://localhost:4200

---

## 🔑 Demo Credentials

| Role     | Username  | Password     | Portal                      |
|----------|-----------|--------------|------------------------------|
| Provider | provider1 | password123  | http://localhost:4200/login  |
| Provider | provider2 | password123  | http://localhost:4200/login  |
| Payer    | payer1    | password123  | http://localhost:4200/login  |
| Admin    | admin     | admin123     | http://localhost:4200/login  |

---

## 📡 API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/login | Login and get JWT |
| POST | /api/auth/register | Register new user |

### Authorization Requests
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/authorization/create | Create draft request |
| POST | /api/authorization/analyze | AI analysis (no save) |
| POST | /api/authorization/{caseId}/submit | Submit to payer |
| POST | /api/authorization/{caseId}/ai-fix | Apply AI recommended fixes |
| POST | /api/authorization/{caseId}/review | Payer approve/reject |
| POST | /api/authorization/{caseId}/clarification | Request clarification |
| GET | /api/authorization/provider/dashboard | Provider KPIs |
| GET | /api/authorization/payer/dashboard | Payer KPIs |
| GET | /api/authorization/provider/cases | All provider cases |
| GET | /api/authorization/payer/cases | All cases for payer |
| GET | /api/authorization/kanban | Kanban board data |
| GET | /api/authorization/{caseId} | Single case detail |

### Communication
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/communication/{caseId}/messages | Get chat messages |
| POST | /api/communication/send | Send message |

### Notifications
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/notifications | Get user notifications |
| GET | /api/notifications/unread-count | Get unread count |
| POST | /api/notifications/mark-all-read | Mark all as read |
| POST | /api/notifications/{id}/read | Mark one as read |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17 (Standalone Components) |
| Styling | Custom SCSS Design System (Dark Healthcare Theme) |
| Backend | Spring Boot 3.2, Java 17 |
| Security | JWT (JJWT 0.11), Spring Security |
| Real-time | WebSocket / STOMP |
| Database | MySQL 8 + Spring Data JPA |
| AI Engine | Custom rule-based clinical validator |
| Standards | HL7 FHIR R4 (Claim, ClaimResponse, Communication, Coverage) |
| API Docs | SpringDoc OpenAPI 3 / Swagger UI |

---

## 📁 Project Structure

```
healthcare-connector/
├── backend/
│   ├── src/main/java/com/healthcare/connector/
│   │   ├── ai/               # AI Copilot Engine
│   │   ├── config/           # Security, WebSocket, Data Initializer
│   │   ├── controller/       # REST Controllers
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── model/            # JPA Entities + Enums
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── security/         # JWT Filter + Utils
│   │   └── service/          # Business Logic Services
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   └── src/app/
│       ├── components/
│       │   ├── auth/           # Login, Register
│       │   ├── provider-dashboard/  # Provider screens
│       │   ├── payer-dashboard/     # Payer screens
│       │   ├── new-request/    # Request form + AI Copilot
│       │   ├── case-detail/    # Case + Chat + Timeline
│       │   ├── status-tracking/ # Kanban Board
│       │   └── shared/         # Layout, Notifications
│       ├── guards/             # Auth guard
│       ├── interceptors/       # JWT interceptor
│       ├── models/             # TypeScript interfaces
│       └── services/           # HTTP services
└── docs/
    ├── schema.sql
    └── README.md
```

Video of the Project

https://github.com/user-attachments/assets/7e63fc29-81b4-41bb-a820-92ed9dfc4433

