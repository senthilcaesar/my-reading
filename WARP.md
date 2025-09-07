# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a personal book collection catalog - a static single-page HTML application that displays a curated collection of books with search functionality. The application presents books in a grid layout with filtering capabilities, sourcing data from an embedded CSV dataset containing over 800 books across various categories.

## Architecture

### Core Components

- **Single HTML File Structure**: The entire application is contained in `index.html` with embedded CSS styling and JavaScript functionality
- **Embedded Data**: Book information is stored as a CSV string within the JavaScript, containing:
  - Title, Author, Category, Amazon Link, Summary
  - 800+ book entries covering diverse topics (Business, Biography, Science, History, Fiction, etc.)
- **Client-Side Parsing**: Custom CSV parser handles quoted fields and escaping
- **Real-time Search**: Live filtering across all book metadata fields

### Key Functionality

- **Responsive Grid Layout**: 3-column desktop grid that adapts to single column on mobile
- **Search Interface**: Filters books by title, author, category, or summary text
- **External Links**: Direct links to Amazon product pages for each book
- **Visual Design**: Gradient background, card-based layout with hover effects

## Common Development Tasks

### Running the Application
```bash
# Serve locally (any HTTP server)
python3 -m http.server 8000
# or
npx serve .
# then visit http://localhost:8000
```

### Adding New Books
Books are stored in the embedded `csvData` variable. Format:
```
Title,Author,Category,Link,Summary
```
Note: Fields containing commas or quotes must be properly escaped with quotes.

### Modifying the UI
- **Styling**: All CSS is embedded in the `<style>` section (lines 7-118)
- **Layout**: Grid configuration in `#bookContainer` CSS rule
- **Search**: Modify the input handler or `displayBooks()` function for search behavior
- **Cards**: Book card structure is generated in the JavaScript display logic

### Data Management
The CSV data structure includes:
- **Title**: Book title
- **Author**: Author name
- **Category**: Subject classification
- **Link**: Amazon purchase URL
- **Summary**: Brief description or subtitle

## File Structure
```
.
├── index.html          # Complete application (HTML/CSS/JS)
└── .git/              # Git repository
```

## Development Notes

- No build process or dependencies required
- All assets are embedded or CDN-linked (Google Fonts)
- Search is case-insensitive and matches any field content
- CSV parser handles edge cases like quoted commas and nested quotes
- Mobile-first responsive design with breakpoint at 600px

## Git Workflow
- Simple two-commit history: initial creation and updates
- Main branch deployment ready
- Static hosting compatible (GitHub Pages, Netlify, etc.)
