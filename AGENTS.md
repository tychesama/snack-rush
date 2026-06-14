# SnackRush Agent Instructions

SnackRush is a React + Vite browser arcade game. Keep agents localized to this repo and work from `/mnt/linux-storage/repos/SnackRush` unless the user explicitly asks for GameCenter integration.

## Source of truth

Read these first, in this order, before meaningful changes:

1. `README.md` — main project direction and planning source.
2. `ROADMAP.md` — milestone order and detailed checklist.
3. `NEWEST UPDATE.txt` — short raw user TODO list, if present.

Older design-memory files may contain history, but they do not override `README.md`, `ROADMAP.md`, or direct user instructions.

## Project shape

Important files:

- `src/App.jsx` — main game UI and gameplay loop.
- `src/App.css` — visual styling and layout.
- `src/game/scoring.js` — scoring helpers.
- `tests/scoring.test.mjs` — scoring tests.
- `tests/source-contract.test.mjs` — important UI/source behavior checks.

## Working style

- Make small, targeted patches. Do not rewrite whole files unless explicitly asked.
- Inspect the relevant section before editing; do not guess at file contents.
- Preserve user-made menu, leaderboard, visual, and layout changes unless the task explicitly changes them.
- Do not overwrite crown leaderboard work unless the user explicitly asks.
- If the user provides a sketch or reference image, treat it as layout authority.
- Keep text compact in the UI. Prefer tooltips or the Game Mechanics modal for details.
- Keep game readability first: falling items, basket catch zone, active effects, and hazards must stay visually clear.

## Local model safety

This repo may be used with local models such as Gemma4. Keep prompts and edits small to avoid unnecessary RAM/swap pressure.

- Read only the files or sections needed for the current task.
- Avoid dumping large files into prompts unless necessary.
- Prefer one milestone slice at a time.
- Avoid long explanations when a small patch is enough.
- Never generate giant replacement files for simple changes.

## Roadmap rules

Follow the roadmap order unless the user overrides it. The current planned order is:

1. Stabilize planning/current state.
2. Special item catalog and special item behavior.
3. Skill rebalance and presentation.
4. Game screen redesign after user sketch.
5. Game modes.
6. Difficulty curve and snack storms.
7. Scoring/combo polish.
8. Sounds and mute/settings.
9. Leaderboard cleanup only when asked around crown work.
10. Documentation/test hardening.
11. GameCenter integration.

Do not attempt the whole roadmap in one pass.

## Documentation rules

Update `README.md` when changing any of these:

- controls
- modes
- skills
- specials
- scoring/combo behavior
- difficulty/storms
- sounds/mute/settings
- leaderboard behavior
- GameCenter integration status

Update `ROADMAP.md` checkboxes only when a task is actually completed and verified.

## Verification

After meaningful code changes, run:

```bash
npm test
npm run build
git diff --check
```

For documentation-only changes, at minimum run:

```bash
git diff --check
```

If visual layout changes were made, also run the dev server and inspect the browser when practical.

## Git hygiene

- Check `git status --short --branch` before and after work.
- Do not stage, commit, push, or create PRs unless the user asks.
- Do not clean up unrelated dirty files.
- Report any pre-existing dirty files separately from your own changes.
