import React from 'react';
import './Navbar.css';

const Navbar = ({ activeTab, onTabChange }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">🎓 IQAC System</h1>
        <div className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => onTabChange('faculty')}
          >
            👨‍🏫 Faculty
          </button>
          <button 
            className={`nav-item ${activeTab === 'iqac' ? 'active' : ''}`}
            onClick={() => onTabChange('iqac')}
          >
            📊 IQAC Records
          </button>
          <button 
            className={`nav-item ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => onTabChange('teacher')}
          >
            ➕ Teacher Portal
          </button>
          <button 
            className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => onTabChange('leaderboard')}
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;