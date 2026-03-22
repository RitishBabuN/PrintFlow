import React from 'react';

export const Button = ({
    children,
    variant = 'primary',
    onClick,
    type = 'button',
    disabled,
    className = '',
    fullWidth
}) => {
    const baseClass = `btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`;
    return (
        <button type={type} className={baseClass} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};
