# SnackRush Roadmap

This roadmap turns the current README and `NEWEST UPDATE.txt` into an implementation order for future SnackRush work.

The README remains the main source of truth for the project idea. This file is the step-by-step roadmap for working through that idea without trying to change everything at once.

## Guiding rules

- Work in small milestones.
- Preserve user-made menu, leaderboard, and visual changes unless the task explicitly changes them.
- Do not overwrite the crown leaderboard fix unless the user asks; the user plans to handle that part.
- If the user provides a sketch for the game screen, treat it as layout authority.
- After each milestone, run:

```bash
npm test
npm run build
git diff --check
```

- Keep README updated whenever controls, modes, skills, specials, scoring, storms, sounds, or GameCenter status change.

## Current source-of-truth files

- `README.md` — main project idea, gameplay direction, planning rules.
- `NEWEST UPDATE.txt` — short raw TODO list from the user.
- `ROADMAP.md` — implementation order and milestone checklist.

Older design-memory text files may contain useful history, but they should not override README or this roadmap.

---

# Milestone 0 — Stabilize planning and current state

Goal: Make the repo easy to continue with Gemma4 before major code changes.

## Tasks

- [ ] Keep `README.md` as the project source of truth.
- [ ] Use `NEWEST UPDATE.txt` only as the raw short TODO list.
- [ ] Use `ROADMAP.md` as the work order.
- [ ] Avoid relying on old design-memory files unless checking historical intent.
- [ ] Confirm current tests/build pass before feature work.
- [ ] Do not touch the crown leaderboard unless explicitly asked.

## Acceptance criteria

- README explains the full project idea.
- Roadmap explains what to do next and in what order.
- Tests/build pass before starting feature work.

## Verification

```bash
npm test
npm run build
git diff --check
```

---

# Milestone 1 — Special item system foundation

Goal: Turn bonus/special items into a real gameplay layer.

## Why this comes first

Special items affect skills, UI panels, event logs, difficulty, storms, sounds, and scoring. Defining them early prevents later systems from guessing what specials are supposed to do.

## Planned specials

- Star: temporary invincibility.
- Magnet: pulls helpful items closer.
- Nuke: clears objects currently on screen.
- Shield: blocks one bad hit.
- Lightning: temporary movement boost.
- Heart: restores one life.

## Tasks

- [ ] Create a special item catalog in code.
- [ ] Give every special a stable id, label, emoji/icon, short description, and effect type.
- [ ] Update item spawning so specials are distinct from normal snacks and bad food.
- [ ] Add visual styling for falling specials.
- [ ] Implement Star effect.
- [ ] Implement Shield effect.
- [ ] Implement Heart effect.
- [ ] Implement Nuke effect.
- [ ] Implement Lightning effect.
- [ ] Implement Magnet effect after the simpler specials work.
- [ ] Add HUD/status feedback for active specials.
- [ ] Add tests or source-contract checks for the special catalog.
- [ ] Update README special-item section after behavior is real.

## Acceptance criteria

- Specials are visually distinct while falling.
- Catching each special applies its intended effect once.
- Bad items remain visually different from specials.
- Active special effects are visible in the UI or on the basket.
- Tests/build pass.

## Suggested files

- `src/App.jsx`
- `src/App.css`
- `src/game/specials.js` if extracting helpers
- `tests/source-contract.test.mjs`
- `README.md`

---

# Milestone 2 — Skill rebalance and skill presentation

Goal: Make skills clearer, better balanced, and more visually satisfying.

## Why this comes after specials

Some skills may overlap with special effects. Specials should be defined first so skills can be balanced around them instead of duplicating them confusingly.

## Tasks

- [ ] Audit current skill behavior and labels.
- [ ] Decide final skill set for the next playable version.
- [ ] Rebalance cooldowns and durations.
- [ ] Decide whether skills use a global cooldown.
- [ ] Make keyboard triggers and UI button triggers use the same rules.
- [ ] Replace simple boost with a more deliberate movement skill if desired.
- [ ] Add clearer disabled/unavailable states.
- [ ] Improve cooldown visuals.
- [ ] Improve skill icons.
- [ ] Add active basket/player effects for skills.
- [ ] Update menu/help text so it matches the real behavior.
- [ ] Add tests/source checks for cooldown and availability rules.

## Acceptance criteria

- Skills cannot be spammed into broken states.
- Skill availability is obvious.
- Active skill effects are visible without needing to read tiny text.
- Controls, help modal, HUD, and README agree.
- Tests/build pass.

## Suggested files

- `src/App.jsx`
- `src/App.css`
- `src/game/abilities.js` if extracting helpers
- `tests/source-contract.test.mjs`
- `README.md`

---

# Milestone 3 — Game screen interface redesign

Goal: Rework the in-game interface into clearer gameplay and information zones.

## Important note

The user plans to provide a sketch. Do not do a large layout redesign before seeing it unless explicitly asked. Once the sketch exists, match that layout first before adding extra flourishes.

## Planned UI areas

- Main playfield.
- Skills panel.
- Event log panel.
- Skill/player status panel.
- Score/lives/timer/combo area.
- Active effect indicators.

