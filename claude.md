# CLAUDE.md — Book Collection App

> This file gives AI assistants instant context about this codebase.
> Read this before touching any file.

---

## What This App Does

A personal **book collection browser** — a rich, interactive web app that displays ~900 books parsed from a CSV. Users can search, filter by category, shuffle the collection, and see a deterministic "Book of the Day." It is _read-only_: no user accounts, no mutations, no backend.

Live URL (local): `http://localhost:5173` (Vite dev server)

---

## Tech Stack

| Layer      | Technology                                                                   |
| ---------- | ---------------------------------------------------------------------------- |
| Framework  | React 19 + Vite 7                                                            |
| UI library | Chakra UI v2 (`@chakra-ui/react`)                                            |
| Animations | Framer Motion 12                                                             |
| Icons      | Lucide React                                                                 |
| Language   | JavaScript (JSX) — no TypeScript                                             |
| Styling    | Chakra semantic tokens + inline Chakra props (no Tailwind, no raw CSS files) |
| Data       | ~900-book CSV embedded as a JS string in `src/data/csvString.js`             |

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
│   ├── BookCard.jsx             # Individual card + HighlightText component; exports getCategoryStyles
│   ├── BookDetailDrawer.jsx     # Right-side Chakra Drawer with full book details + "Visit Link" button
│   ├── NoResults.jsx            # Empty state: says what didn't match; Show all matches / Ask the Library about "…" / Clear
│   └── TechStackModal.jsx       # Chakra Modal listing the tech stack
│
├── data/
│   ├── csvString.js             # Raw CSV exported as `csvData` (486 KB — do NOT edit manually)
│   └── parsedBooks.js           # CSV parser → exports `books` (array) and `categories` (Set)
│
└── hooks/
    └── useDebounce.js           # Generic debounce hook (150 ms used for search)
```

---

## Design System (`src/theme.js`)

All colors are **semantic tokens** that auto-switch between light and dark mode. Always reference them by name, never hardcode hex values.

| Token             | Light                  | Dark                     | Usage                   |
| ----------------- | ---------------------- | ------------------------ | ----------------------- |
| `bg`              | `#fcf8e8` (warm cream) | `#050507`                | Page background         |
| `surface`         | `rgba(67,52,34,0.05)`  | `rgba(255,255,255,0.03)` | Card backgrounds        |
| `surfaceHover`    | `rgba(67,52,34,0.08)`  | `rgba(255,255,255,0.08)` | Inputs, hover states    |
| `borderPrimary`   | `rgba(67,52,34,0.15)`  | `rgba(255,255,255,0.1)`  | Card/input borders      |
| `textPrimary`     | `#3d3021`              | `#f0f0f5`                | Headings, primary text  |
| `textSecondary`   | `#6e5b4b`              | `#a0a0b0`                | Subtext, metadata       |
| `accentPrimary`   | `#b08d57` (warm amber) | `#00f2ff` (cyan)         | Highlights, badges, CTA |
| `accentSecondary` | `#7d6b5d`              | `#7000ff`                | Secondary accents       |
| `accentMagenta`   | `#a64d4d`              | `#ff00ea`                | Unused currently        |

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
const [searchQuery, setSearchQuery]; // raw input value (not debounced)
const [selectedCategory, setSelectedCategory]; // active category filter
const [booksList, setBooksList]; // ordered book array (mutated by Shuffle)

const debouncedSearchQuery = useDebounce(searchQuery, 150); // passed to BookGrid
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

