import React from 'react';
import './Features.css';

const featureData = [
    { icon: "🔬", title: "Faculty-Led", desc: "Learn directly from PhD holders and research scientists." },
    { icon: "📜", title: "Certifications", desc: "Receive industry-recognized certificates for every module." },
    { icon: "💻", title: "Self-Paced", desc: "Access high-quality video content anytime, anywhere." }
];

const Features = () => {
    return (
        <section className="features-wrapper">
            <h2>Why Choose EduPlatform?</h2>
            <div className="features-grid-layout">
                {featureData.map((item, index) => (
                    <div key={index} className="feature-item-card">
                        <div className="feature-icon-box">{item.icon}</div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;