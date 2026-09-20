# Risk Chess: Dynasties of Bharat

> **SIH26208** — A unique toy/game inspired by Indian civilisation.  
> *A royal strategy simulation where every conquest shapes your treasury — built on the principles of Chanakya's Arthashastra.*

---

## 1. What Is This?

**Dynasties of Bharat** is a cultural strategy chess game submitted for **Smart India Hackathon 2026 (Problem Statement SIH26208)**: *develop/conceptualize a unique toy or game inspired by Indian civilisation.*

Traditional chess is already India's gift to the world — born as *Chaturanga* in the Gupta Empire. This game takes that heritage and layers a **resource-planning and risk-management simulation** on top, drawing inspiration from:

- **Chanakya's Arthashastra** — the ancient Indian treatise on statecraft, economic policy, and military strategy
- **The Maurya Empire's Mansabdari system** — where generals were ranked by the cavalry (resources) they could field
- **The Silk Road trade networks** — where every tactical decision had an economic consequence

Every piece capture forces the player to assess **battle survival probability**, **enemy counter-strike threat**, and **treasury impact** — turning chess into a simulation of royal decision-making under uncertainty.

There is **no real money, no wagering, no loot boxes, and no pay-to-win mechanics.** Treasury Reserves (TR) are entirely fictional planning values for an educational simulation.

---

## 2. Sena Parichaya — The Royal Forces

Both players begin with **10,000 TR** (Treasury Reserves).

| Piece (Bharat) | Piece (Standard) | Treasury Value | Role |
|---|---|---|---|
| **Maharaja** | King | *Priceless* | The throne — his fall ends the realm |
| **Rajmata** | Queen | **3,000 TR** | Supreme battlefield authority |
| **Durg** | Rook | **1,500 TR** | Fortress — anchor of position |
| **Acharya** | Bishop | **1,000 TR** | Sage advisor — diagonal wisdom |
| **Ashva** | Knight | **1,000 TR** | Warhorse — unconventional strikes |
| **Padati** | Pawn | **500 TR** | Infantry — backbone of every campaign |

---

## 3. Rajniti Nirnay — The Decision Cycle

When you execute a tactically meaningful strike, a **Strategic Decision Review** opens:

1. **The Situation:** e.g. *Ashva (Knight) seizes Acharya (Bishop) at f7*
2. **The Intelligence:**
   - Captured Territory Value: 1,000 TR
   - Battle Survival Probability: 68%
   - Enemy Counter-Strike: Medium
   - Statistical Expected Impact: +180 TR
3. **The Choice:** Sanction a treasury allocation (**100, 250, 500, or 1,000 TR**) or **Hold Campaign**
4. **The Resolution:**
   - If your piece survives the sequence, the campaign generates **treasury gain**
   - If your piece is captured, committed reserves are **written down**

### Campaign Scenarios

Choose your historical campaign context at setup:

| Scenario | Theme | Effect |
|---|---|---|
| **The Grand Trade Route** | Silk & Spice commerce | High-value captures reward tactical boldness |
| **The Monsoon** | Season of uncertainty | Risk profiles shift with volatile conditions |
| **The Centre of Knowledge** | Nalanda Principles | Defensive mastery builds steady treasury yield |

---

## 4. Yuddha Modes — Game Modes

| Mode | Bharat Name | Description |
|---|---|---|
| Classic vs AI | **Yuddha** | Single combat against an adaptive AI (Senapati / Maharathi / Chakravartin difficulty) |
| Local Duel | **Sabha** | Two commanders, same screen, independent treasuries |
| Judge Showcase | **Rajdarbar** | 60-second curated demo for SIH judges — launches instantly into an active position |
| Tutorial | **Gurukul** | Step-by-step guided walkthrough of all mechanics |
| Practice | **Abhyas** | Low-stakes training ground |

---

## 5. Risk Calculation Methodology

Every decision review is evaluated by the risk engine:

1. **Material Equity Ratio:** Value of attacker vs. value of target
2. **Position Defence Multiplier:** Square attack vectors — is the destination defended or contested?
3. **Survival Probability:**
   - Uncontested square: **95%**
   - Equal trade / trading down: **40%**
   - Sacrificing higher-value piece: **20%**
4. **Risk Score (0–100):**
   - **Low Risk (≤ 33):** Secure capture — modest treasury upside
   - **Medium Risk (34–66):** Contested — balanced upside and exposure
   - **High Risk (≥ 67):** Dangerous sacrifice — high upside, heavy write-down risk

---

## 6. Rajniti Shaili — Decision Profiling

At the end of each campaign, your decision archetype is derived:

| Profile | Description |
|---|---|
| **Calculated Risk Taker** | Balances probability and expected value; takes medium-risk positions |
| **Conservative Strategist** | Prioritises piece preservation and steady low-risk campaigns |
| **Aggressive Opportunist** | High risk appetite; commits significant treasury to speculative strikes |
| **Adaptive Commander** | Dynamically shifts risk posture based on game state |

---

## 7. Architecture & Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | React 19 + TypeScript | Strict type safety, clean component composition |
| **Bundler** | Vite 8 | Near-instant HMR, tree-shaking, fast builds |
| **Chess Rules** | chess.js | Production-tested: castling, en passant, promotion, checkmate |
| **AI Engine** | Web Worker (UCI/Stockfish) | Off-thread computation — keeps 60 FPS UI responsiveness |
| **State** | Zustand | Lightweight reactive state without Redux boilerplate |
| **Audio** | Web Audio API Synthesis | 100% offline, zero-asset audio for moves, captures, and decisions |
| **Styling** | Vanilla CSS + Design Tokens | Cinzel headings, handcrafted dark palette, no generic Tailwind |
| **PWA** | vite-plugin-pwa (Workbox) | Full offline capability, manifest, service worker |
| **Container** | Docker + Nginx Alpine | Reproducible production deployment |

---

## 8. Getting Started Locally

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm

### Installation
```bash
# Navigate to the project directory
cd risk-chess

# Install dependencies
npm install --legacy-peer-deps

# Start local development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Running Tests
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

## 9. Running with Docker

```bash
# Build and run
docker compose up --build
```

Open **http://localhost:3000**. To stop:
```bash
docker compose down
```

---

## 10. Bharat Codex — Cultural Design Philosophy

This game was designed to feel **authentically Indian without being stereotypically decorated**:

- **Piece names are Sanskrit titles** — not decorative labels but meaningful roles from Indian military tradition (*Padati* = infantry soldier, *Ashva* = warhorse, *Acharya* = teacher/sage)
- **Chanakya's Arthashastra** is the philosophical backbone: every treasury decision is framed as an act of statecraft
- **Cinzel typeface** for headings — classical monumental typography that echoes stone inscriptions
- **Warm dark palette** — `#10110f` charcoal background with `#d7b46a` gold accents; restrained, not garish
- **No casino aesthetics:** Risk is communicated through probability data and decision intelligence, not flashing animations

---

## 11. Team

Submitted for **SIH26208** — Smart India Hackathon 2026.

---

## 12. License

MIT License. Educational and strategic game simulation. No real currency involved.
