import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../renderer/App';

jest.mock('../renderer/pages/Home', () => () => <div>Home</div>);
jest.mock('../renderer/pages/Pile', () => () => <div>Pile</div>);
jest.mock('../renderer/pages/License', () => () => <div>License</div>);
jest.mock('../renderer/pages/CreatePile', () => () => <div>CreatePile</div>);

describe('App', () => {
  it('should render', () => {
    expect(
      render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      )
    ).toBeTruthy();
  });
});
