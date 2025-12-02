
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        aria-hidden="true" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
          style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Modal Header */}
          <div className="bg-white px-4 pt-5 pb-2 sm:px-6 sm:pt-6 sm:pb-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              {title}
            </h3>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="bg-white px-4 pb-4 sm:px-6 sm:pb-6 overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 100px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
