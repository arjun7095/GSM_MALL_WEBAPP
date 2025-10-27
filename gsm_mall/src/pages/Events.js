// src/pages/Events.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Events.css';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isEditing, setIsEditing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [tempEvents, setTempEvents] = useState([]);
  const [auth, setAuth] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [regData, setRegData] = useState({ name: '', email: '', phone: '' });
  const [feedbackData, setFeedbackData] = useState({ name: '', mobile: '', rating: 5, comment: '' });

  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://192.168.0.105:5000/api/events');
      setEvents(res.data || []);
      setTempEvents(JSON.parse(JSON.stringify(res.data || [])));
    } catch (e) {
      console.error(e);
    }
  };

  const classifyEvents = () => {
    const now = new Date();
    return {
      past: events.filter(e => new Date(e.dateTime) < now),
      today: events.filter(e => {
        const d = new Date(e.dateTime);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }),
      upcoming: events.filter(e => new Date(e.dateTime) > now && !isToday(e.dateTime))
    };
  };

  const isToday = (dateTime) => {
    const d = new Date(dateTime);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const isLive = (dateTime) => {
    const d = new Date(dateTime);
    const now = new Date();
    const diff = now - d;
    return diff >= 0 && diff < 6 * 60 * 60 * 1000; // within 6 hours
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleBack = () => {
    setSelectedEvent(null);
  };

  const openAuth = () => setShowAuth(true);
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://192.168.0.105:5000/api/pages/auth', auth);
      if (res.data.success) {
        setShowAuth(false);
        setIsEditing(true);
      } else setError('Invalid credentials');
    } catch (e) {
      setError('Auth failed');
    }
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await axios.put('http://192.168.0.105:5000/api/events', {
        username: auth.username,
        password: auth.password,
        events: tempEvents
      });
      await fetchEvents();
      setIsEditing(false);
      alert('Events saved!');
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    setTempEvents([...events]);
    setIsEditing(false);
  };

  const addEvent = () => {
    setTempEvents([...tempEvents, {
      name: 'New Event',
      dateTime: new Date().toISOString().slice(0, 16),
      description: '',
      poster: '',
      feedbacks: [],
      registrations: []
    }]);
  };

  const updateEvent = (index, field, value) => {
    const updated = [...tempEvents];
    updated[index][field] = value;
    setTempEvents(updated);
  };

  const deleteEvent = (index) => {
    setTempEvents(tempEvents.filter((_, i) => i !== index));
  };

  const handlePosterUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://192.168.0.105:5000/api/upload', formData);
      updateEvent(index, 'poster', res.data.url);
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://192.168.0.105:5000/api/events/${selectedEvent._id}/register`, regData);
      alert(`Registered: ${regData.name}`);
      setShowRegForm(false);
      setRegData({ name: '', email: '', phone: '' });
      await fetchEvents();
      setSelectedEvent(events.find(e => e._id === selectedEvent._id));
    } catch (err) {
      alert('Registration failed');
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://192.168.0.105:5000/api/events/feedback/${selectedEvent._id}`, {
        name: feedbackData.name,
        number: feedbackData.mobile,
        rating: feedbackData.rating,
        comment: feedbackData.comment
      });
      alert('Feedback submitted!');
      setShowFeedbackForm(false);
      setFeedbackData({ name: '', mobile: '', rating: 5, comment: '' });
      await fetchEvents();
      setSelectedEvent(events.find(e => e._id === selectedEvent._id));
    } catch (err) {
      alert('Feedback failed');
    }
  };

  const { past, today, upcoming } = classifyEvents();

  // ──────────────────────────────────────────────────────────────
  // ADMIN EDIT MODE – Shows Registrations + Feedbacks
  // ──────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <section className="events-hero">
        <div className="content-wrapper">
          <div className="edit-panel">
            <h2>Edit Events</h2>
            {tempEvents.map((ev, i) => (
              <div key={i} className="event-edit">
                <input
                  value={ev.name}
                  onChange={(e) => updateEvent(i, 'name', e.target.value)}
                  placeholder="Event Name"
                />
                <input
                  type="datetime-local"
                  value={ev.dateTime.slice(0, 16)}
                  onChange={(e) => updateEvent(i, 'dateTime', e.target.value)}
                />
                <textarea
                  value={ev.description}
                  onChange={(e) => updateEvent(i, 'description', e.target.value)}
                  placeholder="Description"
                />

                <div className="file-upload">
                  <label>Poster</label>
                  <input type="file" accept="image/*" onChange={(e) => handlePosterUpload(e, i)} />
                  {ev.poster && <img src={ev.poster} alt="poster" className="preview-img" />}
                </div>

                {/* REGISTRATIONS */}
                <div className="data-section">
                  <h4>Registrations ({ev.registrations?.length || 0})</h4>
                  {ev.registrations?.length > 0 ? (
                    <ul className="data-list">
                      {ev.registrations.map((r, ri) => (
                        <li key={ri}>
                          <strong>{r.name}</strong> | {r.email} | {r.phone}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-data">No registrations yet</p>
                  )}
                </div>

                {/* FEEDBACKS */}
                <div className="data-section">
                  <h4>Feedbacks ({ev.feedbacks?.length || 0})</h4>
                  {ev.feedbacks?.length > 0 ? (
                    <ul className="data-list">
                      {ev.feedbacks.map((f, fi) => (
                        <li key={fi}>
                          <strong>{f.name}</strong> ({f.number}) - {f.rating} stars<br />
                          <em>{f.comment}</em>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-data">No feedback yet</p>
                  )}
                </div>

                <button className="delete-btn" onClick={() => deleteEvent(i)}>
                  Delete Event
                </button>
              </div>
            ))}

            <button className="add-btn" onClick={addEvent}>+ Add Event</button>
            <div className="edit-actions">
              <button onClick={save} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={cancel}>Cancel</button>
            </div>
          </div>
        </div>

        {/* AUTH MODAL */}
        {showAuth && (
          <div className="auth-backdrop" onClick={() => setShowAuth(false)}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Admin Access</h2>
              <form onSubmit={handleAuth}>
                <input
                  type="text"
                  placeholder="Username"
                  value={auth.username}
                  onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={auth.password}
                  onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                  required
                />
                {error && <p className="auth-error">{error}</p>}
                <div className="auth-buttons">
                  <button type="submit">Login</button>
                  <button type="button" onClick={() => setShowAuth(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // EVENT DETAIL VIEW – PUBLIC (NO REGISTRATIONS)
  // ──────────────────────────────────────────────────────────────
  if (selectedEvent) {
    return (
      <section className="events-hero">
        <div className="content-wrapper">
          <button className="back-btn" onClick={handleBack}>
            Back
          </button>
          <div className="event-detail">
            {selectedEvent.poster && (
              <img
                src={selectedEvent.poster}
                alt={selectedEvent.name}
                className="poster-large"
              />
            )}
            <h2>{selectedEvent.name}</h2>
            <p className="detail-info">
              <FaCalendarAlt /> {new Date(selectedEvent.dateTime).toLocaleDateString()}
            </p>
            <p className="detail-info">
              <FaClock /> {new Date(selectedEvent.dateTime).toLocaleTimeString()}
            </p>
            <p className="detail-desc">{selectedEvent.description}</p>

            {/* REGISTRATION BUTTON */}
            {activeTab === 'upcoming' && (
              <button onClick={() => setShowRegForm(true)} className="reg-btn">
                Register Now
              </button>
            )}

            {/* FEEDBACK + QR (LIVE EVENT) */}
            {isLive(selectedEvent.dateTime) && (
              <>
                <button onClick={() => setShowFeedbackForm(true)} className="feedback-btn">
                  Give Feedback
                </button>

                <div className="qr-section">
                  <p><strong>Scan to give feedback:</strong></p>
                  <img
                    src={`http://192.168.0.105:5000/api/events/${selectedEvent._id}/qr?t=${Date.now()}`}
                    alt="Feedback QR Code"
                    className="qr-code-large"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `http://192.168.0.105:5000/api/events/${selectedEvent._id}/qr?t=${Date.now()}`;
                      link.download = `qr-${selectedEvent.name.replace(/\s+/g, '-')}.png`;
                      link.click();
                    }}
                    className="download-qr-btn"
                  >
                    Download QR
                  </button>
                </div>
              </>
            )}

            {/* FEEDBACKS ONLY (NO REGISTRATIONS IN PUBLIC VIEW) */}
            {selectedEvent.feedbacks?.length > 0 && (
              <div className="feedbacks-detail">
                <h3>Feedbacks</h3>
                {selectedEvent.feedbacks.map((f, fi) => (
                  <div key={fi} className="feedback-item-detail">
                    <p><strong>{f.name}</strong></p>
                    <p><strong>Ph.no: {f.number}</strong></p>
                    <p><strong>{f.rating} stars</strong></p>
                    <p>{f.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* REGISTRATION MODAL */}
        {showRegForm && (
          <div className="modal-backdrop" onClick={() => setShowRegForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Register for {selectedEvent.name}</h2>
              <form onSubmit={handleRegister}>
                <input
                  placeholder="Name"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  required
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  required
                />
                <input
                  placeholder="Phone"
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  required
                />
                <div className="modal-actions">
                  <button type="submit">Submit</button>
                  <button type="button" onClick={() => setShowRegForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FEEDBACK MODAL */}
        {showFeedbackForm && (
          <div className="modal-backdrop" onClick={() => setShowFeedbackForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Feedback for {selectedEvent.name}</h2>
              <form onSubmit={handleFeedback}>
                <input
                  placeholder="Name"
                  value={feedbackData.name}
                  onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                  required
                />
                <input
                  placeholder="Mobile Number"
                  value={feedbackData.mobile}
                  onChange={(e) => setFeedbackData({ ...feedbackData, mobile: e.target.value })}
                  required
                />
                <label>Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={feedbackData.rating}
                  onChange={(e) => setFeedbackData({ ...feedbackData, rating: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Your feedback"
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                  required
                />
                <div className="modal-actions">
                  <button type="submit">Submit</button>
                  <button type="button" onClick={() => setShowFeedbackForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // PUBLIC LIST VIEW
  // ──────────────────────────────────────────────────────────────
  return (
    <section className="events-hero">
      <div className="content-wrapper">
        <h1 className="events-title">EVENTS</h1>
        <div className="tabs">
          <button className={activeTab === 'upcoming' ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
          <button className={activeTab === 'today' ? 'active' : ''} onClick={() => setActiveTab('today')}>Today</button>
          <button className={activeTab === 'past' ? 'active' : ''} onClick={() => setActiveTab('past')}>Past</button>
        </div>

        <div className="events-grid">
          {(activeTab === 'upcoming' ? upcoming : activeTab === 'today' ? today : past).map((event, i) => (
            <div key={i} className="event-card" onClick={() => handleEventClick(event)}>
              {event.poster && <img src={event.poster} alt={event.name} className="poster" />}
              <h3>{event.name}</h3>
            </div>
          ))}
        </div>

        {/* Show Edit Button only on /admin/events */}
        {isAdmin && (
          <button className="edit-btn" onClick={openAuth}>Edit Events</button>
        )}
      </div>

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="auth-backdrop" onClick={() => setShowAuth(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Admin Access</h2>
            <form onSubmit={handleAuth}>
              <input type="text" placeholder="Username" value={auth.username} onChange={(e) => setAuth({ ...auth, username: e.target.value })} required />
              <input type="password" placeholder="Password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} required />
              {error && <p className="auth-error">{error}</p>}
              <div className="auth-buttons">
                <button type="submit">Login</button>
                <button type="button" onClick={() => setShowAuth(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Events;