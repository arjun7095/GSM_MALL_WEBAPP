// src/pages/Explore.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Explore.css';
import { 
  FaShoppingBag, FaUtensils, FaGem, FaWineGlass, 
  FaFilm, FaGamepad, FaTshirt
} from 'react-icons/fa';

const Explore = () => {
  const [view, setView] = useState('categories'); // 'categories', 'stores', 'store-detail'
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [tempData, setTempData] = useState({ categories: [], stores: [] });
  const [auth, setAuth] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin');

  const categoryMap = {
    Apparels: <FaTshirt />,
    'Food Court': <FaUtensils />,
    Jewellery: <FaGem />,
    'Restaurant & Bar': <FaWineGlass />,
    'Movies & Entertainments': <FaFilm />,
    'Game Zone': <FaGamepad />,
    'Fashion Stores': <FaShoppingBag />,
    Banquets: <FaUtensils />
  };

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, storeRes] = await Promise.all([
        axios.get('http://192.168.1.31:5000/api/explore/categories'),
        axios.get('http://192.168.1.31:5000/api/explore/stores')
      ]);
      const cats = catRes.data || [];
      const strs = storeRes.data || [];
      setCategories(cats);
      setStores(strs);
      setTempData({ categories: JSON.parse(JSON.stringify(cats)), stores: JSON.parse(JSON.stringify(strs)) });
    } catch (e) {
      console.error('Fetch failed:', e);
    }
  };

  // Category click
  const handleCategoryClick = (category) => {
    const filtered = stores.filter(s => s.category === category.name);
    setStores(filtered);
    setView('stores');
  };

  // Store click
  const handleStoreClick = (store) => {
    setSelectedStore(store);
    setView('store-detail');
  };

  // Auth
  const openAuth = () => {
    setShowAuth(true);
    setError('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://192.168.1.31:5000/api/pages/auth', auth);
      if (res.data.success) {
        setShowAuth(false);
        setIsEditing(true);
        setError('');
      } else {
        setError('Invalid credentials');
      }
    } catch (e) {
      setError('Authentication failed');
    }
  };

  // Save
  const save = async () => {
    setIsSaving(true);
    try {
      await axios.put('http://192.168.1.31:5000/api/explore', {
        username: auth.username,
        password: auth.password,
        categories: tempData.categories,
        stores: tempData.stores
      });
      await fetchData();
      setIsEditing(false);
      alert('All changes saved successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      alert('Save failed: ' + msg);
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    setTempData({ categories: [...categories], stores: [...stores] });
    setIsEditing(false);
  };

  /// === EDIT MODE (with file upload) ===
if (isEditing) {
  const handleFileUpload = async (e, storeIndex, mediaIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://192.168.1.31:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updated = [...tempData.stores];
      if (mediaIndex !== null) {
        updated[storeIndex].media[mediaIndex].url = res.data.url;
      } else {
        updated[storeIndex].image = res.data.url;
      }
      setTempData({ ...tempData, stores: updated });
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <section className="explore-hero">
      <div className="content-wrapper">
        <div className="edit-panel">
          <h2 className="edit-title">Edit Explore Data</h2>

          {/* CATEGORIES */}
          <div className="edit-section">
            <h3>Categories</h3>
            {tempData.categories.map((cat, i) => (
              <div key={i} className="edit-item">
                <input
                  value={cat.name}
                  onChange={(e) => {
                    const updated = [...tempData.categories];
                    updated[i].name = e.target.value;
                    setTempData({ ...tempData, categories: updated });
                  }}
                  placeholder="Category Name"
                />
                <button
                  className="delete-btn"
                  onClick={() => {
                    const updated = tempData.categories.filter((_, idx) => idx !== i);
                    setTempData({ ...tempData, categories: updated });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="add-btn"
              onClick={() => {
                setTempData({
                  ...tempData,
                  categories: [...tempData.categories, { name: "New Category" }]
                });
              }}
            >
              + Add Category
            </button>
          </div>

          {/* STORES */}
          <div className="edit-section">
            <h3>Stores</h3>
            {tempData.stores.map((store, i) => (
              <div key={i} className="edit-store">
                <div className="store-header">
                  <input
                    value={store.name}
                    onChange={(e) => {
                      const updated = [...tempData.stores];
                      updated[i].name = e.target.value;
                      setTempData({ ...tempData, stores: updated });
                    }}
                    placeholder="Store Name"
                  />
                  <select
                    value={store.category}
                    onChange={(e) => {
                      const updated = [...tempData.stores];
                      updated[i].category = e.target.value;
                      setTempData({ ...tempData, stores: updated });
                    }}
                  >
                    <option value="">Select Category</option>
                    {tempData.categories.map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      const updated = tempData.stores.filter((_, idx) => idx !== i);
                      setTempData({ ...tempData, stores: updated });
                    }}
                  >
                    Remove
                  </button>
                </div>

                <input
                  value={store.description || ""}
                  onChange={(e) => {
                    const updated = [...tempData.stores];
                    updated[i].description = e.target.value;
                    setTempData({ ...tempData, stores: updated });
                  }}
                  placeholder="Short description"
                />

                {/* Store Image Upload */}
                <div className="file-upload">
                  <label>Store Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, i)}
                  />
                  {store.image && (
                    <img src={store.image} alt="preview" className="preview-img" />
                  )}
                </div>

                {/* Media */}
                <div className="media-list">
                  <h4>Media</h4>
                  {store.media?.map((m, mi) => (
                    <div key={mi} className="media-item-edit">
                      <select
                        value={m.type}
                        onChange={(e) => {
                          const updated = [...tempData.stores];
                          updated[i].media[mi].type = e.target.value;
                          setTempData({ ...tempData, stores: updated });
                        }}
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                      <input
                        type="file"
                        accept={m.type === 'video' ? 'video/*' : 'image/*'}
                        onChange={(e) => handleFileUpload(e, i, mi)}
                      />
                      {m.url && (
                        m.type === 'video' ? (
                          <video src={m.url} controls className="preview-media" />
                        ) : (
                          <img src={m.url} alt="preview" className="preview-media" />
                        )
                      )}
                      <button
                        className="delete-btn small"
                        onClick={() => {
                          const updated = [...tempData.stores];
                          updated[i].media = updated[i].media.filter((_, idx) => idx !== mi);
                          setTempData({ ...tempData, stores: updated });
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    className="add-btn small"
                    onClick={() => {
                      const updated = [...tempData.stores];
                      if (!updated[i].media) updated[i].media = [];
                      updated[i].media.push({ type: "image", url: "" });
                      setTempData({ ...tempData, stores: updated });
                    }}
                  >
                    + Add Media
                  </button>
                </div>

                {/* Offers */}
                <div className="offers-list">
                  <h4>Offers</h4>
                  {store.offers?.map((o, oi) => (
                    <div key={oi} className="offer-item-edit">
                      <input
                        value={o.title}
                        onChange={(e) => {
                          const updated = [...tempData.stores];
                          updated[i].offers[oi].title = e.target.value;
                          setTempData({ ...tempData, stores: updated });
                        }}
                        placeholder="Offer Title"
                      />
                      <textarea
                        rows={2}
                        value={o.description}
                        onChange={(e) => {
                          const updated = [...tempData.stores];
                          updated[i].offers[oi].description = e.target.value;
                          setTempData({ ...tempData, stores: updated });
                        }}
                        placeholder="Offer Description"
                      />
                      <button
                        className="delete-btn small"
                        onClick={() => {
                          const updated = [...tempData.stores];
                          updated[i].offers = updated[i].offers.filter((_, idx) => idx !== oi);
                          setTempData({ ...tempData, stores: updated });
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    className="add-btn small"
                    onClick={() => {
                      const updated = [...tempData.stores];
                      if (!updated[i].offers) updated[i].offers = [];
                      updated[i].offers.push({ title: "", description: "" });
                      setTempData({ ...tempData, stores: updated });
                    }}
                  >
                    + Add Offer
                  </button>
                </div>
              </div>
            ))}
            <button
              className="add-btn"
              onClick={() => {
                setTempData({
                  ...tempData,
                  stores: [...tempData.stores, {
                    name: "New Store",
                    category: "",
                    description: "",
                    image: "",
                    media: [],
                    offers: []
                  }]
                });
              }}
            >
              + Add Store
            </button>
          </div>

          {/* SAVE / CANCEL */}
          <div className="edit-actions">
            <button onClick={save} className="save-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button onClick={cancel} className="cancel-btn">Cancel</button>
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
}

  // === NORMAL VIEW ===
  return (
    <section className="explore-hero">
      <div className="content-wrapper">
        {view === 'categories' && (
          <>
            <h1 className="explore-title">EXPLORE</h1>
            <p className="explore-subtitle">Discover our mall's vibrant stores</p>
            <div className="category-grid">
              {categories.map((cat, i) => (
                <div key={i} className="category-card" onClick={() => handleCategoryClick(cat)}>
                  <div className="card-icon">{categoryMap[cat.name] || <FaShoppingBag />}</div>
                  <h3>{cat.name}</h3>
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'stores' && (
          <>
            <button className="back-btn" onClick={() => { setView('categories'); fetchData(); }}>
              Back to Categories
            </button>
            <h2 className="stores-title">Stores</h2>
            <div className="store-grid">
              {stores.length === 0 ? (
                <p>No stores in this category.</p>
              ) : (
                stores.map((store, i) => (
                  <div key={i} className="store-card" onClick={() => handleStoreClick(store)}>
                    <img src={store.image || '/placeholder.jpg'} alt={store.name} />
                    <h3>{store.name}</h3>
                    <p>{store.description}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {view === 'store-detail' && selectedStore && (
          <>
            <button className="back-btn" onClick={() => setView('stores')}>
              Back to Stores
            </button>
            <div className="store-detail">
              <h2>{selectedStore.name}</h2>
              <div className="media-grid">
                {selectedStore.media?.length > 0 ? (
                  selectedStore.media.map((item, i) => (
                    <div key={i} className="media-item">
                      {item.type === 'video' ? (
                        <video src={item.url} controls />
                      ) : (
                        <img src={item.url} alt="Store media" />
                      )}
                    </div>
                  ))
                ) : (
                  <p>No media available.</p>
                )}
              </div>
              <div className="offers">
                <h3>Offers</h3>
                {selectedStore.offers?.length > 0 ? (
                  selectedStore.offers.map((offer, i) => (
                    <div key={i} className="offer-card">
                      <h4>{offer.title}</h4>
                      <p>{offer.description}</p>
                    </div>
                  ))
                ) : (
                  <p>No offers available.</p>
                )}
              </div>
            </div>
          </>
        )}

        {isAdmin && view === 'categories' && (
          <button className="edit-btn" onClick={openAuth}>Edit Explore</button>
        )}
      </div>

      {/* AUTH MODAL (duplicate for normal view) */}
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

export default Explore;