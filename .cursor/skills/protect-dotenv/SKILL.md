---
name: protect-dotenv
description: Absolute prohibition on reading .env or any file that may contain live credentials. Use proactively before any file search, glob, or read operation that could touch .env. Covers what to do instead when env var configuration information is needed.
---

# Protect .env — Never Read It

## The absolute rule

Never read `.env` under any circumstances. Reading `.env` pulls live
credentials — database passwords, API keys, SMTP passwords, connection
strings — into the agent context. This is a critical security violation
that can expose credentials and kill the project.

There is no exception. Not verification, not debugging, not
reconnaissance, not "just checking the format."

## Prohibited actions

- Reading `.env` with any file-reading tool
- Using a glob pattern that could match `.env` — patterns like `.env*`,
  `**/.env`, `**/.env*` are all prohibited
- Searching for `.env` by name or content
- Running any shell command that outputs `.env` contents (`cat`, `type`,
  `Get-Content`, etc.)

## What to do instead

**When you need to know what env vars are configured:**
Ask the user. Do not look at files.

**When you need to know what env vars the project expects:**
Read `.env.example` only — and only when the user has explicitly pointed
you to it or asked you to check it. Use the exact filename, never a glob.

**When a user says "I put X in my .env":**
Take their word for it. Do not verify.

**When debugging a missing credential error:**
Ask the user: "Can you confirm `VAR_NAME` is set in your `.env`?" Do not
read the file to check.

## Pre-action checklist

Before any file search, glob, or read operation, verify:

- Does the path equal `.env` exactly? → Stop. Ask the user instead.
- Does the glob pattern match `.env`? (`.env*`, `**/.env*`, etc.) → Stop.
  Use the exact filename `.env.example` if that is what you need.
- Is the directory listing going to show `.env` contents? → Stop.

## Why this matters

Reading `.env` even once exposes credentials. If those credentials are
logged, surfaced in a transcript, or cached in any system, the project
is compromised and all secrets must be rotated immediately. The cost of
an accidental read is not a warning — it is a full incident.
