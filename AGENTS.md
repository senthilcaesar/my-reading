# AGENTS.md — Book Collection App

> This file gives AI assistants instant context about this codebase.
> Read this before touching any file.

---

## What This App Does

A personal **book collection browser** — a rich, interactive web app that displays ~900 books parsed from a CSV. Users can search, filter by category, shuffle the collection, and see a deterministic "Book of the Day." It is *read-only*: no user accounts, no mutations, no backend.

Live URL (local): `http://localhost:5173` (Vite dev server)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 7 |
| UI library | Chakra UI v2 (`@chakra-ui/react`) |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Language | JavaScript (JSX) — no TypeScript |
| Styling | Chakra semantic tokens + inline Chakra props (no Tailwind, no raw CSS files) |
| Data | ~900-book CSV embedded as a JS string in `src/data/csvString.js` |

---

## Project Structure

```
src/
├── App.jsx                      # Root — owns all state (search, category, booksList)
├── main.jsx                     # ReactDOM.createRoot entry point
├── theme.js                     # Chakra extendTheme — colors, fonts, semantic tokens
│
├── components/
│   ├── Header.jsx               # Sticky glassmorphism header: book count, title, dark-mode toggle, Tech Stack modal trigger
│   ├── BookOfTheDay.jsx         # Deterministic daily pick banner (seeded RNG from day-of-year)
│   ├── Controls.jsx             # Search input (debounced), category <Select>, Shuffle button
│   ├── BookGrid.jsx             # Framer Motion animated grid; AnimatePresence with mode="popLayout"
│   ├── BookCard.jsx             # Individual card + HighlightText component
│   └── TechStackModal.jsx       # Chakra Modal listing the tech stack
│
├── data/
│   ├── csvString.js             # Raw CSV exported as `csvData` (486 KB — do NOT edit manually)
│   └── parsedBooks.js           # CSV parser → exports `books` (array) and `categories` (Set)
│
└── hooks/
    └── useDebounce.js           # Generic debounce hook (300 ms used for search)
```

---

## Design System (`src/theme.js`)

All colors are **semantic tokens** that auto-switch between light and dark mode. Always reference them by name, never hardcode hex values.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `bg` | `#fcf8e8` (warm cream) | `#050507` | Page background |
| `surface` | `rgba(67,52,34,0.05)` | `rgba(255,255,255,0.03)` | Card backgrounds |
| `surfaceHover` | `rgba(67,52,34,0.08)` | `rgba(255,255,255,0.08)` | Inputs, hover states |
| `borderPrimary` | `rgba(67,52,34,0.15)` | `rgba(255,255,255,0.1)` | Card/input borders |
| `textPrimary` | `#3d3021` | `#f0f0f5` | Headings, primary text |
| `textSecondary` | `#6e5b4b` | `#a0a0b0` | Subtext, metadata |
| `accentPrimary` | `#b08d57` (warm amber) | `#00f2ff` (cyan) | Highlights, badges, CTA |
| `accentSecondary` | `#7d6b5d` | `#7000ff` | Secondary accents |
| `accentMagenta` | `#a64d4d` | `#ff00ea` | Unused currently |

**Fonts:**
- Headings → `'Outfit', sans-serif`
- Body → `'Inter', sans-serif`
- Book of the Day banner → `'Libre Baskerville', serif`
- App title → `'Franklin Gothic', serif`

Google Fonts are loaded externally (check `index.html`).

---

## State Management (`App.jsx`)

All critical state lives in `App.jsx` — no context, no Zustand, no Redux.

```js
const [searchQuery, setSearchQuery]         // raw input value (not debounced)
const [selectedCategory, setSelectedCategory] // active category filter
const [booksList, setBooksList]             // ordered book array (mutated by Shuffle)

const debouncedSearchQuery = useDebounce(searchQuery, 300) // passed to BookGrid
```

**`filteredBooks`** (memoized): Applies category filter first, then search filter across `title`, `author`, `category`, and `summary`. Passed to `<BookGrid>` and used to update the header count.

**Shuffle**: Fisher-Yates on `booksList`, then resets both `searchQuery` and `selectedCategory`.

---

## Animation Architecture (`BookGrid.jsx`)

This is the most nuanced part — read carefully before changing.

