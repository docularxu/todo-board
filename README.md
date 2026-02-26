# TODO Board - Eisenhower Matrix

A standalone, self-contained Eisenhower Matrix (4-quadrant) TODO board web app with drag-and-drop reordering and done archive.

## Quick Start

```bash
node serve.mjs
```

Open http://localhost:8900 in your browser.

Custom port: `PORT=9000 node serve.mjs`

## Features

- **4-Quadrant Eisenhower Matrix** — Q1 (Urgent & Important), Q2 (Important, Not Urgent), Q3 (Urgent, Not Important), Q4 (Not Urgent, Not Important)
- **Drag & Drop** — Reorder items within a quadrant or move items between quadrants. Changes persist immediately.
- **Done Archive** — Click the dot on any item to mark it complete. Completed items move to a collapsible "Done" section below the matrix.
- **Bilingual** — Toggle between Chinese (中文) and English with a single click.
- **Responsive** — Desktop: 2×2 grid layout. Mobile: single-column stack.
- **Glassmorphism UI** — Apple-style frosted glass design.
- **Zero dependencies** — No npm install needed. Pure Node.js + HTML5.

## Files

| File | Purpose |
|---|---|
| `serve.mjs` | Node.js HTTP server (port 8899) |
| `index.html` | Board UI with drag-and-drop and done archive |
| `todo-matrix.json` | Data file (quadrants + done items + i18n labels) |
| `README.md` | This file |

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/todo-matrix.json` | Returns the current board data |
| `PUT` | `/todo-matrix.json` | Replaces the board data (validates JSON, returns 400 if invalid) |

## Requirements

- Node.js 18+
