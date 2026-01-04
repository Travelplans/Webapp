import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = "px-4 sm:px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed touch-manipulation";
  
  const variantClasses = {
    primary: 'bg-[#00A9E0] hover:bg-[#0087B3] focus:ring-[#0087B3]',
    secondary: 'bg-[#8CC63F] hover:bg-[#7AB32E] focus:ring-[#7AB32E]'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;