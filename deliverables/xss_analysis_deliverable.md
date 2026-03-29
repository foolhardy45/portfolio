# Cross-Site Scripting (XSS) Analysis Report

## 1. Executive Summary

- **Analysis Status:** Complete
- **Key Outcome:** **No externally exploitable XSS vulnerabilities were identified.** Every potential source-to-sink path was traced and confirmed to have context-appropriate defenses in place. The exploitation queue is empty.
- **Purpose of this Document:** This report documents the complete backward taint analysis of all identified XSS sinks, confirms the defensive posture of both the Flask backend and Angular frontend, and provides strategic context for the exploitation phase to confirm the null result.

**Scope Confirmation:** The defined target is `http://host.docker.internal:5000`, which is the **Flask/Gunicorn JSON API backend** running directly without nginx. The Angular SPA frontend (the only HTML rendering surface) is served by nginx on port 80, which is **not running** in the current deployment. Confirmed: `curl http://host.docker.internal:80/` → `Connection refused`.

---

## 2. Dominant Vulnerability Patterns

**No exploitable XSS patterns were found.** The two observations below describe near-miss conditions that were analyzed and confirmed safe.

**Observation 1: URL Field Bindings in Angular Project Components (Theoretical — Not Externally Exploitable)**
- **Description:** Project URL fields (`githubUrl`, `demoUrl`, `imageUrl`) fetched from the database are bound to `[href]` and `[src]` attributes in Angular components. These fields are stored in the database without URL-scheme validation.
- **Why Not Exploitable:** (a) Angular's built-in URL sanitizer intercepts the `[href]` and `[src]` security context and replaces `javascript:` and `data:` URIs with the inert prefix `unsafe:`, preventing script execution. (b) Exploiting this path requires **database write access** — the attacker must first compromise the database or the backend to inject a malicious URL into the `projects` table. No write path to project URL fields is exposed through the API. (c) The Angular frontend is not served via the in-scope target (port 5000).
- **Representative Sinks:** `project-card.component.ts:54,61`, `projects-page.component.ts:83,90`.

**Observation 2: Contact Form Stored Data Without HTML Sanitization (Theoretical — No Rendering Surface)**
- **Description:** The `name` and `message` fields submitted to `POST /api/contact` are stored verbatim in the `contact_messages` PostgreSQL table with no HTML escaping.
- **Why Not Exploitable:** The stored data is **never rendered** in any page, component, or API response. No admin interface, no message listing endpoint, and no read-back path exists anywhere in the codebase. The stored data is write-only from the perspective of any network-accessible surface.

---

## 3. Strategic Intelligence for Exploitation

**Content Security Policy (CSP) Analysis**
- **Current CSP:** **ABSENT.** No `Content-Security-Policy` header is served by the Flask backend at port 5000. The nginx configuration (`frontend/nginx.conf`) defines security headers including `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff`, but nginx is **not running** in the current deployment. The in-scope target (port 5000) serves zero security headers beyond CORS.
- **Implication for Exploitation:** If a future XSS vulnerability is found (e.g., via a new admin UI endpoint), there is no CSP to bypass. Any injected script would execute freely.

**Cookie Security**
- **Observation:** The application has **no session cookies, no authentication cookies, and no tokens of any kind.** Flask sessions are configured but never used. `document.cookie` would return an empty string in any browser context.
- **Implication:** XSS cookie theft is not applicable. There are no high-value credentials to exfiltrate via `document.cookie`.

**Angular Security Model**
- Angular 20's template sanitization system is fully active with no bypasses configured.
- **Zero** uses of `bypassSecurityTrustHtml`, `bypassSecurityTrustScript`, `bypassSecurityTrustUrl`, or `bypassSecurityTrustResourceUrl` exist anywhere in the codebase.
- All text rendering uses `{{ }}` interpolation (auto-HTML-escaped text nodes).
- `[href]` and `[src]` bindings use Angular's URL security context (blocks `javascript:` and `data:` URIs).
- No `innerHTML`, `outerHTML`, `document.write`, or `eval` usage detected.

