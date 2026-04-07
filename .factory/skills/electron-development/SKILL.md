---
name: electron-development
description: Best practices for Electron main/renderer process development
---

# Electron Development Skill

## Architecture Overview

Journal uses Electron with:
- **Main Process**: Node.js backend (file operations, settings)
- **Renderer Process**: React frontend (UI)
- **Preload Script**: Secure bridge between them

## Main Process Guidelines

### IPC Handler Pattern
```typescript
// src/main/handlers/feature.ts
import { ipcMain } from 'electron';

export interface FeaturePayload {
  data: string;
}

export interface FeatureResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export function setupFeatureHandlers() {
  ipcMain.handle('feature:action', async (event, payload: FeaturePayload): Promise<FeatureResult> => {
    try {
      // Implementation
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
```

### Security Best Practices
- Never expose full Node.js API to renderer
- Use context isolation
- Validate all IPC inputs
- Use type-safe IPC (see preload.d.ts)

## Renderer Process Guidelines

### Using IPC in Components
```typescript
// Access exposed API via window.electron
const result = await window.electron.featureAction(payload);

// Type-safe usage with interfaces
interface Window {
  electron: {
    featureAction: (payload: FeaturePayload) => Promise<FeatureResult>;
  }
}
```

### State Management
- Use React hooks for local state
- Use electron-settings for persistent state
- Avoid direct file system access from renderer

## Preload Script Updates

When adding new IPC channels:
1. Add handler in `src/main/handlers/`
2. Register in `src/main/handlers/index.ts`
3. Expose in `src/main/preload.ts`
4. Add type in `src/renderer/preload.d.ts`

## Common Patterns

### File Operations
```typescript
// Always use IPC for file operations
// Handler validates paths and checks permissions
const content = await window.electron.fileRead(filepath);
```

### Settings
```typescript
// Settings use electron-settings with sync methods
const apiKey = await window.electron.settingsGet('openai.apiKey');
await window.electron.settingsSet('openai.apiKey', newKey);
```
