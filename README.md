# SnackRush

SnackRush is a fast-paced React browser arcade game about candy shop chaos. The player controls a goofy basket at the bottom of the screen, catches falling snacks, avoids rotten food, uses arcade skills, survives difficulty spikes, and chases leaderboard scores.

This README is now the main project planning document and source of truth for the direction of SnackRush. Older design-memory text files may be outdated; use this README first when continuing work.

## Project vision

SnackRush should feel like a colorful, silly, quick-play candy arcade game:

- Bright candy-shop colors
- Chunky readable UI
- Simple keyboard controls
- Emoji / CSS / div-based sprites where possible
- Clear good-vs-bad item readability
- Fast feedback when catching, dodging, using skills, or losing combo
- A compact but polished main menu
- A game screen that is easy to read while the action gets chaotic

The goal is not to make a complex simulation. The goal is a polished mini browser game with enough depth from skills, specials, modes, storms, scoring, and leaderboards to feel replayable.

## Current game idea

Core loop:

1. Start a run from the main menu.
2. Move the basket left and right.
3. Catch good snacks and powerups.
4. Avoid rotten / bad food.
5. Use skills at the right time.
6. Build score and combo.
7. Survive until the run ends.
8. Save a completed score to the leaderboard.
9. Restart and try to beat the board.

Important gameplay rules:

- Good snacks increase score.
- Bonus / special items should feel clearly different from normal snacks.
- Rotten food should be obvious and dangerous.
- Catching rotten food costs life and should break combo.
- Missed good snacks should not cost lives unless a future mode explicitly changes that.
- The basket should catch items at the visible basket rim / catch zone, not through a huge invisible box.
- Visual feedback matters: catches, bad hits, shields, skill use, combo breaks, and storms should all be readable.

## Controls

Current / expected base controls:

| Action | Keys |
| --- | --- |
| Move left | Left Arrow or A |
| Move right | Right Arrow or D |
| Skill 1 | Z / assigned skill key |
| Skill 2 | X / assigned skill key |
| Pause / menu | Escape, if implemented |

Controls may change as the skill system is rebalanced. Keep the start screen, help/info modal, HUD, and README in sync whenever controls change.

## Roadmap

This is the main work order for the project. A more detailed checklist version also exists in `ROADMAP.md`, but this README remains the source of truth.

1. Stabilize planning and current state
   - Keep README as the project source of truth.
   - Use `NEWEST UPDATE.txt` as the short raw TODO list.
   - Preserve user-made visual/layout changes.
   - Do not overwrite the crown leaderboard work unless asked.
   - Verify with `npm test`, `npm run build`, and `git diff --check` before major feature work.

2. Build the special item system
   - Define Star, Magnet, Nuke, Shield, Lightning, and Heart.
   - Make specials visually distinct from normal snacks and bad food.
   - Add status feedback for active special effects.
   - Add tests/source checks for the special catalog and behavior.

3. Rebalance skills and improve skill presentation
   - Review current skill behavior, cooldowns, and labels.
   - Make skills useful but not spammy.
   - Improve skill icons, cooldown visuals, disabled states, and basket/player effects.
   - Keep controls, help text, HUD, and README synced.

4. Rework the game screen interface
   - Wait for the user sketch before large layout changes.
   - Add clearer skills, event log, player/status, score, lives, timer, combo, and active-effect panels.
   - Keep the falling-item playfield readable.

5. Add game modes
   - The Start Rush button opens a three-card mode picker.
   - Adventure Mode is the only playable mode for now.
   - Sugar Rush and Timed Rush are visible as locked preview cards.
   - Each mode card should show its goal/status clearly before it becomes playable.

6. Tune difficulty curve and snack storms
   - Difficulty should affect fall speed, spawn rate, bad item frequency, special frequency, and chaos level.
   - Storms need warning, start/end feedback, higher pressure, more danger, and better reward potential.
   - Storms should feel exciting, not unreadable.

7. Polish scoring and combo feedback
   - Review current score rules.
   - Decide whether combo uses flat bonus or multiplier.
   - Add clear combo break feedback.
   - Keep scoring tested because small scoring changes affect game feel heavily.

