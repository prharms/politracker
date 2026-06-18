---
name: sqlite-sqlalchemy-core
description: >-
  Implements SQLite persistence using SQLAlchemy Core (Table, MetaData, select,
  text) without the ORM. Use when adding a new table, writing a repository,
  building dynamic query filters, or testing database logic with an in-memory
  SQLite database. Covers schema definition, safe query construction, engine
  injection, error handling, and the bandit/mypy pitfalls unique to this stack.
---

# SQLite with SQLAlchemy Core

## When to use SQLAlchemy Core (not ORM)

Use Core when:
- The schema is simple and stable (no complex relationships, no lifecycle hooks)
- You want explicit SQL control without an ORM session
- You are writing a data-loading or read-heavy application

Use the ORM when domain objects need identity tracking, lazy loading, or
relationship traversal. Do not mix Core and ORM in the same project.

---

## Step 1 — Schema definition

Declare all tables once in a shared `schema.py`. Never repeat column definitions.

```python
# infrastructure/persistence/schema.py
from sqlalchemy import Column, DateTime, MetaData, Numeric, String, Table

metadata = MetaData()

disbursements = Table(
    "disbursements",
    metadata,
    Column("document_id", String, nullable=False),
    Column("check_date", String, nullable=False),   # stored as ISO date string
    Column("payee", String, nullable=False),
    Column("amount", Numeric, nullable=False),       # Decimal-safe
    Column("source_file", String, nullable=False),
)

file_registry = Table(
    "file_registry",
    metadata,
    Column("filename", String, primary_key=True),
    Column("downloaded_at", DateTime, nullable=False),
    Column("row_count", String, nullable=False),
)
```

---

## Step 2 — Engine creation

The engine is created once in `container.py` and injected into repositories.
Never create an engine inside a repository.

```python
# container.py
import os
from sqlalchemy import create_engine, Engine

def get_engine() -> Engine:
    """Create and return a SQLAlchemy engine from DATABASE_URL env var."""
    db_url = os.environ.get("DATABASE_URL", "sqlite:///data/app.db")
    return create_engine(db_url)
```

```ini
# .env.example
DATABASE_URL=sqlite:///data/app.db
```

---

## Step 3 — Repository pattern

```python
# infrastructure/persistence/my_repository.py
import logging
from datetime import date

from sqlalchemy import Engine, and_, func, select, text
from sqlalchemy.exc import SQLAlchemyError

from your_package.application.exceptions import RepositoryError
from your_package.domain.entities import MyEntity
from your_package.infrastructure.persistence.schema import metadata, my_table


class MyRepository:
    """Implements MyRepositoryPort using SQLAlchemy Core against SQLite."""

    def __init__(self, engine: Engine, logger: logging.Logger | None = None) -> None:
        """Initialise with a SQLAlchemy engine and create tables if needed."""
        self._engine = engine
        self._logger = logger or logging.getLogger(__name__)
        metadata.create_all(engine)   # idempotent — safe to call on every init

    def insert_many(self, records: list[MyEntity]) -> int:
        """Insert a batch of entities and return the row count inserted."""
        if not records:
            return 0
        rows = [_entity_to_row(r) for r in records]
        try:
            with self._engine.begin() as conn:
                conn.execute(my_table.insert(), rows)
            return len(rows)
        except SQLAlchemyError as exc:
            self._logger.error("insert_many failed", exc_info=True)
            raise RepositoryError("Failed to insert records") from exc

    def get_total_count(self) -> int:
        """Return the total number of records in the table."""
        sql = text("SELECT COUNT(*) FROM my_table")
        try:
            with self._engine.connect() as conn:
                return int(conn.execute(sql).scalar_one())  # cast: scalar_one() returns Any
        except SQLAlchemyError as exc:
            self._logger.error("get_total_count failed", exc_info=True)
            raise RepositoryError("Failed to get count") from exc

    def truncate(self) -> None:
        """Delete all rows from the table."""
        try:
            with self._engine.begin() as conn:
                conn.execute(my_table.delete())
        except SQLAlchemyError as exc:
            self._logger.error("truncate failed", exc_info=True)
            raise RepositoryError("Failed to truncate table") from exc
```

---

## Step 4 — Dynamic query filters (without bandit B608)

Bandit flags any SQL built with f-strings (B608). Use `select()` with
`text()` clauses to build dynamic WHERE conditions safely.

```python
from sqlalchemy import and_, select, text

def query_with_filters(
    self,
    filters: MyFilters,
    page: int,
    page_size: int,
) -> tuple[list[MyEntity], int]:
    """Return a filtered, paginated page of records and the total count."""
    where_clauses, params = _build_where(filters)
    conditions = [text(c) for c in where_clauses]   # literal strings — no interpolation
    offset = (page - 1) * page_size

    count_stmt = select(func.count()).select_from(my_table)
    select_stmt = (
        select(my_table)
        .order_by(my_table.c.check_date.desc())
        .limit(page_size)
        .offset(offset)
    )
    if conditions:
        count_stmt = count_stmt.where(and_(*conditions))
        select_stmt = select_stmt.where(and_(*conditions))

    try:
        with self._engine.connect() as conn:
            total = int(conn.execute(count_stmt, params).scalar_one())
            rows = conn.execute(select_stmt, params).fetchall()
    except SQLAlchemyError as exc:
        self._logger.error("query failed", exc_info=True)
        raise RepositoryError("Failed to query records") from exc

    return [_row_to_entity(r) for r in rows], total
```

