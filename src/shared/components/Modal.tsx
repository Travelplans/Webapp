
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto" 
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop - Lighter and less prominent */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" 
        aria-hidden="true" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
        <div 
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-full sm:my-8 sm:w-full sm:max-w-4xl"
          style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-white px-3 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none sm:hidden"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="bg-white px-3 pb-3 sm:px-6 sm:pb-6 overflow-y-auto flex-1" style={{ maxHeight: 'calc(95vh - 80px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
