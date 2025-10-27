// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Explore from './pages/Explore';
import Events from './pages/Events';
import Feedback from './pages/Feedback';
// Other pages...

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<div> Welcome home</div>} /> {/* Assume you have Home */}
            <Route path="/about" element={<About />} />
            <Route path="/admin/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/admin/services" element={<Services />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/admin/explore" element={<Explore />} />
            <Route path="/events" element={<Events />} />
            <Route path="/admin/events" element={<Events />} />
            <Route path="/events/feedback/:id" element={<Feedback />} />
            {/* Add more routes */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;