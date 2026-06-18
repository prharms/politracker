---
name: hexagonal-feature
description: Step-by-step workflow for implementing a new feature end-to-end in this project's hexagonal (ports and adapters) architecture. Use when adding a new use case, repository, CLI command, or any feature that touches more than one layer. Prevents the most common failure mode: writing concrete infrastructure imports inside application-layer files, which causes lint-imports to fail.
---

# Implementing a New Feature End-to-End (Hexagonal Architecture)

## The single most common failure mode

The agent writes a use case like this:

```python
# WRONG — infrastructure import inside application layer
from irs_data.infrastructure.persistence.filing_repository import FilingRepository

class FilingUseCase:
    def __init__(self, repository: FilingRepository) -> None:  # concrete type
```

This fails `lint-imports` immediately. `application` must never import from
`infrastructure`. The use case must be typed against the **Port**, not the
concrete class.

The correct form:

```python
# CORRECT — application imports only from application/ports
from irs_data.application.ports.filing_repository_port import FilingRepositoryPort

class FilingUseCase:
    def __init__(self, repository: FilingRepositoryPort) -> None:  # Protocol type
```

The concrete class (`FilingRepository`) is imported in **exactly one place**: inside the
factory method in `container.py`. Nowhere else.

---

## Step 0 — Create a feature branch

A new hexagonal feature always touches at least 5 files. This meets the mandatory
branching threshold in `git-branching.mdc`. Create the branch before writing any code.

```powershell
git checkout -b feature/<short-description>
```

Use `feature/` for new functionality, `fix/` for bug fixes, `refactor/` for
restructuring. Never commit new Python logic directly to `main`.

---

## Implementation order — follow this sequence

Always build in this order. Each step has a hard import constraint. Violating the
constraint causes `lint-imports` to fail.

```
Step 1 → Port          application/ports/
Step 2 → Domain entity domain/                (skip if entity already exists)
Step 3 → Repository    infrastructure/persistence/
Step 4 → DTO           application/dtos/      (skip if DTO already exists)
Step 5 → Use case      application/use_cases/<topic>/
Step 6 → Container     container.py
Step 7 → CLI command   presentation/cli/commands/
Step 8 → Write tests
```

The order matters because each step imports only from steps that came before it.
Writing the use case before the port causes the wrong import to be written.

---

## Step 1 — Define the port

**File:** `irs_data/application/ports/<snake_case>_repository_port.py`
**Class name:** `FooRepositoryPort`

```python
"""Repository port for <description>."""

from __future__ import annotations

from typing import List, Optional, Protocol

from irs_data.domain.<module> import FooDomainEntity


class FooRepositoryPort(Protocol):
    """Port for persisting and retrieving Foo entities."""

    def get_all(self) -> List[FooDomainEntity]:
        """Return all Foo records."""
        ...

    def find_by_id(self, foo_id: int) -> Optional[FooDomainEntity]:
        """Return one Foo by ID, or None if it does not exist."""
        ...

    def save(self, entity: FooDomainEntity) -> FooDomainEntity:
        """Create or update a Foo and return the persisted entity."""
        ...
```

**Import constraints:**
- May import from: `domain`, `typing`, `__future__`
- Must NOT import from: `infrastructure`, `application.use_cases`, `presentation`, `container`

**Rules:**
- Inherits `Protocol` — no `@runtime_checkable` unless explicitly required.
- Method bodies are `...` (ellipsis) — no implementation.
- Every method must have a docstring and return type annotation.

---

## Step 2 — Domain layer additions (if new)

Skip this step if the required domain types already exist. If anything new is
needed, use the guidance below to decide what type of domain object to create
and where to put it.

---

### 2a — Choose the right type of domain object

| What you need | Type | Pattern |
|---|---|---|
| A named concept with identity that persists over time (a Filing, a Contractor) | **Entity** | `@dataclass(frozen=True)` with an ID field; validation at construction |
| An immutable descriptor defined entirely by its value (a tax year, an EIN) | **Value object** | `@dataclass(frozen=True)`; no ID; equality is value equality |
| A computation over domain data with no side effects | **Rule function** | Module-level `def` returning a plain value; no class needed |
| A fixed set of named values | **Enum** | `class FooType(str, Enum)` |
| A signal that a domain invariant was violated | **Domain exception** | `class InvalidFooError(ValueError)` — inherits `ValueError`, not `Exception` |
| A threshold, cap, or magic number used in more than one place | **Domain constant** | Module-level `_CONSTANT_NAME: int = 7`; underscore prefix, type-annotated |

