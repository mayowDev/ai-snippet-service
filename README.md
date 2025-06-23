# AI Snippet Service

A Node.js Express API service that generates AI-powered summaries from raw text content with user authentication, rate limiting, and quota management.

## Tech Stack

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

## Prerequisites

- Node.js 22.16+ LTS
- MongoDB Atlas account
- Google Gemini API key (or OpenAI/Hugging Face API key)
- Docker and Docker Compose (for containerized deployment)

## Quick Start with Docker

### 1. Clone and Setup Environment

```bash
git clone <repository-url>
cd ai-snippet-service
cp env.example .env
```

### 2. Configure Environment Variables

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

# Frontend API URL - comming soon
API_URL=http://localhost:3000
```

### 3. Getting API Keys

\*At least one AI provider API key is required

### Google Gemini API Key (Recommended - Free Tier)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### Hugging Face API Key

1. Visit [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to Settings > Access Tokens
4. Create a new token
5. Copy the token to your `.env` file

### MongoDB Atlas (Detailed Setup below)

1. Follow the MongoDB Atlas setup instructions below
2. Create a free cluster
3. Set up database user and network access
4. Get your connection string
5. Replace username/password in the connection string

### 4. Run with Docker (Recommended)

**Option A: Use the startup script (runs tests first)**

```bash
./docker-start.sh
```

**Option B: Manual Docker commands**

```bash
# Run tests first
docker-compose --profile test up test-runner --build --abort-on-container-exit

