# API Plan

## Auth

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

## Employees

- `GET /api/employees/me`
- `GET /api/employees`
- `POST /api/employees`
- `PATCH /api/employees/{id}`
- `PATCH /api/employees/{id}/deactivate`

## Attendance

- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET /api/attendance/me`
- `GET /api/attendance/team`
- `GET /api/attendance/reports/monthly`

## Leave

- `POST /api/leaves`
- `GET /api/leaves/me`
- `GET /api/leaves/pending`
- `PATCH /api/leaves/{id}/approve`
- `PATCH /api/leaves/{id}/reject`
- `GET /api/leaves/balance/me`

## Payroll

- `GET /api/payroll/me`
- `GET /api/payroll/monthly`
- `POST /api/payroll/generate`
- `PATCH /api/payroll/{id}/finalize`

## Future AI

- `GET /api/ai/attrition-risk/{employeeId}`
- `GET /api/ai/attendance-anomalies`
- `POST /api/ai/resume-screening`
- `POST /api/hr-chatbot/query`
