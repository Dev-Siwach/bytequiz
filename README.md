# ByteQuiz: Comprehensive Technical Documentation

ByteQuiz is an industrial-grade, full-stack educational platform built with modern web technologies. It is designed to facilitate the creation, distribution, and grading of online quizzes while introducing localized, privacy-first AI features powered by Ollama.

This document serves as the complete technical manual, covering system architecture, data models, interaction flows, and deployment procedures.

---

## 📑 Table of Contents
1. [System Overview & Capabilities](#1-system-overview--capabilities)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Data & Domain Model (Database Schema)](#4-data--domain-model-database-schema)
5. [Core Interaction Flows](#5-core-interaction-flows)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Directory Structure](#7-directory-structure)
8. [Security & Authentication](#8-security--authentication)
9. [Prerequisites & System Requirements](#9-prerequisites--system-requirements)
10. [Local Development Setup](#10-local-development-setup)
11. [Running the Application](#11-running-the-application)
12. [Default Seed Data & Access](#12-default-seed-data--access)

---

## 1. System Overview & Capabilities

ByteQuiz orchestrates a complete lifecycle for online testing through three distinct Role-Based Access Control (RBAC) profiles:

*   **ADMIN:** System overseers with absolute control over user accounts. They can create new accounts manually, deactivate malicious users, and reset user passwords directly.
*   **TEACHER:** Content creators who manage the quiz catalog. Teachers create drafts, populate them with questions, publish them for student access, and review class performance metrics.
*   **STUDENT:** End-users who consume published content. Students take active quizzes under timed conditions, submit answers for immediate grading, review their exact mistakes, and see how they stack up against peers on dynamic leaderboards.

### 🧠 Native AI Integration (The Differentiator)
Instead of relying on costly and privacy-invasive cloud LLM providers (like OpenAI), ByteQuiz integrates **Ollama**, allowing a Large Language Model to run entirely offline on the host machine.
*   **Automated Content Generation:** Teachers prompt the AI with a topic and question count. The LLM generates a mathematically structured JSON payload containing the questions, four options, the designated correct answer, and an educational explanation.
*   **Personalized Student Tutoring:** When a student reviews a completed quiz, they can invoke the AI on any missed question. The system constructs a contextual prompt containing the question, the right answer, and the student's *wrong* answer, generating a targeted explanation of why the student's logic was flawed.

---

## 2. High-Level Architecture

ByteQuiz follows a classic Client-Server architecture augmented by a local AI Inference Engine.

```text
+-------------------+       REST / JSON       +-----------------------+
|                   |  (Bearer Token Auth)    |                       |
|   React Client    | <=====================> |   Node.js/Express     |
|   (SPA / Vite)    |                         |   Backend API         |
|                   |                         |                       |
+-------------------+                         +-------+-------+-------+
                                                      |       |
                 +------------------------------------+       |
                 |                                            |
                 V                                            V
        +-----------------+                       +-------------------+
        |                 |                       |                   |
        |  Ollama Engine  |                       |  SQLite Database  |
        |  (gemma4:e4b)   |                       |  (via Prisma ORM) |
        |                 |                       |                   |
        +-----------------+                       +-------------------+
```

### Component Breakdown
1.  **The Client (Frontend):** A React Single Page Application (SPA) that manages state, user sessions, and protected routing. It communicates exclusively via asynchronous Axios calls to the backend API.
2.  **The Server (Backend):** An Express.js application responsible for input validation (via Zod), business logic execution, authentication (JWT), and orchestrating downstream requests to the database and the AI engine.
3.  **The Persistence Layer:** Prisma ORM handles object-relational mapping to a file-based SQLite database (`dev.db`), ensuring ACID compliance and referential integrity across users, quizzes, and submissions.
4.  **The AI Inference Layer:** A local Ollama daemon hosting the Google `gemma4:e4b` model. It receives highly engineered, zero-shot prompts from the backend and returns generated text or JSON.

---

## 3. Technology Stack

### Frontend Tier
*   **Core:** React 18
*   **Build Tooling:** Vite (Lightning-fast HMR and optimized builds)
*   **Routing:** React Router DOM v6
*   **Data Fetching:** Axios (configured with intercepts for JWT injection)
*   **Styling:** Pure, semantic Vanilla CSS (`global.css`, `auth.css`) to minimize dependency bloat.

### Backend Tier
*   **Runtime Environment:** Node.js (v18+)
*   **Web Framework:** Express.js 4.x
*   **Database ORM:** Prisma Client 5.x
*   **Schema Validation:** Zod (ensures runtime type safety on incoming payloads)
*   **Security:** `bcryptjs` for cryptographic password hashing; `jsonwebtoken` for stateless session management.
*   **Cross-Origin:** `cors` middleware configured strictly for the frontend origin.

### Artificial Intelligence
*   **Platform:** Ollama
*   **Model:** `gemma4:e4b`

---

## 4. Data & Domain Model (Database Schema)

The Prisma schema is designed with strict relational constraints and cascading deletes to maintain data hygiene.

### Core Entities:
*   **`User`**: The central actor. Contains authentication fields (`email`, `passwordHash`), profile metadata (`name`), and role designations (`role: 'ADMIN' | 'TEACHER' | 'STUDENT'`).
*   **`Quiz`**: Represents an assessment container. Authored by a Teacher (`createdById`). Contains metadata (`title`, `description`) and a publication state (`isPublished`).
*   **`Question`**: Belongs to a Quiz. Holds the prompt (`text`), four distinct choices (`optionA`...`D`), the structural key of the correct choice (`correctOption`), and an optional human-authored explanation.
*   **`Submission`**: A composite record representing a Student's attempt at a Quiz. Captures the aggregated score, time elapsed (`timeTakenSecs`), and timestamps. Enforces a `@@unique([studentId, quizId])` constraint to prevent multiple attempts.
*   **`SubmissionAnswer`**: A granular breakdown of a Submission. Maps exactly which option the student selected for each question and calculates if it was correct at the time of submission.
*   **`Ranking`**: An asynchronously generated or synchronously inserted record mapping a student to a specific rank on a specific quiz based on score and completion time.

---

## 5. Core Interaction Flows

### A. Authentication Flow
1. User provides credentials to the frontend login form.
2. Frontend POSTs `/api/auth/login`.
3. Backend controller searches the `User` table. If found, compares hashes via `bcrypt.compare`.
4. If successful, backend signs a JWT containing the user's `id` and `role` and returns it.
5. Frontend stores the JWT in Local Storage and attaches it as a `Bearer` token in the `Authorization` header for all subsequent API calls via an Axios interceptor.

### B. AI Quiz Generation Flow (Teacher)
1. Teacher clicks "Generate with AI" and provides a topic (e.g., "Photosynthesis") and a count (e.g., 5).
2. Frontend POSTs to `/api/llm/generate`.
3. The `llm.controller` validates the input and constructs a strict prompt commanding the LLM to output *only* a specific JSON array structure.
4. The request is dispatched to the local Ollama instance (`http://localhost:11434/api/generate`).
5. Ollama processes the prompt through `gemma4:e4b` and returns the raw string.
6. The backend cleans the response (stripping markdown fences), parses it into a native JavaScript object, and returns it to the client.
7. The frontend iterates over the array and populates the dynamic quiz creation form fields automatically.

### C. AI Mistake Explanation Flow (Student)
1. Student views their quiz result and clicks "Explain my mistake" on a failed question.
2. Frontend POSTs to `/api/llm/explain` with the full context: the question text, all options, what the student chose, and what was actually correct.
3. The backend constructs an educational prompt instructing the LLM to act as a tutor and explain the logical gap in 3-5 sentences without repeating the question.
4. Ollama processes the request and streams the response back.
5. The backend returns the text string, and the frontend renders the customized explanation dynamically beneath the incorrect answer.

---

## 6. API Endpoints Reference

All endpoints are prefixed with `/api`.

### Auth (`/auth`)
*   `POST /register`: Register a new user (usually defaults to STUDENT).
*   `POST /login`: Authenticate and receive a JWT.
*   `GET /me`: Validate current token and fetch user profile.

### Quiz (`/quizzes`)
*   `GET /`: List all *published* quizzes (Student/Teacher).
*   `GET /mine`: List all quizzes authored by the requesting Teacher.
*   `GET /:id`: Fetch a specific published quiz (without correct answers).
*   `GET /:id/full`: Fetch the complete quiz, including correct answers (Teacher only).
*   `POST /`: Create a new quiz with nested questions.
*   `PUT /:id`: Overwrite an existing quiz and its questions.
*   `DELETE /:id`: Delete a quiz entirely.
*   `PATCH /:id/publish`: Toggle the visibility of a quiz.

### Submission (`/submissions`)
*   `POST /:quizId`: Submit a completed quiz for grading. Calculates score, inserts `SubmissionAnswer` records, and updates `Ranking`.
*   `GET /my/:quizId`: Fetch the requesting student's past submission for a quiz.
*   `GET /quiz/:quizId`: Fetch all student submissions for a specific quiz (Teacher only).

### Ranking (`/rankings`)
*   `GET /:quizId`: Get the global leaderboard for a specific quiz.
*   `GET /:quizId/mine`: Get the requesting student's exact rank and score.

### Local AI (`/llm`)
*   `POST /generate`: Trigger Ollama to generate quiz questions (Teacher only).
*   `POST /explain`: Trigger Ollama to explain a specific wrong answer (Student only).

### Administration (`/admin`)
*   `GET /users`: List all users.
*   `POST /users`: Provision a new user manually.
*   `PATCH /users/:id/deactivate`: Suspend an account.
*   `PATCH /users/:id/activate`: Restore a suspended account.
*   `PATCH /users/:id/reset-password`: Force reset a user's password.

---

## 7. Directory Structure

```text
bytequiz/
├── start.sh                 # Unified script to boot both servers in background
├── stop.sh                  # Script to kill running backend/frontend processes
├── README.md                # This documentation file
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database structure & ORM configuration
│   │   ├── seed.js          # Initial database population script
│   │   └── dev.db           # SQLite database file
│   ├── src/
│   │   ├── server.js        # Node.js entry point (port binding)
│   │   ├── app.js           # Express application & middleware assembly
│   │   ├── controllers/     # Business logic & request handling (auth, quiz, llm)
│   │   ├── middleware/      # JWT verification, Role checks, Zod validation
│   │   ├── routes/          # Express route definitions linking to controllers
│   │   ├── schemas/         # Zod schemas for strict request body validation
│   │   ├── services/        # External integrations (e.g., llm.service.js)
│   │   └── utils/           # Helper functions (e.g., jwt.utils.js)
│   └── .env                 # Backend environment variables
└── frontend/
    ├── src/
    │   ├── main.jsx         # React DOM attachment point
    │   ├── App.jsx          # Route definitions and layout wrapper
    │   ├── api/             # Axios instance configuration (axios.js)
    │   ├── components/      # Reusable UI elements (Navbar, ProtectedRoute)
    │   ├── context/         # React Context for global state (AuthContext.jsx)
    │   ├── pages/           # View layer, separated by role (admin/, student/, teacher/)
    │   └── styles/          # Global CSS and Auth-specific styling
    ├── vite.config.js       # Vite bundler configuration
    └── .env                 # Frontend environment variables
```

---

## 8. Security & Authentication

1.  **Stateless JWT:** All routes (except login/register) require a valid JSON Web Token in the `Authorization: Bearer <token>` header.
2.  **Role-Based Middleware:** The backend utilizes specialized middleware (`requireAdmin`, `requireTeacher`, `requireStudent`) that inspects the decoded JWT payload. If a Student attempts to hit a Teacher endpoint (e.g., `POST /api/quizzes`), the request is rejected with a `403 Forbidden` before it ever reaches the controller.
3.  **Data Sanitization:** All incoming POST/PUT bodies are verified against strict Zod schemas in `validate.middleware.js`. Unrecognized fields are stripped, and invalid data types return a `400 Bad Request` with exact error mappings.
4.  **Password Hashing:** Plaintext passwords are never stored. `bcryptjs` is used with a high salt round to hash passwords on creation and verify them on login.

---

## 9. Prerequisites & System Requirements

To run this stack successfully, the host machine must have:

*   **Operating System:** Linux, macOS, or Windows (via WSL2).
*   **Node.js:** Version 18.0.0 or higher.
*   **NPM:** Node Package Manager (comes with Node.js).
*   **Ollama:** Must be installed and running on the host network.
    *   Download from: [https://ollama.com/](https://ollama.com/)
    *   **Crucial Step:** You must pull the exact model the system expects before using AI features. Open a terminal and run:
        ```bash
        ollama pull gemma4:e4b
        ```
*   **Hardware:** For smooth AI generation, a machine with at least 8GB of RAM is recommended (16GB+ preferred if running the model heavily).

---

## 10. Local Development Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd bytequiz
    ```

2.  **Initialize the Backend**
    ```bash
    cd backend
    npm install
    ```
    *Note: The repository includes a pre-configured `dev.db` SQLite file. If you ever need to reset the database completely from scratch:*
    ```bash
    npx prisma migrate reset
    # or
    rm prisma/dev.db
    npx prisma db push
    node prisma/seed.js
    ```

3.  **Initialize the Frontend**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Environment Configuration**
    Ensure the `.env` files exist.
    *   `backend/.env`:
        ```env
        DATABASE_URL="file:./dev.db"
        JWT_SECRET="replace_this_with_a_long_random_secret_string"
        PORT=3001
        CORS_ORIGIN="http://localhost:5173"
        OLLAMA_URL="http://localhost:11434"
        LLM_MODEL="gemma4:e4b"
        ```
    *   `frontend/.env`:
        ```env
        VITE_API_URL="http://localhost:3001/api"
        ```

---

## 11. Running the Application

### The Automated Way (Background Services)
For convenience, a shell script is provided at the root of the project to orchestrate the startup sequence.

```bash
# From the root /bytequiz directory:
./start.sh
```
This script runs the backend and frontend in detached `nohup` processes. It stores their process IDs in `.pid` files and pipes their console output to `backend.log` and `frontend.log`.

**To shut down the entire stack cleanly:**
```bash
./stop.sh
```

### The Manual Way (Foreground Development)
If you are actively developing and need to see console outputs in real-time, open two separate terminal windows.

**Terminal A (Backend):**
```bash
cd backend
npm run dev
```
*(Runs on `http://localhost:3001` with Nodemon for hot-reloading)*

**Terminal B (Frontend):**
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173` with Vite HMR)*

**Ollama Requirement:**
Ensure the Ollama application/service is active in the background before testing the AI functionalities.

---

## 12. Default Seed Data & Access

The database is pre-seeded with three accounts representing each core role. Use these to immediately test the Role-Based Access controls and AI features.

| Role Designation | Login Email | Login Password | Recommended First Action |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@quiz.com` | `admin123` | View user list, deactivate a user. |
| **Teacher** | `teacher@quiz.com` | `teacher123` | Click "Create Quiz", use AI generator, publish the quiz. |
| **Student** | `student@quiz.com` | `student123` | Take a published quiz, get an answer wrong, and ask the AI to explain. |

---
*End of Documentation.*
