# Campus Help Desk Board

A full-stack Campus Help Desk application built using **Next.js, PostgreSQL, and Redis**. Students can submit help requests, view the latest requests, and monitor the total number of page visits.

## Features

- Submit campus help requests with student name and message.
- Validate empty or invalid submissions.
- Store requests permanently in PostgreSQL.
- Cache the latest 10 requests using Redis.
- Automatically invalidate the Redis cache when a new request is submitted.
- Track page views using Redis counters.
- Fall back to PostgreSQL when Redis is unavailable.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend and API routes |
| React | User interface |
| TypeScript | Application development |
| PostgreSQL | Permanent data storage |
| Redis | Caching and view counter |
| Node.js | Runtime environment |
| Docker | Running PostgreSQL and Redis |

## Project Structure

```text
helpdesk-app/
├── app/
│   ├── api/
│   │   ├── requests/
│   │   │   └── route.ts
│   │   └── views/
│   │       └── route.ts
│   ├── page.tsx
│   └── ...
├── lib/
│   ├── db.ts
│   └── redis.ts
├── public/
├── .env.example
├── package.json
└── README.md
```

## Prerequisites

- Node.js and npm
- Docker Desktop
- PostgreSQL
- Redis

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Babyln1704/Campus-HelpDesk-Board.git
cd Campus-HelpDesk-Board
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://helpdesk:helpdesk123@localhost:5432/campus_helpdesk
REDIS_URL=redis://localhost:6379
```

Update these values if your local database configuration is different.

### 4. Start PostgreSQL and Redis

If Docker Compose is configured in the project:

```bash
docker compose up -d
```

Ensure PostgreSQL and Redis are running.

### 5. Run the application

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser if the application starts on port 3001. Otherwise, use the port shown in your terminal.

## Database Schema

The application uses the following PostgreSQL table:

```sql
CREATE TABLE IF NOT EXISTS help_requests (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(50) NOT NULL,
    message VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### 1. Submit a Help Request

**POST** `/api/requests`

Accepts a student name and message, validates the input, stores the request in PostgreSQL, and invalidates the Redis cache.

Example request:

```json
{
  "student_name": "Student",
  "message": "Need help with campus Wi-Fi"
}
```

### 2. Retrieve Latest Requests

**GET** `/api/requests`

- Checks Redis for cached requests.
- Returns cached data when available.
- Queries PostgreSQL when the cache is missing.
- Stores the latest 10 requests in Redis for 60 seconds.
- Falls back to PostgreSQL if Redis is unavailable.

The response includes a `source` field indicating whether the data came from Redis or PostgreSQL.

### 3. Track Page Views

**GET** `/api/views`

Uses Redis `INCR` to maintain the page-view counter.

## Testing and Verification

The following scenarios were tested:

1. Submit a valid help request.
2. Verify that the request is stored in PostgreSQL.
3. Verify a Redis cache miss and PostgreSQL response.
4. Verify a Redis cache hit on subsequent requests.
5. Submit a new request and verify cache invalidation.
6. Submit empty input and verify validation.
7. Stop Redis and verify PostgreSQL fallback.
8. Verify that the page-view counter increments.

## Production Build

To verify the application build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Author

**Baby L N**

GitHub: [Babyln1704](https://github.com/Babyln1704)

## Repository

[Campus Help Desk Board – GitHub](https://github.com/Babyln1704/Campus-HelpDesk-Board)
