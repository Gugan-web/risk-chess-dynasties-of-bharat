# RISK CHESS

> **"Risk Chess uses fictional resource units for strategic planning only."**  
> *A corporate strategy chess game about resource allocation, tactical execution, and decision quality.*

---

## 1. Why Risk Chess?

Traditional chess has always been a game of perfect information and absolute outcomes: you either win, draw, or lose, and material is evaluated in static point values (1, 3, 3, 5, 9). 

In modern organizations, decisions are rarely deterministic. They are defined by **uncertainty, resource limits, expected value, operational exposure, and probabilistic risk management**.

**Risk Chess** transforms these abstract strategic concepts into an interactive boardroom simulation. Every piece carries an internal resource value; every tactical engagement forces the player to assess defender-to-attacker ratios, counter-attack threats, and piece survival odds. Players don't just calculate moves; they manage a fictional operating budget, deciding when to approve resources for a tactical plan and when to preserve reserves.

There is **no real money, no deposits, no wagering, no loot boxes, and no pay-to-win mechanics**. It is an educational corporate strategy simulation designed for players who want to sharpen judgment under uncertainty.

---

## 2. Core Game Concept

### Starting Resources
Both players begin with **10,000 RU** in fictional resource units.

### Piece Valuations
| Piece | Resource Value | Strategic Role |
|---|---|---|
| **King** | *Priceless* | Sovereign asset; cannot be liquidated |
| **Queen** | **3,000 RU** | High-impact executive asset |
| **Rook** | **1,500 RU** | Long-range operational asset |
| **Bishop** | **1,000 RU** | Specialist diagonal asset |
| **Knight** | **1,000 RU** | Agile tactical asset |
| **Pawn** | **500 RU** | Baseline field resource |

### The Core Tactical Twist: Resource Decisions
Whenever a player initiates a tactically meaningful move, a **Decision Review** prompt appears:
1. **The Context:** e.g. *Knight attacks Queen on f7*.
2. **The Metrics:**
   - Asset Value: 3,000 RU
   - Survival Probability: 68%
   - Opponent Threat Level: Medium
   - Projected Impact: +420 RU
3. **The Decision:** The player can approve a resource commitment (**100, 250, 500, or 1,000 RU**) or choose to **Defer**.
4. **The Resolution:** 
   - If the piece survives the tactical sequence over subsequent moves, the assignment creates positive operational impact.
   - If the piece is captured, committed resources are written down.

### Match Winner & Executive Settlement
The match winner is always decided by the chess result: checkmate, resignation, stalemate, or draw. Resource units do **not** override the board winner.

If the board winner finishes with fewer resource units than the loser, a post-match executive settlement is applied: the winner receives **50% of the loser's earned surplus RU**. Earned surplus is calculated from the loser’s final resource position above the starting resource pool.

---

## 3. Game Modes

- **Classic vs AI:** Battle an adaptive AI opponent across 3 selectable difficulty levels (Beginner, Intermediate, Advanced).
- **Local Duel:** Two players on the same screen with independent resource pools and decision histories.
- **Hackathon Demo Mode:** A curated 60-second experience designed for judges and rapid reviews. Launches instantly into an active board position where a decision review occurs on move 1.
- **Interactive Tutorial:** A step-by-step guided simulator that teaches piece values, probabilities, risk meters, and operational impact through gameplay rather than walls of text.
- **Practice Mode:** A relaxed environment to test tactical bets and risk profiling without competitive records.

---

## 4. Risk Calculation Methodology

Every decision review is dynamically evaluated by the risk engine:
1. **Material Equity Ratio:** Comparing the value of the attacking piece against the target piece.
2. **Position Defense Multiplier:** Evaluating square attack vectors to determine whether the destination square is defended by friendly pieces or attacked by opponent counter-attackers.
3. **Survival Probability ($P_s$):**
   - Uncontested square: $95\%$
   - Equal trade or trading down: $40\%$
   - Sacrificing higher-value piece into counterplay: $20\%$
4. **Risk Score ($0 - 100$):**
   - **Low Risk ($\le 33$):** Highly defended, secure capture. Produces modest operational upside.
   - **Medium Risk ($34 - 66$):** Contested square with possible counterplay. Produces balanced upside and exposure.
   - **High Risk ($\ge 67$):** Dangerous tactical sacrifice or deep infiltration. Produces high upside but can cause a significant resource write-down.

---

## 5. Decision Profiling

At the conclusion of matches, Risk Chess analyzes the player's lifetime risk decisions and categorizes their behavioral archetype:
- **Calculated Risk Taker:** Balances probability and expected value; takes medium-risk positions while protecting reserves.
- **Conservative Strategist:** Prioritizes piece preservation and steady low-risk assignments; rarely overextends.
- **Aggressive Opportunist:** High risk appetite; willing to commit significant resources to speculative sacrifices.
- **Adaptive Player:** Dynamically shifts risk posture depending on whether the game is equal, winning, or behind.

---

## 6. Architecture & Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | **React 19 + TypeScript** | Strict type safety, clean component composition |
| **Bundler** | **Vite 8** | Near-instant HMR, tree-shaking, fast builds |
| **Chess Rules** | **chess.js** | Production-tested validation for castling, en passant, promotion, and checkmate |
| **AI Worker** | **Web Worker (UCI Engine)** | Runs off-thread chess computation, keeping 60 FPS UI responsiveness |
| **State Management** | **Zustand** | Lightweight, reactive state without Redux boilerplate |
| **Audio** | **Web Audio API Synthesis** | 100% offline, zero-asset latency audio synthesis for moves, captures, and resource decisions |
| **Styling** | **Vanilla CSS + Design Tokens** | Handcrafted palette; no generic Tailwind SaaS templates |
| **Offline / PWA** | **vite-plugin-pwa (Workbox)** | Full offline capability, manifest, service worker |
| **Container** | **Docker + Nginx Alpine** | Reproducible production deployment |

---

## 7. Getting Started Locally

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or pnpm

### Installation
```bash
# 1. Navigate to the project directory
cd risk-chess

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start local development server
npm run dev
```

The application will be accessible at `http://localhost:3000` (or the port specified by Vite).

### Running Automated Tests
```bash
npm run test
# or
npx vitest run
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 8. Running with Docker

You can run the entire application using Docker:

```bash
# Build and run the container
docker compose up --build
```

Access the application in your browser at `http://localhost:3000`.

To stop the container:
```bash
docker compose down
```

---

## 9. Design Philosophy & Anti-AI-Slop

Risk Chess was built with strict human-centric design rules:
- **No generic Tailwind SaaS layouts:** Handcrafted tokens using warm dark charcoal (`#171615`), warm parchment light squares (`#d4c4a0`), walnut dark squares (`#7a6a4a`), and muted gold accents (`#c9a84c`).
- **No casino visuals or slot sounds:** Risk is presented through clear data, probability distributions, and subtle tactile audio tones.
- **The Chessboard is King:** The board dominates desktop and mobile viewports; strategy panels and controls support the board rather than cluttering it.
- **Responsive Architecture:** On mobile screens, the investment panel converts into a fluid bottom sheet with one-tap access.

---

## 10. License

MIT License. Educational and strategic game simulation.
