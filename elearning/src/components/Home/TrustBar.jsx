import React from 'react';
import './TrustBar.css';

const TrustBar = () => {
    return (
        <div className="trust-bar-container">
            <p>Our students are hired by industry leaders:</p>
            <div className="trust-logo-flex">
                <span className="trust-logo-text">IEEE</span>
                <span className="trust-logo-text">ASME</span>
                <span className="trust-logo-text">CERN</span>
                <span className="trust-logo-text">NASA</span>
                <span className="trust-logo-text">MIT Labs</span>
            </div>
        </div>
    );
};

export default TrustBar;