---
name: polite-scraping
description: >-
  Implements a well-behaved HTTP scraper that respects robots.txt, identifies
  itself via User-Agent, and jitters request delays to avoid detectable patterns.
  Use when writing a new scraper, adding a download step to an existing one, or
  reviewing scraper code for compliance with polite-scraping standards. Covers
  the port/adapter pattern, robots.txt checking, jittered delay, User-Agent
  header, file preservation, and error handling.
---

# Polite Scraping

## The three mandatory properties

Every scraper in this codebase must satisfy all three:

1. **Identifies itself** — a descriptive `User-Agent` header on every request.
2. **Respects `robots.txt`** — check before fetching any resource on a host.
3. **Jitters its delay** — randomise the wait between requests to avoid a
   detectable fixed-interval pattern. Use `random.uniform(min, max)` with a
   range centered near 2 seconds (e.g. 1.5–2.5 s).

---

## Port definition

The scraper is defined as a `Protocol` in `application/ports/`:

```python
# application/ports/scraper.py
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol


@dataclass(frozen=True)
class FileInfo:
    """Metadata for a single downloadable file discovered on the index page."""

    url: str
    filename: str


class CheckRegisterScraperPort(Protocol):
    """Discovers and downloads files from the source website."""

    def list_available_files(self) -> list[FileInfo]:
        """Return metadata for all downloadable files found on the index page."""
        ...

    def download(self, file_info: FileInfo, dest_dir: Path) -> Path:
        """Download one file to dest_dir and return its local path."""
        ...
```

---

## robots.txt pitfall — never use rp.read()

`urllib.robotparser.RobotFileParser.read()` fetches `robots.txt` using
Python's built-in `urllib`, which sends a bare Python User-Agent header.
Many web servers return `403 Forbidden` for this. Python's robotparser
interprets a 403 as "disallow everything" — `can_fetch()` returns `False`
for every URL, even ones that are explicitly permitted in the actual file.

**This is a silent false positive that blocks all scraping with no clear error.**

Always fetch `robots.txt` using the same `requests.Session` that carries
your custom `User-Agent`, then pass the content to `rp.parse()` directly:

```python
# WRONG — urllib fetches without your User-Agent, 403 = disallow all
rp.read()

# CORRECT — fetch with your session, parse the content yourself
response = session.get(robots_url, timeout=10)
response.raise_for_status()
rp.parse(response.text.splitlines())
```

After calling `rp.parse()`, also verify the parser found entries. If the
server returned an empty or malformed file, `rp.entries` will be empty and
`can_fetch()` may return False for everything:

```python
rp.parse(response.text.splitlines())
if not rp.entries and rp.default_entry is None:
    logger.warning("robots.txt parsed but contains no entries — allowing access")
    return None  # treat as permissive, not restrictive
return rp
```

---

## Scraper implementation

Use a `requests.Session` so the custom `User-Agent` is sent on every
request — including the `robots.txt` fetch — without repeating the header
on every call.

```python
# infrastructure/scraper/my_scraper.py
import logging
import random
import time
import urllib.robotparser
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

from your_package.application.exceptions import ScraperError
from your_package.application.ports.scraper import CheckRegisterScraperPort, FileInfo
from your_package.domain.constants import OFFICIAL_SOURCE_URL

USER_AGENT = "your-project/1.0 (public records research; non-commercial)"
BASE_URL = "https://example.com"


class MyScraper:
    """Implements CheckRegisterScraperPort with polite-scraping behaviour."""

    SOURCE_URL = OFFICIAL_SOURCE_URL

    def __init__(
        self,
        delay_min: float = 1.5,
        delay_max: float = 2.5,
        logger: logging.Logger | None = None,
    ) -> None:
        """Initialise with configurable jitter range."""
        self._delay_min = delay_min
        self._delay_max = delay_max
        self._logger = logger or logging.getLogger(__name__)
        self._session = requests.Session()
        self._session.headers.update({"User-Agent": USER_AGENT})
        # Session must be created before _load_robots so the robots fetch
        # uses the same User-Agent as all other requests.
        self._robots = _load_robots(BASE_URL, USER_AGENT, self._logger, self._session)

    def list_available_files(self) -> list[FileInfo]:
        """Fetch the index page and return all downloadable file links."""
        self._check_robots(self.SOURCE_URL)
        try:
            resp = self._session.get(self.SOURCE_URL, timeout=30)
            resp.raise_for_status()
        except requests.RequestException as exc:
            raise ScraperError("Failed to fetch index page") from exc
        return _extract_links(resp.text, self.SOURCE_URL)

    def download(self, file_info: FileInfo, dest_dir: Path) -> Path:
        """Download one file, jitter-wait, and save to dest_dir."""
        self._check_robots(file_info.url)
        self._jitter_sleep()
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / file_info.filename
        try:
            resp = self._session.get(file_info.url, timeout=60, stream=True)
            resp.raise_for_status()
            with dest.open("wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)
        except requests.RequestException as exc:
            raise ScraperError(f"Failed to download {file_info.filename}") from exc
        self._logger.info("Downloaded %s", file_info.filename)
        return dest

    def _jitter_sleep(self) -> None:
        """Sleep for a random duration within the configured range."""
        delay = random.uniform(self._delay_min, self._delay_max)
        self._logger.debug("Polite delay: %.2fs", delay)
        time.sleep(delay)

    def _check_robots(self, url: str) -> None:
        """Raise ScraperError if robots.txt disallows the URL."""
        if self._robots and not self._robots.can_fetch(USER_AGENT, url):
            raise ScraperError(f"robots.txt disallows: {url}")


def _load_robots(
    base_url: str,
    user_agent: str,
    logger: logging.Logger,
    session: requests.Session,
) -> urllib.robotparser.RobotFileParser | None:
    """Fetch and parse robots.txt using the session; return None if unavailable.

    Uses the provided session (with custom User-Agent) rather than
    urllib.robotparser's built-in fetch, which many servers block with 403.
    Python interprets a 403 on robots.txt as disallow-all — a silent false
    positive. Fetching with requests avoids this.
    """
    robots_url = f"{base_url}/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(robots_url)
    try:
        response = session.get(robots_url, timeout=10)
        response.raise_for_status()
        rp.parse(response.text.splitlines())
        if not rp.entries and rp.default_entry is None:
            logger.warning("robots.txt at %s has no entries — allowing access", robots_url)
            return None
        return rp
    except Exception as exc:
        logger.warning("Could not fetch robots.txt from %s: %s", robots_url, exc)
        return None
```

