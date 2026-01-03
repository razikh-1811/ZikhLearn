import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Home/Hero';
import TrustBar from '../components/Home/TrustBar';
import Features from '../components/Home/Features';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        /* The root class here must match the CSS overflow-x: hidden logic */
        <div className="home-page-viewport-wrapper">
            <Hero />
            <TrustBar />
            <Features />
            
            <section className="bottom-cta-section">
                <div className="cta-content-limit">
                    <h2>Ready to elevate your technical skills?</h2>
                    <p>Sign up now and get access to your first module for free.</p>
                    <button 
                        className="hero-btn-primary" 
                        onClick={() => navigate('/signup')}
                    >
                        Join Now
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;