8. Add sounds with mute/settings
   - Add sounds for catches, specials, bad hits, shield blocks, skill use, combo breaks, storms, game over, and menu clicks.
   - Add a persistent mute toggle.
   - Trigger sounds from events, not renders.

9. Harden documentation and tests
   - Update README after every meaningful gameplay change.
   - Keep ROADMAP checkboxes current if using the companion roadmap file.
   - Add focused tests for scoring, specials, difficulty, skill rules, and important UI hooks.

10. Integrate SnackRush into GameCenter
   - First inspect GameCenter architecture.
   - Prefer a lower-risk link-card integration first unless a full port is requested.
   - Update both SnackRush and GameCenter docs after integration.

Best next implementation slice: start the special item system by adding only the special item catalog first. Do not implement every special in one pass. Create the data model, add tests/source checks, then implement one simple special at a time.

## Main planning TODO

This list comes from `NEWEST UPDATE.txt` and should drive the next work sessions.

### 1. Add the special item system

Special items should become a clear gameplay layer, not just generic bonus treats.

Planned specials may include:

- Star / invincibility
- Magnet / pull helpful items closer
- Nuke / clear the screen
- Shield / block one bad hit
- Lightning / movement boost
- Heart / regain life

Special items need:

- Distinct icons or emoji
- Unique visual styling while falling
- Clear effects when caught
- HUD/status feedback when active
- Tests or source checks for the item catalog and behavior

### 2. Rebalance skills

The current skill setup should be reviewed and rebalanced.

Goals:

- Skills should be useful but not spammy.
- Cooldowns should be clear.
- Active states should be visible on the HUD and/or basket.
- Skill behavior should match what the menu/help text says.
- Keyboard and button interactions should follow the same rules.

Possible direction:

- Replace simple boost with a more deliberate dash or movement skill.
- Keep invincibility/shield behavior understandable.
- Consider a global cooldown if multiple skills become available.
- Make unavailable skills visibly disabled instead of silently doing nothing.

### 3. Improve skill design, icons, and effects

Skills need stronger presentation.

Improve:

- Skill icons
- Active-state basket effects
- Cooldown visuals
- Press/activation feedback
- Disabled/locked states
- Tooltips and help descriptions

Avoid cluttering the main menu with too much text. Skill explanations can live in the info/help modal or tooltips.

### 4. Rework the game screen interface

The in-game screen should eventually be redesigned around clearer panels.

Planned direction:

- Skills / event log panel
- Skill / player status panel
- Cleaner score, lives, timer, and combo layout
- Better active-effect indicators
- Less overlap with the falling-item playfield
- Stronger separation between gameplay area and UI panels

The user plans to make a sketch for this. Treat that sketch as layout authority when it arrives.

### 5. Implement game modes

Current mode picker:

#### Sugar Rush

- Locked preview card for now
- Short, fast, chaotic score-chase mode later
- Good candidate for quick replay and leaderboard chasing

#### Adventure Mode

- Playable now
- Main structured SnackRush run
- Timer pressure, skills, specials, combo scoring, and snack storms
- Current default serious scoring mode

#### Timed Rush

- Locked preview card for now
- Future focused score attack with stricter clock rules
- Intended to sit between Adventure depth and Sugar Rush speed

Each mode should clearly show:

- Mode name
- Goal
- Timer or endless status
- Whether scores submit to leaderboard

### 6. Check and tune difficulty curve and snack storms

Difficulty and storms are work in progress.

Difficulty should affect:

- Falling speed
- Spawn rate
- Bad item frequency
- Special item frequency
- Candy/item size or value, if implemented
- Overall chaos level

Snack storms should be readable event moments, not random confusion.

Storms should have:

- Warning / countdown feedback
- Stronger spawn pressure
- More danger
- More reward potential
- Clear start/end feedback
- Event log entry or HUD notice

### 7. Add sounds with mute/settings

SnackRush should have lightweight arcade audio.

Sound events to consider:

