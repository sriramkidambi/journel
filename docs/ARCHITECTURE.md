## Project Architecture

### Overview

Journal is a desktop Electron application with a clear separation between the main process (Node.js) and renderer process (React).

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  main.ts     │  │  IPC Handlers │  │  Menu        │     │
│  │  (Entry)     │  │  (file, tag)  │  │  (App menu)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  preload.ts  │  │  Settings    │                        │
│  │  (Bridge)    │  │  (electron-  │                        │
│  │              │  │   settings)    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ IPC Communication
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Chromium Renderer Process                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    React App                        │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │   │
│  │  │  Home   │  │ Journal │  │ Create  │  │ License │ │   │
│  │  │  Page   │  │  Page   │  │ Journal │  │  Page   │ │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  TipTap      │  │  Radix UI    │  │  Router      │     │
│  │  (Editor)    │  │  (Components)│  │  (Navigation)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → React Component
2. **Component** → IPC Call (via preload bridge)
3. **Main Process** → Handler Execution
4. **Handler** → File System / Settings / API
5. **Result** → IPC Response → Component Update

### Module Boundaries

- **Main** cannot import from **Renderer**
- **Renderer** cannot import from **Main**
- Communication only through **IPC** defined in `preload.ts`
- **Handlers** are organized by domain (file, tags, highlights, etc.)

### External Dependencies

- **OpenAI API**: AI reflections (optional)
- **File System**: Journal entries stored locally
- **electron-settings**: User preferences