**Default to `frozen=True`.** Mutable domain objects are the exception, not
the rule.

---

### 2b — Choose the right location

| Type of addition | Location |
|---|---|
| Project-specific concept (a Filing, a Contractor) | `irs_data/domain/<topic>/<snake_case>.py` |
| Reusable pure utility with no project-specific knowledge | `irs_data/shared/utils/<snake_case>.py` |
| Cross-cutting domain protocol (e.g. `DBSessionProtocol`) | `irs_data/domain/protocols.py` |
| Domain exception for a specific module | `irs_data/domain/<topic>/exceptions.py` |

Put things in `domain/` when they encode a rule or concept specific to this
project's subject matter (IRS 990 filings, tax-exempt status, contractor records).
Put things in `shared/` when they are pure utilities with no subject-matter
knowledge (string formatting, date arithmetic, generic normalization).

---

### 2c — Entity and value object pattern

```python
"""Domain entity for <description>."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class FooDomainEntity:
    """<One-sentence description of what this entity represents>."""

    foo_id: int
    name: str

    def __post_init__(self) -> None:
        """Validate invariants at construction time."""
        if not self.name:
            raise InvalidFooError("name must not be empty")
        if self.foo_id <= 0:
            raise InvalidFooError(f"foo_id must be positive, got {self.foo_id}")


class InvalidFooError(ValueError):
    """Raised when a Foo entity cannot be constructed from invalid data."""
```

**Rules:**
- Validate in `__post_init__`, not in a setter or repository.
- Raise a domain exception (`InvalidFooError(ValueError)`), never `AssertionError`.
- No methods that call repositories, session objects, or external services.
- No imports from `application`, `infrastructure`, or `presentation`.

---

### 2d — Rule function pattern

Pure functions that express a domain rule belong at module level, not in a class.

```python
"""Domain rules for IRS 990 filing classification."""

# Threshold is a domain constant — name it, don't inline the magic number.
_CONTRACTOR_DISCLOSURE_THRESHOLD = 100_000


def requires_contractor_disclosure(compensation: int) -> bool:
    """Return True when a contractor must be disclosed on Part VII Section B."""
    return compensation >= _CONTRACTOR_DISCLOSURE_THRESHOLD
```

---

### 2e — Import constraints for domain files

Domain files may import from:
- `typing`, `__future__`, `dataclasses`, `enum`, `datetime`, `decimal` — stdlib only
- Other modules within `irs_data/domain/` (sibling domain modules)

Domain files must **never** import from:
- `irs_data.application.*`
- `irs_data.infrastructure.*`
- `irs_data.presentation.*`
- `irs_data.container`

**The runtime import trap — read this before writing any domain type:**

If a domain type is imported at runtime (not under `TYPE_CHECKING`) in a use
case file, and a CLI command imports that use case, `lint-imports` will fail
with a transitive path violation:

```
presentation/cli/foo_commands.py
  → application/use_cases/foo_use_case.py
    → domain/filing_rules.py          ← forbidden transitive path
```

Fix: either move the domain reference to a string/numeric literal inside the
use case, or place the import under `TYPE_CHECKING` (type annotations only).

---

## Step 3 — Infrastructure repository

**File:** `irs_data/infrastructure/persistence/<snake_case>_repository.py`
**Class name:** `FooRepository` (drops the `Port` suffix)

```python
"""Infrastructure adapter: persistence for <table>."""

from __future__ import annotations

from typing import List, Optional, cast

from sqlalchemy.exc import SQLAlchemyError

from irs_data.domain.protocols import DBSessionProtocol
from irs_data.domain.<module> import FooDomainEntity
from irs_data.infrastructure.persistence.orm_models import FooOrmModel
from irs_data.shared.exceptions import RepositoryError


class FooRepository:
    """Persist and retrieve Foo domain entities."""

    def __init__(self, db_session: DBSessionProtocol) -> None:
        """Initialise with a database session."""
        self._db_session = db_session

    def get_all(self) -> List[FooDomainEntity]:
        """Return all Foo records."""
        try:
            orm_objs = self._db_session.query(FooOrmModel).all()
            return [self._to_domain(obj) for obj in orm_objs]
        except SQLAlchemyError as exc:
            raise RepositoryError(f"Failed to load Foo records: {exc}") from exc

    def find_by_id(self, foo_id: int) -> Optional[FooDomainEntity]:
        """Return one Foo by ID, or None."""
        try:
            obj = (
                self._db_session.query(FooOrmModel)
                .filter(FooOrmModel.foo_id == foo_id)
                .first()
            )
            return self._to_domain(obj) if obj else None
        except SQLAlchemyError as exc:
            raise RepositoryError(f"Failed to load Foo {foo_id}: {exc}") from exc

    @staticmethod
    def _to_domain(orm_obj: FooOrmModel) -> FooDomainEntity:
        """Convert ORM object to domain entity."""
        return FooDomainEntity(foo_id=cast(int, orm_obj.foo_id), ...)
```

