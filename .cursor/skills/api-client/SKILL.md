---
name: api-client
description: Implements a well-behaved HTTP API client with exponential backoff, rate limit handling, and authentication from environment variables. Use when calling an external JSON/REST API, adding retry logic to an existing client, or reviewing API client code. Distinct from polite-scraping, which covers HTML scraping of public websites. Covers the port/adapter pattern, retry with equal/full jitter, retry count, 429 Retry-After handling, logging failures, UX error display, authentication, and testing.
---

# API Client with Exponential Backoff

This skill covers calling external REST/JSON APIs from within the
infrastructure layer of a hexagonal architecture project.

---

## How this differs from polite-scraping

- **Polite scraping** is for HTML pages with no authentication, no documented
  rate limit, and no structured response format. Robots.txt compliance is
  required. Fixed per-request delay is the primary courtesy mechanism.
- **API clients** have documented rate limits, structured JSON responses,
  authentication (API keys, tokens), and explicit retry guidance. Exponential
  backoff with jitter is the standard retry mechanism. Robots.txt is not
  relevant.

---

## How many retries

The default recommendation is **3 retries** (4 total requests: 1 original
+ 3 retries). This is the politeness ceiling for most cases.

- 3 retries gives the server a genuine chance to recover from a transient
  failure without hammering it repeatedly.
- Beyond 3, you are more likely adding load to a struggling server than
  recovering from a real transient error.
- For `429` (rate limited): always respect the `Retry-After` header first.
  If the server tells you to wait 30 seconds, wait 30 seconds — do not
  count this against your `max_retries` if you want to be especially polite,
  though counting it is simpler and still acceptable.
- For paid APIs with per-call billing: 3 retries also limits accidental
  cost from a misbehaving client.

When in doubt, 3 is the right default. Only increase it (to 5) if the API
documentation explicitly acknowledges transient failures and recommends
higher retry counts.

---

## Exponential backoff — the algorithm

Exponential backoff increases the wait time between retries geometrically.
Jitter adds randomness so that multiple clients do not all retry at the
same instant after a shared failure (the "thundering herd" problem).

### Which jitter to use

**Equal jitter** (recommended for single-client tools):

```python
def _backoff_delay(attempt: int, base: float = 1.0, cap: float = 60.0) -> float:
    """Equal jitter: half the ceiling guaranteed, half randomised.

    Ensures a meaningful minimum wait on every retry while still spreading
    retries enough to avoid synchronised bursts. Appropriate for single-client
    tools where near-zero delays (possible with full jitter) would be
    too aggressive.
    """
    ceiling = min(cap, base * (2 ** attempt))
    return ceiling / 2 + random.uniform(0, ceiling / 2)
```

Attempt 0 → 0.5–1s, attempt 1 → 1–2s, attempt 2 → 2–4s, capped at 60s.

**Full jitter** (for multi-client / distributed systems):

```python
def _backoff_delay(attempt: int, base: float = 1.0, cap: float = 60.0) -> float:
    """Full jitter: uniform random across the entire window.

    Maximally distributes load across the retry window. Can produce near-zero
    delays at low attempt numbers, which is acceptable when many independent
    clients are retrying simultaneously.
    """
    ceiling = min(cap, base * (2 ** attempt))
    return random.uniform(0, ceiling)
```

Use full jitter when many independent clients might retry simultaneously
(e.g. a deployed service handling many users). Use equal jitter for
single-user tools, scripts, and CLI applications.

Never retry indefinitely. Set a `max_retries` ceiling — default is 3.

---

## Which status codes to retry

- **Retry:** `429` (rate limited), `503` (service unavailable), `504`
  (gateway timeout), and transient network errors (`requests.ConnectionError`,
  `requests.Timeout`).
- **Do not retry:** `400` (bad request — fix the input), `401` (auth failure —
  the key is wrong, retrying will not help), `403` (forbidden), `404`
  (not found), `422` (validation error).
- **On 429:** respect the `Retry-After` header if present. Use its value
  as the delay instead of computing one.

---

## Port definition

```python
# application/ports/my_api_port.py
from typing import Any, Protocol


class MyApiPort(Protocol):
    """Port for the external API."""

    def get_record(self, record_id: str) -> dict[str, Any]:
        """Fetch a single record by ID. Raises ApiError on failure."""
        ...

    def search(self, query: str, page: int = 1) -> dict[str, Any]:
        """Search records. Raises ApiError on failure."""
        ...
```

Define a matching exception in `application/exceptions.py`:

```python
class ApiError(Exception):
    """Raised when an external API call fails after all retries."""
```

---

## Client implementation

