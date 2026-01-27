import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();
    return (
        <section className="hero-block">
            <div className="hero-content-left">
                <span className="hero-subtitle">Industry-Leading Technical Education</span>
                <h1>Master Engineering & Sciences with Experts</h1>
                <p>Join over 10,000 students accessing advanced modules in Electronics,Civil,Mechanical and Computer Science engineering.</p>
                <div className="hero-btn-group">
                    <button className="hero-btn-primary" onClick={() => navigate('/courses')}>
                        Browse Catalog
                    </button>
                    <button className="hero-btn-outline" onClick={() => navigate('/signup')}>
                        Start Learning
                    </button>
                </div>
            </div>
            <div className="hero-visual-right">
                <div className="hero-abstract-bg">
                    <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=900&auto=format&fit=crop
"/>
                    <div className="floating-stat-card">
                        <strong>4.9/5</strong>
                        <span>Average Course Rating</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
