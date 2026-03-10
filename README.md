# 📚 Senthil's Reading Habit

A modern, high-performance book collection and "Book of the Day" showcase built with React, Vite, and Chakra UI.

## ✨ Features

- **⚡ High Performance**: 
  - **Debounced Search**: Optimized keyword searching across titles, authors, categories, and summaries.
  - **Memoized Components**: Smooth rendering and theme transitions using `React.memo`.
- **📖 Book of the Day**: A premium, deterministic hero banner featuring a novelistic "Marcellus SC" typography and dynamic animations.
- **🎨 Modern UI**: 
  - Glassmorphic header with real-time book counter.
  - Fully responsive layout with seamless Dark/Light mode support.
  - Dynamic categorization badges and "Shuffle" functionality.
- **🚀 Automated Deployment**: CI/CD pipeline set up via GitHub Actions for publishing to GitHub Pages.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Chakra UI](https://chakra-ui.com/) (v2)
- **Icons**: [Lucide React](https://lucide-dev.github.io/lucide/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Deployment**: [GitHub Actions](https://github.com/features/actions)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/senthilcaesar/my-reading.git
   cd my-reading
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Building and Deploying

### Build for Production

To generate a production build in the `dist/` folder:
```bash
npm run build
```

### GitHub Pages Deployment

The project is configured to deploy automatically via GitHub Actions.
1. Push your changes to the `main` branch.
2. The [Deploy to GitHub Pages workflow](.github/workflows/main.yml) will trigger.
3. Once finished, the site will be live at `https://senthilcaesar.github.io/my-reading/`.

---
*Inspired by the KnowledgeLab design system.*
