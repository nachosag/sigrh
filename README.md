# SIGRH+ — Integrated HR Management System

A full-featured Human Resources management platform built with FastAPI, designed to automate and consolidate core HR workflows: employee lifecycle management, shift-aware payroll calculation, biometric attendance tracking, AI-assisted candidate screening, and leave administration.

---

## Overview

SIGRH+ was built to address the operational complexity of mid-sized organizations where HR processes are often fragmented across spreadsheets, manual clock-in systems, and disconnected tools. The system provides a unified REST API backend that serves as the single source of truth for:

- Employee records and organizational structure
- Attendance registration (manual and face-recognition-based)
- Shift-aware payroll calculation with automatic overtime and absence detection
- Job posting lifecycle and NLP-driven CV matching against required skills
- Leave request management with document validation workflows
- System-wide audit logging for sensitive mutations

The target audience is internal HR and administrative staff, with role-based access control governing which operations each user can perform.

---

## Key Features

**Employee Management**
Tracks full employee records including personal data, job assignments, shift assignments, document attachments, and work history. Supports soft-deletion (active/inactive status) and auto-generated user IDs derived from name and DNI.

**Attendance and Face Recognition**
Clock events (IN/OUT) can be registered manually via API or automatically through a facial recognition endpoint. Face embeddings are stored as JSON vectors and matched against registered employees using Euclidean distance with a configurable threshold.

**Shift-Aware Payroll Calculation**
Three shift types (morning, afternoon, night) each have distinct logic for calculating worked hours, detecting absences, validating overtime, and cross-midnight scenarios. The engine queries approved leaves and automatically classifies each working day without human intervention.

**NLP-Driven CV Matching**
Candidate CVs (stored as base64-encoded PDFs) are extracted, normalized, and semantically matched against job opportunity skill requirements using spaCy large language models. The matching pipeline uses PhraseMatcher for exact terms and vector similarity with sliding window permutations for multi-word skills.

**Leave Management**
Employees can submit leave requests; supervisors review and approve them. Document upload and validation status are tracked independently from request status. Approved leaves are integrated directly into payroll calculation.

**Role and Permission System**
Permissions are assigned to roles, and roles to employees. Critical endpoints perform runtime checks against the decoded JWT payload and the employee's resolved permission set.

**Audit Logging**
All mutations to payroll records, clock events, job opportunities, and leaves are recorded in a centralized log table with entity type, entity ID, acting user, timestamp, and a diff-style description of changed fields.

**Configurable AI Assistant**
An Ollama-backed chatbot provides guided navigation of the SIGRH+ interface. It streams responses via Server-Sent Events and maintains conversation history per session.

---

## Architecture

The project follows a strict layered architecture applied consistently across every module:

```
Controller  →  Service  →  Model/ORM
```

- **Controllers** (`controllers/`) declare FastAPI routers, define HTTP method and status code, and delegate all logic to services. No business logic lives here.
- **Services** (`services/`) contain all domain logic, database queries, and error handling. They raise `HTTPException` when validation fails and catch `IntegrityError` for constraint violations.
- **Models** (`models/`) are SQLModel table definitions used directly by SQLAlchemy for schema generation and ORM queries.
- **Schemas** (`schemas/`) are Pydantic models used for request validation and response serialization, kept separate from ORM models to avoid coupling persistence and transport concerns.

Each business domain is an isolated module under `src/modules/`:

| Module | Responsibility |
|---|---|
| `auth` | JWT encoding/decoding, login, `/me` endpoint, bcrypt password management |
| `employees` | Full employee CRUD, user ID generation, document and work history management |
| `clock_events` | Attendance event registration, attendance summaries via raw SQL |
| `payroll_calculator` | Shift-specific hour calculation, overtime detection, leave integration |
| `cv_matching` | PDF extraction, NLP normalization, semantic skill matching |
| `face_recognition` | Embedding registration, Euclidean distance verification, attendance auto-registration |
| `leave` | Leave creation, supervisor approval flow, document status tracking, reporting |
| `opportunity` | Job posting lifecycle, required/desirable skill associations, postulation indicators |
| `postulation` | Candidate applications, suitability flags, rejection reason tracking |
| `role` / `ability` / `shift` / `concept` | Supporting catalogs |
| `logs` | Centralized audit trail |
| `ai_assistant` | Ollama-backed contextual chatbot with streaming |
| `configuration` | System-level customization (branding, SMTP config) |

Database initialization uses SQLModel's `metadata.create_all` triggered via FastAPI's `lifespan` context manager. SQLite is supported for local testing via an environment flag.

