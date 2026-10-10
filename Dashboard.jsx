
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  MapPin,
  Package,
  HeartPulse,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Droplets,
  Utensils,
  Pill,
  House,
  Truck,
  Boxes,
  ArrowUpRight,
  HandHeart,
  Activity,
  Phone,
  CheckCircle2,
  AlertCircle,
  Menu,
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api/resources";

const categories = [
  "Food",
  "Water",
  "Medicine",
  "Blood",
  "Shelter",
  "Rescue",
  "Other",
];

const initialForm = {
  name: "",
  category: "Food",
  quantity: 1,
  location: "",
  owner: "",
  phone: "",
  available: true,
};

const categoryIcons = {
  Food: Utensils,
  Water: Droplets,
  Medicine: Pill,
  Blood: HeartPulse,
  Shelter: House,
  Rescue: Truck,
  Other: Boxes,
};

function App() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  async function loadResources() {
    setLoading(true);

    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Unable to load resources.");

      const data = await response.json();
      setResources(data);
      setError("");
    } catch {
      setError(
        "Cannot connect to the backend. Check that MongoDB and the backend server are running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, []);

  const stats = useMemo(() => {
    const available = resources.filter((item) => item.available).length;
    const unavailable = resources.length - available;
    const quantity = resources.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    return {
      total: resources.length,
      available,
      unavailable,
      quantity,
    };
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const text =
        `${item.name} ${item.location} ${item.owner} ${item.category}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || item.category === category;
      const matchesAvailability =
        availability === "All" ||
        (availability === "Available" && item.available) ||
        (availability === "Unavailable" && !item.available);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [resources, search, category, availability]);

  function updateField(event) {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : name === "quantity"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
  }

  function openAddForm() {
    setForm({ ...initialForm });
    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEditForm(resource) {
    setForm({
      name: resource.name,
      category: resource.category,
      quantity: resource.quantity,
      location: resource.location,
      owner: resource.owner,
      phone: resource.phone,
      available: resource.available,
    });
    setEditingId(resource._id);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitResource(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save resource.");
      }

      setForm({ ...initialForm });
      setEditingId(null);
      setShowForm(false);
      setSuccess(
        editingId
          ? "Resource updated successfully."
          : "Resource added successfully."
      );

      await loadResources();
    } catch (err) {
      setError(err.message || "Unable to save resource.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(resource) {
    const confirmed = window.confirm(
      `Delete "${resource.name}" from the resource directory?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/${resource._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete resource.");
      }

      setSuccess("Resource deleted successfully.");
      await loadResources();
    } catch (err) {
      setError(err.message || "Unable to delete resource.");
    }
  }

  function scrollToResources() {
    document.getElementById("resources")?.scrollIntoView({
      behavior: "smooth",
    });
    setMobileMenu(false);
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a href="#" className="brand" aria-label="ResQLink home">
          <span className="brand-mark">
            <ShieldCheck size={24} strokeWidth={2.4} />
          </span>
          <span>
            <strong>ResQLink</strong>
            <small>COMMUNITY RESPONSE NETWORK</small>
          </span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenu((value) => !value)}
          aria-label="Toggle navigation"
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>

        <nav className={mobileMenu ? "nav-links nav-open" : "nav-links"}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Overview
          </button>
          <button onClick={scrollToResources}>Resources</button>
          <button onClick={openAddForm}>Share Help</button>
          <a href="https://112.gov.in/" target="_blank" rel="noreferrer">
            Emergency Help <ArrowUpRight size={14} />
          </a>
        </nav>

        <div className="network-status">
          <span className="live-dot" />
          Community Network
        </div>
      </header>

      <main className="main-content">
        <motion.section
          className="hero"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              EMERGENCY RESOURCE COORDINATION
            </div>

            <h1>
              When every minute
              <br />
              <span>matters,</span> we connect.
            </h1>

            <p>
              A community-powered network connecting essential supplies and
              available support to people who need help during emergencies.
            </p>

            <div className="hero-actions">
              <motion.button
                className="button-primary"
                whileHover={{ y: -3, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToResources}
              >
                <Search size={17} />
                Find Resources
              </motion.button>

              <motion.button
                className="button-outline"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={openAddForm}
              >
                <HandHeart size={17} />
                Share Resources
              </motion.button>
            </div>

            <div className="hero-trust">
              <ShieldCheck size={17} />
              <span>Community-shared resource directory</span>
              <span className="trust-divider" />
              <Activity size={17} />
              <span>Live database updates</span>
            </div>
          </div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />

            <motion.div
              className="visual-core"
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="core-icon">
                <ShieldCheck size={47} strokeWidth={1.5} />
              </div>
              <strong>ResQLink</strong>
              <span>HELP. CONNECT. RECOVER.</span>
            </motion.div>

            <motion.div
              className="float-card float-card-top"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="float-icon teal-icon">
                <Package size={18} />
              </span>
              <span>
                <strong>{stats.total} listings</strong>
                <small>Resources shared</small>
              </span>
            </motion.div>

            <motion.div
              className="float-card float-card-bottom"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <span className="float-icon green-icon">
                <HeartPulse size={18} />
              </span>
              <span>
                <strong>{stats.available} available</strong>
                <small>Marked as available</small>
              </span>
            </motion.div>

            <span className="orbit-point point-one" />
            <span className="orbit-point point-two" />
            <span className="orbit-point point-three" />
          </motion.div>

          <div className="hero-index">
            <span>01</span>
            <div />
            <span>COMMUNITY RESILIENCE</span>
          </div>
        </motion.section>

        <section className="stats-grid" aria-label="Resource statistics">
          {[
            {
              label: "Total Listings",
              value: stats.total,
              note: "Registered resources",
              icon: Package,
              color: "teal",
            },
            {
              label: "Available Now",
              value: stats.available,
              note: "Marked as available",
              icon: CheckCircle2,
              color: "green",
            },
            {
              label: "Total Quantity",
              value: stats.quantity,
              note: "Across all listings",
              icon: Boxes,
              color: "blue",
            },
            {
              label: "Unavailable",
              value: stats.unavailable,
              note: "Needs status review",
              icon: AlertCircle,
              color: "amber",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.article
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 * index, duration: 0.45 }}
                whileHover={{ y: -5 }}
              >
                <div className="stat-card-top">
                  <span>{stat.label}</span>
                  <span className={`stat-icon ${stat.color}`}>
                    <Icon size={19} />
                  </span>
                </div>
                <motion.strong
                  key={stat.value}
                  initial={{ opacity: 0.45, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="stat-value"
                >
                  {stat.value.toLocaleString()}
                </motion.strong>
                <small>{stat.note}</small>
                <div className={`stat-accent ${stat.color}`} />
              </motion.article>
            );
          })}
        </section>

        <section className="workspace" id="resources">
          <div className="workspace-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                RESOURCE OPERATIONS
              </div>
              <h2>Community <span>Resource Hub</span></h2>
              <p>Discover available support shared by your community.</p>
            </div>

            <motion.button
              className="button-primary add-button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={openAddForm}
            >
              <Plus size={18} />
              Add Resource
            </motion.button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.section
                className="resource-form-panel"
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-panel-heading">
                  <div>
                    <span className="eyebrow">
                      {editingId ? "EDIT RECORD" : "NEW CONTRIBUTION"}
                    </span>
                    <h3>{editingId ? "Update Resource" : "Share a Resource"}</h3>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setForm({ ...initialForm });
                    }}
                    aria-label="Close resource form"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form className="resource-form" onSubmit={submitResource}>
                  <label>
                    Resource Name *
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      placeholder="e.g. Drinking Water"
                      required
                    />
                  </label>

                  <label>
                    Category *
                    <select
                      name="category"
                      value={form.category}
                      onChange={updateField}
                      required
                    >
                      {categories.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Quantity *
                    <input
                      name="quantity"
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={updateField}
                      required
                    />
                  </label>

                  <label>
                    Location *
                    <input
                      name="location"
                      value={form.location}
                      onChange={updateField}
                      placeholder="City or locality"
                      required
                    />
                  </label>

                  <label>
                    Provider / Organization *
                    <input
                      name="owner"
                      value={form.owner}
                      onChange={updateField}
                      placeholder="Provider name"
                      required
                    />
                  </label>

                  <label>
                    Contact Number *
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={updateField}
                      placeholder="Contact number"
                      required
                    />
                  </label>

                  <label className="availability-checkbox">
                    <input
                      type="checkbox"
                      name="available"
                      checked={form.available}
                      onChange={updateField}
                    />
                    Currently available
                  </label>

                  <div className="form-actions">
                    <button
                      className="button-primary"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : editingId ? "Save Changes" : "Publish Resource"}
                    </button>
                    <button
                      className="button-outline"
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setForm({ ...initialForm });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(error || success) && (
              <motion.div
                className={error ? "notice notice-error" : "notice notice-success"}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
              >
                {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span>{error || success}</span>
                <button
                  className="notice-close"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                  }}
                  aria-label="Dismiss message"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="filter-panel">
            <div className="search-box">
              <Search size={19} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search resources, locations, providers..."
                aria-label="Search resources"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              className="filter-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              aria-label="Filter by availability"
            >
              <option value="All">Any Status</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>

            <button
              className="icon-button refresh-button"
              onClick={loadResources}
              disabled={loading}
              aria-label="Refresh resources"
              title="Refresh resources"
            >
              <RefreshCw size={18} className={loading ? "spin" : ""} />
            </button>
          </div>

          <div className="results-bar">
            <span>
              Showing <strong>{filteredResources.length}</strong> of{" "}
              <strong>{resources.length}</strong> listings
            </span>
            <span className="results-live">
              <span className="live-dot" /> Database connected when online
            </span>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={25} className="spin" />
              <p>Loading community resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="empty-icon">
                <Package size={30} />
              </span>
              <h3>
                {resources.length === 0
                  ? "Your resource network starts here"
                  : "No matching resources"}
              </h3>
              <p>
                {resources.length === 0
                  ? "Add the first resource to help your community find support."
                  : "Try another search term or adjust your filters."}
              </p>
              {resources.length === 0 && (
                <button className="button-primary" onClick={openAddForm}>
                  <Plus size={17} /> Add First Resource
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div layout className="resource-grid">
              <AnimatePresence mode="popLayout">
                {filteredResources.map((resource, index) => {
                  const Icon = categoryIcons[resource.category] || Boxes;

                  return (
                    <motion.article
                      layout
                      key={resource._id}
                      className="resource-card"
                      initial={{ opacity: 0, y: 18, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{
                        duration: 0.28,
                        delay: Math.min(index * 0.035, 0.2),
                      }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="resource-card-top">
                        <span className="resource-category-icon">
                          <Icon size={21} />
                        </span>
                        <span
                          className={
                            resource.available
                              ? "status-pill status-available"
                              : "status-pill status-unavailable"
                          }
                        >
                          <span />
                          {resource.available ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <span className="resource-category-label">
                        {resource.category}
                      </span>
                      <h3>{resource.name}</h3>

                      <div className="resource-info">
                        <div>
                          <MapPin size={16} />
                          <span>{resource.location}</span>
                        </div>
                        <div>
                          <Package size={16} />
                          <span>Quantity: {resource.quantity}</span>
                        </div>
                        <div>
                          <HandHeart size={16} />
                          <span>{resource.owner}</span>
                        </div>
                        <div>
                          <Phone size={15} />
                          <span>{resource.phone}</span>
                        </div>
                      </div>

                      <div className="resource-card-footer">
                        <span className="record-label">
                          <ShieldCheck size={14} /> Resource record
                        </span>
                        <div className="resource-actions">
                          <button
                            className="icon-button"
                            onClick={() => openEditForm(resource)}
                            aria-label={`Edit ${resource.name}`}
                            title="Edit resource"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button delete-icon-button"
                            onClick={() => deleteResource(resource)}
                            aria-label={`Delete ${resource.name}`}
                            title="Delete resource"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        <section className="contribution-banner">
          <div className="banner-icon">
            <HandHeart size={29} />
          </div>
          <div>
            <span>STRONGER TOGETHER</span>
            <h3>Small contributions. Meaningful impact.</h3>
            <p>
              Share resources responsibly and help communities prepare for
              difficult moments.
            </p>
          </div>
          <button className="button-primary" onClick={openAddForm}>
            Contribute <ArrowUpRight size={17} />
          </button>
        </section>
      </main>

      <footer className="footer">
        <a href="#" className="footer-brand">
          <ShieldCheck size={21} /> ResQLink
        </a>
        <p>Connecting resources. Supporting communities.</p>
        <a href="https://112.gov.in/" target="_blank" rel="noreferrer">
          Emergency in India? Call 112
        </a>
        <small>
          Resource availability is community-reported. Verify details before
          travelling. This prototype does not replace official emergency
          services.
        </small>
      </footer>
    </div>
  );
}

export default App;