**Backend Rendering Surface**
- The Flask backend is a **pure JSON API**. Every HTTP response has `Content-Type: application/json`.
- No `render_template()`, `render_template_string()`, or HTML `make_response()` calls exist anywhere.
- The Werkzeug interactive debugger is **not active** (Gunicorn deployment bypasses Werkzeug's WSGI middleware; confirmed: `GET /__debugger__` → JSON 404).
- User-supplied input is **never reflected** in any API response body.

---

## 4. Vectors Analyzed and Confirmed Secure

All input vectors from the reconnaissance deliverable were analyzed. The table below documents every path traced and its confirmed-secure verdict.

| ID | Source (Parameter/Key) | Endpoint/File Location | Sink Function | Render Context | Defense Mechanism | Verdict |
|---|---|---|---|---|---|---|
| S01 | Server error string (`error.error.error`) | `api.service.ts:65` → `contact-page.component.ts:107` | Angular `{{ error() }}` interpolation | HTML_BODY | Angular text interpolation: auto-HTML-escapes `<`, `>`, `"`, `&` before DOM insertion | SAFE |
| S02 | `project().githubUrl` (DB field) | `project-card.component.ts:54`, `projects-page.component.ts:83` | `[href]` attribute binding | HTML_ATTRIBUTE (URL) | Angular `[href]` URL security context: strips `javascript:` and `data:` URIs to inert `unsafe:` prefix | SAFE |
| S03 | `project().demoUrl` (DB field) | `project-card.component.ts:61`, `projects-page.component.ts:90` | `[href]` attribute binding | HTML_ATTRIBUTE (URL) | Same as S02 | SAFE |
| S04 | `project().imageUrl` (DB field) | `project-card.component.ts:15` | `[src]` attribute binding | HTML_ATTRIBUTE (URL) | Angular `[src]` URL security context; no script-execution risk via img src | SAFE |
| S05 | `MouseEvent.clientX / clientY` | `glow-card.directive.ts:31-32` | `element.style.setProperty()` | CSS_VALUE | Source is numeric browser-controlled coordinates; not user string input | SAFE |
| S06 | `name` field (POST /api/contact body) | `contact_repo.py:26-35` → `contact_messages.name` | No render sink (DB write-only) | N/A | No rendering surface exists for stored contact messages | SAFE |
| S07 | `message` field (POST /api/contact body) | `contact_repo.py:26-35` → `contact_messages.message` | No render sink (DB write-only) | N/A | No rendering surface exists for stored contact messages | SAFE |
| S08 | `email` field (POST /api/contact body) | `contact_repo.py:26-35` → `contact_messages.email` | No render sink (DB write-only) | N/A | No rendering surface exists for stored contact messages | SAFE |
| S09 | `tech` query parameter | `GET /api/projects?tech=` → `project_repo.py:25-30` | In-memory Python filter | N/A (JSON API, no HTML rendering) | Parameter used only as a string comparison predicate; never reflected in response | SAFE |
| S10 | `slug` path parameter | `GET /api/projects/<slug>` → `project_repo.py:61` | SQLAlchemy bound parameter | N/A (JSON API, no HTML rendering) | SQLAlchemy parameterized `.where()` clause; parameter never reflected in response body | SAFE |
| S11 | `featured` query parameter | `GET /api/projects?featured=` → `routes/projects.py:18` | String comparison | N/A | Compared to literal `"true"` only; never reflected | SAFE |
| S12 | `localStorage('theme')` | `theme.service.ts` | `classList.toggle()` | CSS_CLASS | Value only used in `classList.toggle('dark', ...)`, not interpolated into HTML | SAFE |
| S13 | Route `data.description` | `app.ts` → `Meta.updateTag()` | `<meta>` tag `content` attribute | HTML_ATTRIBUTE | Source is hardcoded static strings in `app.routes.ts`, not URL-derived | SAFE |
| S14 | `window.scrollY` | `navbar.component.ts` | CSS pixel calculation | CSS_VALUE | Numeric browser value for scroll indicator positioning only | SAFE |
| S15 | Flask error handlers (400/404/405/429/500) | `errors/handlers.py` | `jsonify()` | N/A (JSON) | All error messages are static hardcoded strings; no user input reflected | SAFE |

---

## 5. Analysis Constraints and Blind Spots

- **Angular SPA Not Accessible at Target Port:** The nginx server (which serves the Angular SPA) is not running in the current deployment. Port 80 is closed. If nginx were running, it would serve additional HTML rendering surfaces (Angular components) that were analyzed from source code but could not be browser-tested live.
- **No Rendering Surface for Stored Data:** The `contact_messages` table stores user input without sanitization, but since no read path exists, this is a **latent risk only** — exploitable if a future admin UI is added without proper output encoding.
- **Spartan UI Alpha Library:** The frontend uses `@spartan-ng/brain@0.0.1-alpha.656`. This alpha-stage library was not deeply audited for hidden `innerHTML` usage or `bypassSecurityTrust*` calls in its internal implementation. The risk is low but non-zero.
- **Database Write Path as Prerequisite:** Two potential sinks (S02/S03 URL injection) require database write access as a prerequisite. This was out of scope for this assessment but represents a secondary XSS risk if the database is compromised via leaked credentials (`.env` tracked in git).
