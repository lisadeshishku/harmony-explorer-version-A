import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MinimalNavbar.css';

const MinimalNavbar = () => {
    return (
        <nav className="minimal-navbar">
            <div className="navbar-content">
                <div className="logo">
                    <Link to="/">Harmony Explorer</Link>
                    <span className="version-tag">Basic</span>
                </div>
            </div>
        </nav>
    );
};

export default MinimalNavbar;