**Critical:** `FooRepository` does **not** inherit from `FooRepositoryPort`.
Conformance is structural (same method names and signatures). The type checker
verifies this at the call site in `container.py`.

**Import constraints:**
- May import from: `domain`, `application.ports`, `application.dtos`,
  `application.exceptions`, `shared`, `infrastructure` (own layer)
- Must NOT import from: `application.use_cases`, `application.services`,
  `presentation`, `container`

---

## Step 4 — DTO (if new)

**File:** `irs_data/application/dtos/<snake_case>_dto.py`

```python
"""DTO for Foo — presentation-safe representation of the domain entity."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict

from irs_data.domain.<module> import FooDomainEntity


@dataclass
class FooDTO:
    """Presentation-safe view of a Foo entity."""

    foo_id: int
    name: str

    @classmethod
    def from_entity(cls, entity: FooDomainEntity) -> "FooDTO":
        """Build a DTO from a domain entity."""
        return cls(foo_id=entity.foo_id, name=entity.name)

    def to_dict(self) -> Dict[str, Any]:
        """Serialise to a plain dict for CLI output or XLSX export."""
        return {"foo_id": self.foo_id, "name": self.name}
```

Skip this step if a suitable DTO already exists.

---

## Step 5 — Use case

**File:** `irs_data/application/use_cases/<topic>/<snake_case>_use_case.py`
**Class name:** `FooUseCase`

```python
"""Use case for <description>."""

from __future__ import annotations

import logging
from typing import List, Optional

from irs_data.application.dtos.foo_dto import FooDTO
from irs_data.application.ports.foo_repository_port import FooRepositoryPort


class FooUseCase:
    """<One-sentence description of what this use case orchestrates>."""

    def __init__(
        self,
        repository: FooRepositoryPort,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Initialise with a repository port and optional logger."""
        self._repository = repository
        self._logger = logger or logging.getLogger(__name__)

    def execute(self) -> List[FooDTO]:
        """<What this method does and returns>."""
        self._logger.debug("Fetching all Foo records")
        entities = self._repository.get_all()
        return [FooDTO.from_entity(e) for e in entities]
```

**The anti-pattern guard — before writing this file, confirm:**

- [ ] The `repository` parameter is typed as `FooRepositoryPort` (the Protocol).
- [ ] There is no import of `FooRepository` (the concrete class) anywhere in this file.
- [ ] There is no import from `irs_data.infrastructure.*` anywhere in this file.
- [ ] There is no import from `irs_data.presentation.*` anywhere in this file.
- [ ] Every public method has a docstring and return type annotation.
- [ ] Every method has a McCabe complexity score of 10 or less — exceeding 10 causes
  `./make.ps1 flake8` to fail with C901. Count before writing.
- [ ] **Transitive domain import check (mandatory):** scan every top-level `import`
  and `from ... import` in this file. If any resolves to a module under
  `irs_data.domain.*`, ask: "will a `presentation` file ever import this use case?"
  If yes, that domain import creates the forbidden path
  `presentation → application → domain`. Replace the domain reference with a string
  literal or numeric literal defined at module level in this file instead.

  ```python
  # WRONG — runtime domain import; CLI command reaches domain transitively
  from irs_data.domain.filing_rules import FilingRules
  _DEFAULT_FORM = FilingRules.FORM_990

  # CORRECT — literal in the application layer; no domain import needed
  _DEFAULT_FORM = "990"
  ```

**Import constraints:**
- May import from: `application.ports`, `application.dtos`,
  `application.exceptions`, `shared`
- May import from `domain` **only** under `TYPE_CHECKING` (type annotations) —
  **never** at runtime for constants, rule classes, or default values
- Must NOT import from: `infrastructure`, `presentation`, `container`

---

## Step 6 — Wire the container

**File:** `irs_data/container.py`

Add two factory methods. Both import their concrete classes **inside the method body**
using a local import. The return type is a **string forward reference** to the Port or
use case class.

