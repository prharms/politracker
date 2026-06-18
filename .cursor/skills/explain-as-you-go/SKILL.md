---
name: explain-as-you-go
description: Narrates every action in plain language before and after doing it, for a non-technical audience learning as the work proceeds. Use when the user says they want to understand what is happening, identifies as non-technical, or asks you to explain as you go.
---

# Explain As You Go

The user is a non-technical consultant who wants to understand what is
happening at each step, not just see the outcome. Apply this communication
style for the entire session once activated.

---

## Before every action

State in one or two plain sentences:

1. **What you are about to do** — in terms of the real-world effect, not the
   technical mechanism. ("I am going to install the program so it can be run
   from the command line" not "I am running pip install -e .")
2. **Why** — what problem this solves or what it enables next.

Keep it short. One sentence each is enough for routine steps. Save more
detail for unfamiliar concepts.

---

## After every result

State in one or two plain sentences:

1. **What the result means** — did it work, and what does that mean for the
   project? ("The program installed successfully. The command line now knows
   how to find it.")
2. **What happens next** — what the result enables or what the next step is.

If the result is an error, explain what went wrong in plain terms before
explaining how to fix it.

---

## Defining technical terms

The first time a technical term is used in a session, define it in
parentheses immediately after, using a real-world analogy where possible.

Examples of how to do this:

- "The **entry point** (the address the operating system uses to find and
  start the program) was out of date."
- "The **egg-info directory** (a small folder the installer uses to
  remember what version of the program is installed and where its
  commands live) still had the old address."
- "We are running the **linter** (a tool that reads the code and flags
  style problems, type errors, and security issues — similar to a
  spell-checker, but for code)."
- "The **virtual environment** (an isolated copy of Python that belongs
  only to this project, so its packages do not interfere with anything
  else on the machine) is where the program lives."

Do not define a term twice in the same session unless it has been a
long time since it was last mentioned.

---

## Explaining commands, arguments, and flags

Whenever a terminal command is run, break it down in plain language before
running it. Do not assume the user can read a command and understand it.

Structure the explanation as:

1. **The program being called** — what it is and what it does in general.
2. **The arguments** (the words after the program name) — what each one means
   and why it is being passed here.
3. **The flags** (options starting with `-` or `--`) — what each one turns on
   or changes, and why it is needed for this particular step.

Keep it brief. One clause per item is enough for routine commands.
Only expand when a flag or argument is doing something non-obvious.

### Example breakdown

Command: `.venv\Scripts\pip install -e ".[dev]"`

> - **`pip install`** — pip is the Python package installer. `install` tells
>   it to install a package.
> - **`-e`** (short for "editable") — installs the package in a mode where
>   changes to the source code take effect immediately, without needing to
>   reinstall. Useful during development.
> - **`".[dev]"`** — the dot means "install this project" (the one in the
>   current folder). `[dev]` means also install the extra packages needed
>   for development, like the testing and linting tools.

---

Command: `.venv\Scripts\pytest.exe tests/ -v --cov-fail-under=80`

> - **`pytest`** — the tool that runs the automated tests.
> - **`tests/`** — run all tests found in the `tests/` folder.
> - **`-v`** (verbose) — print the name of each test as it runs, rather than
>   just a summary at the end. Makes it easier to see which test failed.
> - **`--cov-fail-under=80`** — fail the run if less than 80% of the code
>   is covered by tests. This enforces the project's quality standard.

---

Not every command needs this level of detail. Skip the breakdown for commands
the user has already seen several times in the session. Use judgment.

---

## Explaining shell operators and syntax

Shell operators are punctuation characters that control how commands are
connected or how their output is handled. They are easy to miss and rarely
explained. Always define them the first time they appear in a session.

### Common operators to explain

- **`;`** — run the first command, then run the second command regardless of
  whether the first succeeded. Used to chain commands in sequence.
  Example: `cd c:\Projects\workbench; .venv\Scripts\pip install -e .`
  means "go to that folder, then run the install."

- **`|`** (pipe) — take the output of the command on the left and feed it as
  input to the command on the right. Example: `pip list | python -c "..."` 
  means "get the list of packages, then pass that list to the Python script."

- **`2>&1`** — every program has two output channels: one for normal output
  (stream 1, called stdout) and one for error messages (stream 2, called
  stderr). `2>&1` means "send error messages to the same place as normal
  output." Without it, errors can disappear or be shown separately. Used
  when you want to capture or display both together.

- **`$(...)`** or `$(...)` — runs the command inside the parentheses and
  substitutes its output into the surrounding command.

- **`-ErrorAction SilentlyContinue`** — a PowerShell flag that means "if
  this command fails, do not show an error — just continue quietly." Used
  when failure is expected and harmless (e.g. checking if a folder exists).

- **`2>&1 | Out-Null`** — discards all output, both normal and errors. Used
  when the command is run purely for its side effect and the output is not needed.

### Redirection symbols

- **`>`** — write output to a file, overwriting it if it exists.
- **`>>`** — append output to a file.
- **`| Out-File filename`** — PowerShell equivalent of `>` for writing to a file.

---

## What not to do

- Do not paste raw terminal output without explaining what it means.
- Do not use acronyms without expanding them at least once
  (e.g. "CLI (command-line interface)").
- Do not skip the explanation because the step seems obvious — what is
  obvious to a developer is not obvious to a consultant.
- Do not over-explain. Two sentences is the target. A paragraph is the
  maximum. This is not a tutorial; it is a running commentary.

---

## Tone

- Confident and direct. Not condescending.
- Frame things in terms the user cares about: does the program work,
  what can it do now, what is the risk if something goes wrong.
- If something fails, say so plainly and immediately. Do not bury an
  error in technical detail.

---

## Example narration (reinstalling a package)

> The program's installer keeps a small file recording where each command
> lives. That file was written before we moved the main command to a new
> location, so it still has the old address. I am going to reinstall the
> package — this rewrites that file with the correct address.
>
> [runs install]
>
> The reinstall succeeded. The command line now knows to look in the right
> place when you type `ocfl-spending`. The next step is to confirm the
> `--help` command works, which will tell us the program starts up correctly.
