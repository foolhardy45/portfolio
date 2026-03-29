# Code Analysis Deliverable — Tayrell Music Portfolio

**Date:** 2026-03-29
**Application:** Tayrell Music Portfolio Website
**Assessment Type:** Pre-Engagement Security Code Analysis
**Analyst:** Automated Code Intelligence Agent

---

# Penetration Test Scope & Boundaries

**Primary Directive:** This analysis is strictly limited to the **network-accessible attack surface** of the application. All findings adhere to the scope criteria defined below.

### In-Scope: Network-Reachable Components
A component is considered **in-scope** if its execution can be initiated, directly or indirectly, by a network request that the deployed application server is capable of receiving. This includes:
- The nginx reverse proxy serving the Angular SPA on port 80 (production)
- The Flask backend API serving 4 endpoints on port 5000 (proxied through nginx in production)
- All Angular frontend pages rendered in the browser that make API calls
- The PostgreSQL database accessed indirectly through backend API endpoints
- Static assets served by nginx (JavaScript, CSS, images)

### Out-of-Scope: Locally Executable Only
The following components are **out-of-scope** as they cannot be invoked through the running application's network interface:
- **Database migration scripts** (`backend/migrations/`) — Alembic CLI tool, requires `flask db upgrade` command
- **Test suite** (`backend/tests/`) — pytest-based, requires `pytest` CLI execution
- **CI/CD pipeline** (`.github/workflows/ci.yml`) — GitHub Actions, triggered by git events only
- **Backend seed scripts** (`backend/scripts/seed.py`) — CLI-only data seeder
- **Development Docker Compose** (`docker-compose.yml`) — Local development orchestration
- **Flask CLI commands** (`.flaskenv`) — Development server bootstrapping

---

## 1. Executive Summary

This application is a **public-facing portfolio website** built with an Angular 20 frontend and Flask 3.1 backend, backed by PostgreSQL 16. The architecture follows a standard SPA + REST API pattern deployed via Docker containers with nginx as a reverse proxy. The application has a deliberately minimal attack surface: it exposes only 4 API endpoints, none of which require authentication, and serves primarily read-only content with a single write endpoint (contact form).

The most critical security findings center around **secrets management and infrastructure hardening** rather than application-level vulnerabilities. A `.env` file containing database credentials and a weak Flask `SECRET_KEY` is **tracked in git** (confirmed via `git ls-files`), representing an immediate credential exposure risk. The production deployment serves traffic over **HTTP only** (port 80) with no TLS termination configured in nginx, meaning all data — including contact form PII (names and emails) — would transit in plaintext. Additionally, several critical security headers are missing from the nginx configuration, including Content-Security-Policy and Strict-Transport-Security.

From an application security perspective, the codebase demonstrates reasonable defensive coding practices: SQLAlchemy parameterized queries prevent SQL injection, Marshmallow schema validation enforces input constraints, Angular's built-in template escaping mitigates XSS, and rate limiting protects the contact form endpoint. However, there are notable gaps: no CSRF protection on the POST endpoint, project URL fields (`image_url`, `github_url`, `demo_url`) stored without validation that could enable client-side URL injection attacks if an attacker gains database write access, CORS origins hardcoded to localhost only, and no data retention or deletion mechanisms for stored PII. The overall risk profile is **LOW-MEDIUM** given the public-facing nature and minimal write surface, but the infrastructure issues require remediation before production deployment.

---

## 2. Architecture & Technology Stack

### Framework & Language

The application is a **monorepo** with two primary components:

| Component | Technology | Version | Security Implication |
|-----------|-----------|---------|---------------------|
| Frontend | Angular | 20.3.0 | Built-in XSS sanitization via DomSanitizer; strict TypeScript compilation |
| Backend | Flask (Python) | 3.1 | Lightweight WSGI framework; security features via extensions (CORS, rate limiting) |
| Database | PostgreSQL | 16-alpine | Mature RDBMS with parameterized query support via SQLAlchemy |
| Reverse Proxy | nginx | alpine | Static file serving + API proxying; security header configuration |
| WSGI Server | Gunicorn | 23.0 | Production-grade Python server with 4 worker processes |
| Validation | Marshmallow | 3.23 | Schema-based input validation for API endpoints |
| ORM | SQLAlchemy | 2.0 (Core) | Parameterized queries prevent SQL injection; uses Core (not ORM) pattern |

