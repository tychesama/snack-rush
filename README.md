# SnackRush

SnackRush is a mini React browser game about candy shop chaos. Move a goofy basket across the bottom of the screen, catch falling snacks, avoid rotten food, build combos, and chase the highest score before the timer runs out.

The game uses emojis, CSS shapes, and div-based sprites only — no image assets required.

## Game features

- Wider arcade playfield for more side-to-side movement
- Bright arcade-style candy shop UI
- Start screen, active game screen, and game over screen
- Keyboard-controlled player basket
- Falling snacks, bonus treats, and rotten food hazards
- Score counter, 45-second timer, lives, and combo display
- Ability panel showing dodge/boost status and cooldowns
- X-key invincibility and Z-key speed boost controls with 5-second duration and 10-second cooldowns
- Confetti burst effect when a snack or bonus treat is caught
- Restart button after each run
- Clean component-based React structure

## How to play

Catch the good snacks:

- 🍩 Donuts
- 🧁 Cupcakes
- 🍪 Cookies
- 🍭 Lollipops
- 🍫 Chocolate
- 🍬 Candy
- 🥨 Pretzels
- 🍿 Popcorn

Grab bonus treats for extra points:

- ⭐ Star
- 💎 Gem

Avoid clearly marked bad food:

- ☠️ Poison snack
- 🤮 Gross snack
- 🦠 Germy food
- 💀 Skull snack

## Rules

- Good snacks are worth 10 points.
- Bonus treats are worth 25 points.
- Longer catch streaks add combo bonus points.
- Catching rotten food costs 1 life.
- Missed good snacks do not cost lives.
- The basket catches items the moment they touch the basket rim catch zone.
- Pressing X starts 5 seconds of invincibility with a 10-second cooldown. While invincible, rotten food passes safely through the basket, but normal snacks and bonus treats can still be caught.
- Pressing Z starts a 5-second movement boost with a 10-second cooldown.
- The game ends when the timer reaches 0 or all lives are lost.

## Controls

| Action | Keys |
| --- | --- |
| Move left | Left Arrow or A |
| Move right | Right Arrow or D |
| Invincibility | X |
| Speed boost | Z |

## Project structure

```text
SnackRush/
├── index.html
├── package.json
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── README.md
```

## Run locally

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:5173/
```

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Tech stack

- React
- Vite
- CSS animations
- Emoji/div-based game sprites

## Notes

SnackRush is intentionally lightweight and asset-free, so it is easy to remix, restyle, or expand with new snacks, hazards, power-ups, sounds, or difficulty modes.
