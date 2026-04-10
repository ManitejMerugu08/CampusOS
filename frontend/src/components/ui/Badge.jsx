import React from 'react';
import './Badge.css';

const Badge = ({ children, variant = "primary" }) => {
    return (
        <span className={`badge-custom badge-${variant}`}>
            {children}
        </span>
    );
};

export default Badge;
