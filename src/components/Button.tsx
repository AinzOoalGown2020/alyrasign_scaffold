import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ease-in-out ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'hover:bg-opacity-90'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button; 