```python
# infrastructure/api/my_api_client.py
import logging
import random
import time
from typing import Any

import requests

from your_package.application.exceptions import ApiError

_RETRYABLE_STATUSES = {429, 503, 504}
_RETRYABLE_EXCEPTIONS = (requests.ConnectionError, requests.Timeout)


class MyApiClient:
    """Implements MyApiPort against the external API."""

    def __init__(
        self,
        api_key: str,
        base_url: str,
        max_retries: int = 3,
        base_delay: float = 1.0,
        logger: logging.Logger | None = None,
    ) -> None:
        """Initialise with API credentials and retry configuration."""
        self._max_retries = max_retries
        self._base_delay = base_delay
        self._logger = logger or logging.getLogger(__name__)
        self._session = requests.Session()
        self._session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
            "User-Agent": "your-project/1.0",
        })
        self._base_url = base_url.rstrip("/")

    def get_record(self, record_id: str) -> dict[str, Any]:
        """Fetch a single record by ID."""
        return self._get(f"/records/{record_id}")

    def search(self, query: str, page: int = 1) -> dict[str, Any]:
        """Search records."""
        return self._get("/search", params={"q": query, "page": page})

    def _get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """GET with retry and exponential backoff."""
        url = f"{self._base_url}{path}"
        for attempt in range(self._max_retries + 1):
            try:
                resp = self._session.get(url, params=params, timeout=30)
            except _RETRYABLE_EXCEPTIONS as exc:
                if attempt == self._max_retries:
                    raise ApiError(f"Network error after {attempt + 1} attempts: {exc}") from exc
                self._wait(attempt, retry_after=None)
                continue
            if resp.status_code not in _RETRYABLE_STATUSES:
                resp.raise_for_status()
                return resp.json()
            if attempt == self._max_retries:
                raise ApiError(f"API returned {resp.status_code} after {attempt + 1} attempts")
            retry_after = _parse_retry_after(resp)
            self._wait(attempt, retry_after=retry_after)
        raise ApiError("Retry loop exhausted without result")  # unreachable

    def _wait(self, attempt: int, retry_after: float | None) -> None:
        """Sleep before the next retry, using Retry-After if provided."""
        delay = retry_after if retry_after is not None else _backoff_delay(attempt, self._base_delay)
        self._logger.warning("Retrying in %.1fs (attempt %d)", delay, attempt + 1)
        time.sleep(delay)


def _backoff_delay(attempt: int, base: float = 1.0, cap: float = 60.0) -> float:
    """Full-jitter exponential backoff delay for the given attempt (0-indexed)."""
    ceiling = min(cap, base * (2 ** attempt))
    return random.uniform(0, ceiling)


def _parse_retry_after(response: requests.Response) -> float | None:
    """Parse the Retry-After header as seconds, returning None if absent or unparseable."""
    value = response.headers.get("Retry-After")
    if value is None:
        return None
    try:
        return float(value)
    except ValueError:
        return None
```

---

## Wiring in the container

API credentials come from environment variables — never hardcoded.

```python
# container.py
import os

def get_my_api_client() -> MyApiClient:
    """Create the API client from environment configuration."""
    api_key = os.environ["MY_API_KEY"]  # KeyError is intentional — fail fast if missing
    base_url = os.environ.get("MY_API_BASE_URL", "https://api.example.com/v1")
    return MyApiClient(api_key=api_key, base_url=base_url)
```

```ini
# .env.example
MY_API_KEY=your-key-here
MY_API_BASE_URL=https://api.example.com/v1
```

Use `os.environ["KEY"]` (not `.get()`) for required credentials so the
program fails immediately at startup with a clear `KeyError` rather than
making requests with a missing key and getting confusing 401 errors.

---

## Logging failed API requests

Log at the right level for each stage of failure. The goal is enough
information to diagnose a failure without exposing secrets.

```python
def _wait(self, attempt: int, retry_after: float | None) -> None:
    """Sleep before the next retry, logging the reason."""
    delay = retry_after if retry_after is not None else _backoff_delay(attempt, self._base_delay)
    self._logger.warning(
        "API request failed (attempt %d/%d) — retrying in %.1fs",
        attempt + 1,
        self._max_retries,
        delay,
    )
    time.sleep(delay)
```

After all retries are exhausted, log at ERROR with `exc_info=True` if an
exception caused the final failure, or at ERROR without `exc_info` if it
was a status code:

```python
# Status code exhausted retries
self._logger.error(
    "API returned %d after %d attempts — giving up",
    resp.status_code,
    self._max_retries + 1,
)
raise ApiError(f"API returned {resp.status_code} after {self._max_retries + 1} attempts")

# Exception exhausted retries
self._logger.error("Network error after %d attempts", self._max_retries + 1, exc_info=True)
raise ApiError(f"Network error: {exc}") from exc
```

Rules:
- Never log the API key, token, or any header value.
- Never log the full response body at WARNING or above — it may contain
  sensitive data. Log at DEBUG only, and only if the API is known to
  return non-sensitive error details.
- Log the URL being called at DEBUG (not WARNING/ERROR) since URLs can
  contain query parameters that may include identifiers.
- Each retry attempt gets a WARNING. The final failure gets an ERROR.

---

## Showing API failures in the UX

`ApiError` must be caught at the presentation boundary — not swallowed
inside the infrastructure layer. See `clean-error-messages.mdc` for the
full pattern.

### CLI

```python
from your_package.application.exceptions import ApiError

try:
    result = use_case.execute(...)
except ApiError as exc:
    click.echo(f"\nAPI request failed: {exc}", err=True)
    raise SystemExit(1) from exc
```

