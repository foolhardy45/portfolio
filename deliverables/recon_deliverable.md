# Reconnaissance Deliverable: Tayrell Music Portfolio

## 0) HOW TO READ THIS
This reconnaissance report provides a comprehensive map of the application's attack surface. The application is a **minimal public portfolio website** with no authentication system, making the authorization surface extremely limited. The attack surface consists of 4 unauthenticated API endpoints served by a Flask backend.

**Key Sections for Vulnerability Analysis:**
- **Section 4 (API Endpoint Inventory):** All 4 endpoints are publicly accessible with no authentication. Focus on input parameters for injection and validation bypass testing.
- **Section 5 (Input Vectors):** The primary write surface is the POST /api/contact endpoint. GET endpoints accept query/path parameters for filtering.
- **Section 7 (Role & Privilege Architecture):** There is effectively a single role level — anonymous/public — for all endpoints. No RBAC system exists.
- **Section 8 (Authorization Vulnerability Candidates):** Without an auth system, horizontal/vertical privilege escalation is not applicable. Context-based testing for rate limit bypass and validation evasion is the primary focus.

**How to Use the Network Mapping (Section 6):** The system has a simple 3-tier architecture: browser → nginx (port 80, production) → Flask backend (port 5000, directly exposed in development, internal in production) → PostgreSQL DB (internal only). All security boundaries are at the nginx ingress point.

**Priority Order for Testing:**
1. POST /api/contact — rate limit bypass, stored data content, CSRF
2. GET /api/projects?tech= — input validation boundary testing
3. GET /api/projects/<slug> — path parameter boundary testing
4. GET /api/health — information disclosure

---

## 1. Executive Summary

**Application:** Tayrell Music Portfolio Website — a public-facing personal portfolio for a developer named "Tayrell." The site presents project showcases and a contact form.

**Purpose:** Read-only portfolio display with one write endpoint (contact form). No user accounts, authentication, or admin interface.

**Core Technology Stack:**
- **Frontend:** Angular 20 SPA (TypeScript, Tailwind CSS 4.2, @spartan-ng/brain alpha UI library), served by nginx
- **Backend:** Flask 3.1 (Python), Gunicorn WSGI server (4 workers), port 5000
- **Database:** PostgreSQL 16-alpine
- **Reverse Proxy:** nginx (Alpine), production serves port 80 only

**Primary Attack Surface:**
The application exposes exactly **4 network-accessible API endpoints**, all publicly accessible without authentication. The Flask backend is directly accessible on port 5000 in the current (development) deployment configuration. The primary write endpoint is POST /api/contact, protected only by a rate limiter using in-memory storage (bypassable in multi-worker deployments). The most significant infrastructure risk is the `.env` file with database credentials and a weak Flask SECRET_KEY being tracked in git.

---

## 2. Technology & Service Map

- **Frontend:** Angular 20.3.0 (standalone components, signals-based reactivity), TypeScript, Tailwind CSS 4.2.2, @spartan-ng/brain@0.0.1-alpha.656 (alpha UI library — potential unpatched CVEs)
- **Backend:** Python / Flask 3.1, SQLAlchemy 2.0 Core (parameterized queries), Marshmallow 3.23 (input validation), flask-cors ≥5.0, flask-limiter ≥3.8, psycopg[binary] ≥3.2, Gunicorn 23.0 (4 workers)
- **Infrastructure:** Docker Compose, nginx alpine (reverse proxy + static file server), PostgreSQL 16-alpine (container, internal only in production), host Docker network
- **Identified Subdomains:** None discovered (subfinder found no subdomains; this is a single-host deployment)
- **Open Ports & Services:**
  - **Port 5000/TCP** — Flask/Gunicorn backend (directly exposed in development mode; internal-only in production behind nginx)
  - **Port 80/TCP** — nginx (production only; not present in current dev deployment)
  - **Port 5432/TCP** — PostgreSQL (exposed to host in development docker-compose.yml; internal-only in production)