**`_build_where` helper** — always extract to module level (not a method) to
avoid C901 complexity violations. Split further if there are many filter types:

```python
def _build_where(filters: MyFilters) -> tuple[list[str], dict]:
    """Build SQL WHERE clause strings and bound parameter dict."""
    clauses: list[str] = []
    params: dict = {}
    _apply_text_filters(filters, clauses, params)
    _apply_date_filters(filters, clauses, params)
    _apply_amount_filters(filters, clauses, params)
    return clauses, params

def _apply_text_filters(filters: MyFilters, clauses: list[str], params: dict) -> None:
    """Append LIKE clauses for string filter fields."""
    for col in ("payee", "department", "purpose"):
        val = getattr(filters, col, None)
        if val:
            clauses.append(f"UPPER({col}) LIKE UPPER(:{col})")
            params[col] = f"%{val}%"

def _apply_date_filters(filters: MyFilters, clauses: list[str], params: dict) -> None:
    """Append date-range clauses."""
    if filters.date_from:
        clauses.append("check_date >= :date_from")
        params["date_from"] = filters.date_from.isoformat()
    if filters.date_to:
        clauses.append("check_date <= :date_to")
        params["date_to"] = filters.date_to.isoformat()

def _apply_amount_filters(filters: MyFilters, clauses: list[str], params: dict) -> None:
    """Append amount-range clauses."""
    if filters.amount_min is not None:
        clauses.append("CAST(amount AS REAL) >= :amount_min")
        params["amount_min"] = float(filters.amount_min)
    if filters.amount_max is not None:
        clauses.append("CAST(amount AS REAL) <= :amount_max")
        params["amount_max"] = float(filters.amount_max)
```

---

## Step 5 — Row converters

Keep these at module level as plain functions:

```python
def _entity_to_row(entity: MyEntity) -> dict:
    """Convert a domain entity to a dict for SQLAlchemy Core insert."""
    return {
        "document_id": entity.document_id,
        "check_date": entity.check_date.isoformat(),
        "payee": entity.payee,
        "amount": str(entity.amount),
        "source_file": entity.source_file,
    }

def _row_to_entity(row: object) -> MyEntity:
    """Convert a SQLAlchemy Core result row to a domain entity."""
    return MyEntity(
        document_id=row[0],       # type: ignore[index]
        check_date=date.fromisoformat(row[1]),  # type: ignore[index]
        payee=row[2],             # type: ignore[index]
        amount=Decimal(row[3]),   # type: ignore[index]
        source_file=row[4],       # type: ignore[index]
    )
```

---

## Step 6 — Integration tests with in-memory SQLite

Use `create_engine("sqlite:///:memory:")` — no file, no teardown needed.

```python
# tests/integration/test_my_repository.py
import pytest
from decimal import Decimal
from datetime import date
from sqlalchemy import create_engine

from your_package.infrastructure.persistence.my_repository import MyRepository
from your_package.domain.entities import MyEntity


@pytest.fixture
def repo():
    engine = create_engine("sqlite:///:memory:")
    return MyRepository(engine)

def _make_entity(**kwargs) -> MyEntity:
    defaults = dict(
        document_id="DOC001",
        check_date=date(2021, 11, 15),
        payee="ACME Corp",
        amount=Decimal("1500.00"),
        source_file="test.xlsx",
    )
    return MyEntity(**{**defaults, **kwargs})

@pytest.mark.integration
class TestMyRepository:
    def test_insert_and_count(self, repo):
        repo.insert_many([_make_entity()])
        assert repo.get_total_count() == 1

    def test_insert_empty_list_returns_zero(self, repo):
        assert repo.insert_many([]) == 0

    def test_truncate_removes_all_records(self, repo):
        repo.insert_many([_make_entity(), _make_entity(document_id="DOC002")])
        repo.truncate()
        assert repo.get_total_count() == 0
```

---

## Common pitfalls

| Pitfall | Fix |
|---|---|
| `f"SELECT ... {variable}"` in `text()` | Use `select()` + `text()` clauses with bound params |
| `scalar_one()` fails mypy (`returns Any`) | Wrap with `int(...)` or `str(...)` as appropriate |
| `metadata.create_all()` called once at app start but not in tests | Call it in `__init__` — it is idempotent |
| `Engine` created inside a repository | Inject via `__init__`; create once in `container.py` |
| Raw SQL `WHERE` built by string join | Use `and_(*[text(c) for c in clauses])` |
| `_build_where` grows to complexity > 10 | Split into `_apply_text_filters`, `_apply_date_filters`, etc. |