The frontend uses Angular's standalone component pattern (no NgModules) with signal-based reactivity. The UI layer uses `@spartan-ng/brain@0.0.1-alpha.656` — an **alpha-stage UI library** that may contain unpatched security issues. Tailwind CSS 4.2.2 handles styling. The backend follows a layered architecture: routes (Flask blueprints) → services → repositories → SQLAlchemy Core.

**Key dependency security notes:** `flask-cors>=5.0` handles cross-origin requests, `flask-limiter>=3.8` provides rate limiting with in-memory storage (not suitable for multi-instance deployments), and `psycopg[binary]>=3.2` is the modern PostgreSQL driver. No authentication libraries (JWT, OAuth, etc.) are present in `requirements.txt`, confirming the application has no auth system.

### Architectural Pattern

The application follows a **decoupled SPA + REST API** pattern with Docker containerization. Trust boundaries exist at three levels:

1. **Internet → nginx** (port 80): The primary trust boundary. Nginx serves static Angular assets and proxies `/api` requests to the Flask backend. Security headers (`X-Frame-Options`, `X-Content-Type-Options`) are applied here, but critical headers (CSP, HSTS) are missing.
2. **nginx → Flask backend** (port 5000, internal only in production): Internal Docker network communication. The backend trusts that requests have passed through nginx but performs its own validation via Marshmallow schemas and rate limiting.
3. **Flask → PostgreSQL** (port 5432, internal only in production): Database access over internal Docker network with credential-based authentication. Connection uses `postgresql+psycopg://` protocol without SSL enforcement.

In production (`docker-compose.prod.yml`), the database and backend are **not exposed to the host** — only nginx on port 80 is externally accessible. In development, both the database (5432) and backend (5000) are exposed on the host.

### Critical Security Components

- **Rate Limiting:** `flask-limiter` with `memory://` storage backend — protects only the `/api/contact` POST endpoint (5 requests/hour per IP). Other endpoints have no rate limiting. Memory storage means limits reset on restart and don't sync across instances.
- **CORS:** Configured via `flask-cors` with origins hardcoded to `["http://localhost:4200"]` in `backend/app/config.py:12`. Production configuration is unclear — if the CORS origins aren't updated for production, the API may reject legitimate frontend requests or be overly permissive.
- **Input Validation:** Marshmallow schemas enforce type, length, and format constraints on the contact form. Project data retrieved from the database passes through without output validation.
- **Error Handling:** Centralized error handlers in `backend/app/errors/handlers.py` return generic messages to clients while logging details server-side — good practice for information disclosure prevention.

---

## 3. Authentication & Authorization Deep Dive

### Authentication Mechanisms

**No authentication system is implemented.** The application has no user accounts, login/logout endpoints, password handling, JWT tokens, API keys, OAuth flows, or session management. This is architecturally appropriate for a public portfolio website — all content is intended to be publicly accessible.

**Authentication-related API endpoints: NONE.** There are no login, logout, token refresh, password reset, registration, or any other authentication endpoints in the codebase. The 4 API endpoints (`/api/health`, `/api/projects`, `/api/projects/<slug>`, `/api/contact`) are all publicly accessible without any authentication requirement.

The absence of authentication means there are no credential-stuffing targets, no session hijacking opportunities, and no authentication bypass vectors. However, this also means there is **no access control on data writes** — the contact form endpoint accepts submissions from any source, protected only by CORS (development-only configuration) and rate limiting.

### Session Management and Token Security

**No session management is configured.** Flask's built-in session support is not utilized — there are no `session[]` accesses in any route handler, no session store configuration, and no cookie flags configured. Since the application is stateless (no login, no session data), this is appropriate.

**Session cookie flags: NOT APPLICABLE.** There are no session cookies configured anywhere in the codebase. The Flask `SECRET_KEY` (configured in `backend/app/config.py:7` with a weak default of `"dev-secret-key"`) is present but currently only used internally by Flask and flask-limiter. If session support were ever added, this weak default would be a critical vulnerability allowing session forgery.

### Authorization Model

**No authorization model exists.** There is no role-based access control (RBAC), no access control lists (ACL), no permission decorators, and no middleware that checks user privileges. All 4 endpoints are unconditionally accessible. The only access control mechanism is the rate limiter on the contact form.

**Potential bypass scenarios:** Since there's no authorization, there's nothing to bypass at the application level. The primary risk is that if administrative features are added later (e.g., a CMS for managing projects), they could be accidentally exposed without proper auth if developers forget to add authentication middleware.