# Start API service
docker-compose up api --build -d
```

**Option C: Start everything at once**

```bash
docker-compose up --build
```

### 5. Verify Installation

- **API Health Check**: http://localhost:3000/health
- **API Documentation**: See API Endpoints section below

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd ai-snippet-service
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your actual values (see Getting API Keys in Docker section above).

### 3. Running the Application

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

**Running tests:**

```bash
npm test
```

**Test with coverage:**

```bash
npm run test:coverage
```

## Docker & Containerization

### Docker Setup

The project includes comprehensive Docker support:

- **Dockerfile**: Production-ready Node.js 22.16 Alpine image
- **Dockerfile.dev**: Development image with test dependencies
- **docker-compose.yml**: Multi-service orchestration
- **docker-start.sh**: Automated startup script with test-first approach

### Docker Services

1. **API Service** (Port 3000): Main Express.js API
2. **Test Runner**: Runs all tests before starting services
3. **UI Service** (Port 3030): Placeholder for Remix frontend

### Docker Commands

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

### Docker Features

- **Test-First Approach**: Tests run automatically before service startup
- **Health Checks**: Built-in health monitoring
- **Security**: Non-root user execution
- **Optimization**: Multi-stage builds and .dockerignore
- **Environment**: Proper environment variable handling

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account & Cluster

1. **Visit MongoDB Atlas**: Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Sign Up/Login**: Create a free account or sign in
3. **Create a Cluster**:
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region close to you
   - Click "Create"

### 2. Set Up Database Access

1. **Create Database User**:
   - In the left sidebar, click "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

### 3. Set Up Network Access

1. **Allow IP Access**:
   - In the left sidebar, click "Network Access"
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

### 4. Get Connection String

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

### 5. Test Database Setup

The application automatically creates a test database by appending `-test` to your database name:

- Development database: `ai-snippet-service`
- Test database: `ai-snippet-service-test`

## API Endpoints & Request Examples (curl & Postman)

### Create a Snippet (POST /snippets)

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

### List All Snippets (GET /snippets)

**curl:**

```bash
curl http://localhost:3000/snippets
```

**Postman:**

- Method: GET
- URL: http://localhost:3000/snippets

### Get a Snippet by ID (GET /snippets/:id)

**curl:**

```bash
curl http://localhost:3000/snippets/<snippet_id>
```

**Postman:**

- Method: GET
- URL: http://localhost:3000/snippets/<snippet_id>

### Get User Status (GET /snippets/user/status)

**curl:**

```bash
curl "http://localhost:3000/snippets/user/status?email=user@example.com"
```

**Postman:**

- Method: GET
- URL: http://localhost:3000/snippets/user/status?email=user@example.com

---

### Health Check

- **GET** `/health` - Server health status

### Snippets

- **POST** `/snippets` - Create new snippet with AI summary

  - Body: `{ "text": "raw content to summarize", "email": "user@example.com" }`
  - Returns: `{ "id": "...", "text": "...", "summary": "...", "userInfo": { "email": "...", "summariesCreated": 1, "remainingSummaries": 4, "isProUser": false } }`
  - Rate Limit: 1 request per 30 seconds per user
  - Quota: 5 summaries per user (free tier)

- **GET** `/snippets` - Get all snippets (sorted by latest)

  - Returns: `[{ "id": "...", "text": "...", "summary": "...", "createdAt": "...", "createdBy": "user@example.com" }]`

- **GET** `/snippets/:id` - Get single snippet by ID
  - Returns: `{ "id": "...", "text": "...", "summary": "...", "createdAt": "...", "createdBy": "user@example.com" }`

### User Management

- **GET** `/snippets/user/status?email=user@example.com` - Get user's quota and status
  - Returns: `{ "email": "...", "summariesCreated": 1, "remainingSummaries": 4, "isProUser": false, "lastSummaryAt": "...", "canCreateSummary": true }`

## Authentication & Rate Limiting

### Authentication

- Simple email-based authentication
- Users are automatically created on first use
- No password required (suitable for demo/internal use)

### Rate Limiting

- **API Level**: 15 requests per minute (respects AI provider limits)
- **User Level**: 1 request per 30 seconds per user
- **Quota**: 5 summaries per user (free tier)

### Error Responses

- `429 Too Many Requests`: Rate limit exceeded
- `403 Forbidden`: Quota exceeded
- `400 Bad Request`: Invalid email or text
- `401 Unauthorized`: Authentication required

## Development Progress

### ✅ Step 1: Express Backend Boilerplate

- [x] Created package.json with all dependencies
- [x] Set up Express server with middleware
- [x] Configured MongoDB connection with Mongoose
- [x] Added CORS support
- [x] Implemented health check endpoint
- [x] Created Jest test configuration
- [x] Wrote comprehensive tests for server setup
- [x] Added graceful shutdown handling

### ✅ Step 2: Mongoose Snippet Model

- [x] Created Snippet model with text, summary, and createdAt fields
- [x] Added proper validation and required fields
- [x] Implemented database indexing for duplicate detection
- [x] Wrote comprehensive tests for model validation
- [x] Set up MongoDB Atlas integration for both development and testing

### ✅ Step 3: AI Service Implementation

- [x] Created AI service with Google Gemini integration
- [x] Implemented async summarize function with proper error handling
- [x] Added dependency injection for testability
- [x] Wrote comprehensive tests with mocking
- [x] Used environment variables for API key management
- [x] Added support for multiple AI providers (OpenAI, Hugging Face)

### ✅ Step 4: Express Routes Implementation

- [x] Created POST /snippets endpoint with validation and AI integration
- [x] Created GET /snippets endpoint with sorting and formatting
- [x] Created GET /snippets/:id endpoint with error handling
- [x] Implemented Zod validation for all inputs
- [x] Added comprehensive error handling and status codes
- [x] Wrote full test suite with Supertest

### ✅ Step 5: Docker & Containerization

- [x] Created production Dockerfile with Node.js 22.16 Alpine
- [x] Created development Dockerfile with test dependencies
- [x] Implemented docker-compose.yml with multi-service setup
- [x] Added test-first approach with automated test runner
- [x] Created startup script with environment validation
- [x] Added health checks and security best practices
- [x] Optimized build with .dockerignore

### ✅ Step 6: User Authentication & Rate Limiting

- [x] Implemented User model with email-based authentication
- [x] Added rate limiting middleware (API and user level)
- [x] Created quota management system (5 summaries per user)
- [x] Implemented user status endpoint
- [x] Added creator tracking to snippets
- [x] Updated API responses to include user information
- [x] Wrote comprehensive tests for authentication and rate limiting

### ✅ Step 7: Frontend Implementation

- [x] Scaffolded Remix app in `/frontend`
- [x] Integrated TailwindCSS, Zod, TypeScript, React
- [x] Implemented snippet creation and listing UI
- [x] Added Cypress and Vitest for testing (TDD/E2E planned)
- [x] Connected to backend API for AI summaries

### 🔄 Next Steps

- [ ] **Monorepo Migration:** Move backend code to `/backend` (from `/src`)
- [ ] **Create root `package.json`:** For running both apps concurrently (e.g., with `concurrently` or `npm workspaces`)
- [ ] **Shared Types/Utils:** Set up shared code between backend and frontend
- [ ] **Update CI/CD:** Build/test/deploy both apps in GitHub Actions
- [ ] **Docker Compose:** Add frontend service to Docker setup
- [ ] **Docs:** Update documentation for monorepo and full-stack usage

## Testing

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

## Environment Variables

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

## Troubleshooting

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

## Project Structure

```
src/                  # Backend (to be moved to /backend)
frontend/             # Remix frontend app
  app/                # Remix routes and components
  ...                 # Frontend config, tests, etc.
