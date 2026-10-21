# GradeLab shared class registry

This public, moderated registry stores reusable **class-wide grading definitions** for GradeLab. A correction is published once and can then benefit every current and future student in that specific course and term. Supported declarative calculation rules, such as dropping the lowest eligible category, are executed locally by GradeLab and displayed in the right-hand grade guide.

## Privacy boundary

This repository contains only public course structure: category names and weights, class-wide grading rules, official source URLs, verification dates, and revisions.

It must never contain student grades, submissions, names, Andrew IDs, Canvas IDs, email addresses, cookies, passwords, tokens, authenticated HTML, what-if work, personal preferences, or grade overrides. CI rejects common private-data fields.

## How GradeLab uses it

GradeLab renders its last validated local cache immediately. In the background and whenever the student presses **Refresh grades**, it checks `registry.json`, downloads only changed definitions for the student's active classes, validates them, and updates the local cache. Personal grades continue to come directly from the student's authenticated Canvas, Gradescope, and official course sessions and are never uploaded here.

## Publishing a correction

1. Verify the correction against an official syllabus or course-owned source.
2. Update the term-specific course JSON and increment its `revision`.
3. Update the matching revision and global `revision` in `registry.json`.
4. Run `npm test`.
5. Review and merge the change. Git history provides moderation, rollback, and attribution.

Course keys are term-aware, for example `cmu:fall-2026:15-112:all`, so one semester's rules cannot silently replace another's.