**Batched rendering**: `CardList` renders the first 60 matching books and adds 60 more when an invisible sentinel comes within 1500px of the viewport (IntersectionObserver); a new search/filter/shuffle resets to 60. Each card also has `content-visibility: auto` (with transparent padding/negative margins so the hover lift isn't clipped). `CardList` is memoised separately from the fade driven by `isFiltering`, so keystrokes don't re-render cards. Rendering all 1,000+ cards made load, filtering, shuffle and theme toggles stall for ~1 s (4× CPU throttle). Heavy page sections (`BookGrid`, `Header`, `Controls`, `NewspaperBackground`) are `memo`ised so opening a drawer/modal doesn't re-render them.

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

- `books`: Array of `{ id, title, author, category, link, summary, tags, keywords, coverUrl, recommender, ... }` objects
- `categories`: `Set<string>` of unique category strings

**Cleanup & enrichment applied at parse time** (precedence: curated > generated > CSV):

- `repairText` fixes mis-decoded UTF-8 ("RaÃºl" → "Raúl"); `cleanAuthor` strips Dr./MD/PhD.
- `categoryOverrides.js` also holds `titleOverrides` (CSV rows whose title is really a subtitle), `authorOverrides`, `excludedTitles` (duplicate rows) and `summaryOverrides`. Lookups accept the old CSV title too, so `bookCovers.js` etc. need no renames.
- `generatedBookMeta.js` (from `scripts/enrichBooks.mjs`, gpt-4.1) supplies summaries for books whose CSV summary was only a subtitle, 2 displayed `tags`, search-only `keywords`, and category fixes only where the old category was clearly wrong. `bookTags.js` still wins for tags. Review output in `reports/enrichment-review.md`.
- Every book object therefore has `tags` and `keywords` arrays — components read `book.tags`, not `bookTags`.

**After adding books**: `node scripts/enrichBooks.mjs` (only new titles) → `npm run generate:embeddings` → `npm run eval:ask`.

**Warning**: `csvString.js` is ~486 KB. Vite will warn about chunk size during build. Do NOT restructure data or add dynamic imports without testing build output.

---

## Ask the Library (RAG) — `AskDrawer.jsx` + `src/utils/askSearch.js`

- **Index**: `public/embeddings.bin` (int8 vectors, ~530 KB) + `public/embeddings.meta.json` (titles, content hashes, scales, precomputed vectors for `src/data/askSuggestions.js`). Rows are keyed by **title**, not row id.
- **Rebuild**: `npm run generate:embeddings` re-embeds only books whose embedding text changed (and new suggestions); `--full` re-embeds everything. Run it after any CSV/summary/tag change.
- **Retrieval**: `hybridSearch` orders books by semantic similarity (text-embedding-3-small, 512d) plus a bonus for containing the question's terms weighted by rarity (IDF), so a telling term ("WWII", an author) separates close books while a common one ("women") doesn't reshuffle them. The list ends where the score drops 0.14 below the best (max 40; the drawer shows 15, then "Show more"). Plain BM25/rank fusion was tried and rejected: it rewards books that merely repeat a word. Returns `weak: true` when nothing really matches; the UI and librarian prompt say so.
- **Quality check**: `npm run eval:ask` compares the old semantic-only ranking with hybrid on a labelled query set. Run it before and after tuning any constant in `askSearch.js`.
- **API key (TEMPORARY)**: the OpenAI key is currently baked into the build (`vite.config.js` + `main.yml`), so it is public. Once the Cloudflare proxy below is live, remove it from both. Target setup: the deployed site calls the Cloudflare Worker in `proxy/` (URL from the `ASK_PROXY_URL` repo variable → `VITE_ASK_PROXY_URL`), which adds the key server-side. The Worker builds the OpenAI request bodies itself (`src/utils/askApi.js`), allows only `ALLOWED_ORIGINS`, and rate-limits 20 req/min per IP. Precedence in `AskDrawer`: visitor's own key → proxy → baked-in key.
- **Proxy deploy**: `.github/workflows/proxy.yml` (needs `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `OPENAI_API_KEY` secrets). Local: put `OPENAI_API_KEY=...` in `proxy/.dev.vars`, run `npx wrangler dev` in `proxy/`, and start Vite with `VITE_ASK_PROXY_URL=http://localhost:8787`.

---

## Key Components — Quick Reference

### `Header.jsx`

- Once the page's search box scrolls out of view (IntersectionObserver in `App.jsx`), the title is replaced by a compact search box sharing the same `searchQuery`; when that box scrolls back into view while the header box has focus, the cursor is handed to it, so only one search box shows. Changing the search/filters while deep in the list scrolls the results' start up under the header.

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

- Each card is a `<Box as="button">` with `data-group` (not `role="group"`) so `_groupHover` styles still fire
- Clicking a card calls `onSelect(book)` → opens `BookDetailDrawer` (external links now live in the drawer footer)
- Hover effect: `translateY(-8px)` + gradient top border reveal
- `h="full"` ensures cards in the same grid row share height

### `BookDetailDrawer.jsx`

- Chakra `<Drawer placement="right">` rendered once in `App.jsx`; `selectedBook` state + `useDisclosure` control it
- Shows category badge, title, author, tags, full summary; footer has Close + "Visit Link" (external)
- The "Surprise Me" button in `Controls.jsx` picks a random book from `filteredBooks` (respects active search/category filters) and opens it here

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

- Edit the `150` in `App.jsx`: `useDebounce(searchQuery, 150)`

### Add a new animation

- Framer Motion is already installed. Use `motion()` wrapping Chakra components.
- Keep exit animations short (`< 0.2s`) to avoid feeling sluggish during filtering.

---

## Known Issues / Future Work

- **Bundle size warning**: `csvString.js` chunk is large. Consider lazy-loading or fetching from `/public/` on mount.
- **Reading List ("My Shelf")**: Not yet implemented. Plan: LocalStorage-based per-book status (Want to Read / Reading / Read), toggled via icon buttons on each card.
- ~~**Detail Drawer**~~: ✅ Implemented (`BookDetailDrawer.jsx`). Future polish: cover image placeholder.
- **Keyboard Navigation**: ArrowKey navigation through cards and `Esc` to clear search would improve accessibility.
- **CLAUDE.md outdated?**: After any major architectural change (new state, new libraries, new components), update this file.

---

## Running Locally

```bash
cd /Users/senthilpalanivelu/my-reading
npm run dev        # starts Vite dev server at http://localhost:5173
npm run build      # production build (watch for chunk size warnings)
npm run preview    # preview production build locally
```
