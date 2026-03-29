# Authorization Analysis Report

## 1. Executive Summary

- **Analysis Status:** Complete
- **Target:** Tayrell Music Portfolio — `http://host.docker.internal:5000`
- **Key Outcome:** The application's authorization surface is extremely minimal. There is **no authentication system**, **no role model**, and **no user-owned resources**. Horizontal and vertical privilege escalation are structurally impossible. The only authorization-relevant control in the entire application is the rate limiter on `POST /api/contact`, which has a confirmed logical flaw due to per-worker in-memory storage. This single context/workflow finding has been passed to the exploitation phase.
- **Purpose of this Document:** This report provides the strategic context, dominant patterns, and architectural intelligence necessary to understand the authorization posture of the application and to contextualize the single exploitable finding in the queue.

---

## 2. Dominant Vulnerability Patterns

### Pattern 1: Ineffective Rate Limit Guard (Context/Workflow)
- **Description:** The sole authorization guard in the application — a rate limiter on `POST /api/contact` — uses per-process in-memory storage (`memory://`) that is not shared across Gunicorn worker processes.
- **Root Cause:** `storage_uri="memory://"` at `backend/app/routes/contact.py:13` means each of the 4 Gunicorn workers maintains an independent counter. A client can exceed the advertised 5/hr limit by having requests distributed across workers.
- **Implication:** The effective rate limit is `5 × N` where N = number of Gunicorn workers (currently 4), yielding up to 20 submissions per hour per IP instead of the intended 5.
- **Representative:** AUTHZ-VULN-01

---

## 3. Strategic Intelligence for Exploitation

### Session Management Architecture
- **No sessions exist.** The application does not use Flask sessions, JWTs, cookies, or any token-based authentication. `SECRET_KEY` is configured in `backend/app/config.py:7` with weak fallback `"dev-secret-key"`, but is never used by any route handler.
- **Critical Finding:** There is nothing to hijack or impersonate. All requests are anonymous.

### Role/Permission Model
- **Single implicit role: anonymous.** All four endpoints accept any request without authentication.
- **Code evidence:** `backend/app/routes/__init__.py` registers only three blueprints: `health_bp`, `projects_bp`, `contact_bp`. No admin, user, or dashboard blueprints exist. No auth middleware is registered in `backend/app/__init__.py`.
- **Critical Finding:** No RBAC system exists. Vertical escalation is structurally impossible.

### Resource Access Patterns
- All resources (projects, health status) are public data with no ownership model.
- `GET /api/projects` and `GET /api/projects/<slug>` return the same data to every caller.
- **Critical Finding:** No user IDs, tenant IDs, or ownership relationships exist anywhere in the codebase. Horizontal privilege escalation is structurally impossible.

### Rate Limit Implementation
- **Guard location:** `backend/app/routes/contact.py:11-14` (Limiter instantiation) and `backend/app/routes/contact.py:18` (`@limiter.limit("5 per hour")` decorator).
- **Key function:** `get_remote_address` from `flask_limiter.util` — reads `request.remote_addr` directly. Does NOT trust `X-Forwarded-For` unless `PROXIES_COUNT` or `ProxyFix` middleware is configured (neither is present).
- **Storage backend:** `memory://` — per-process, not shared across workers.
- **Worker count:** 4 Gunicorn workers (from `docker-compose.yml`).
- **Critical Finding:** Each worker independently tracks the 5/hr limit. A client hitting all 4 workers can submit up to 20 messages/hr.

### Workflow Implementation (POST /api/contact)
- Step 1: CORS check (flask-cors middleware)
- Step 2: Rate limit check (`@limiter.limit("5 per hour")` — **INSUFFICIENT GUARD**)
- Step 3: JSON body parse (`request.get_json(silent=True)`)
- Step 4: Schema validation (`contact_schema.load(json_data)` — Marshmallow)
- Step 5: DB write (`contact_service.submit_contact_message(...)` → `contact_repo.create_contact_message(...)`)
- **Critical Finding:** The rate limit guard at Step 2 runs before the DB write (Step 5), so it is correctly placed in the workflow order. However, the guard itself is **insufficient** because its state is not shared across all worker processes.

---

## 4. Vectors Analyzed and Confirmed Secure

These authorization checks were traced and confirmed to have robust guards OR are not applicable due to the application's design.

| **Endpoint** | **Guard Location** | **Defense Mechanism** | **Verdict** |
|---|---|---|---|
| `GET /api/health` | None needed | Public endpoint by design; no sensitive data requiring access control | SAFE (public by design) |
| `GET /api/projects` | None needed | Public portfolio data; no user ownership model exists | SAFE (public by design) |
| `GET /api/projects/<slug>` | None needed | Public portfolio data; slug parameter uses parameterized SQL query; no ownership model | SAFE (public by design) |
| Horizontal escalation (all endpoints) | N/A | No user accounts, no session tokens, no ownership model in any DB table | NOT APPLICABLE |
| Vertical escalation (all endpoints) | N/A | No admin roles, no privileged endpoints; only 3 blueprints registered (health, projects, contact) | NOT APPLICABLE |
| SQL injection via `slug` param | `backend/app/repositories/project_repo.py:58` | SQLAlchemy parameterized WHERE clause | SAFE |
| SQL injection via `tech` param | `backend/app/repositories/project_repo.py:23-29` | In-memory Python filter, never reaches SQL | SAFE |
| SQL injection via contact fields | `backend/app/repositories/contact_repo.py:26-35` | SQLAlchemy parameterized INSERT | SAFE |
| Schema validation enforcement | `backend/app/schemas/contact_schema.py:1-30` | Marshmallow enforces name(2-100), email(RFC5322), message(10-5000) before any DB write | SAFE (validation functional) |

### Context Candidate: Schema Validation Whitespace Bypass
- **Candidate:** Marshmallow `validate.Length(min=2)` on `name` field does not strip whitespace. A 2-space string `"  "` passes length validation and is stored verbatim.
- **Authorization verdict:** **NOT AN AUTHORIZATION VULNERABILITY.** This is an input quality issue. Whitespace-only names do not bypass any authorization gate, do not grant access to additional resources, and do not escalate privileges. The workflow's "prior state" (rate limit + schema validation) is still enforced. Excluded from exploitation queue.

---

## 5. Analysis Constraints and Blind Spots

### Single Public-Facing Codebase
The application is a single-service portfolio. No microservices, no internal APIs, no service mesh. All backend code was directly accessible for analysis.

### No Authentication = No Classical Auth Bugs
Because there is no authentication system, classical authorization vulnerabilities (IDOR, BOLA, privilege escalation, JWT tampering, etc.) are architecturally absent. The only authorization control is the rate limiter.

### Rate Limit Worker Distribution is Probabilistic
The per-worker rate limit bypass (AUTHZ-VULN-01) relies on requests being distributed across Gunicorn workers. With round-robin or random load balancing, an attacker cannot guarantee which worker handles each request. The bypass is probabilistic, not deterministic, which reduces exploitability confidence.

### X-Forwarded-For Not Trusted
Despite the recon noting X-Forwarded-For as a potential bypass vector, code analysis confirms that `get_remote_address` reads `request.remote_addr` directly. No `ProxyFix` middleware or `PROXIES_COUNT` configuration is present. IP spoofing via `X-Forwarded-For` headers is **not effective** in the current deployment configuration.

### No Admin Interface Exists
A complete search of `backend/app/routes/` confirms only three route files: `health.py`, `projects.py`, `contact.py`. No hidden admin panel, management API, or debug endpoint exists in the deployed application.
