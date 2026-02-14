import React from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showButtons?: boolean;
  labelClassName?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 999,
  step = 1,
  className = '',
  showButtons = true,
  labelClassName = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (rawValue === '') {
      onChange(0);
      return;
    }

    const parsed = parseInt(rawValue);
    if (isNaN(parsed)) return;

    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showButtons) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleDecrement();
      }
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className={`text-[9px] uppercase tracking-wide mb-0.5 text-center ${labelClassName || 'text-gray-500'}`}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {showButtons && (
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="absolute left-0 h-full px-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed z-10 transition-colors"
            aria-label="Decrease"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" />
            </svg>
          </button>
        )}

        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`
            w-full bg-gray-700 border border-gray-600 rounded text-center text-white text-sm font-semibold
            focus:border-blue-500 focus:outline-none transition-colors
            [&::-webkit-outer-spin-button]:appearance-none
            [&::-webkit-inner-spin-button]:appearance-none
            [&]:appearance-none
            ${showButtons ? 'px-6 py-0.5' : 'px-1 py-0.5'}
          `}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />

        {showButtons && (
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className="absolute right-0 h-full px-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed z-10 transition-colors"
            aria-label="Increase"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