**Confirmed live endpoint (current scan target):** `http://host.docker.internal:5000` — Flask/Gunicorn backend responding directly. No nginx proxy in current deployment.

**Response Headers Observed:**
```
Server: gunicorn
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:4200
```
Notable absences: No `X-Frame-Options`, no `X-Content-Type-Options`, no `Content-Security-Policy`, no `Strict-Transport-Security`. Security headers are configured in nginx.conf but nginx is not in front of the current target.

---

## 3. Authentication & Session Management Flow

### Entry Points
**NONE.** The application has no authentication system. No login endpoint, no registration endpoint, no password reset, no JWT/OAuth/OIDC flows.

### Mechanism
All 4 API endpoints are publicly accessible without any authentication token or session cookie. There are no user accounts in the database schema.

### Code Pointers
- `backend/app/__init__.py` — Application factory; confirms no auth middleware is registered
- `backend/app/config.py` — `SECRET_KEY` configured but unused for sessions; CORS origins hardcoded to `["http://localhost:4200"]`
- `backend/app/routes/__init__.py` — Blueprint registration; confirms only 3 blueprints: health, projects, contact

### 3.1 Role Assignment Process
- **Role Determination:** Not applicable — no user accounts or roles exist
- **Default Role:** All requests are anonymous
- **Role Upgrade Path:** None
- **Code Implementation:** N/A

### 3.2 Privilege Storage & Validation
- **Storage Location:** Not applicable
- **Validation Points:** Not applicable
- **Cache/Session Persistence:** Flask `SECRET_KEY` is configured (`backend/app/config.py:7`) with weak fallback `"dev-secret-key"` but Flask sessions are never used by any route handler
- **Code Pointers:** `backend/app/config.py:7` — SECRET_KEY definition

### 3.3 Role Switching & Impersonation
- **Impersonation Features:** None
- **Role Switching:** None
- **Audit Trail:** None
- **Code Implementation:** N/A

---

## 4. API Endpoint Inventory

**Network Surface Focus:** The target `http://host.docker.internal:5000` exposes the Flask/Gunicorn backend directly. All 4 endpoints are in-scope and accessible.

| Method | Endpoint Path | Required Role | Object ID Parameters | Authorization Mechanism | Description & Code Pointer |
|---|---|---|---|---|---|
| GET | `/api/health` | anon | None | None | Returns DB health status and server timestamp. Discloses infrastructure state. See `backend/app/routes/health.py:11-33` |
| GET | `/api/projects` | anon | None | None | Lists all projects. Accepts `?tech=<string>` and `?featured=true` query params. See `backend/app/routes/projects.py:9-26` |
| GET | `/api/projects/<slug>` | anon | slug (path param) | None | Returns single project by slug. 404 if not found. See `backend/app/routes/projects.py:29-36` |
| POST | `/api/contact` | anon | None | Rate limit: 5/hr/IP (memory storage) | Accepts JSON body `{name, email, message}`. Validated by Marshmallow. Stores PII in DB. See `backend/app/routes/contact.py:17-36` |

**Known valid slugs (enumerated from live API):**
- `portfolio`
- `synk`
- `erua-data`
- `iut-cafe`

**Known project UUIDs (from live API response):**
- `de929304-3aa0-484f-aa53-0aedf7590607` (portfolio)
- `31f2e64b-69d3-44fb-a5b0-5345baf129bb` (synk)
- `7af7741f-4641-4cd1-9127-116968282a9c` (erua-data)
- `ee6b75e5-e9cd-4beb-9865-d9f447835779` (iut-cafe)

---

## 5. Potential Input Vectors for Vulnerability Analysis

**Network Surface Focus:** All vectors below are accessible via network requests to `http://host.docker.internal:5000`.

