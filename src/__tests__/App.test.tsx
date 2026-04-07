import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../renderer/App';

// Mock electron API
const mockElectronAPI = {
  platform: {
    isMac: true,
    isWindows: false,
  },
  file: {
    exists: jest.fn().mockResolvedValue({ success: true, data: true }),
    read: jest.fn().mockResolvedValue({ success: true, data: '[]' }),
    write: jest.fn().mockResolvedValue({ success: true }),
  },
  path: {
    join: jest.fn().mockResolvedValue({ success: true, data: '/test/path' }),
    separator: jest.fn().mockResolvedValue({ success: true, data: '/' }),
  },
  config: {
    getPath: jest.fn().mockResolvedValue({ success: true, data: '/test/config.json' }),
  },
  ipc: {
    sendMessage: jest.fn(),
    on: jest.fn().mockReturnValue(() => {}),
    invoke: jest.fn().mockResolvedValue({ success: true, data: null }),
  },
};

Object.defineProperty(window, 'electron', {
  value: mockElectronAPI,
  writable: true,
});

// Mock the page components
jest.mock('../renderer/pages/Home', () => () => <div data-testid="home-page">Home</div>);
jest.mock('../renderer/pages/Journal', () => () => <div data-testid="journal-page">Journal</div>);
jest.mock('../renderer/pages/License', () => () => <div data-testid="license-page">License</div>);
jest.mock('../renderer/pages/CreateJournal', () => () => <div data-testid="create-journal-page">CreateJournal</div>);

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully', () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(container).toBeTruthy();
  });

  it('should render Home page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should render Journal page when navigating to /journal', () => {
    render(
      <MemoryRouter initialEntries={['/journal/test']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('journal-page')).toBeInTheDocument();
  });

  it('should render CreateJournal page when navigating to /create', () => {
    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('create-journal-page')).toBeInTheDocument();
  });

  it('should render License page when navigating to /license', () => {
    render(
      <MemoryRouter initialEntries={['/license']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('license-page')).toBeInTheDocument();
  });
});

describe('App Navigation', () => {
  it('should handle route changes', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    
    // Simulate navigation by re-rendering with different route
    rerender(
      <MemoryRouter initialEntries={['/journal/test']}>
        <App />
      </MemoryRouter>,
    );
    
    expect(screen.getByTestId('journal-page')).toBeInTheDocument();
  });
});
