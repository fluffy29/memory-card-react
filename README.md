# Memory Game

## 🧠 How to Play (Quick Version)

This version is a memory pairing game with short narrative lines. Each pair = two related fragments (same `memoryKey`). Match all pairs before you rack up too many distortions.

### Basic Loop
1. (Optional) Enter a seed in Settings (makes the shuffle repeatable). If you skip it, a random one is used.
2. Pick a difficulty (sets number of pairs + allowed mistakes).
3. Flip two cards:
   - Match → they stay face up and you unlock a vignette line.
   - No match → they flip back after a moment and Distortions +1.
4. Win when every pair is matched. Lose if Distortions reach the cap.

### Key Terms
- Integrity: How much of the memory is restored (matched pairs / total).
- Distortions: Failed tries; hit the cap = collapse screen.
- Vignette: Short line revealed when a pair is completed.
- Efficiency: Rough skill stat (higher = fewer wasted flips).
- Seed: Lets you replay or share the exact same layout.

### Difficulty Caps
- Calm: 3 pairs / 14 distortions
- Standard: 4 / 20
- Deep: 6 / 24
- Overload: 8 / 28

### After a Run
- Success: Shows an ending assembled from the lines you revealed.
- Collapse: Shows a quick summary (time, integrity, efficiency, seed) so you can retry smarter.

### Accessibility
Keyboard flip (focus + Enter/Space), reduced‑motion toggle, and live region updates for progress.

Legacy hero image mode (`cards.json`) still exists but the narrative fragment mode (`fragments.json`) is the default.

---

## 🚀 Getting Started

1. Fork the repo (Make a copy of it to your repos)
2. Clone your project on your machine
3. Install dependencies and run it locally

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

```bash
bash# Clone the repository
git clone https://github.com/YOUR_USERNAME/memory-card-react.git

# Navigate to project directory
cd memory-card-react

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
memory-card-react/
├── public/
│   ├── imgs/
│   └── favicon.ico
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   ├── assets/
│   │   └── favicon.ico
│   ├── components/
│   │   ├── CardComp.tsx
│   │   ├── CardComp.module.css
│   │   ├── IntegrityBar.tsx
│   │   ├── IntegrityBar.module.css
│   │   ├── VignetteOverlay.tsx
│   │   ├── VignetteOverlay.module.css
│   │   ├── ModalComp.tsx
│   │   └── ModalComp.module.css
│   ├── data/
│   │   ├── fragments.json
│   │   └── cards.json
│   ├── hooks/
│   │   └── useMemoryGame.ts
│   ├── styles/
│   │   ├── bounceIn.css
│   │   └── cssmodules.d.ts
│   └── types/
│       ├── memory.types.ts
│       └── card.types.ts
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 🏗️ Architecture Overview

### Components

- CardComp: Individual card component handling flip animations and click events
- ModalComp: Start screen + end-of-game dialog with restart and best score
- App: Main game component managing game state, logic, and card interactions

## Data Flow

- cards.json → Contains base hero data (6 unique heroes)
- App.tsx → Creates pairs, shuffles cards, manages game state
- CardComp → Receives card data and click handlers as props
- Types → TypeScript definitions ensure type safety

## Key Features

- Start / Restart modal with accessible dialog semantics
- Best score persistence (localStorage) – lower moves is better
- Fair deck randomization via Fisher–Yates shuffle
- State Management: useState for deck, flips, matches, moves, best score, modal
- Card Matching Logic: Compares hero names when two cards are flipped
- Accessibility: ARIA roles/labels for interactive elements
- Lazy-loaded images for performance
- TypeScript: Strong typing for cards and lists

## 🎨 Styling

- CSS Modules: Scoped component styles to prevent conflicts
- CSS Custom Properties: Consistent theming with CSS variables
- Animations: Smooth card flip transitions and bounce effects
- Responsive Design: Grid layout that adapts to different screen sizes

## 🔧 Technologies Used

- React 19 - UI library
- TypeScript - Type safety and better developer experience
- Vite - Fast build tool and development server
- CSS Modules - Scoped component styling
- ESLint - Code linting and formatting

## 🙏 Acknowledgments

- Superhero images used for educational purposes [Pinterest](https://www.pinterest.com/pin/6473993211278271/)
- Inspired by classic memory card games
- Built as a learning project for React + TypeScript