### SSO/OAuth/OIDC Flows

**Not applicable.** No SSO, OAuth, or OIDC integrations exist. No callback endpoints, no state/nonce parameter validation, no token exchange flows.

---

## 4. Data Security & Storage

### Database Security

The PostgreSQL 16 database stores two tables: `projects` (public content) and `contact_messages` (user-submitted PII). All database interactions use **SQLAlchemy Core** with parameterized queries, providing strong SQL injection protection. The repository layer (`backend/app/repositories/project_repo.py`, `backend/app/repositories/contact_repo.py`) consistently uses SQLAlchemy's `select()`, `insert()`, and `.where()` constructs with bound parameters — no raw SQL string concatenation was found.

**Database connection security concerns:**
- Connection string in `backend/app/config.py:8-11` defaults to `postgresql+psycopg://user:password@localhost:5432/portfolio` — weak default credentials
- No SSL/TLS enforcement on the database connection (`sslmode` not specified)
- No connection pooling configuration — relies on SQLAlchemy defaults (pool_size=5, max_overflow=10) without `pool_pre_ping` or `pool_recycle` settings (`backend/app/extensions.py:29`)
- In production Docker compose, the database is not exposed to the host (good), but no network-level encryption between containers

**Encryption at rest:** NOT CONFIGURED. No `pgcrypto` extension, no application-level field encryption, no transparent data encryption. Contact form PII (names, emails, messages) is stored in plaintext.

### Data Flow Security

**Contact form PII trace:**
1. **Browser → nginx (HTTP):** User submits form data as JSON. In production, this traverses the network in plaintext (no TLS configured).
2. **nginx → Flask:** Internal Docker network, JSON body forwarded to Flask.
3. **Flask validation:** Marshmallow schema (`backend/app/schemas/contact_schema.py:7-27`) validates name (2-100 chars), email (RFC 5322 format), message (10-5000 chars).
4. **Service layer:** `backend/app/services/contact_service.py:6-21` passes validated data directly to repository — no transformation, sanitization, or encryption.
5. **Database storage:** `backend/app/repositories/contact_repo.py:26-35` inserts PII via parameterized query into `contact_messages` table with UUID primary key and timestamp.

**Data leakage risks:**
- Debug-level logging (`backend/app/__init__.py:37-40`) may log SQL queries with PII parameters in development mode
- Frontend `console.error` at `frontend/src/app/services/api.service.ts:70` logs error objects that may contain response bodies
- Health endpoint (`/api/health`) discloses database connectivity status — minor information disclosure

### Multi-tenant Data Isolation

**Not applicable.** This is a single-user portfolio website with no multi-tenancy concept. All project data is public, and contact messages are collected for a single site owner.

---

## 5. Attack Surface Analysis

### External Entry Points (In-Scope)

All 4 API endpoints are network-accessible and in-scope:

| # | Method | Path | Auth | Rate Limit | Input Sources | File Location |
|---|--------|------|------|-----------|---------------|---------------|
| 1 | GET | `/api/health` | Public | None | None | `backend/app/routes/health.py:11-33` |
| 2 | GET | `/api/projects` | Public | None | Query: `tech`, `featured` | `backend/app/routes/projects.py:9-26` |
| 3 | GET | `/api/projects/<slug>` | Public | None | Path: `slug` | `backend/app/routes/projects.py:29-36` |
| 4 | POST | `/api/contact` | Public | 5/hour/IP | Body: `name`, `email`, `message` | `backend/app/routes/contact.py:17-36` |

**Frontend routes** (Angular SPA, served by nginx):

| Route | Component | API Dependency |
|-------|-----------|---------------|
| `/` | HomePageComponent | None |
| `/projets` | ProjectsPageComponent | GET `/api/projects`, GET `/api/projects/<slug>` |
| `/a-propos` | AboutPageComponent | None |
| `/hobbies` | HobbiesPageComponent | None |
| `/contact` | ContactPageComponent | POST `/api/contact` |
| `**` (wildcard) | Redirects to `/` | None |

**Endpoint-specific attack surface analysis:**

