// src/pages/Contact.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Contact.css";

const Contact = () => {
  const [data, setData] = useState({
    address: "Loading...",
    phone: "",
    email: "",
    mapEmbed: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [temp, setTemp] = useState({ address: "", phone: "", email: "", mapEmbed: "" });
  const [auth, setAuth] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const location = useLocation();
  const isAdmin = location.pathname.includes("/admin");

  // -----------------------------------------------------------------
  // FETCH
  // -----------------------------------------------------------------
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://192.168.1.31:5000/api/pages/contact");
      setData(res.data);
      setTemp(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // -----------------------------------------------------------------
  // AUTH
  // -----------------------------------------------------------------
  const openAuth = () => {
    setShowAuth(true);
    setError("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://192.168.1.31:5000/api/pages/auth", auth);
      if (res.data.success) {
        setShowAuth(false);
        setIsAuthenticated(true);
        setIsEditing(true);
        setError("");
      } else setError("Invalid credentials");
    } catch (e) {
      setError("Auth failed");
    }
  };

  // -----------------------------------------------------------------
  // SAVE
  // -----------------------------------------------------------------
  const save = async () => {
    if (!isAuthenticated) {
      alert("Session expired – please re-login");
      setIsEditing(false);
      return;
    }
    try {
      const res = await axios.put("http://192.168.1.31:5000/api/pages/contact", {
        username: auth.username,
        password: auth.password,
        ...temp,
      });
      setData(res.data);
      setIsEditing(false);
      setIsAuthenticated(false);
    } catch (e) {
      alert("Save error: " + (e.response?.data?.message || e.message));
    }
  };

  const cancel = () => {
    setTemp(data);
    setIsEditing(false);
    setIsAuthenticated(false);
  };

  // -----------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------
  return (
    <section className="contact-hero">
      {/* LEFT – ADDRESS */}
      <div className="contact-hero__left">
        <div className="contact-card">
          {isEditing ? (
            <div className="edit-panel">
              <label>Address</label>
              <textarea
                rows={4}
                value={temp.address}
                onChange={(e) => setTemp({ ...temp, address: e.target.value })}
              />
              <label>Phone</label>
              <input
                value={temp.phone}
                onChange={(e) => setTemp({ ...temp, phone: e.target.value })}
              />
              <label>Email</label>
              <input
                value={temp.email}
                onChange={(e) => setTemp({ ...temp, email: e.target.value })}
              />
              <div className="edit-actions">
                <button onClick={save} className="save-btn">Save</button>
                <button onClick={cancel} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="contact-title">CONTACT US</h1>
              <div className="contact-underline" />
              <p className="contact-item"><strong>Address:</strong> {data.address}</p>
              <p className="contact-item"><strong>Phone:</strong> {data.phone}</p>
              <p className="contact-item"><strong>Email:</strong> <a href={`mailto:${data.email}`}>{data.email}</a></p>

              {isAdmin && (
                <button className="edit-btn" onClick={openAuth}>
                  Edit Contact
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT – MAP */}
      <div className="contact-hero__right">
        {isEditing ? (
          <div className="edit-panel map-edit">
            <label>Map Embed (iframe code)</label>
            <textarea
              rows={6}
              value={temp.mapEmbed}
              onChange={(e) => setTemp({ ...temp, mapEmbed: e.target.value })}
            />
          </div>
        ) : (
          <div
            className="map-container"
            dangerouslySetInnerHTML={{ __html: data.mapEmbed }}
          />
        )}
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
                autoFocus
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
                <button type="button" onClick={() => setShowAuth(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Contact;