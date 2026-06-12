# Architecture Overview

## System Context

```text
User Browser
  |
  | HTTPS / REST
  v
Next.js Frontend
  |
  | JSON API requests with JWT
  v
Spring Boot Backend
  |
  | JPA/Hibernate
  v
PostgreSQL

Spring Boot Backend
  |
  | Internal HTTP, future phase
  v
Python AI Service
  |
  | ML models / RAG / external AI API
  v
Vector Store / Model Artifacts
```

## Backend Modules

- `security`: JWT filters, password hashing, role guards.
- `user`: login identity and account state.
- `employee`: employee profile, reporting manager, department metadata.
- `attendance`: check-in/out records, attendance summaries, anomaly-ready data.
- `leave`: leave requests, approvals, balances, leave types.
- `payroll`: salary summary, deductions, payable days, overtime impact.
- `shift`: shifts, assignments, roster, overtime detection.
- `document`: file metadata, access control, upload/download flow.
- `notification`: in-app alerts and future email hooks.
- `analytics`: dashboards, AI integration boundaries, reports.
- `common`: shared exceptions, DTOs, pagination, audit helpers.

## Frontend Modules

- `app/(auth)`: login and auth-only pages.
- `app/(dashboard)`: protected application area.
- `components/layout`: app shell, sidebar, topbar.
- `components/ui`: reusable buttons, cards, tables, inputs.
- `lib`: API client, auth helpers, utilities.
- `types`: shared frontend TypeScript models.

## Security Model

- Frontend stores JWT in a secure client strategy appropriate for the final deployment.
- Backend validates JWT on protected endpoints.
- Role-based rules protect Employee, Manager, and HR Admin actions.
- Service layer enforces ownership checks, for example employees can only read their own documents.

## Initial Roles

- `EMPLOYEE`
- `MANAGER`
- `HR_ADMIN`
- `SYSTEM_ADMIN`
