---
name: mass-document-retrieval
description: Planning and implementation guide for bulk retrieval of public government documents — meeting minutes, agendas, resolutions, financial records — from multi-page archives. Use when scraping more than one index page, handling multiple document formats (PDF, DOCX, HTML), building a resumable download pipeline, or working with public records that may contain embedded personal information. Extends polite-scraping with pagination, resumability, metadata capture, format routing, and legal context.
---

# Mass Document Retrieval

This skill covers bulk retrieval of public government documents from
multi-page archives. It builds on `polite-scraping` for the HTTP layer
and `sqlite-sqlalchemy-core` for the file registry. Read those skills
first if working with an unfamiliar codebase.

---

## How this differs from polite-scraping

`polite-scraping` assumes:
- A single index page listing all downloadable files.
- One file format (XLSX in the ocfl-spending project).
- Discovery and download are simple sequential operations.

Mass document retrieval adds:
- Multi-page or hierarchically structured archives requiring crawl traversal.
- Multiple document formats with different parsers for each.
- Resumability across sessions — a download of thousands of documents
  may take hours or days.
- Metadata that lives on the index page, not inside the document.
- Content rot — links that no longer resolve, pages that silently redirect.
- Embedded personal information requiring documented handling decisions.

---

## Phase 1 — Reconnaissance before any code

Before writing a scraper, spend time manually exploring the source.
Run `data-source-recon` if available. Answer these questions first:

### Archive structure
- Is the document list on a single page or paginated? How many pages?
- Is it a flat list or hierarchical (year → month → meeting → documents)?
- What is the URL pattern? Does pagination use query parameters (`?page=2`)
  or path segments (`/minutes/2023/`)?
- Is there a sitemap or API endpoint that lists documents more cleanly
  than the HTML archive?

### Document formats
- What formats are present? PDF, DOCX, HTML, video, audio?
- Are PDFs text-layer (searchable) or scanned images requiring OCR?
- Are there mixed formats within the same document set
  (e.g. agenda in HTML, minutes in PDF)?

### Metadata location
- Is meeting date, agenda number, or committee name on the index page
  (capture at discovery) or inside the document (capture at parse)?
- Is there structured metadata (JSON-LD, microdata) in the page source,
  or must it be extracted from link text and surrounding HTML?

### Scale and freshness
- How many total documents? How far back does the archive go?
- How frequently are new documents published?
- Is there a "recent documents" feed (RSS, Atom) that could be used for
  incremental updates rather than full re-crawl?

Document the answers before writing any code. They drive every subsequent
architectural decision.

---

## Phase 2 — File registry design

A resumable pipeline requires a registry that records what has already
been downloaded. See `sqlite-sqlalchemy-core` for the implementation pattern.

The registry table needs more columns than the basic ocfl-spending model:

```
document_registry
  url             TEXT PRIMARY KEY   -- canonical source URL
  filename        TEXT               -- local filename in datasets/
  source_format   TEXT               -- 'pdf', 'docx', 'html', 'video'
  document_date   DATE               -- meeting/publication date (nullable)
  document_title  TEXT               -- from index page link text
  downloaded_at   DATETIME
  parsed_at       DATETIME           -- null until text extraction completes
  parse_status    TEXT               -- 'pending', 'done', 'error', 'ocr_needed'
  row_count       INTEGER            -- records extracted, if applicable
```

Separating `downloaded_at` from `parsed_at` is important: downloading and
parsing are separate pipeline stages. A document can be downloaded but
not yet parsed (OCR is slow). The registry tracks both independently so
each stage can be resumed without repeating the other.

---

## Phase 3 — Crawl architecture

### Separate discovery from download

Discovery (finding URLs) and download (fetching files) should be distinct
operations. This allows:
- Previewing the full document list before committing to a long download.
- Resuming downloads without re-crawling the archive.
- Reporting progress accurately (total known before work begins).

```python
# Port definitions
class DocumentDiscoveryPort(Protocol):
    def discover(self) -> list[DocumentInfo]: ...

class DocumentDownloadPort(Protocol):
    def download(self, doc: DocumentInfo, dest_dir: Path) -> Path: ...
```

`DocumentInfo` is a dataclass in `application/ports/` containing at minimum
`url`, `filename`, `source_format`, `document_date`, and `document_title`.

### Pagination pattern

```python
def _crawl_all_pages(self, base_url: str) -> list[DocumentInfo]:
    """Crawl all archive pages, following pagination until exhausted."""
    results = []
    url: str | None = base_url
    while url is not None:
        self._check_robots(url)
        resp = self._session.get(url, timeout=30)
        resp.raise_for_status()
        page_docs, next_url = _parse_archive_page(resp.text, url)
        results.extend(page_docs)
        self._logger.info("Discovered %d documents (page: %s)", len(results), url)
        url = next_url
        if url:
            self._jitter_sleep()
    return results
```

`_parse_archive_page` returns `(list[DocumentInfo], next_page_url | None)`.
When `next_page_url` is None, the crawl stops.

### Handling content rot

Check the HTTP status before treating a download as successful:

