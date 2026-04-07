---
name: test-writing
description: Write effective unit and integration tests for React/Electron code
---

# Test Writing Skill

## When to Use
- Adding new features that need test coverage
- Fixing bugs (write regression tests)
- Refactoring existing code
- Meeting coverage thresholds

## Testing Patterns

### React Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(
      <MemoryRouter>
        <ComponentName {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    const onAction = jest.fn();
    render(<ComponentName onAction={onAction} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

### Electron Main Process Tests
```typescript
// Mock electron modules
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  app: { getPath: jest.fn().mockReturnValue('/tmp') },
}));

jest.mock('electron-settings', () => ({
  getSync: jest.fn(),
  setSync: jest.fn(),
}));

describe('handler', () => {
  it('should handle IPC events', async () => {
    const result = await handler(mockEvent, mockData);
    expect(result).toEqual(expected);
  });
});
```

### Mocking Strategy
- Mock external APIs (OpenAI, file system)
- Mock Electron modules
- Use MemoryRouter for routing tests
- Mock electron-settings for storage tests

## Coverage Requirements
- Functions: 60% minimum
- Lines: 60% minimum
- Branches: 60% minimum
- Statements: 60% minimum

## Test Naming
- `it('should [expected behavior] when [condition]')`
- `describe('FeatureName', () => { ... })`
- Group related tests in nested describes

## Running Tests
```bash
# Single run
npm test

# With coverage
npm run test:coverage

# Watch mode
npx jest --watch

# Specific file
npx jest App.test.tsx
```
