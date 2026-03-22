import React from 'react';

export const Card = ({ children, className = '', title }) => (
    <div className={`glass-card p-6 ${className}`}>
        {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
        {children}
    </div>
);