1. **`POST /api/contact`** — The highest-risk endpoint. Accepts user-controlled JSON body with `name`, `email`, and `message` fields. Protected by rate limiting (5/hour per IP via `flask-limiter`) and Marshmallow schema validation. Attack vectors: rate limit bypass (IP rotation, proxy chains), input validation bypass (edge cases in email format validation), stored XSS if messages are later rendered in an admin interface without escaping, CSRF (no anti-CSRF tokens — relies solely on CORS which is misconfigured for production).

2. **`GET /api/projects?tech=<value>&featured=<value>`** — Accepts query string parameters. The `tech` parameter is used for **in-memory filtering** after database retrieval (not in SQL query), making SQL injection impossible. The `featured` parameter is compared to the string `"true"` — safe. No rate limiting means this endpoint could be used for denial-of-service by requesting large datasets repeatedly.

3. **`GET /api/projects/<slug>`** — Path parameter `slug` is passed to a SQLAlchemy `.where()` clause as a bound parameter — safe from injection. Returns 404 if no project matches. Could be used for enumeration of valid project slugs.

4. **`GET /api/health`** — Returns database connectivity status. Minor information disclosure — reveals whether the database is reachable and the server timestamp.

### Internal Service Communication

Communication between nginx, Flask, and PostgreSQL occurs over Docker's internal bridge network. In production (`docker-compose.prod.yml`), only nginx port 80 is published to the host. The Flask backend exposes port 5000 internally (via `expose: ["5000"]`), and PostgreSQL has no published ports. Trust assumption: internal Docker network traffic is considered trusted — no mutual TLS between services.

### Input Validation Patterns

Input validation follows a dual-layer approach:
- **Frontend (Angular):** Reactive form validators (`Validators.required`, `Validators.email`, `Validators.minLength`, `Validators.maxLength`) in `frontend/src/app/pages/contact/contact-page.component.ts:126-130`
- **Backend (Marshmallow):** Schema validation in `backend/app/schemas/contact_schema.py` enforces the same constraints server-side

The backend validation is the authoritative layer — frontend validation can be bypassed. The Marshmallow schema provides type checking, length constraints, and email format validation. However, there is **no HTML/script sanitization** on the `message` field — content is stored as-is, which is safe for the current JSON API but could become an issue if an admin interface is added.

### Background Processing

**None.** The application has no background job processing, no task queues (Celery, Redis Queue, etc.), and no async workers. All request processing is synchronous within Gunicorn worker processes.

---

## 6. Infrastructure & Operational Security

### Secrets Management

**CRITICAL FINDING:** The `.env` file at the repository root is **tracked in git** (confirmed: `git ls-files .env` returns `.env`). Despite being listed in `.gitignore`, it was committed before the ignore rule was added. This file contains:

```
POSTGRES_USER=portfolio
POSTGRES_PASSWORD=portfolio_dev
POSTGRES_DB=portfolio
DATABASE_URL=postgresql+psycopg://portfolio:portfolio_dev@db:5432/portfolio
SECRET_KEY=dev-secret-key-change-in-production
FLASK_ENV=development
```

The Flask `SECRET_KEY` in `backend/app/config.py:7` has a hardcoded fallback default of `"dev-secret-key"` — if the environment variable is missing in production, the application silently uses this weak, publicly-known secret. No secrets rotation mechanism, no external secrets manager (Vault, AWS Secrets Manager), and no runtime secret injection.

### Configuration Security

**Nginx configuration** (`frontend/nginx.conf`):
- **Present:** `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`
- **MISSING:** `Strict-Transport-Security` (HSTS) — no HTTPS enforcement
- **MISSING:** `Content-Security-Policy` (CSP) — no script source restrictions
- **MISSING:** `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`
- **MISSING:** TLS configuration (`listen 443 ssl`, `ssl_certificate`, `ssl_protocols`) — HTTP only
- Cache headers set for static assets (`expires 1y; Cache-Control "public, immutable"`)

**Docker security:**
- Backend Dockerfile (`backend/Dockerfile`) runs as **root** — no `USER` directive
- Frontend Dockerfile (`frontend/Dockerfile`) uses multi-stage build (good) but also runs nginx as root
- No Docker health checks in Dockerfiles (only in compose files)
- No read-only filesystem or capability dropping

**Environment separation:** Development and production use separate Docker Compose files, but configuration values (CORS origins, secret key defaults) are hardcoded in source code rather than driven by environment variables.

### External Dependencies

No external service integrations were identified. The application is entirely self-contained:
- No external email service (contact messages stored locally)
- No authentication providers
- No analytics or tracking services
- No CDN
- No external API integrations

