/**
 * Tests for Card component
 */

import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card', () => {
  it('should render children', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );
    
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-card">
        <div>Card Content</div>
      </Card>
    );
    
    const card = container.querySelector('.custom-card');
    expect(card).toBeInTheDocument();
  });
});