## Tasks

- [ ] Wait for or inspect the user sketch if provided.
- [ ] Map sketch regions to React/CSS sections.
- [ ] Keep falling-item playfield readable and uncluttered.
- [ ] Add or refine skills panel.
- [ ] Add event log panel for important moments.
- [ ] Add player/status panel for active effects and protection states.
- [ ] Rebalance score/lives/timer/combo layout.
- [ ] Verify responsive behavior on smaller screens.
- [ ] Update source-contract tests for important UI hooks, not exact pixel layout.

## Acceptance criteria

- Gameplay remains readable while UI panels are present.
- Skills and active states are easier to understand.
- Event feedback is visible but not distracting.
- Layout follows the user sketch if one is provided.
- Tests/build pass.

## Suggested files

- `src/App.jsx`
- `src/App.css`
- `tests/source-contract.test.mjs`
- `README.md`

---

# Milestone 4 — Game modes

Goal: Add mode selection and make each run type feel intentional.

## Planned modes

### Freeplay

- Endless or long-running mode.
- No strict timer ending unless lives run out or the player exits.
- Difficulty still increases and eventually caps.

### Timed / Adventure

- Main structured mode.
- Timer-based run.
- Best place for difficulty curve, storms, and leaderboard scoring.

### Sugar Rush

- Short 1-minute chaos mode.
- Fast replay.
- Good for quick score chasing.

## Tasks

- [ ] Add mode selection to the main menu.
- [ ] Define mode config data in code.
- [ ] Add mode-specific timer behavior.
- [ ] Add mode labels to HUD/game-over screen.
- [ ] Decide which modes submit leaderboard scores.
- [ ] Make game reset correctly when switching modes.
- [ ] Update README mode descriptions.
- [ ] Add tests/source checks for mode names and timer behavior.

## Acceptance criteria

- Player can choose a mode before starting.
- Each mode displays its name and goal clearly.
- Freeplay does not end just because a timer reaches zero.
- Sugar Rush is 1 minute.
- Timed/Adventure has the intended timer length.
- Tests/build pass.

## Suggested files

- `src/App.jsx`
- `src/App.css`
- `src/game/modes.js` if extracting helpers
- `tests/source-contract.test.mjs`
- `README.md`

---

# Milestone 5 — Difficulty curve and snack storms

Goal: Make runs ramp up in intensity and add readable event moments.

## Difficulty should affect

- Falling speed.
- Spawn rate.
- Bad item frequency.
- Special item frequency.
- Candy/item size or value, if implemented.
- Overall chaos level.

## Storms should provide

- Warning/countdown feedback.
- Higher spawn pressure.
- More danger.
- More reward potential.
- Clear start/end feedback.
- Event log or HUD notice.

## Tasks

- [ ] Define difficulty levels and how they are calculated.
- [ ] Tie spawn interval to difficulty.
- [ ] Tie falling speed to difficulty.
- [ ] Tie bad item chance to difficulty.
- [ ] Tie special item chance to difficulty.
- [ ] Add storm schedule/config.
- [ ] Add storm warning UI.
- [ ] Add storm active UI.
- [ ] Add storm end feedback.
- [ ] Tune storm spawn pressure.
- [ ] Add tests for difficulty and storm schedule.
- [ ] Update README.

## Acceptance criteria

- Early run feels readable and forgiving.
- Later run feels harder.
- Storms are obvious and exciting, not confusing.
- Storms do not make the game visually impossible to parse.
- Tests/build pass.

## Suggested files

- `src/App.jsx`
- `src/App.css`
- `src/game/difficulty.js` if extracting helpers
- `src/game/storms.js` if extracting helpers
- `tests/source-contract.test.mjs`
- New unit tests if helpers are extracted
- `README.md`

---

# Milestone 6 — Sounds and mute/settings

Goal: Add lightweight arcade sound feedback without making the game annoying.

## Sound events

- Catch snack.
- Catch special.
- Catch bad food.
- Shield block.
- Skill use.
- Skill unavailable.
- Combo break.
- Storm warning/start/end.
- Game over.
- Button/menu click.

## Tasks

- [ ] Choose Web Audio generated sounds or small audio files.
- [ ] Add sound helper/access layer.
- [ ] Add mute toggle.
- [ ] Persist mute/settings locally.
- [ ] Wire catch snack sound.
- [ ] Wire catch special sound.
- [ ] Wire bad catch sound.
- [ ] Wire shield block sound.
- [ ] Wire skill use/unavailable sounds.
- [ ] Wire combo break sound.
- [ ] Wire storm sounds.
- [ ] Wire game-over sound.
- [ ] Verify sounds trigger from events, not renders.
- [ ] Update README.

## Acceptance criteria

- Sounds play only once per event.
- Mute works everywhere.
- Mute persists after reload.
- Browser autoplay restrictions do not spam console errors.
- Tests/build pass.

## Suggested files

- `src/App.jsx`
- `src/App.css`
- `src/audio/sound.js` if extracting helper
- `tests/source-contract.test.mjs`
- `README.md`

---

# Milestone 7 — Scoring, combo, and feedback polish

