# Journal - Agent Development Guide

This document provides essential information for AI agents working on the Journal codebase.

## Project Overview

**Journal** is a desktop Electron application for reflective journaling with local data storage and AI integration. It uses React for the UI and stores data locally using electron-settings.

## Technology Stack

- **Framework**: Electron 41.x with React 19.x
- **Language**: TypeScript 5.9.x (strict mode enabled)
- **Bundler**: Webpack 5.x
- **Testing**: Jest 29.x with Testing Library
- **State Management**: React hooks + electron-settings
- **UI Components**: Radix UI primitives
- **Text Editor**: TipTap
- **Package Manager**: pnpm 10.x

## Prerequisites

- Node.js >= 18
- pnpm >= 10

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm start

# Run tests
pnpm test

# Build for production
pnpm run build

# Package the app
pnpm run package
```

## Development Workflow

### Running the Application

The app consists of two main processes:
- **Main process**: Node.js backend (Electron main thread)
- **Renderer process**: React frontend (Chromium)

```bash
# Start both processes in development mode
pnpm start

# Start only main process
pnpm run start:main

# Start only renderer process
pnpm run start:renderer
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Run tests in CI mode (with coverage reporting)
pnpm run test:ci
```

### Code Quality

```bash
# Run linter
pnpm run lint

# Run linter with auto-fix
pnpm run lint:fix

# Check for dead/unused code
pnpm run knip

# Check for duplicate code
pnpm run jscpd
```

### Build Commands

```bash
# Build for production
pnpm run build

# Build DLL for development
pnpm run build:dll

# Build main process only
pnpm run build:main

# Build renderer process only
pnpm run build:renderer
```

## Project Structure

```
src/
├── main/               # Electron main process
│   ├── handlers/      # IPC handlers for file operations
│   ├── utils/         # Main process utilities
│   ├── main.ts        # Main entry point
│   ├── menu.ts        # Application menu
│   ├── preload.ts     # Preload script
│   └── ipc.ts         # IPC communication setup
├── renderer/          # React frontend
│   ├── pages/         # Page components
│   │   ├── Home/      # Home page
│   │   ├── Journal/   # Journal page
│   │   ├── CreateJournal/  # Create journal page
│   │   └── License/   # License page
│   ├── index.tsx      # Renderer entry point
│   └── preload.d.ts   # Type definitions
└── __tests__/         # Test files
```

## Code Conventions

### Naming

- **Variables**: camelCase (`userName`, `journalEntry`)
- **Functions**: camelCase (`getJournalEntries()`, `handleSave()`)
- **React Components**: PascalCase (`JournalPage`, `HomeView`)
- **Interfaces**: PascalCase with `I` prefix (`IJournalEntry`, `IUserSettings`)
- **Types**: PascalCase (`JournalData`, `EntryType`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`)

### File Organization

- Keep components in their own directories with an `index.tsx` file
- Co-locate styles, tests, and types with components when possible
- Use barrel exports (`index.ts`) for cleaner imports

### TypeScript

- Strict mode is enabled - all code must be properly typed
- Avoid using `any` - use `unknown` when type is uncertain
- Define interfaces for all data structures
- Use discriminated unions for complex state management

### Import Rules

- **Never import from main into renderer or vice versa** - enforced by ESLint
- Use absolute imports from `src/` for cross-module imports
- Group imports: external libraries, then internal modules, then styles

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# OpenAI API key for AI reflections
OPENAI_API_KEY=sk-...
```

## Testing Guidelines

### Unit Tests

- Place tests in `src/__tests__/` or co-locate as `Component.test.tsx`
- Use React Testing Library for component tests
- Mock Electron APIs and external dependencies
- Test user interactions, not implementation details

### Integration Tests

- Integration tests use Jest with jsdom environment
- Mock file system operations in main process tests
- Test component integration with context providers

## Pre-commit Hooks

The project uses Husky and lint-staged:

1. **Linting**: ESLint auto-fixes staged files
2. **Formatting**: Prettier formats staged files
3. **Large file check**: Files >100KB are blocked
4. **Tech debt check**: TODO/FIXME comments flagged
5. **Secret scan**: Potential secrets in staged files detected

Pre-push hooks run tests and check for duplicate/unused code.

## Tech Debt Markers

When adding TODO/FIXME comments, include an issue reference:

```typescript
// Good: Links to specific issue
// TODO(PROJ-123): Add validation for journal entry dates

// Bad: No issue reference
// TODO: Add validation
```

## Code Quality Thresholds

- **Cyclomatic complexity**: Max 10 per function
- **Max file size**: 500 lines (warning)
- **Max line length**: 120 characters
- **Duplicate code**: Flagged if >10% similarity

## Common Tasks

### Adding a New Page

1. Create directory in `src/renderer/pages/PageName/`
2. Add `index.tsx` with React component
3. Add route in the router configuration
4. Add navigation link if needed

### Adding an IPC Handler

1. Create handler in `src/main/handlers/`
2. Register handler in `src/main/handlers/index.ts`
3. Expose API in `src/main/preload.ts`
4. Add type definition in `src/renderer/preload.d.ts`

### Working with Settings

```typescript
import settings from 'electron-settings';

// Get setting
const apiKey = settings.getSync('openai.apiKey');

// Set setting
settings.setSync('openai.apiKey', newKey);
```

## Debugging

- **Main process**: Use `console.log` or attach Node.js debugger
- **Renderer process**: Use Chrome DevTools (Ctrl+Shift+I / Cmd+Option+I)
- **Preload script**: Logs appear in renderer DevTools console

## Troubleshooting

### Build Issues

```bash
# Clean and rebuild
rm -rf node_modules .erb/dll release/dist
pnpm install
pnpm run build:dll
```

### Test Failures

```bash
# Clear Jest cache
npx jest --clearCache
```

### Electron Issues

```bash
# Rebuild native modules
pnpm run rebuild
```

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## Contributing

1. Follow the code conventions outlined above
2. Ensure tests pass before committing
3. Add tests for new functionality
4. Update this document if you change development workflows

---

Last updated: March 2026