### URL Parameters (Query String)
- **`tech` parameter** — `GET /api/projects?tech=<value>` — User-controlled string. No length limit or character restriction at route layer. Used for **in-memory filtering** in Python (never interpolated into SQL). File: `backend/app/routes/projects.py:17`, flows to `backend/app/repositories/project_repo.py:25-30`
- **`featured` parameter** — `GET /api/projects?featured=<value>` — User-controlled string compared to literal `"true"` after `.lower()`. Binary safe. File: `backend/app/routes/projects.py:18`

### URL Path Parameters
- **`slug` parameter** — `GET /api/projects/<slug>` — User-controlled string extracted from URL path. No length limit or character restriction at route layer. Passed to SQLAlchemy parameterized WHERE clause. File: `backend/app/routes/projects.py:30`, flows to `backend/app/repositories/project_repo.py:61`. Note: DB column is `String(200)` but no length guard exists at the application layer — overly long slugs are passed to the query.

### POST Body Fields (JSON)
All in `POST /api/contact`, Content-Type: `application/json`. Validated by `ContactSchema`:
- **`name`** — String, required. Marshmallow enforces length 2–100 chars. Stored verbatim in `contact_messages.name` (String(200)). File: `backend/app/schemas/contact_schema.py:7-11`, stored via `backend/app/repositories/contact_repo.py:26-35`
- **`email`** — String (email format), required. Marshmallow `fields.Email` validates RFC format. Stored verbatim in `contact_messages.email` (String(320)). File: `backend/app/schemas/contact_schema.py:12-18`
- **`message`** — String, required. Marshmallow enforces length 10–5000 chars. **No HTML/script sanitization.** Stored verbatim in `contact_messages.message` (Text, unbounded at DB level). File: `backend/app/schemas/contact_schema.py:19-27`, stored via `backend/app/repositories/contact_repo.py:26-35`

### HTTP Headers
- **`Content-Type` header** — Must be `application/json` for POST /api/contact (checked via `request.get_json(silent=True)` at `backend/app/routes/contact.py:21`). Returns `{"error": "Request body must be JSON."}` if absent or wrong.
- **`X-Forwarded-For` / Remote IP** — Flask-limiter keys rate limits on `get_remote_address()`. In the current deployment (no nginx proxy), this reads `request.remote_addr` directly. With a proxy, `X-Forwarded-For` header could be used to spoof IP for rate limit bypass — depends on proxy trust configuration (`RATELIMIT_KEY_FUNC` not overridden, defaults to `get_remote_address` from flask-limiter which respects `X-Forwarded-For` if `PROXIES_COUNT` is configured).
- **`Origin` header** — CORS handled by flask-cors. Current `CORS_ORIGINS = ["http://localhost:4200"]`. Only relevant for browser-based cross-origin requests; not a barrier for direct API access.

### Cookie Values
- **No cookies are set or read by the backend.** Flask sessions are not used. No cookie-based input vectors exist.

---

## 6. Network & Interaction Map

### 6.1 Entities

| Title | Type | Zone | Tech | Data | Notes |
|---|---|---|---|---|---|
| UserBrowser | Identity | Internet | Browser (Angular SPA) | Public | End-user client; renders Angular frontend |
| FlaskBackend | Service | App | Python/Flask 3.1 + Gunicorn | PII, Public | Main API backend; port 5000; directly exposed in dev deployment |
| PostgreSQLDB | DataStore | Data | PostgreSQL 16-alpine | PII, Public | Stores projects (public) and contact messages (PII: name, email, message) |
| NginxProxy | Service | Edge | nginx Alpine | Public | Static file server + reverse proxy (production only; NOT present in current dev target) |

### 6.2 Entity Metadata

