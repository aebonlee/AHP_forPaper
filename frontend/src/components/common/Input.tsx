import React from 'react';

interface InputProps {
  id?: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  rows?: number;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  rows = 3
}) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm';
  const errorClasses = error 
    ? 'border-error-600 text-error-900 placeholder-error-300 focus:ring-error-500 focus:border-error-500' 
    : 'border-gray-300 text-gray-900 placeholder-gray-400';
  const disabledClasses = disabled 
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
    : 'bg-white';

  const inputClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-error-600 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={inputClasses}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={inputClasses}
        />
      )}
      
      {error && (
        <p className="text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;