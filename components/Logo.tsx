import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = 'h-10', showText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Shield Background - adapts to text color */}
        <path
          d="M20 4L8 8V18C8 25.5 13.5 31.5 20 33C26.5 31.5 32 25.5 32 18V8L20 4Z"
          fill="currentColor"
          className="text-gray-900 dark:text-white"
          opacity="0.9"
        />
        {/* Shield Border - orange accent */}
        <path
          d="M20 4L8 8V18C8 25.5 13.5 31.5 20 33C26.5 31.5 32 25.5 32 18V8L20 4Z"
          stroke="#f97316"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Checkmark - orange accent */}
        <path
          d="M15 20L18 23L25 16"
          stroke="#f97316"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {showText && (
        <span className="font-bold text-xl text-current">
          ResilientOS
        </span>
      )}
    </div>
  );
}