| Title | Metadata Key: Value |
|---|---|
| FlaskBackend | Hosts: `http://host.docker.internal:5000`; Endpoints: `/api/health`, `/api/projects`, `/api/projects/<slug>`, `/api/contact`; Auth: None; Workers: Gunicorn 4 workers; CORS: `http://localhost:4200` only; Rate-Limit: memory://, 5/hr on /api/contact |
| PostgreSQLDB | Engine: PostgreSQL 16-alpine; Exposure: Internal Docker network only; Consumers: FlaskBackend; Tables: `projects` (public content), `contact_messages` (PII); Credentials: `portfolio`/`portfolio_dev` (from .env tracked in git) |
| NginxProxy | Port: 80 (production); Config: `frontend/nginx.conf`; Headers: X-Frame-Options, X-Content-Type-Options (present); Missing: CSP, HSTS, Referrer-Policy; Proxy: `/api/*` → FlaskBackend:5000 |

### 6.3 Flows (Connections)

| FROM → TO | Channel | Path/Port | Guards | Touches |
|---|---|---|---|---|
| UserBrowser → FlaskBackend | HTTP | `:5000 /api/health` | None | Public |
| UserBrowser → FlaskBackend | HTTP | `:5000 /api/projects` | None | Public |
| UserBrowser → FlaskBackend | HTTP | `:5000 /api/projects/<slug>` | None | Public |
| UserBrowser → FlaskBackend | HTTP | `:5000 /api/contact` | ratelimit:5/hr/IP | PII |
| FlaskBackend → PostgreSQLDB | TCP | `:5432` | docker-internal-network | PII, Public |
| UserBrowser → NginxProxy | HTTP | `:80 /*` | None (production path) | Public |
| NginxProxy → FlaskBackend | HTTP | `:5000 /api/*` | cors:localhost-only | PII, Public |

### 6.4 Guards Directory

| Guard Name | Category | Statement |
|---|---|---|
| ratelimit:5/hr/IP | RateLimit | Flask-limiter enforces 5 requests per hour per IP on POST /api/contact. Uses in-memory storage — NOT shared across Gunicorn workers. Effectively up to 5×N requests/hr with N workers. |
| cors:localhost-only | Network | Flask-CORS restricts `Access-Control-Allow-Origin` to `http://localhost:4200`. This is a browser-enforced header; direct API access bypasses CORS entirely. |
| marshmallow:contact | Auth | Marshmallow ContactSchema enforces: name(2-100), email(RFC5322), message(10-5000). Server-side validation only — no client-side trust. |
| docker-internal-network | Network | PostgreSQL is accessible only within Docker bridge network. Not exposed to host in production. In development, port 5432 is published to host. |

---

## 7. Role & Privilege Architecture

### 7.1 Discovered Roles

| Role Name | Privilege Level | Scope/Domain | Code Implementation |
|---|---|---|---|
| anon | 0 | Global | No authentication required. All 4 endpoints accept anonymous requests. No role checks in any handler. |

### 7.2 Privilege Lattice

```
Privilege Ordering:
  anon (only role — level 0)

No role hierarchy exists. There is no authenticated role, no admin role,
no manager role. All users are treated identically as anonymous.

Note: No impersonation, sudo mode, or role switching mechanisms exist.
```

### 7.3 Role Entry Points

| Role | Default Landing Page | Accessible Route Patterns | Authentication Method |
|---|---|---|---|
| anon | N/A (API-only backend) | `/api/health`, `/api/projects`, `/api/projects/<slug>`, `/api/contact` | None |

**Angular SPA Routes (frontend, served by nginx in production):**
| Route | Component | API Dependency |
|---|---|---|
| `/` | HomePageComponent | None |
| `/projets` | ProjectsPageComponent | GET /api/projects, GET /api/projects/<slug> |
| `/a-propos` | AboutPageComponent | None |
| `/hobbies` | HobbiesPageComponent | None |
| `/contact` | ContactPageComponent | POST /api/contact |
| `**` | Redirect to `/` | None |

### 7.4 Role-to-Code Mapping

| Role | Middleware/Guards | Permission Checks | Storage Location |
|---|---|---|---|
| anon | None (except ratelimit on /api/contact) | None | N/A |

---

