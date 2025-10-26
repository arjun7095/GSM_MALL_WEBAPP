// src/pages/Services.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Services.css";

const Services = () => {
  const [data, setData] = useState({
    title: "OUR SERVICES",
    subtitle: "Everything your mall needs to thrive digitally",
    services: [
      { icon: "faChartLine", title: "Analytics Dashboard", desc: "Real-time footfall & sales insights" },
      { icon: "Megaphone", title: "Campaign Manager", desc: "Launch SMS, email & in-app promotions" },
      { icon: "Store", title: "Brand Collaboration", desc: "Connect retailers with joint offers" },
      { icon: "Calendar", title: "Event Promotion", desc: "Boost festivals, sales & pop-ups" },
    ],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [temp, setTemp] = useState(data);
  const [auth, setAuth] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const location = useLocation();
  const isAdmin = location.pathname.includes("/admin");

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch Services
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://192.168.1.31:5000/api/pages/services");
      if (res.data) {
        setData(res.data);
        setTemp(res.data);
      }
    } catch (e) {
      console.error("Services fetch failed:", e);
    }
  };

  // Auth
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

  // Save
  const save = async () => {
    if (!isAuthenticated) {
      alert("Session expired – please re-login");
      setIsEditing(false);
      return;
    }
    try {
      const res = await axios.put("http://192.168.1.31:5000/api/pages/services", {
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

  const updateService = (index, field, value) => {
    const updated = [...temp.services];
    updated[index][field] = value;
    setTemp({ ...temp, services: updated });
  };

  return (
    <section className="services-hero">
      <div className="services-hero__content">
        <div className="content-wrapper">
          {isEditing ? (
            <div className="edit-panel">
              <input
                value={temp.title}
                onChange={(e) => setTemp({ ...temp, title: e.target.value })}
                placeholder="Main Title"
              />
              <input
                value={temp.subtitle}
                onChange={(e) => setTemp({ ...temp, subtitle: e.target.value })}
                placeholder="Subtitle"
              />

              <h3 style={{ margin: "1.5rem 0 1rem" }}>Services</h3>
              {temp.services.map((srv, i) => (
                <div key={i} className="service-edit">
                  <input
                    value={srv.icon}
                    onChange={(e) => updateService(i, "icon", e.target.value)}
                    placeholder="Icon (e.g., ChartLine)"
                  />
                  <input
                    value={srv.title}
                    onChange={(e) => updateService(i, "title", e.target.value)}
                    placeholder="Service Title"
                  />
                  <textarea
                    rows={2}
                    value={srv.desc}
                    onChange={(e) => updateService(i, "desc", e.target.value)}
                    placeholder="Description"
                  />
                </div>
              ))}

              <div className="edit-actions">
                <button onClick={save} className="save-btn">Save All</button>
                <button onClick={cancel} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="services-title">{data.title}</h1>
              <p className="services-subtitle">{data.subtitle}</p>
              <div className="services-grid">
                {data.services.map((srv, i) => (
                  <div key={i} className="service-card">
                    <div className="icon-wrapper">
                      <i className={`icon-${srv.icon.toLowerCase()}`}></i>
                    </div>
                    <h3>{srv.title}</h3>
                    <p>{srv.desc}</p>
                  </div>
                ))}
              </div>

              {isAdmin && (
                <button className="edit-btn" onClick={openAuth}>
                  Edit Services
                </button>
              )}
            </>
          )}
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

export default Services;