---

## Tech Stack

- **Language:** Python 3.12
- **Framework:** FastAPI 0.115 with Uvicorn
- **ORM:** SQLModel (SQLAlchemy 2.0 + Pydantic v2)
- **Databases:** PostgreSQL 17 (production), SQLite (test)
- **NLP:** spaCy 3.8 with `es_core_news_lg` and `en_core_web_lg` large models
- **PDF Extraction:** PyMuPDF and pypdf (dual-library strategy for robustness)
- **Authentication:** python-jose (JWT), passlib/bcrypt
- **AI Integration:** Ollama (self-hosted LLM, default `gemma:2b`)
- **Email:** fastapi-mail with Mailpit for local SMTP simulation
- **Containerization:** Docker + Docker Compose (backend, PostgreSQL, Ollama, Mailpit)
- **Numerical computation:** NumPy (face embedding distance)
- **Code quality:** Pyright (strict type checking), Ruff (linting/formatting)

---

## Notable Implementation Details

### CV Matching Pipeline

The candidate evaluation pipeline (`cv_matching/matcher_service.py`) solves a non-trivial NLP problem: matching free-text CVs against structured skill labels that may appear in varied forms (synonyms, inflections, abbreviations).

The pipeline operates in stages:

1. **Text extraction** — PDFs are decoded from base64 and processed by both PyMuPDF and pypdf independently. Their outputs are concatenated to maximize coverage of different PDF formats and encodings.
2. **Normalization** — Text is lowercased, accent-stripped via Unicode NFD decomposition, punctuation-removed, and whitespace-collapsed.
3. **Exact matching** — spaCy's `PhraseMatcher` is attempted first for direct token matches.
4. **Semantic matching** — If exact matching fails, both the document tokens and the skill label are lemmatized using a domain-specific custom lemma dictionary (covering technical terms like `postgres → sql`, `programacion → programar`, and ~50 others that spaCy's statistical model handles poorly for Spanish technical vocabulary).
5. **Sliding window similarity** — Token groups of the same length as the skill label are extracted from the document. For short phrases (under 10 tokens), all permutations of each token group are also evaluated. Cosine similarity is computed as the mean token-pair similarity across the group.
6. **Threshold decision** — A match is accepted when the maximum similarity across all windows and permutations exceeds a configurable threshold (default `0.79`).
7. **Suitability scoring** — Each opportunity defines minimum match percentages independently for required and desirable skills. A candidate is marked suitable only when both thresholds are satisfied.

### Payroll Calculation Engine

The payroll service (`payroll_calculator/service.py`) handles three shift archetypes with structurally different logic:

- **Morning shift** — Work begins and ends within the same calendar day. Overtime and absences are evaluated day by day, Monday through Friday.
- **Afternoon shift** — Shift can overlap midnight. OUT events from the following calendar day are included in the calculation. The engine resolves the correct day boundary when computing worked duration.
- **Night shift** — Entry is always on the current day, exit always on the next. Cross-midnight arithmetic is handled explicitly using `datetime.combine` with `timedelta(days=1)`.

For each day in the requested range, the engine:
- Deletes existing non-archived `EmployeeHours` records for that day before recalculating (idempotent recalculation)
- Skips weekends with a `DIA_NO_HABIL` record
- Checks for an approved leave overlapping the day
- Classifies the day as: absent, absent with leave, present without check-out, incomplete shift, complete shift, or shift with overtime
- Creates one or two `EmployeeHours` records per day (two when overtime is present: one `payable` for the standard shift, one `pending validation` for the extra hours)

Concept records (descriptive labels for each record type) are created on first use via `check_concept`, avoiding the need for pre-seeded catalog data.

### Face Recognition

Embeddings are stored as JSON float arrays in PostgreSQL. Verification iterates all registered embeddings and computes `np.linalg.norm(vec1 - vec2)`. A match below the Euclidean threshold (0.6) triggers either a verification response or direct clock event registration, depending on the endpoint called.

### Circular Import Avoidance

SQLModel relationship declarations use `TYPE_CHECKING` guards throughout. All cross-model type hints are string-forward-referenced, ensuring that Python's import system never encounters circular dependencies at runtime while preserving full static analysis support.

### Token Dependency Pattern

`TokenDependency = Annotated[dict, Depends(decode_token)]` is declared once in `auth/token.py` and reused across all authenticated endpoints. The token payload carries `employee_id` and `user_id`, which services use to perform ownership checks and audit log attribution.

### Attendance Summary via Raw SQL

The daily attendance summary endpoint uses a raw parameterized SQL query rather than ORM composition. This is a deliberate decision: the query involves a LEFT JOIN between employees, jobs, and clock events with conditional aggregation (`MIN`, `MAX`, `COUNT`) grouped by employee. Expressing this cleanly in SQLAlchemy's query API would be significantly more verbose without any correctness benefit.

---

## How to Run the Project

### With Docker (recommended)

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env: set POSTGRES_PASSWORD and optionally SECRET_KEY

# Start all services
docker compose up -d backend db ollama mailpit

# Load required seed data (mandatory)
# Connect to PostgreSQL on localhost:8003 and execute:
# src/database/data/data_entry_system.sql
```

Access the API at `http://localhost:8000`.  
Swagger UI: `http://localhost:8000/docs`  
Mailpit UI: `http://localhost:8005`

### Local Development

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\Activate.ps1 on Windows

pip install -r requirements.txt

# Configure .env with local PostgreSQL credentials
# Set USE_TEST_DATABASE=true to use SQLite instead

uvicorn src.main:app --reload
```

Default test credentials (after seed data is loaded):  
User: `bsosa672` / Password: `1234`

---

## Example Usage

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=bsosa672&password=1234"

# Get current user
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"

# Evaluate candidates for a job opportunity
curl http://localhost:8000/api/v1/matcher/1 \
  -H "Authorization: Bearer <token>"

# Register a clock-in event
curl -X POST http://localhost:8000/api/v1/clock_events/ \
  -H "Content-Type: application/json" \
  -d '{"employee_id": 1, "event_type": "in", "source": "manual", "device_id": "desk-01"}'

# Calculate payroll for a date range
curl -X POST http://localhost:8000/api/v1/payroll/calculate \
  -H "Content-Type: application/json" \
  -d '{"employee_id": 1, "start_date": "2025-06-01", "end_date": "2025-06-30"}'
```

---

## Project Structure

```
src/
  main.py                    # FastAPI app, router registration, CORS, lifespan
  database/
    core.py                  # Engine setup, session factory, DB initialization
    data/
      data_entry_system.sql  # Seed data: countries, roles, permissions, shifts, test user
  modules/
    auth/                    # JWT, bcrypt, OAuth2 login
    employees/               # Employee CRUD, documents, work history, user ID generation
    clock_events/            # Attendance registration and summaries
    payroll_calculator/      # Shift-specific hour calculation engine
    cv_matching/             # NLP pipeline for candidate-skill matching
    face_recognition/        # Embedding-based biometric verification
    leave/                   # Leave requests, approval workflow, reporting
    opportunity/             # Job postings, skill associations, indicators
    postulation/             # Candidate applications, suitability, rejection tracking
    role/                    # Roles and permissions catalog
    ability/                 # Skills catalog
    shift/                   # Shift definitions
    concept/                 # Payroll concept labels
    logs/                    # Centralized audit trail
    ai_assistant/            # Ollama chatbot with streaming
    configuration/           # System-level settings
    email/                   # Mail sending abstraction
    config/                  # Environment variable helpers
```

Each module follows the same internal layout: `controllers/`, `services/`, `models/`, `schemas/`.

---

## Future Improvements

- **Permission enforcement consistency** — Several endpoints have permission checks commented out with TODOs. Completing this layer with a centralized decorator or dependency would eliminate the current inconsistency.
- **Async database sessions** — The current implementation uses synchronous SQLModel sessions. Migrating to `AsyncSession` with async drivers would improve throughput under concurrent load.
- **Payroll recalculation granularity** — The current approach deletes and recreates all records for a date range on each call. A change-detection mechanism (comparing existing records against computed values) would allow partial updates and preserve manual adjustments.
- **CV matching caching** — spaCy models are loaded per request in the current implementation. Loading them at startup and holding them in application state would eliminate significant per-request overhead.
- **Structured permission enum** — Permissions are currently referenced by integer ID in service code. Replacing these magic numbers with a synchronized Python enum (mirroring the seed data) would prevent silent failures when permission IDs drift.
- **Test coverage** — The `TEST_DATABASE_URL` SQLite configuration is in place but no test suite exists. Integration tests against the SQLite database would validate the core service layer without requiring PostgreSQL.

---

## Author

Backend project developed as part of a university-level software engineering group project. Reflects applied work in REST API design, NLP integration, domain-driven module organization, and automated payroll logic.

Built to demonstrate practical proficiency with FastAPI, SQLModel, and Python ecosystem tooling in a realistic HR domain context.

---

## Demo

https://github.com/user-attachments/assets/2a613fba-c511-4348-b897-5d90a7580f01