- `MotionSimpleGrid` = `motion(SimpleGrid)` with `layout` prop → the grid itself animates its height.
- `AnimatePresence mode="popLayout"` wraps all cards inside the grid. **`initial={false}`** prevents entrance animations on first load.
- Each card is a `MotionBox` with `layout` prop and custom `cardVariants`:
  - `hidden`: `{ opacity: 0, y: 22, scale: 0.97 }`
  - `visible`: staggered via `custom={idx}`, delay capped at index 14 (15 items max stagger) to keep snappy perf.
  - `exit`: `{ opacity: 0, scale: 0.95, duration: 0.15 }`

**Why `mode="popLayout"`?** Earlier attempts with `mode="sync"` caused exiting cards to stay in-flow and push remaining cards down, creating a jarring layout jump. `popLayout` removes exiting cards from flow immediately.

**Card key**: `book.title` — assumed unique. If duplicates exist, keys would need to include index.

---

## Search Highlighting (`BookCard.jsx`)

`HighlightText` is a helper component (not exported) defined at the top of `BookCard.jsx`:

- Escapes the query for safe regex use.
- Splits the text string by the query (case-insensitive).
- Wraps matching parts in a Chakra `<Box as="mark">` with `bg="accentPrimary"` styling.
- Applied to: book `title`, `author`, and `summary` fields.

The `searchQuery` prop flows: `App` → `BookGrid` → `BookCard`.

---

## Data Pipeline (`src/data/`)

```
csvString.js  →  parsedBooks.js  →  App.jsx (booksList state)
```

**`parsedBooks.js`** runs a custom CSV parser (handles quoted fields with commas) at module load time. It exports:
- `books`: Array of `{ title, author, category, link, summary }` objects
- `categories`: `Set<string>` of unique category strings

**Warning**: `csvString.js` is ~486 KB. Vite will warn about chunk size during build. Do NOT restructure data or add dynamic imports without testing build output.

---

## Key Components — Quick Reference

### `Header.jsx`
- Sticky with glassmorphism (`backdropFilter: blur(16px)`)
- Shrinks padding on scroll (`scrolled` state via `window.scrollY`)
- Animated amber underline expands on scroll
- Theme toggle (Moon/Sun) + Tech Stack modal trigger

### `BookOfTheDay.jsx`
- Deterministic pick: seeded RNG using `year * 366 + dayOfYear`
- Changes pick every calendar day, same for all users
- Compact banner row between Header and Controls

### `Controls.jsx`
- Search: debounced input with clear (`X`) button
- Category: `<Select>` with sorted `Array.from(categories)`
- Shuffle: amber CTA button calls `onShuffle` in App

### `BookCard.jsx`
- Each card is an `<Box as={Link} isExternal>` — the entire card is clickable
- Hover effect: `translateY(-8px)` + gradient top border reveal
- `h="full"` ensures cards in the same grid row share height

---

## Common Tasks

### Add a new field to book cards
1. Add the field name to the CSV and re-export `csvString.js`
2. Parse it in `parsedBooks.js` (add to `books.push({...})`)
3. Display it in `BookCard.jsx`
4. Optionally add it to the search filter in `App.jsx`

### Add a new component
- Place it in `src/components/`
- Use Chakra semantic tokens — **do not hardcode colors**
- Import and render in `App.jsx` or an existing component

### Change the search debounce delay
- Edit the `300` in `App.jsx`: `useDebounce(searchQuery, 300)`

### Add a new animation
- Framer Motion is already installed. Use `motion()` wrapping Chakra components.
- Keep exit animations short (`< 0.2s`) to avoid feeling sluggish during filtering.

---

## Known Issues / Future Work

- **Bundle size warning**: `csvString.js` chunk is large. Consider lazy-loading or fetching from `/public/` on mount.
- **Reading List ("My Shelf")**: Not yet implemented. Plan: LocalStorage-based per-book status (Want to Read / Reading / Read), toggled via icon buttons on each card.
- **Detail Drawer**: Currently cards open external links. A Chakra `<Drawer>` showing full book details (cover image placeholder, extended summary) would be more immersive.
- **Keyboard Navigation**: ArrowKey navigation through cards and `Esc` to clear search would improve accessibility.
- **AGENTS.md outdated?**: After any major architectural change (new state, new libraries, new components), update this file.

---

## Running Locally

```bash
cd /Users/senthilpalanivelu/my-reading
npm run dev        # starts Vite dev server at http://localhost:5173
npm run build      # production build (watch for chunk size warnings)
npm run preview    # preview production build locally
```