- Catch snack
- Catch special
- Catch bad food
- Shield block
- Skill use
- Skill unavailable
- Combo break
- Storm warning/start/end
- Game over
- Button/menu click

Requirements:

- Add a mute toggle.
- Persist mute/settings locally.
- Do not let sounds spam every render.
- Handle browser autoplay restrictions safely.

### 8. Update documentation and tests

Documentation and tests should move with the game.

Update README whenever changing:

- Controls
- Skills
- Specials
- Scoring
- Modes
- Difficulty
- Storms
- Leaderboard behavior
- GameCenter integration status

Tests should protect behavior without freezing every visual detail.

Important checks:

- Scoring logic
- Leaderboard/player profile behavior
- Skill cooldown/availability behavior
- Special item catalog
- Difficulty/storm schedule
- Source contract expectations for important UI hooks

### 9. Integrate SnackRush into GameCenter

SnackRush should eventually appear in the GameCenter project.

Possible approaches:

1. Link-card integration
   - Fastest
   - GameCenter shows SnackRush as a playable/external game card
   - Lower risk

2. Full port into GameCenter
   - More work
   - Better long-term integration
   - Requires adapting the Vite React game into GameCenter architecture

Before doing this, inspect the current GameCenter structure and decide whether SnackRush should stay separate or become a GameCenter route.

### 10. Fix crown leaderboard

The crown leaderboard needs a fix, but the user plans to handle this personally.

Do not overwrite that work unless explicitly asked.

## Main menu direction

The menu should be polished but compact.

Important menu pieces:

- Game title and short arcade pitch
- Start button / mode selection
- Leaderboard challenge
- Help/info modal for mechanics
- Social links/icons
- Control panel with movement, skills, catch/avoid/specials

Avoid:

- Repeated labels
- Tall redundant explanation blocks
- Placeholder-looking icons
- Tooltips that rotate, clip, or cover important content
- Menus that are too tall for normal screens

## Leaderboard direction

Leaderboard should feel like an arcade challenge.

Desired behavior:

- Local/offline leaderboard is fine unless backend persistence is explicitly requested.
- Player name should persist locally.
- Completed runs should submit scores.
- Restarts or menu exits should not accidentally submit duplicate scores.
- Default leaderboard entries should make the game feel alive.
- Crown/high-rank styling should be readable and not broken.

## Scoring and combo direction

Scoring should reward skilled play without becoming confusing.

Potential scoring direction:

- Normal snacks give base points.
- Special items may grant effects, points, or both.
- Combo should increase score multiplier.
- Bad catches should break combo.
- Combo timeout can create pressure if tuned well.
- Combo break should have visible feedback.

Keep scoring rules documented and tested, because small changes can dramatically affect game feel.

## Visual design rules

Keep SnackRush readable first.

- Good items: inviting, bright, candy-like
- Bad items: obviously dangerous, red/green hazard styling, labels or warning shapes if needed
- Specials: distinct from both normal snacks and hazards
- Basket: clear rim/catch zone
- Skills: active effects should be visible on the basket/player, not only in text
- Storms: exciting but not visually impossible to parse

## Technical notes

SnackRush is a React + Vite project.

Main files:

```text
SnackRush/
├── index.html
├── package.json
├── README.md
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── game/
│       └── scoring.js
└── tests/
    ├── scoring.test.mjs
    └── source-contract.test.mjs
```

Run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Test:

```bash
npm test
```

Recommended verification after meaningful changes:

```bash
npm test
npm run build
git diff --check
```

## Working notes for future agents

- Use this README as the main planning source.
- `NEWEST UPDATE.txt` is the short raw TODO list from the user.
- Older design-memory files may contain useful history, but they are not the current source of truth.
- Preserve user-made visual/layout changes unless asked to revise them.
- Do not overwrite the user's planned crown leaderboard work unless asked.
- If the user provides sketches or reference images, use them as layout authority.
- Keep changes milestone-sized; do not attempt the entire roadmap in one pass.
- After each milestone, run tests/build and ideally inspect the game visually.
