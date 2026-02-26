# TODO Board v2 - Requirements

## Overview
A standalone, self-contained Eisenhower Matrix (4-quadrant) TODO board web app. 
Can be packaged and shared - others can clone this directory and run it.

## Current State
- `index.html` - existing working board (read-only, fetches todo-matrix.json)
- `todo-matrix.json` - data file with q1/q2/q3/q4 items + lang labels
- Board supports Chinese and English via a language toggle (both read from same JSON)

## Requirements

### 1. Drag & Drop
- Items within a quadrant can be reordered by dragging
- Items can be dragged between quadrants (e.g., move from q2 to q1)
- Drag & drop changes persist immediately to `todo-matrix.json` via API
- Changes apply to both zh and en views (they share the same JSON data)
- Use HTML5 Drag & Drop API (no external libraries)

### 2. Done Archive
- Add a `done` array to `todo-matrix.json`:
  ```json
  "done": [
    {"id": 9, "text": "...", "text_en": "...", "completed": "2026-02-25", "from": "q1", ...}
  ]
  ```
- When an item is marked complete, move it from its quadrant to the `done` array
- Record `completed` date and `from` (original quadrant)
- UI: Show a collapsible "✅ Done" section below the matrix
- Completion can be triggered by clicking the dot/checkbox on each item

### 3. Backend API (serve.mjs)
- `GET /todo-matrix.json` - serve the JSON (existing behavior via static file)
- `PUT /todo-matrix.json` - accept full JSON body, write back to file
  - Validate it's valid JSON before writing
  - Return 200 on success, 400 on invalid JSON
- The server should be standalone (copy of the workspace serve.mjs but simplified, only serving this directory)
- Listen on port 8899, bind 0.0.0.0

### 4. Favicon
Keep the current E2 Unified Squircle favicon (already in index.html).

### 5. Standalone Package
- Everything in `todo-board/` directory
- `serve.mjs` - lightweight Node.js server (no npm dependencies)
- `index.html` - the board UI
- `todo-matrix.json` - the data
- `README.md` - usage instructions
- No dependencies on files outside this directory

### 6. Design Constraints
- Keep the existing glassmorphism Apple-style design
- Keep the language toggle (zh/en)
- Keep responsive layout (mobile: single column, desktop: 2x2 grid)
- Desktop quadrant order: Q2(top-left) Q1(top-right) Q4(bottom-left) Q3(bottom-right)
- Mobile order: Q1, Q2, Q3, Q4
