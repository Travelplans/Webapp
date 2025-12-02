# Testing Guide

## Overview

The project uses **Jest** and **React Testing Library** for unit and integration testing.

## Test Results

✅ **30 tests passing** across 5 test suites

### Test Coverage

- ✅ Error Handling (`errorHandler.test.ts`) - 5 tests
- ✅ Validation (`validation.test.ts`) - 6 tests  
- ✅ Pagination (`pagination.test.ts`) - 5 tests
- ✅ Button Component (`Button.test.tsx`) - 6 tests
- ✅ Login Page (`Login.test.tsx`) - 4 tests
- ⚠️ ErrorBoundary (`ErrorBoundary.test.tsx`) - Skipped (import.meta limitation)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a specific test file
npm test Button.test.tsx
```

## Test Structure

Tests are located alongside their source files in `__tests__` directories:

```
src/
  shared/
    components/
      __tests__/
        Button.test.tsx
        ErrorBoundary.test.tsx
    utils/
      __tests__/
        errorHandler.test.ts
        validation.test.ts
        pagination.test.ts
  features/
    auth/
      pages/
        __tests__/
          Login.test.tsx
```

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Utility Function Tests

```typescript
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

## Known Limitations

1. **ErrorBoundary Tests**: The `ErrorBoundary` component uses `import.meta.env.DEV` which Jest cannot parse. These tests are currently skipped.

2. **Firebase Mocking**: Firebase services are mocked in `src/setupTests.ts`. For more complex Firebase interactions, consider using `@firebase/rules-unit-testing`.

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the user sees and does, not internal implementation details.

2. **Use Accessible Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`.

3. **Async Operations**: Always use `waitFor` or `findBy*` queries for async operations.

4. **Clean Up**: Use `beforeEach` and `afterEach` to set up and tear down test state.

5. **Mock External Dependencies**: Mock Firebase, API calls, and other external services.

## Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Run `npm run test:coverage` to see current coverage.

## Continuous Integration

Tests should pass before merging any PR. Consider setting up:
- GitHub Actions
- Pre-commit hooks with Husky
- Coverage reporting with Codecov