**Dependency risk:** The frontend uses `@spartan-ng/brain@0.0.1-alpha.656`, an alpha-stage Angular UI library. Alpha software may have unpatched security vulnerabilities and no security advisory process.

### Monitoring & Logging

Logging is configured in `backend/app/__init__.py:37-40` using Python's `logging.basicConfig`:
- Development: DEBUG level (logs all SQL queries — potential PII exposure)
- Production: INFO level
- Format: timestamp + level + logger name + message

**Gaps:** No structured logging (JSON format), no centralized log aggregation, no security event monitoring, no audit trail for contact form submissions, no alerting on rate limit violations or error spikes. Error handlers in `backend/app/errors/handlers.py` log server errors but don't capture security-relevant metadata (client IP, user agent, request fingerprint).

---

## 7. Overall Codebase Indexing

The codebase is organized as a monorepo with two top-level directories: `backend/` (Flask/Python) and `frontend/` (Angular/TypeScript), plus root-level Docker Compose files for orchestration. The backend follows a clean layered architecture — `app/routes/` contains Flask blueprints (one per resource: health, projects, contact), `app/services/` contains business logic, `app/repositories/` contains data access code using SQLAlchemy Core, `app/models/` defines table schemas, `app/schemas/` holds Marshmallow validation schemas, `app/errors/` has centralized error handlers, and `app/extensions.py` initializes shared extensions (database engine). Database migrations are managed by Alembic in `backend/migrations/` with a single initial migration file. The backend entry point is `backend/app/__init__.py` which uses the Flask application factory pattern (`create_app()`), with `backend/wsgi.py` as the WSGI entry point for Gunicorn.

The frontend follows Angular 20's standalone component pattern. `frontend/src/app/app.routes.ts` defines client-side routes, `frontend/src/app/pages/` contains page-level components (home, projects, about, hobbies, contact), `frontend/src/app/components/` has reusable UI components (project cards, navbar, footer, hero sections), `frontend/src/app/services/api.service.ts` centralizes all HTTP communication with the backend, `frontend/src/app/models/` defines TypeScript interfaces, and `frontend/src/app/directives/` contains custom directives (including a `glow-card` directive with mouse-tracking CSS property injection). Environment-specific API URLs are configured in `frontend/src/environments/`. The frontend build uses `@angular/build` and is served in production via nginx with the configuration at `frontend/nginx.conf`.

From a security discoverability perspective, the codebase is well-organized — all security-relevant components are locatable through conventional paths. The primary risk areas are concentrated in: `backend/app/routes/contact.py` (the only write endpoint), `backend/app/config.py` (secrets and CORS configuration), `frontend/nginx.conf` (security headers and TLS), and `frontend/src/app/components/project-card/project-card.component.ts` (client-side URL rendering). The CI pipeline (`.github/workflows/ci.yml`) runs backend tests and frontend builds but includes no security scanning (SAST, dependency vulnerability checks, or container scanning).

---

## 8. Critical File Paths

### Configuration
- `docker-compose.yml` — Development Docker orchestration (exposes DB port 5432 and API port 5000)
- `docker-compose.prod.yml` — Production Docker orchestration (only nginx port 80 exposed)
- `backend/app/config.py` — Flask configuration (SECRET_KEY, CORS_ORIGINS, DATABASE_URL, rate limit storage)
- `backend/Dockerfile` — Backend container (runs as root, Gunicorn on 0.0.0.0:5000)
- `frontend/Dockerfile` — Frontend container (multi-stage build, nginx serving)
- `frontend/nginx.conf` — Nginx reverse proxy configuration (security headers, caching, SPA routing)
- `.env` — **TRACKED IN GIT** — Contains database credentials and SECRET_KEY
- `.env.example` — Environment variable template with weak defaults
- `backend/.env.example` — Backend-specific environment template
- `backend/.flaskenv` — Flask CLI configuration

### Authentication & Authorization
- **No authentication files exist** — Application has no auth system
- `backend/app/routes/contact.py` — Rate limiting is the only access control (lines 11-18)

