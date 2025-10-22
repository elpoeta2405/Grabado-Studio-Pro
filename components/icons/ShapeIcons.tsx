import React from 'react';

const smallIconClass = "w-5 h-5";

export const RectangleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={smallIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
    </svg>
);

export const EllipseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={smallIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <ellipse cx="12" cy="12" rx="10" ry="7" strokeWidth="2" />
    </svg>
);