Goal: Make score-chasing more satisfying and readable.

## Tasks

- [ ] Review current scoring rules.
- [ ] Decide whether combo uses flat bonus or multiplier.
- [ ] Add or tune combo timeout.
- [ ] Make bad catches break combo clearly.
- [ ] Add combo-break feedback.
- [ ] Ensure specials/skills interact with scoring intentionally.
- [ ] Update score display if multiplier is added.
- [ ] Add scoring unit tests.
- [ ] Update README.

## Acceptance criteria

- Player understands why score increases.
- Combo is visible and satisfying.
- Combo break is obvious.
- Scoring has tests.
- Tests/build pass.

## Suggested files

- `src/game/scoring.js`
- `src/App.jsx`
- `src/App.css`
- `tests/scoring.test.mjs`
- `README.md`

---

# Milestone 8 — Leaderboard cleanup and crown fix handoff

Goal: Keep leaderboard reliable while respecting that the user wants to fix the crown leaderboard personally.

## Tasks for assistant only if asked

- [ ] Inspect leaderboard behavior.
- [ ] Confirm completed runs submit once.
- [ ] Confirm restarts/menu exits do not submit accidental scores.
- [ ] Confirm player name persists.
- [ ] Confirm leaderboard visual layout still works after mode/scoring changes.
- [ ] Do not change crown styling unless user asks.

## User-owned task

- [ ] Fix crown leaderboard.

## Acceptance criteria

- Leaderboard scores are not duplicated.
- Leaderboard entries match the current scoring/mode rules.
- Crown work is not overwritten.
- Tests/build pass.

## Suggested files

- `src/App.jsx`
- `src/App.css`
- `tests/source-contract.test.mjs`
- `README.md`

---

# Milestone 9 — Documentation and test hardening

Goal: Make the project easier to continue with Gemma4 or another assistant.

## Tasks

- [ ] Update README after each implemented system.
- [ ] Keep ROADMAP checkboxes current.
- [ ] Add focused helper tests when logic is extracted.
- [ ] Keep source-contract tests for important UI hooks.
- [ ] Avoid tests that lock in every exact visual layout detail.
- [ ] Remove or clearly mark stale planning files if the user wants cleanup later.

## Acceptance criteria

- README matches the playable game.
- ROADMAP shows what is done and what remains.
- Tests cover core behavior.
- Gemma4 can continue from README + ROADMAP without needing old chat context.

## Suggested files

- `README.md`
- `ROADMAP.md`
- `tests/scoring.test.mjs`
- `tests/source-contract.test.mjs`
- Additional tests if new helper modules are created

---

# Milestone 10 — GameCenter integration

Goal: Make SnackRush appear in GameCenter.

## Integration options

### Option A: Link-card integration

Best first option.

- Fastest.
- Lower risk.
- GameCenter adds a SnackRush card that links to the separate SnackRush game.

### Option B: Full GameCenter port

Better long-term but much more work.

- Convert SnackRush into a GameCenter route/component.
- Adapt Vite React/CSS structure to GameCenter architecture.
- More testing and styling work.

## Tasks

- [ ] Inspect GameCenter repo structure.
- [ ] Decide link-card vs full port.
- [ ] If link-card: add SnackRush game card.
- [ ] If full port: create route and migrate gameplay carefully.
- [ ] Update GameCenter docs/tasks.
- [ ] Run GameCenter verification.
- [ ] Update SnackRush README with integration status.

## Acceptance criteria

- SnackRush is visible from GameCenter.
- GameCenter build passes.
- SnackRush remains playable.

## Suggested files

SnackRush:

- `README.md`
- `ROADMAP.md`

GameCenter, exact paths to inspect later:

- `/mnt/linux-storage/repos/game-center/package.json`
- `/mnt/linux-storage/repos/game-center/README.md`
- `/mnt/linux-storage/repos/game-center/src/`

---

# Recommended work order

1. Milestone 0 — Stabilize planning and current state.
2. Milestone 1 — Special item system foundation.
3. Milestone 2 — Skill rebalance and presentation.
4. Milestone 3 — Game screen interface redesign, after user sketch.
5. Milestone 4 — Game modes.
6. Milestone 5 — Difficulty curve and snack storms.
7. Milestone 7 — Scoring/combo polish.
8. Milestone 6 — Sounds and mute/settings.
9. Milestone 8 — Leaderboard cleanup, only if asked around crown work.
10. Milestone 9 — Documentation and test hardening.
11. Milestone 10 — GameCenter integration.

Sound can move earlier if the game already feels mechanically stable. Game screen redesign can move earlier once the user sketch exists.

---

# Good next task

The best next implementation task is:

## Start Milestone 1: Special item catalog only

Do not implement every special at once. First create the data model/catalog and update tests/source checks. Then implement one simple special at a time.

Suggested first slice:

- Create `src/game/specials.js`.
- Define Star, Magnet, Nuke, Shield, Lightning, and Heart metadata.
- Export helper functions for lookup/listing.
- Add a small test or source-contract check.
- Update README if needed.
- Run `npm test`, `npm run build`, and `git diff --check`.

This gives Gemma4 a clean, low-risk starting point.