### API & Routing
- `backend/app/routes/__init__.py` — Blueprint registration
- `backend/app/routes/health.py` — Health check endpoint (GET /api/health)
- `backend/app/routes/projects.py` — Project endpoints (GET /api/projects, GET /api/projects/<slug>)
- `backend/app/routes/contact.py` — Contact form endpoint (POST /api/contact)
- `frontend/src/app/app.routes.ts` — Angular SPA route definitions
- `frontend/src/app/services/api.service.ts` — Frontend HTTP client for all API calls
- `frontend/src/environments/environment.ts` — Development API URL (http://localhost:5000/api)
- `frontend/src/environments/environment.prod.ts` — Production API URL (/api relative)

### Data Models & DB Interaction
- `backend/app/models/project.py` — Projects table definition (includes unvalidated URL fields: image_url, github_url, demo_url)
- `backend/app/models/contact.py` — Contact messages table (stores PII: name, email, message)
- `backend/app/repositories/project_repo.py` — Project data access (parameterized SQLAlchemy queries)
- `backend/app/repositories/contact_repo.py` — Contact message data access (insert operations)
- `backend/app/services/project_service.py` — Project business logic
- `backend/app/services/contact_service.py` — Contact form business logic
- `backend/migrations/versions/8a6442079d9b_initial_tables_with_slug_and_sort_order.py` — Database schema migration

### Dependency Manifests
- `backend/requirements.txt` — Python dependencies (Flask, SQLAlchemy, Marshmallow, flask-cors, flask-limiter)
- `frontend/package.json` — Node.js dependencies (Angular 20, @spartan-ng/brain alpha, Tailwind CSS)

### Sensitive Data & Secrets Handling
- `.env` — **CRITICAL: Tracked in git with real credentials**
- `backend/app/config.py` — SECRET_KEY with weak hardcoded default (line 7)
- `backend/app/extensions.py` — Database engine creation with connection string (line 29)

### Middleware & Input Validation
- `backend/app/schemas/contact_schema.py` — Marshmallow contact form validation (name, email, message constraints)
- `backend/app/errors/handlers.py` — Centralized error handling (prevents information disclosure)
- `backend/app/__init__.py` — CORS initialization, logging configuration, blueprint registration

### Logging & Monitoring
- `backend/app/__init__.py` — Logging configuration (lines 37-40, DEBUG in dev, INFO in prod)
- `backend/app/errors/handlers.py` — Error logging for 500 errors

### Infrastructure & Deployment
- `docker-compose.prod.yml` — Production deployment topology
- `frontend/nginx.conf` — Reverse proxy with security headers
- `backend/Dockerfile` — Backend container definition
- `frontend/Dockerfile` — Frontend container definition (multi-stage build)
- `.github/workflows/ci.yml` — CI pipeline (no security scanning)

### Frontend Security-Relevant Components
- `frontend/src/app/components/project-card/project-card.component.ts` — Renders unvalidated URLs (image_url, github_url, demo_url)
- `frontend/src/app/pages/projects/projects-page.component.ts` — Also renders project URLs
- `frontend/src/app/pages/contact/contact-page.component.ts` — Contact form with client-side validation
- `frontend/src/app/directives/glow-card.directive.ts` — CSS property injection via mouse events (low risk)

---

## 9. XSS Sinks and Render Contexts

### Network Surface Assessment

The Angular frontend has strong built-in XSS protections through its template sanitization system. No usage of `bypassSecurityTrustHtml`, `bypassSecurityTrustScript`, `bypassSecurityTrustUrl`, or `bypassSecurityTrustResourceUrl` was found. No `innerHTML` bindings, `document.write`, `eval()`, or `Function()` constructors were detected. Angular's interpolation (`{{ }}`) and property binding (`[property]`) automatically escape HTML content.

### Identified Sinks

#### Sink 1: Error Message Display (LOW — Mitigated by Angular)
- **File:** `frontend/src/app/services/api.service.ts` (line 65)
- **Render Location:** `frontend/src/app/pages/contact/contact-page.component.ts` (lines 105-109)
- **Sink Type:** HTML Body Context (Angular interpolation `{{ error() }}`)
- **Code:**
  ```typescript
  // api.service.ts:65 — Error message extracted from server response
  } else if (error.error?.error) {
    message = error.error.error;  // Server-controlled string
  }

  // contact-page.component.ts:107 — Rendered in template
  {{ error() }}
  ```
- **Assessment:** Angular's default interpolation binding automatically HTML-escapes all content. A malicious server response containing `<script>alert(1)</script>` would be rendered as escaped text, not executed. **Currently mitigated**, but would become exploitable if refactored to use `[innerHTML]`.

#### Sink 2: URL-based Attribute Injection (MEDIUM — Requires DB Compromise)
- **File:** `frontend/src/app/components/project-card/project-card.component.ts` (lines 14-17, 53-67)
- **Also:** `frontend/src/app/pages/projects/projects-page.component.ts` (lines 82-95)
- **Sink Type:** URL-based Attributes (`[src]` and `[href]` bindings)
- **Code:**
  ```html
  <!-- Image src from database (line 15) -->
  <img [src]="project().imageUrl" [alt]="'Capture du projet ' + project().title">

  <!-- GitHub URL href (line 54) -->
  <a [href]="project().githubUrl" target="_blank" rel="noopener noreferrer">GitHub ↗</a>

  <!-- Demo URL href (line 60) -->
  <a [href]="project().demoUrl" target="_blank" rel="noopener noreferrer">Demo ↗</a>
  ```
- **Assessment:** Angular sanitizes `[href]` bindings and blocks `javascript:` URLs by default (logs a warning and renders `unsafe:javascript:...`). However, `data:` URIs and external domain URLs are NOT blocked. If an attacker gains database write access, they could inject `data:text/html,<script>...</script>` in URL fields or redirect users to phishing domains. The `[src]` binding on `<img>` allows loading images from arbitrary external domains, enabling tracking and potential SSRF via the browser.

#### Sink 3: CSS Custom Property Injection (LOW — Not Exploitable)
- **File:** `frontend/src/app/directives/glow-card.directive.ts` (lines 31-32)
- **Sink Type:** CSS Context (element.style.setProperty)
- **Code:**
  ```typescript
  this.el.nativeElement.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
  this.el.nativeElement.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
  ```
- **Assessment:** Values are derived from browser MouseEvent coordinates (numeric), not user-controllable strings. Not exploitable.

### Backend Injection Sinks

**No backend injection sinks found.** Specifically:
- **SQL Injection:** All queries use SQLAlchemy parameterized statements (`backend/app/repositories/project_repo.py`, `backend/app/repositories/contact_repo.py`)
- **Command Injection:** No `os.system`, `subprocess`, `exec`, or `eval` calls
- **Template Injection:** No `render_template_string()` usage; only `jsonify()` responses
- **Deserialization:** No `pickle.loads`, unsafe `yaml.load`, or custom JSON decoders
- **File Inclusion/Path Traversal:** No `open()`, `send_file()`, or file path construction with user input

---

## 10. SSRF Sinks

### Network Surface Assessment

The backend application **does not make any outbound HTTP requests**. No HTTP client libraries (`requests`, `urllib`, `httpx`, `aiohttp`) are imported anywhere in the backend codebase. The Flask application exclusively receives requests and responds with JSON — it never fetches external resources, processes URLs, or makes server-to-server calls.

### Server-Side SSRF: NONE FOUND

After comprehensive analysis, no traditional SSRF sinks exist:
- **No HTTP clients:** Backend has no `requests`, `urllib`, `httpx`, `fetch`, or equivalent imports
- **No URL fetching:** No code fetches content from user-supplied URLs
- **No webhook handlers:** No outbound callback or webhook functionality
- **No link preview/unfurl:** No URL metadata extraction
- **No media processing:** No ImageMagick, FFmpeg, or wkhtmltopdf
- **No SSO/OIDC:** No OpenID Connect discovery or JWKS fetching
- **No import-from-URL:** No remote data loading functionality
- **No headless browsers:** No Puppeteer, Playwright, or Selenium
- **No cloud metadata helpers:** No AWS/GCP/Azure metadata API calls

### Client-Side URL Injection (Related Finding)

While not traditional SSRF, the project data model stores URLs without server-side validation:

- **File:** `backend/app/models/project.py` (lines 20-22)
- **Fields:** `image_url` (String 500), `github_url` (String 500), `demo_url` (String 500)
- **Issue:** No URL format validation, no domain allowlisting, no protocol restriction
- **Impact:** If an attacker gains database write access (e.g., via leaked credentials from the tracked `.env` file), they could inject arbitrary URLs that the frontend would render as `<img src>` and `<a href>` attributes, causing user browsers to make requests to attacker-controlled domains.

### Redirect Handling

- **Backend:** No `redirect()` calls with user-controllable URLs
- **Frontend:** Angular router has a wildcard route (`**`) that redirects to `/` — not exploitable as it's a client-side route, not a server redirect
- **No "next URL" or "return URL" parameters** in any endpoint
