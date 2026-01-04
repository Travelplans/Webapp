/**
 * Tests for ConfirmationModal component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationModal from '../ConfirmationModal';

describe('ConfirmationModal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <ConfirmationModal
        isOpen={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="Confirm Action"
        message="Are you sure?"
      />
    );
    
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="Confirm Action"
        message="Are you sure?"
      />
    );
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const handleConfirm = jest.fn();
    const user = userEvent.setup();
    
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={jest.fn()}
        onConfirm={handleConfirm}
        title="Confirm Action"
        message="Are you sure?"
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);
    
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();
    
    render(
      <ConfirmationModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={jest.fn()}
        title="Confirm Action"
        message="Are you sure?"
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});