```python
def get_foo_repository(self, session: "Session") -> "FooRepositoryPort":
    """Get Foo repository instance."""
    from irs_data.infrastructure.persistence.foo_repository import FooRepository
    return FooRepository(db_session=session)

def get_foo_use_case(self, session: "Session") -> "FooUseCase":
    """Get Foo use case instance."""
    from irs_data.application.use_cases.topic.foo_use_case import FooUseCase
    from irs_data.infrastructure.persistence.foo_repository import FooRepository
    return FooUseCase(
        repository=FooRepository(db_session=session),
        logger=self.get_logger(),
    )
```

**Rules:**
- Concrete class imports (`FooRepository`) are **inside the method body**, never at
  the top of `container.py`.
- Port and use case types used in return annotations are declared under
  `TYPE_CHECKING` at the top of `container.py` as string forward references.
- `container.py` is the **only file** in the project where a concrete infrastructure
  class is instantiated and passed to an application-layer use case.

---

## Step 7 — CLI command

**File:** `irs_data/presentation/cli/commands/<snake_case>_commands.py`

CLI commands use Click. They call the container for the use case, invoke
`execute()`, and print results. They never import `container` at module level —
the container is instantiated inside the command function.

```python
"""CLI commands for <description>."""

from __future__ import annotations

import click

from irs_data.application.exceptions import ApplicationError


@click.command("foo")
@click.option("--bar", default=None, help="Filter by bar value.")
@click.option(
    "--output", default=".", show_default=True,
    help="Directory to write output files.",
)
def foo_command(bar: str, output: str) -> None:
    """<One-sentence description of what this command does>."""
    from irs_data.container import Container

    container = Container()
    try:
        with container.get_session() as session:
            use_case = container.get_foo_use_case(session)
            results = use_case.execute(bar=bar)
        for dto in results:
            click.echo(dto.to_dict())
    except ApplicationError as exc:
        click.echo(f"\nError: {exc}", err=True)
        raise SystemExit(1) from exc
```

**Rules:**
- `from irs_data.container import Container` is inside the command function body,
  not at the top of the file. This prevents `lint-imports` from tracing a
  `presentation → container → infrastructure` path at the module level.
- All exceptions caught at the CLI boundary. Raw tracebacks must not reach the user.
- Use `click.echo(..., err=True)` for errors (writes to stderr).
- Use `raise SystemExit(1)` — never `sys.exit()`.

### Step 7a — Register the command in main.py

Every new CLI command must be added to the Click group in `main.py` before
the feature is considered done.

```python
# irs_data/main.py
from irs_data.presentation.cli.commands.foo_commands import foo_command

cli.add_command(foo_command)
```

Verify the command is reachable:

```powershell
cd c:\Projects\prhrt\irs-data; .venv\Scripts\python.exe -m irs_data --help
```

The new command name must appear in the help output.

---

## Step 8 — Write tests

Two test files are required. Both must exist before the task is done. Coverage below
80% causes `./make.ps1 test` to fail — this is a hard build failure.

### Use case test

**File:** `tests/test_<snake_case>_use_case.py` — `Mock()` for repository, no database.

```python
"""Tests for FooUseCase."""
import pytest
from unittest.mock import Mock

from irs_data.application.use_cases.topic.foo_use_case import FooUseCase


@pytest.fixture
def repo() -> Mock:
    """Repository mock."""
    r = Mock()
    r.get_all.return_value = []
    return r


@pytest.fixture
def use_case(repo: Mock) -> FooUseCase:
    """Use case with mocked repository."""
    return FooUseCase(repository=repo, logger=Mock())


class TestFooUseCaseInit:
    """Test constructor wiring."""

    @pytest.mark.unit
    def test_stores_repository(self) -> None:
        """Use case stores the injected repository port."""
        r = Mock()
        assert FooUseCase(repository=r)._repository is r


class TestFooUseCaseExecute:
    """Test execute behaviour."""

    @pytest.mark.unit
    def test_calls_repository(self, use_case: FooUseCase, repo: Mock) -> None:
        """execute() delegates to the repository."""
        use_case.execute()
        repo.get_all.assert_called_once()

    @pytest.mark.unit
    def test_returns_dtos(self, use_case: FooUseCase, repo: Mock) -> None:
        """execute() returns a list."""
        result = use_case.execute()
        assert isinstance(result, list)
```

**What to test:** constructor wiring, `execute()` calls the right repository method(s),
filters/parameters forwarded correctly, DTOs returned (not entities), edge cases
(empty results, `None`, invalid parameter values).

