# HR Management System

Enterprise-style HR Management System built with a Next.js frontend and Spring Boot backend.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Spring Boot, Spring Security, Spring Data JPA
- Database: PostgreSQL
- API Docs: OpenAPI / Swagger
- Deployment: Docker Compose

## Workspace Layout

```text
HRMS/
  frontend/        Next.js web app
  backend/         Spring Boot REST API
  docs/            PRD, architecture, API notes, diagrams
  infra/           Docker Compose and infrastructure config
  scripts/         Utility scripts
```

## Suggested Build Order

1. Backend authentication, roles, database schema, and seed users.
2. Attendance check-in/check-out APIs and employee dashboard.
3. Leave application and manager approval workflow.
4. Payroll summary, holidays, shifts, and overtime detection.
5. Document vault, org chart, notifications, and audit logs.
6. AI service integration for attrition risk and HR chatbot.

## Local Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
mvn spring-boot:run
```

Database and services:

```bash
docker compose -f infra/docker-compose.yml up -d
```