```python
PERMANENT_ERRORS = {404, 410}  # gone — mark as error, do not retry
TRANSIENT_ERRORS = {500, 502, 503, 504}  # retry with backoff

if response.status_code in PERMANENT_ERRORS:
    registry.mark_error(doc.url, f"HTTP {response.status_code}")
    return  # do not retry — the document is gone
```

Log 404s at WARNING, not ERROR — they are common in old government archives
and expected, not exceptional.

---

## Phase 4 — Format routing

Different document formats need different parsers. Route at the use case
level, not inside the scraper:

```python
# application/ports/document_parser.py
class DocumentParserPort(Protocol):
    def can_parse(self, source_format: str) -> bool: ...
    def parse(self, path: Path, metadata: DocumentInfo) -> list[Record]: ...
```

Register parsers in the container:

```python
PARSERS: list[DocumentParserPort] = [
    PdfTextParser(),
    PdfOcrParser(),   # fallback when text layer is absent
    DocxParser(),
    HtmlMinutesParser(),
]

def route_parser(source_format: str, path: Path) -> DocumentParserPort:
    for parser in PARSERS:
        if parser.can_parse(source_format):
            return parser
    raise ParseError(f"No parser registered for format: {source_format}")
```

### PDF: text layer vs OCR

Before invoking OCR (which is slow and requires additional dependencies),
check whether the PDF has a text layer:

```python
import pdfplumber

def _has_text_layer(path: Path) -> bool:
    """Return True if the PDF has extractable text on the first page."""
    with pdfplumber.open(path) as pdf:
        if not pdf.pages:
            return False
        return bool(pdf.pages[0].extract_text())
```

Only fall back to OCR (`pytesseract`, `pdf2image`) if `_has_text_layer`
returns False. Document the OCR dependency in `pyproject.toml` as optional:

```toml
[project.optional-dependencies]
ocr = ["pytesseract>=0.3", "pdf2image>=1.16"]
```

---

## Phase 5 — Metadata capture

Capture metadata from the index page at discovery time, not from inside
the document. Index page metadata is more reliable (structured HTML) than
metadata embedded in PDFs (often absent, inconsistent, or wrong).

Minimum metadata to capture at discovery:
- Document date (parse from link text, surrounding `<td>`, or URL pattern)
- Document title or description
- Committee or board name (if the archive covers multiple bodies)
- Agenda item number (if present)

Store in `DocumentInfo` and write to the registry before downloading.
If parsing fails later, the metadata is still preserved.

---

## Phase 6 — Legal and ethical context for public records

Public records are public. However, they frequently contain:

- Names and addresses of private citizens (zoning applicants, speakers,
  petitioners, complainants).
- Personal financial information (property values, business filings).
- Names of minors (school board minutes, child welfare reports).

Before storing or exposing this data, document the handling decision in an
ADR. Typical decisions:

- Store everything as-is (appropriate for research/analysis tools not
  publicly accessible).
- Redact or hash names of private citizens before storage.
- Exclude document types that routinely contain sensitive PII
  (e.g. include agendas but exclude personnel records).

The decision must be made explicitly and documented. "We did not think
about it" is not an acceptable default.

---

## Progress and UX

A pipeline downloading thousands of documents over multiple sessions must
show clear progress. See `progress-indicators` skill.

Recommended output per session:

```
Discovering documents...
  Found 4,832 documents across 97 archive pages.
  New since last run: 14

Downloading [####        ]  14/14  00:00:32  Minutes_2024-03-19.pdf
Done. Downloaded: 14  Skipped: 4,818  Errors: 0

Parsing pending documents...
  [  1/14] Minutes_2024-03-19.pdf (text layer — 312 records)
  [  2/14] Agenda_2024-03-19.pdf (text layer — 28 records)
  ...
Done. Parsed: 14  OCR needed: 0  Errors: 0
```

Separate the download and parse stages in the output. They have different
durations and different failure modes.

---

## Checklist

- [ ] Reconnaissance completed and documented before writing any code.
- [ ] Discovery and download are separate operations with separate ports.
- [ ] File registry tracks `downloaded_at` and `parsed_at` independently.
- [ ] Registry stores `parse_status` so OCR backlog can be queried.
- [ ] Pagination crawl has a termination condition — cannot loop infinitely.
- [ ] 404/410 marked as permanent errors — not retried.
- [ ] PDF text layer checked before invoking OCR.
- [ ] OCR dependencies in `pyproject.toml` as optional extras.
- [ ] Metadata captured from index page at discovery time.
- [ ] PII handling decision documented in an ADR before storage begins.
- [ ] Progress indicators on both download and parse stages.
- [ ] robots.txt checked — see `polite-scraping` pitfall on 403 behavior.

## See also

- `polite-scraping` — HTTP layer: User-Agent, robots.txt, jitter delay.
- `sqlite-sqlalchemy-core` — registry and repository implementation.
- `progress-indicators` — UX for long-running pipeline stages.
- `adr-decision-gate` — for PII handling and format routing decisions.
- `data-source-recon` — reconnaissance before writing any scraper code.
