# AI Snippet Service

A Node.js Express API service that generates AI-powered summaries from raw text content with user authentication, rate limiting, and quota management.

## Table of Contents

- [1. Overview](#1-overview)
- [2. Project Structure](#2-project-structure)
- [3. Setup & Configuration](#3-setup--configuration)
- [4. Running the Application](#4-running-the-application)
- [5. API Reference](#5-api-reference)
- [6. Frontend (Remix)](#6-frontend-remix)
- [7. Testing](#7-testing)
- [8. Troubleshooting](#8-troubleshooting)
- [9. Advanced Topics](#9-advanced-topics)
- [10. Contributing](#10-contributing)
- [11. License](#11-license)
- [12. Post-Challenge Reflection](#12-post-challenge-reflection)

---

## 1. Overview

### Features

- **Create Snippets**: POST raw text and get AI-generated summaries
- **Read Snippets**: Retrieve individual snippets by ID
- **List Snippets**: Get all snippets sorted by creation date with creator information
- **User Authentication**: Simple email-based authentication system
- **Rate Limiting**: API and user-level rate limiting to prevent abuse
- **Quota Management**: Free tier limits (5 summaries per user) with pro user support
- **Caching**: Avoid duplicate AI processing for similar text
- **RESTful API**: Clean, well-documented endpoints
- **Docker Support**: Containerized deployment with test-first approach
- **Centralized Health Check**: The root `/` route now serves as the health check endpoint
- **Single Database Connection Utility**: All database connections use a single shared utility for maintainability
- **Modular, DRY Backend**: Business logic is in service modules, cross-cutting concerns use middleware, and response formatting is handled by utility functions

### Tech Stack

- **Runtime**: Node.js 22.16+ LTS
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose
- **AI Provider**: Google Gemini API (with support for OpenAI GPT-4, Hugging Face)
- **Testing**: Jest + Supertest
- **Validation**: Zod
- **Authentication**: Simple email-based auth with JWT support
- **Rate Limiting**: express-rate-limit
- **CORS**: Enabled for frontend integration
- **Containerization**: Docker + Docker Compose

---

## 2. Project Structure

```
ai-snippet-service/
├── src/                  # Backend (to be moved to /backend)
│   ├── __tests__/        # Backend tests
│   ├── config/           # Database configuration (single connectDatabase utility)
│   ├── middleware/       # Rate limiting, validation, error handling
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes (thin, call service layer)
│   ├── services/         # Business logic (e.g., snippetService.js)
│   └── utils/            # Response helpers and other utilities
├── frontend/             # Remix frontend app
│   ├── app/              # Remix routes and components
│   ├── cypress/          # E2E tests
│   └── ...               # Frontend config, tests, etc.
├── Docker/               # Docker and compose files
└── ...                   # Root-level config
```

---

## 3. Setup & Configuration

### Prerequisites

- Node.js 22.16+ LTS
- MongoDB Atlas account
- Google Gemini API key (or OpenAI/Hugging Face API key)
- Docker and Docker Compose (for containerized deployment)

### Step 1: Clone and Setup Environment

```bash
git clone <repository-url>
cd ai-snippet-service
cp env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` with your actual values:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/ai-snippet-service?retryWrites=true&w=majority

# AI Provider Configuration (choose one)
GEMINI_API_KEY=your-gemini-api-key-here
# OPENAI_API_KEY=your-openai-api-key-here
# HUGGINGFACE_API_KEY=your-huggingface-api-key-here

# JWT Configuration
JWT_SECRET=your-jwt-secret-here

# Frontend API URL
API_URL=http://localhost:3000
```

### Step 3: Getting API Keys

_At least one AI provider API key is required_

#### Google Gemini API Key (Recommended - Free Tier)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

#### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

#### Hugging Face API Key

1. Visit [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to Settings > Access Tokens
4. Create a new token
5. Copy the token to your `.env` file

### Step 4: MongoDB Atlas Setup

#### Create MongoDB Atlas Account & Cluster

1. **Visit MongoDB Atlas**: Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Sign Up/Login**: Create a free account or sign in
3. **Create a Cluster**:
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region close to you
   - Click "Create"

#### Set Up Database Access

1. **Create Database User**:
   - In the left sidebar, click "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

#### Set Up Network Access

1. **Allow IP Access**:
   - In the left sidebar, click "Network Access"
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

#### Get Connection String

1. **Get Connection String**:

   - In the left sidebar, click "Database"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

2. **Format the Connection String**:
   Replace `<password>` with your actual password and `<dbname>` with your database name:

```
mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/ai-snippet-service?retryWrites=true&w=majority
```

### Environment Variables Reference

| Variable              | Description                     | Required | Default                      |
| --------------------- | ------------------------------- | -------- | ---------------------------- |
| `PORT`                | Server port                     | No       | 3000 (Docker) / 3000 (Local) |
| `NODE_ENV`            | Environment                     | No       | development                  |
| `MONGODB_URI`         | MongoDB Atlas connection string | Yes      | -                            |
| `GEMINI_API_KEY`      | Google Gemini API key           | Yes\*    | -                            |
| `OPENAI_API_KEY`      | OpenAI API key                  | No       | -                            |
| `HUGGINGFACE_API_KEY` | Hugging Face API key            | No       | -                            |
| `JWT_SECRET`          | JWT signing secret              | No       | default-jwt-secret           |
| `API_URL`             | Frontend API URL                | No       | http://localhost:3000        |

---

## 4. Running the Application

### Option A: Local Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production mode
npm start

# Run tests
npm test

# Test with coverage
npm run test:coverage
```

### Option B: Docker (Recommended)

#### Quick Start with Startup Script

```bash
./docker-start.sh
```

#### Manual Docker Commands

```bash
# Run tests first
docker-compose --profile test up test-runner --build --abort-on-container-exit

# Start API service
docker-compose up api --build -d

# Start everything at once
docker-compose up --build
```

#### Docker Services

1. **API Service** (Port 3000): Main Express.js API
2. **Test Runner**: Runs all tests before starting services
3. **UI Service** (Port 3030): Placeholder for Remix frontend

#### Docker Commands

```bash
# Build and run tests
docker-compose --profile test up test-runner --build

# Start API service
docker-compose up api --build -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build --force-recreate
```

### Verify Installation

- **API Health Check**: http://localhost:3000/health
- **API Documentation**: See API Reference section below

---

## 5. API Reference

### Authentication & Rate Limiting

- **Authentication**: Simple email-based authentication (users created automatically)
- **API Level**: 15 requests per minute
- **User Level**: 1 request per 30 seconds per user
- **Quota**: 5 summaries per user (free tier)

### Endpoints

#### Health Check

- **GET** `/` - Server health status (now at root; `/health` removed)

#### Create a Snippet (POST /snippets)

**curl:**

```bash
curl -X POST http://localhost:3000/snippets \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a long blog post that needs a summary.", "email": "user@example.com"}'
```

**Postman:**

- Method: POST
- URL: http://localhost:3000/snippets
- Body (JSON):
  ```json
  {
    "text": "This is a long blog post that needs a summary.",
    "email": "user@example.com"
  }
  ```

**Response:**

```json
{
  "id": "...",
  "text": "...",
  "summary": "...",
  "userInfo": {
    "email": "...",
    "summariesCreated": 1,
    "remainingSummaries": 4,
    "isProUser": false
  }
}
```

#### List All Snippets (GET /snippets)

**curl:**

```bash
curl http://localhost:3000/snippets
```

**Postman:**

- Method: GET
- URL: http://localhost:3000/snippets

**Response:**

```json
[
  {
    "id": "...",
    "text": "...",
    "summary": "...",
    "createdAt": "...",
    "createdBy": "user@example.com"
  }
]
```

#### Get a Snippet by ID (GET /snippets/:id)

**curl:**

```bash
curl http://localhost:3000/snippets/<snippet_id>
```

**Postman:**

- Method: GET
- URL: http://localhost:3000/snippets/<snippet_id>

**Response:**

```json
{
  "id": "...",
  "text": "...",
  "summary": "...",
  "createdAt": "...",
  "createdBy": "user@example.com"
}
```

#### Get User Status (GET /snippets/user/status)

**curl:**

```bash
curl "http://localhost:3000/snippets/user/status?email=user@example.com"
```

**Postman:**

- Method: GET
- URL: http://localhost:3000/snippets/user/status?email=user@example.com

**Response:**

```json
{
  "email": "...",
  "summariesCreated": 1,
  "remainingSummaries": 4,
  "isProUser": false,
  "lastSummaryAt": "...",
  "canCreateSummary": true
}
```

### Error Responses

- `429 Too Many Requests`: Rate limit exceeded
- `403 Forbidden`: Quota exceeded
- `400 Bad Request`: Invalid email or text
- `401 Unauthorized`: Authentication required

---

## 6. Frontend (Remix)

### Implementation Details

The frontend is implemented in the `/frontend` directory using:

- **Remix** (with Vite) for modern React routing and SSR
- **React** 18
- **TypeScript** for strict typing
- **TailwindCSS** for utility-first styling
- **Zod** for schema validation
- **Cypress** for E2E testing
- **Vite** for fast dev/build
- **ESLint** and **Prettier** for code quality
- **@remix-run/node/react/serve/dev** for full-stack features

### Current Features

- Creating snippets and summaries via the main `/` route
- Listing recent snippets below the form
- Responsive, accessible UI with TailwindCSS
- (Planned) E2E and TDD tests

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 7. Testing

The project follows Test-Driven Development (TDD) approach:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in Docker
docker-compose --profile test up test-runner --build
```

### Test Database

Tests automatically use a separate test database:

- **Development**: `ai-snippet-service`
- **Testing**: `ai-snippet-service-test`

The test database is automatically created and cleaned up after each test run.

---

## 8. Troubleshooting

### Docker Issues

- **"Environment variables not found"**: Ensure `.env` file exists and contains required variables
- **"Tests failing in Docker"**: Check MongoDB Atlas connection and API keys
- **"Port already in use"**: Stop existing containers with `docker-compose down`

### MongoDB Connection Issues

- **"Authentication failed"**: Check your username and password in the connection string
- **"Network timeout"**: Ensure your IP address is whitelisted in Network Access
- **"Database not found"**: The database will be created automatically on first use

### Test Failures

- **"MongoDB connection timeout"**: Ensure your MongoDB Atlas cluster is running
- **"Permission denied"**: Check that your database user has read/write permissions

### Rate Limiting Issues

- **"429 Too Many Requests"**: Wait for the rate limit window to reset
- **"403 Quota exceeded"**: User has reached their 5-summary limit

---

## 9. Advanced Topics

### MongoDB Downtime Handling & Guest Fallback

The API supports a fallback mode if MongoDB is down:

- Cached snippets are served for GET requests if available
- If the database is unavailable, users can use `guest@example.com` to create new AI summaries, which are stored in memory (not persisted)

**Bottlenecks faced:**

- Most API write/auth routes require a working database, so fallback is limited to guest/demo mode
- End-to-end (e2e) tests and frontend TDD could not be fully implemented due to time constraints and the dependency on a live database connection
- If MongoDB is down, e2e tests that require DB access will fail

**Guest fallback:**

- If the DB is down, users can use `guest@example.com` to access the main AI summary functionality and create snippets (in-memory only)

### Development Progress

#### ✅ Completed Steps

1. **Express Backend Boilerplate**: Server setup, middleware, MongoDB connection, health checks, Jest configuration
2. **Mongoose Snippet Model**: Model with validation, indexing, comprehensive tests
3. **AI Service Implementation**: Google Gemini integration, multiple provider support, error handling
4. **Express Routes Implementation**: All CRUD endpoints with validation and error handling
5. **Docker & Containerization**: Production and development images, test-first approach
6. **User Authentication & Rate Limiting**: Email-based auth, rate limiting, quota management
7. **Frontend Implementation**: Remix app with TailwindCSS, TypeScript, Zod integration
8. **Backend Refactor for Modularity & Reusability**: 
   - Removed duplicate database connection logic (now using a single shared connectDatabase utility)
   - The root `/` route is now the health check endpoint (removed `/health`)
   - All business logic is in service modules, cross-cutting concerns use middleware, and response formatting is handled by utility functions
   - **Centralized MongoDB shutdown logic**: Graceful shutdown and connection closing is now handled only in the database config, not duplicated in index.js

#### 🔄 Next Steps

- **Monorepo Migration**: Move backend code to `/backend` (from `/src`)
- **Create root `package.json`**: For running both apps concurrently
- **Shared Types/Utils**: Set up shared code between backend and frontend
- **Update CI/CD**: Build/test/deploy both apps in GitHub Actions
- **Docker Compose**: Add frontend service to Docker setup
- **Docs**: Update documentation for monorepo and full-stack usage

---

## 10. Contributing

1. Follow TDD approach - write tests first
2. Use meaningful commit messages
3. Ensure all tests pass before committing
4. Follow the established code style
5. Test with Docker before submitting

---

## 11. License

MIT

---

## 12. Post-Challenge Reflection

**What I'd improve with more time:**

- Complete the monorepo migration: move backend to `/backend`, set up a root `package.json` for concurrent dev, and enable shared types/utils
- Implement full TDD and E2E coverage for the frontend (Remix) and backend, including CI/CD for both apps
- Add persistent caching (e.g., Redis) for better fallback and scalability
- Add user authentication with JWT and role-based access for more robust security
- Improve error handling and user feedback in the frontend
- Add pagination, search, and filtering for snippets
- Polish the UI/UX and add accessibility improvements

**Trade-offs made:**

- Fallback logic for MongoDB downtime is in-memory only (not persistent, not distributed)
- Guest mode is enabled for demo purposes, but not suitable for production security
- E2E and TDD for the frontend were limited by time and DB dependency
- Some advanced features (streaming summaries, role-based access, etc.) were left as time didn't allow