---

## Link extraction helper

Keep this at module level (not nested) to avoid complexity violations:

```python
from urllib.parse import urljoin

def _extract_links(html: str, base_url: str) -> list[FileInfo]:
    """Parse HTML and return FileInfo for each .xlsx link."""
    soup = BeautifulSoup(html, "lxml")
    results = []
    for tag in soup.find_all("a", href=True):
        href: str = tag["href"]
        if not href.lower().endswith(".xlsx"):
            continue
        url = href if href.startswith("http") else urljoin(base_url, href)
        filename = _derive_filename(tag.get_text(strip=True), url)
        results.append(FileInfo(url=url, filename=filename))
    return results


def _derive_filename(link_text: str, url: str) -> str:
    """Derive a safe filename from link text, falling back to the URL segment."""
    name = link_text.strip() if link_text else ""
    if not name:
        name = url.rstrip("/").split("/")[-1]
    if not name.lower().endswith(".xlsx"):
        name += ".xlsx"
    return name
```

---

## File preservation rule

Downloaded files are **always saved to disk before parsing**. The `datasets/`
directory is the local cache of source data and is never deleted by the ingest
process. Pass the saved `Path` to the parser rather than parsing bytes in memory.

```python
# In the use case — download first, then parse
local_path = scraper.download(file_info, datasets_dir)
records = parser.parse(local_path, source_file=file_info.filename)
```

---

## Configuration

Delay bounds come from environment variables, not hardcoded values:

```python
# container.py
def get_scraper() -> MyScraper:
    """Create the scraper with configured jitter delay."""
    delay_min = float(os.environ.get("CRAWL_DELAY_MIN", "1.5"))
    delay_max = float(os.environ.get("CRAWL_DELAY_MAX", "2.5"))
    return MyScraper(delay_min=delay_min, delay_max=delay_max)
```

```ini
# .env.example
CRAWL_DELAY_MIN=1.5
CRAWL_DELAY_MAX=2.5
```

---

## Testing

The scraper is tested with `unittest.mock` — no real HTTP calls in unit tests.
Tag real network tests `@pytest.mark.api` and exclude them from the default suite.

```python
# Unit test — mock requests.get
from unittest.mock import MagicMock, patch
from your_package.infrastructure.scraper.my_scraper import MyScraper

def test_list_available_files_returns_file_infos():
    html = '<a href="/files/BCC_2021-10-27.xlsx">BCC 2021-10-27</a>'
    mock_resp = MagicMock()
    mock_resp.text = html
    with patch("requests.get", return_value=mock_resp):
        scraper = MyScraper()
        files = scraper.list_available_files()
    assert len(files) == 1
    assert files[0].filename == "BCC 2021-10-27.xlsx"

def test_robots_check_raises_when_disallowed():
    scraper = MyScraper()
    mock_rp = MagicMock()
    mock_rp.can_fetch.return_value = False
    scraper._robots = mock_rp
    with pytest.raises(ScraperError):
        scraper._check_robots("https://example.com/file.xlsx")
```

---

## Polite scraping checklist

Before declaring a scraper done, verify:

- [ ] A `requests.Session` is used — not bare `requests.get` — so the
  `User-Agent` header is set once and sent on every request automatically.
- [ ] `robots.txt` is fetched with the session (not `rp.read()`) and parsed
  with `rp.parse(response.text.splitlines())`.
- [ ] After parsing `robots.txt`, check that `rp.entries` is non-empty before
  trusting `can_fetch()`. Return `None` (allow) if the file parsed empty.
- [ ] `robots.txt` is loaded at construction, before the first fetch.
- [ ] `_check_robots()` is called before every URL fetch (index page and
  each individual file download).
- [ ] Delay is `random.uniform(min, max)` — not `time.sleep(fixed_value)`.
- [ ] Delay bounds come from environment variables (`CRAWL_DELAY_MIN/MAX`).
- [ ] Downloaded files are saved to `datasets/` before parsing.
- [ ] All `requests.RequestException` caught and re-raised as `ScraperError`.
- [ ] No network calls in unit tests — mocked via `patch` on the session or
  `requests.get`.
