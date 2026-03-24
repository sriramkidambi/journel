import { TextDecoder, TextEncoder } from 'util';

(global as typeof globalThis & {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
}).TextEncoder = TextEncoder;

(global as typeof globalThis & {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
}).TextDecoder = TextDecoder;

Object.defineProperty(window, 'electron', {
  writable: true,
  value: {
    settingsGet: jest.fn().mockResolvedValue(undefined),
    settingsSet: jest.fn(),
    getConfigPath: jest.fn().mockReturnValue('/tmp/piles.json'),
    existsSync: jest.fn().mockReturnValue(true),
    writeFile: jest.fn((_, __, callback) => callback?.(null)),
    readFile: jest.fn((_, callback) => callback?.(null, '[]')),
    joinPath: jest.fn((...parts) => parts.filter(Boolean).join('/')),
    isDirEmpty: jest.fn().mockReturnValue(true),
    mkdir: jest.fn(),
    pathSeparator: '/',
    ipc: {
      invoke: jest.fn().mockResolvedValue(null),
      on: jest.fn(),
      off: jest.fn(),
      removeListener: jest.fn(),
    },
  },
});
