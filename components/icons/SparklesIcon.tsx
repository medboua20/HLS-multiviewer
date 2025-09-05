import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3L14.34 9.66L21 12L14.34 14.34L12 21L9.66 14.34L3 12L9.66 9.66L12 3Z" />
    <path d="M5 3L6.08 6.08" />
    <path d="M19 21L17.92 17.92" />
    <path d="M3 19L6.08 17.92" />
    <path d="M21 5L17.92 6.08" />
  </svg>
);
