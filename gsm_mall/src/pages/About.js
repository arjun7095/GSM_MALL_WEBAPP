// src/pages/About.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './About.css';

const About = () => {
  const [data, setData] = useState({ content: 'Loading...' });
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tempContent, setTempContent] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const location = useLocation();
  const isAdminRoute = location.pathname.includes('/admin');

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch About Content
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://192.168.0.105:5000/api/pages/about');
      setData(res.data);
      setTempContent(res.data.content || '');
    } catch (err) {
      console.error('Fetch failed:', err);
      setData({ content: 'Failed to load content.' });
    }
  };

  // Auth Modal
  const handleEditClick = () => {
    setShowAuthModal(true);
    setError('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://192.168.0.105:5000/api/pages/auth', { username, password });
      if (res.data.success) {
        setShowAuthModal(false);
        setIsAuthenticated(true);
        setIsEditing(true);
        setError('');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Authentication failed');
    }
  };

  // Save Content
  const handleSave = async () => {
    if (!isAuthenticated) {
      alert('Session expired. Please re-authenticate.');
      setIsEditing(false);
      return;
    }

    try {
      const res = await axios.put('http://192.168.0.105:5000/api/pages/about', {
        username,
        password,
        content: tempContent
      });
      setData(res.data);
      setIsEditing(false);
      setIsAuthenticated(false); // Force re-auth next time
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    setTempContent(data.content);
    setIsEditing(false);
    setIsAuthenticated(false);
  };

  return (
    <section className="about-hero">

      <div className="about-hero__content">
        <div className="about_content-wrapper">
          {isEditing ? (
            <div className="edit-panel">
              <textarea
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                placeholder="Edit About Us content..."
                rows={12}
              />
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn">Save</button>
                <button onClick={handleCancel} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="about-title">ABOUT US</h1>
              <div className="title-underline" />
              <div
                className="about-text"
                dangerouslySetInnerHTML={{ __html: data.content.replace(/\n/g, '<br>') }}
              />

              {isAdminRoute && (
                <button className="edit-btn" onClick={handleEditClick}>
                  Edit Content
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="auth-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Admin Access</h2>
            <form onSubmit={handleAuthSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="auth-error">{error}</p>}
              <div className="auth-buttons">
                <button type="submit">Login</button>
                <button type="button" onClick={() => setShowAuthModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default About;