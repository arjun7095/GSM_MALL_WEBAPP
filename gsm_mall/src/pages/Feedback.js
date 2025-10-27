// src/pages/Feedback.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Feedback.css';

const Feedback = () => {
  const { id } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://192.168.0.105:5000/api/events/feedback/${id}`, { rating, comment });
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  if (submitted) {
    return (
      <div className="feedback-success">
        <h2>Thank You!</h2>
        <p>Your feedback has been submitted.</p>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <h2>Event Feedback</h2>
      <form onSubmit={handleSubmit}>
        <label>Rating (1-5)</label>
        <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} required />
        
        <label>Your Feedback</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." required />

        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  );
};

export default Feedback;