The message shown to the user should state what failed and what to try
next, not the raw exception internals:

- Good: `"API request failed: service unavailable after 3 retries. Try again later."`
- Bad: `"ApiError: requests.exceptions.ConnectionError: HTTPSConnectionPool..."`

If the `ApiError` message from the infrastructure layer is already clean
(as in the implementation above), pass it through directly. If it contains
internal detail, wrap it:

```python
except ApiError:
    click.echo("\nCould not reach the API. Check your connection and try again.", err=True)
    raise SystemExit(1)
```

### Flask

Register an error handler in `create_app()`:

```python
@app.errorhandler(ApiError)
def handle_api_error(exc: ApiError) -> tuple[str, int]:
    """Return a clean 503 page when an API call fails."""
    app.logger.error("API error in request: %s", exc, exc_info=True)
    return render_template("error.html", message="External service unavailable. Try again later."), 503
```

---

## Complexity note

The `_get` method above has a loop with branches and an except clause. Count
before adding any more logic. If complexity approaches 10, extract helpers:

```python
def _is_retryable(self, status: int) -> bool:
    """Return True if the status code warrants a retry."""
    return status in _RETRYABLE_STATUSES

def _handle_response(self, resp: requests.Response, attempt: int) -> dict[str, Any] | None:
    """Return parsed JSON on success, None if should retry, raise on fatal error."""
    ...
```

---

## Testing

Mock the session, not `requests.get`. Testing the retry logic requires
simulating sequences of failures followed by success.

```python
from unittest.mock import MagicMock, patch
import pytest
from your_package.application.exceptions import ApiError
from your_package.infrastructure.api.my_api_client import MyApiClient


def _make_client(**kwargs) -> MyApiClient:
    return MyApiClient(api_key="test-key", base_url="https://api.test", **kwargs)


def test_returns_json_on_success():
    client = _make_client()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"id": "abc"}
    client._session.get = MagicMock(return_value=mock_resp)
    result = client.get_record("abc")
    assert result == {"id": "abc"}


def test_retries_on_429_then_succeeds():
    client = _make_client(max_retries=2, base_delay=0)
    rate_limited = MagicMock(status_code=429, headers={})
    success = MagicMock(status_code=200, headers={})
    success.json.return_value = {"id": "abc"}
    client._session.get = MagicMock(side_effect=[rate_limited, success])
    with patch("time.sleep"):  # don't actually wait in tests
        result = client.get_record("abc")
    assert result == {"id": "abc"}


def test_raises_api_error_after_max_retries():
    client = _make_client(max_retries=2, base_delay=0)
    rate_limited = MagicMock(status_code=429, headers={})
    client._session.get = MagicMock(return_value=rate_limited)
    with patch("time.sleep"):
        with pytest.raises(ApiError):
            client.get_record("abc")


def test_respects_retry_after_header():
    client = _make_client(max_retries=1, base_delay=0)
    rate_limited = MagicMock(status_code=429, headers={"Retry-After": "5"})
    success = MagicMock(status_code=200, headers={})
    success.json.return_value = {}
    client._session.get = MagicMock(side_effect=[rate_limited, success])
    with patch("time.sleep") as mock_sleep:
        client.get_record("abc")
    mock_sleep.assert_called_once_with(5.0)


def test_raises_on_400_without_retry():
    client = _make_client(max_retries=3, base_delay=0)
    bad_request = MagicMock(status_code=400)
    bad_request.raise_for_status.side_effect = Exception("400 Bad Request")
    client._session.get = MagicMock(return_value=bad_request)
    with pytest.raises(Exception, match="400"):
        client.get_record("abc")
    assert client._session.get.call_count == 1  # no retries
```

Always patch `time.sleep` in retry tests. Never let real delays run in
the test suite.

---

## API client checklist

- [ ] Uses `requests.Session` with headers set once at construction.
- [ ] API key read from `os.environ["KEY"]` — `KeyError` on missing key is intentional.
- [ ] `max_retries` is 3 unless the API documentation explicitly recommends more.
- [ ] `_backoff_delay` uses equal jitter for single-client tools, full jitter for multi-client.
- [ ] Retry loop has a hard `max_retries` ceiling — never infinite.
- [ ] Retries on `429`, `503`, `504`, and network exceptions only.
- [ ] Does not retry on `400`, `401`, `403`, `404`, `422`.
- [ ] `Retry-After` header respected when present on `429` responses.
- [ ] Each retry attempt logged at WARNING with attempt number and delay.
- [ ] Final failure logged at ERROR — with `exc_info=True` for exceptions, without for status codes.
- [ ] API key, token, and header values never logged at any level.
- [ ] Response body logged at DEBUG only, never WARNING or above.
- [ ] `ApiError` raised after exhausting retries — not a silent empty result.
- [ ] `ApiError` caught at the CLI/route boundary with a clean user message.
- [ ] `time.sleep` patched to zero in all retry tests.

## See also

- `polite-scraping` — for HTML scraping of public websites without authentication.
- `secrets-and-env.mdc` — environment variable rules for credentials.
- `clean-error-messages.mdc` — catching `ApiError` at the CLI/route boundary.
