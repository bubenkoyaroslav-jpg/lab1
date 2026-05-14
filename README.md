# Cybersecurity Incident Tracker Backend (Laboratory Work)
Version: `0.2.0`
## Project Description
This is a simple backend project for university laboratory work.
It uses Node.js + Express + TypeScript and stores all data only in memory (arrays in repositories).
No database is used.
Important: after server restart, all data is deleted.
## Implemented Entities
- Users (mandatory)
- Incidents (main domain entity)
## Technologies
- Node.js
- Express
- TypeScript
- tsx (dev mode)
- tsc (build)
- ESLint (basic config)
## Project Structure
```text
src/
 ┣ routes/
 ┣ controllers/
 ┣ services/
 ┣ repositories/
 ┣ dtos/
 ┣ middleware/
 ┣ utils/
 ┣ app.ts
 ┗ server.ts
```
## Installation and Run
1) Install dependencies:
```bash
npm install
```
2) Run in development mode:
```bash
npm run dev
```
3) Build production files:
```bash
npm run build
```
4) Start from build:
```bash
npm start
```
Server default URL:
`http://localhost:3000`
## API Endpoints
### Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
### Incidents
- `GET /api/incidents`
- `GET /api/incidents/:id`
- `POST /api/incidents`
- `PUT /api/incidents/:id`
- `PATCH /api/incidents/:id`
- `DELETE /api/incidents/:id`
## Additional REST Features
Implemented:
- Filtering via query params
- Pagination via `page` and `pageSize`
- Sorting via `sortBy` and `sortDir`
- PATCH partial update
Examples:
- `GET /api/users?role=Analyst&page=1&pageSize=5&sortBy=name&sortDir=asc`
- `GET /api/incidents?status=New&itemCode=INC&page=1&pageSize=10&sortBy=dateFrom&sortDir=desc`
## cURL Examples
### Users
Get users:
```bash
curl -X GET "http://localhost:3000/api/users?page=1&pageSize=10&sortBy=id&sortDir=desc"
```
Create user:
```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Brown",
    "email": "alice@example.com",
    "role": "Analyst"
  }'
```
Update user (PUT):
```bash
curl -X PUT "http://localhost:3000/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Brown Updated",
    "email": "alice.updated@example.com",
    "role": "Admin"
  }'
```
Partial update user (PATCH):
```bash
curl -X PATCH "http://localhost:3000/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "User"
  }'
```
Delete user:
```bash
curl -X DELETE "http://localhost:3000/api/users/1"
```
### Incidents
Get incidents:
```bash
curl -X GET "http://localhost:3000/api/incidents?status=New&page=1&pageSize=10&sortBy=dateFrom&sortDir=desc"
```
Create incident:
```bash
curl -X POST "http://localhost:3000/api/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "itemCode": "INC-001",
    "userId": 1,
    "dateFrom": "2026-05-01",
    "dateTo": "2026-05-02",
    "comment": "Suspicious login attempts",
    "status": "New"
  }'
```
Update incident (PUT):
```bash
curl -X PUT "http://localhost:3000/api/incidents/1" \
  -H "Content-Type: application/json" \
  -d '{
    "itemCode": "INC-001",
    "userId": 1,
    "dateFrom": "2026-05-01",
    "dateTo": "2026-05-03",
    "comment": "Investigation in progress",
    "status": "In Progress"
  }'
```
Partial update incident (PATCH):
```bash
curl -X PATCH "http://localhost:3000/api/incidents/1" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Resolved"
  }'
```
Delete incident:
```bash
curl -X DELETE "http://localhost:3000/api/incidents/1"
```
## Validation Examples
Invalid user request (missing required fields):
```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A"
  }'
```
Invalid incident request (dateTo < dateFrom):
```bash
curl -X POST "http://localhost:3000/api/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "itemCode": "INC-002",
    "userId": 1,
    "dateFrom": "2026-05-10",
    "dateTo": "2026-05-01",
    "comment": "Wrong dates example",
    "status": "New"
  }'
```
## Error Response Examples
Validation error (`400 Bad Request`):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "email",
        "message": "email is required and must be 5-100 chars."
      }
    ]
  }
}
```
Not found error (`404 Not Found`):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": []
  }
}
```
Unexpected error (`500 Internal Server Error`):
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Internal server error",
    "details": []
  }
}
```