## 8. Authorization Vulnerability Candidates

### 8.1 Horizontal Privilege Escalation Candidates

**Not applicable.** The application has no user accounts, no user-owned resources, and no object ownership model. All data is publicly accessible to everyone. No user IDs, session tokens, or ownership relationships exist in any endpoint.

### 8.2 Vertical Privilege Escalation Candidates

**Not applicable.** There is no admin role, no privileged endpoint, and no authentication system to escalate. All 4 endpoints are publicly accessible without any privilege requirement.

### 8.3 Context-Based Authorization Candidates

| Workflow | Endpoint | Expected Prior State | Bypass Potential |
|---|---|---|---|
| Contact Form Submission | `POST /api/contact` | Valid JSON body with name/email/message | Rate limit bypass via IP rotation, X-Forwarded-For header spoofing (if proxy config allows), or direct per-worker exploitation (5 requests × 4 Gunicorn workers = up to 20 req/hr) |
| Contact Schema Validation | `POST /api/contact` | Marshmallow validation must pass | Edge-case validation bypass: whitespace-only `name` field ≥ 2 chars passes length check; Unicode/homoglyph email addresses may bypass email validator; extremely long message approaching 5000-char limit |

---

## 9. Injection Sources

### Summary

After complete source code analysis, the following injection source assessment applies to all **network-accessible** code paths:

**SQL Injection:**
- All database interactions use SQLAlchemy Core parameterized queries.
- `GET /api/projects?tech=<value>`: `tech_filter` never reaches SQL — applied in Python memory after full table fetch. File: `backend/app/repositories/project_repo.py:24-30`. No SQL injection vector.
- `GET /api/projects/<slug>`: `slug` used in `select(projects_table).where(projects_table.c.slug == slug)` (L61) — SQLAlchemy bound parameter. No SQL injection vector.
- `POST /api/contact`: `name`, `email`, `message` used in `insert(contact_messages_table).values(...)` (L26-35) — SQLAlchemy parameterized insert. No SQL injection vector.
- Static health check: `text("SELECT 1")` — no user input. File: `backend/app/routes/health.py:17`.

**Command Injection:**
- No `subprocess`, `os.system`, `os.popen`, `eval()`, `exec()`, or `__import__` calls found anywhere in the network-accessible codebase.

**Path Traversal / LFI / RFI:**
- No file I/O operations (`open()`, `send_file()`, `send_from_directory()`) with user-controlled paths. No file upload functionality.

**Server-Side Template Injection (SSTI):**
- No `render_template_string()` calls. No Jinja2 template rendering with user input. All API responses use `jsonify()`. No SSTI vector.

**Deserialization:**
- No `pickle.loads()`, `yaml.load()` (unsafe), `marshal.loads()`, `jsonpickle`, or custom deserializers. `request.get_json()` uses Python's standard library JSON parser — not exploitable via deserialization attacks.

**Stored Data Injection (Latent Risk):**
- `POST /api/contact` stores `name` and `message` fields verbatim without HTML sanitization.
  - Input entry: `backend/app/routes/contact.py:21` (`request.get_json()`)
  - Validation: `backend/app/schemas/contact_schema.py:7-27` (length/format only, no HTML stripping)
  - Storage: `backend/app/repositories/contact_repo.py:26-35`
  - Risk: Stored XSS if any future admin UI renders these values without escaping. Currently no rendering surface exists in this codebase.

**SSRF:**
- The Flask backend makes **no outbound HTTP requests**. No HTTP client libraries (`requests`, `urllib`, `httpx`) are imported. No URL fetching, webhook processing, or metadata API calls. No SSRF vectors.
- Client-side URL injection: `image_url`, `github_url`, `demo_url` fields in the `projects` table (models: `backend/app/models/project.py:20-22`) are rendered as `[src]`/`[href]` in Angular without server-side URL validation. Impact is browser-side only (no server-side request). Requires database write access to exploit.
