import React from 'react';

export const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required,
    className = '',
    accept
}) => (
    <div className={`input-group ${className}`}>
        {label && <label className="input-label">{label}</label>}
        <input
            type={type}
            value={value}
            onChange={onChange}
            className="input-field"
            placeholder={placeholder}
            required={required}
            accept={accept}
        />
    </div>
);
