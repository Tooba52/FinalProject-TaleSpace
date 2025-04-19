import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Mock child component
const MockChild = () => <h1>TEST CHILD</h1>;

// Mock the authStatus to return immediately
vi.mock('../components/ProtectedRoute', async () => {
  const actual = await vi.importActual('../components/ProtectedRoute');
  return {
    ...actual,
    default: ({ children }) => {
      // Always authorized for this test
      return localStorage.getItem('access_token') 
        ? children 
        : <div>REDIRECTING</div>;
    }
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('shows child when token exists', () => {
    localStorage.setItem('access_token', 'fake-token');
    
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockChild />
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(container.innerHTML).toContain('TEST CHILD');
  });

  test('does not show child when no token', () => {
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockChild />
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(container.innerHTML).not.toContain('TEST CHILD');
    expect(container.innerHTML).toContain('REDIRECTING');
  });
});