### CLI command test

**File:** `tests/test_<snake_case>_commands.py` — uses `click.testing.CliRunner`.

```python
"""Tests for foo CLI commands."""
import pytest
from unittest.mock import MagicMock, patch

from click.testing import CliRunner

from irs_data.presentation.cli.commands.foo_commands import foo_command


class TestFooCommand:
    """Test the foo CLI command."""

    @pytest.mark.unit
    def test_exits_zero_on_success(self) -> None:
        """Command exits with code 0 when use case succeeds."""
        mock_use_case = MagicMock()
        mock_use_case.execute.return_value = []

        with patch("irs_data.presentation.cli.commands.foo_commands.Container") as mock_container:
            mock_container.return_value.get_foo_use_case.return_value = mock_use_case
            mock_container.return_value.get_session.return_value.__enter__ = MagicMock(return_value=MagicMock())
            mock_container.return_value.get_session.return_value.__exit__ = MagicMock(return_value=False)

            runner = CliRunner()
            result = runner.invoke(foo_command, [])

        assert result.exit_code == 0

    @pytest.mark.unit
    def test_calls_use_case(self) -> None:
        """Command delegates to the use case execute method."""
        mock_use_case = MagicMock()
        mock_use_case.execute.return_value = []

        with patch("irs_data.presentation.cli.commands.foo_commands.Container") as mock_container:
            mock_container.return_value.get_foo_use_case.return_value = mock_use_case
            mock_container.return_value.get_session.return_value.__enter__ = MagicMock(return_value=MagicMock())
            mock_container.return_value.get_session.return_value.__exit__ = MagicMock(return_value=False)

            runner = CliRunner()
            runner.invoke(foo_command, [])

        mock_use_case.execute.assert_called_once()
```

**What to test:** zero exit code for happy path, non-zero exit code on
`ApplicationError`, use case is called, CLI options forwarded as expected.

### Run targeted tests, then the full suite

```powershell
cd c:\Projects\prhrt\irs-data; .venv\Scripts\pytest.exe tests/test_foo_use_case.py tests/test_foo_commands.py -v
./make.ps1 test
```

Targeted tests must pass before running the full suite. Coverage below 80% is a hard
build failure — add more tests before declaring the task done.

---

## Lint-imports self-check before running lint

After writing all files, verify each file's imports against this table:

| File | Allowed imports | Forbidden |
|---|---|---|
| `application/ports/foo_repository_port.py` | `domain`, `typing` | `infrastructure`, `presentation`, `container` |
| `application/use_cases/.../foo_use_case.py` | `application.ports`, `application.dtos`, `application.exceptions`, `shared`; `domain` **only under `TYPE_CHECKING`** | `infrastructure`, `presentation`, `container`; `domain` **at runtime** |
| `infrastructure/persistence/foo_repository.py` | `domain`, `application.ports`, `application.dtos`, `application.exceptions`, `shared`, own `infrastructure` | `application.use_cases`, `application.services`, `presentation`, `container` |
| `container.py` factory methods | local imports of concrete classes | top-level infrastructure imports |
| `presentation/cli/commands/foo_commands.py` | `application`, `click`; `container` **inside function body only** | top-level `container` import; `infrastructure`, `domain` directly |

**Transitive path check — run this mental trace before declaring lint done:**

For every use case file you wrote, trace: does any `presentation` file import
this use case? If yes, open the use case file and verify zero top-level imports
from `irs_data.domain.*`. If you find one, the tool will report:

```
presentation/cli/foo_commands.py → application/use_cases/foo_use_case.py → domain/filing_rules.py
```

Fix: move the domain reference to a string/numeric literal in the use case, or
move it under `TYPE_CHECKING`.

Also verify complexity across all new files:

- Every function and method must have a McCabe complexity score of 10 or less.
  Exceeding 10 causes the linter to fail with C901 — it is a hard build failure,
  not a warning.
- `ReadLints` does **not** detect C901 — only `./make.ps1 flake8` does.
- Count branches before submitting. If any method is over 10, extract helpers at module
  level and recount before running lint.

Then run:

```powershell
./make.ps1 lint
```

---

## See also

- Branching and commit rules: `git-branching.mdc` and the `git-commit` skill
- Layer rules and import table: `clean-architecture-imports.mdc`
- DTO boundary enforcement: `dto-boundary.mdc`
- Progress indicators for long-running CLI commands: `progress-indicators` skill
- XLSX export patterns: `excel-export` skill
