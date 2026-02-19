# My Reading — Book Collection Website

## Overview
A single-page book collection website that displays 888+ books with search, filter, sort, and shuffle functionality. Features a "Book of the Day" ribbon at the top that highlights a different book each day.

## Tech Stack
- **Single file**: Everything lives in `index.html`
- **CSS**: Tailwind CSS (via CDN), plus custom `<style>` block for animations
- **Fonts**: Google Fonts — Inter (sans) and Crimson Text (serif)
- **JavaScript**: Vanilla JS, no frameworks
- **Data**: Book collection stored as embedded CSV in a `csvData` variable

## Architecture

### Data Format
Books are stored as CSV with columns: `Title, Author, Category, Link, Summary`. The CSV is parsed by a custom `parseCSV()` function that handles quoted fields and commas within fields.

### Key Functions
- `parseCSV(csv)` — Parses CSV string into 2D array
- `displayBooks(csv, filter, categoryFilter, sortBy)` — Renders book cards with filtering/sorting
- `getCategoryStyles(category)` — Returns icon, gradient, and text color for each category
- `getBookOfTheDay()` — Date-seeded deterministic daily book selection
- `populateCategoryFilter()` — Populates the category dropdown
- `shuffleBooks()` — Fisher-Yates shuffle of displayed cards
- `toggleTheme()` / `initTheme()` — Dark/light mode with localStorage persistence

### Book of the Day
Uses a date-based hash (`YYYY-M-D` string → hash → index) to deterministically select a book. Same book shows all day, changes at midnight. Rendered as a slim ribbon at the very top of the page.

### Theme System
- Supports light and dark mode via Tailwind's `class` dark mode strategy
- Persisted in `localStorage`
- Respects `prefers-color-scheme` on first visit

## Categories
Books span many categories including: Business, Non-fiction, Biography, History, Politics, Fiction, Philosophy, Psychology, Health/Wellness, Culture, Science, Economics, Finance, Technology, Education, Self-Help, and more.

## Style Conventions
- Use Tailwind utility classes for styling
- Custom CSS only for animations and special effects
- Book cards use `backdrop-blur`, rounded corners, and hover lift effects
- Category badges use gradient backgrounds with matching icons