Docker/               # Docker and compose files
...                   # Root-level config
```

## Features

- **Create Snippets**: POST raw text and get AI-generated summaries
- **Read Snippets**: Retrieve individual snippets by ID
- **List Snippets**: Get all snippets sorted by creation date with creator information
- **User Authentication**: Simple email-based authentication system
- **Rate Limiting**: API and user-level rate limiting to prevent abuse
- **Quota Management**: Free tier limits (5 summaries per user) with pro user support
- **Caching**: Avoid duplicate AI processing for similar text
- **RESTful API**: Clean, well-documented endpoints
- **Docker Support**: Containerized deployment with test-first approach

## Frontend Implementation (Remix, TailwindCSS, Zod, and More)

- The frontend is implemented in the `/frontend` directory using:
  - **Remix** (with Vite) for modern React routing and SSR
  - **React** 18
  - **TypeScript** for strict typing
  - **TailwindCSS** for utility-first styling
  - **Zod** for schema validation
  - **Cypress** for E2E testing
  - **Vite** for fast dev/build
  - **ESLint** and **Prettier** for code quality
  - **@remix-run/node/react/serve/dev** for full-stack features
  - See `frontend/package.json` for all dependencies
- The frontend currently supports:
  - Creating snippets and summaries via the main `/` route
  - Listing recent snippets below the form
  - Responsive, accessible UI with TailwindCSS
  - (Planned) E2E and TDD tests (see bottlenecks section)

## Issues faced: MongoDB Downtime Handling, Guest Fallback, and Testing Limitations

- The API now supports a fallback mode if MongoDB is down:
  - Cached snippets are served for GET requests if available.
  - If the database is unavailable, users can use `guest@example.com` to create new AI summaries, which are stored in memory (not persisted).
- **Bottlenecks faced:**
  - Most API write/auth routes require a working database, so fallback is limited to guest/demo mode.
  - End-to-end (e2e) tests and frontend TDD could not be fully implemented due to time constraints and the dependency on a live database connection.
  - If MongoDB is down, e2e tests that require DB access will fail.
- **Guest fallback:**
  - If the DB is down, users can use `guest@example.com` to access the main AI summary functionality and create snippets (in-memory only).

## Post-Challenge Reflection

**What I'd improve with more time:**

- Complete the monorepo migration: move backend to `/backend`, set up a root `package.json` for concurrent dev, and enable shared types/utils.
- Implement full TDD and E2E coverage for the frontend (Remix) and backend, including CI/CD for both apps.
- Add persistent caching (e.g., Redis) for better fallback and scalability.
- Add user authentication with JWT and role-based access for more robust security.
- Improve error handling and user feedback in the frontend.
- Add pagination, search, and filtering for snippets.
- Polish the UI/UX and add accessibility improvements.

**Trade-offs made:**

- Fallback logic for MongoDB downtime is in-memory only (not persistent, not distributed).
- Guest mode is enabled for demo purposes, but not suitable for production security.
- E2E and TDD for the frontend were limited by time and DB dependency.
- Some advanced features (streaming summaries, role-based access, etc.) were left as time didn't allow.

---

## Contributing

1. Follow TDD approach - write tests first
2. Use meaningful commit messages
3. Ensure all tests pass before committing
4. Follow the established code style
5. Test with Docker before submitting

## License

MIT
