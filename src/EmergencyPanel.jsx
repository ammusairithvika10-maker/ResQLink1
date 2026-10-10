import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ClipboardList,
  MapPin,
  Package,
  RefreshCw,
  Send,
  CheckCircle,
} from "lucide-react";

import "./Auth.css";

const API = "http://localhost:5000/api/emergency-requests";

const initialForm = {
  title: "",
  category: "Water",
  description: "",
  quantity: 1,
  location: "",
  phone: "",
  priority: "Normal",
};

export default function EmergencyPanel() {
  const [user] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("resqlinkUser") || "null");
    } catch {
      return null;
    }
  });

  const isProvider = user?.role === "provider";
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function apiRequest(path = "", options = {}) {
    const token = sessionStorage.getItem("resqlinkToken");

    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  async function loadRequests() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function submitRequest(event) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setError("");

    try {
      await apiRequest("", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
        }),
      });

      setMessage("Emergency request submitted successfully!");
      setForm(initialForm);
      await loadRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(requestId, action) {
    setBusyId(requestId);
    setMessage("");
    setError("");

    try {
      const data = await apiRequest(`/${requestId}/${action}`, {
        method: "PATCH",
      });

      setMessage(data.message || "Request updated successfully");
      await loadRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  const statusClass = (status) =>
    `request-status status-${status?.toLowerCase()}`;

  return (
    <section className="emergency-panel">
      <div className="emergency-heading">
        <div>
          <p className="emergency-eyebrow">RESQLINK RESPONSE NETWORK</p>
          <h2>{isProvider ? "Provider Dashboard" : "Emergency Requests"}</h2>
          <p className="emergency-muted">
            {isProvider
              ? "Review emergency needs and coordinate available resources."
              : "Request essential resources and track your requests."}
          </p>
        </div>

        <button
          type="button"
          className="emergency-refresh"
          onClick={loadRequests}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {message && (
        <p className="emergency-success" role="status">{message}</p>
      )}

      {error && (
        <p className="emergency-error" role="alert">{error}</p>
      )}

      <div className="emergency-layout">
        {!isProvider && (
          <motion.form
            className="emergency-form"
            onSubmit={submitRequest}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="emergency-card-heading">
              <AlertTriangle size={20} />
              <h3>Raise a Request</h3>
            </div>

            <label htmlFor="request-title">Request title</label>
            <input
              id="request-title"
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="e.g. Drinking water needed"
              maxLength={100}
              required
            />

            <label htmlFor="request-category">Resource category</label>
            <select
              id="request-category"
              name="category"
              value={form.category}
              onChange={updateField}
              required
            >
              {["Food", "Water", "Medicine", "Blood", "Shelter", "Rescue", "Other"].map(
                (category) => (
                  <option key={category} value={category}>{category}</option>
                )
              )}
            </select>

            <label htmlFor="request-description">Describe the emergency</label>
            <textarea
              id="request-description"
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Explain what is needed..."
              maxLength={1000}
              rows={3}
              required
            />

            <div className="emergency-form-row">
              <div>
                <label htmlFor="request-quantity">Quantity</label>
                <input
                  id="request-quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={updateField}
                  required
                />
              </div>

              <div>
                <label htmlFor="request-priority">Priority</label>
                <select
                  id="request-priority"
                  name="priority"
                  value={form.priority}
                  onChange={updateField}
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <label htmlFor="request-location">
              <MapPin size={14} /> Location
            </label>
            <input
              id="request-location"
              name="location"
              value={form.location}
              onChange={updateField}
              placeholder="Area, city"
              required
            />

            <label htmlFor="request-phone">Contact phone</label>
            <input
              id="request-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              placeholder="Your contact number"
              required
            />

            <button
              className="emergency-submit"
              type="submit"
              disabled={sending}
            >
              <Send size={16} />
              {sending ? "Submitting..." : "Submit Emergency Request"}
            </button>
          </motion.form>
        )}

        <div className="emergency-list">
          <div className="emergency-card-heading">
            <ClipboardList size={20} />
            <h3>{isProvider ? "Available Requests" : "My Requests"}</h3>
            <span className="request-count">{requests.length}</span>
          </div>

          {loading && (
            <p className="emergency-muted">Loading requests...</p>
          )}

          {!loading && requests.length === 0 && (
            <div className="emergency-empty">
              <Package size={32} />
              <p>No requests available</p>
              <span>
                {isProvider
                  ? "New emergency requests will appear here."
                  : "Your submitted requests will appear here."}
              </span>
            </div>
          )}

          {requests.map((request) => (
            <motion.article
              key={request._id}
              className="request-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="request-card-top">
                <span className="request-category">{request.category}</span>
                <span className={statusClass(request.status)}>
                  {request.status}
                </span>
              </div>

              <h4>{request.title}</h4>
              <p className="request-description">{request.description}</p>

              <div className="request-details">
                <span><Package size={14} /> Qty: {request.quantity}</span>
                <span><MapPin size={14} /> {request.location}</span>
              </div>

              {isProvider && (
                <p className="request-description">
                  Requested by: {request.requester?.name || "Requester"}
                  <br />
                  Contact: {request.phone}
                </p>
              )}

              <div className="request-card-bottom">
                <span>Priority: {request.priority}</span>
                <span>
                  {request.createdAt
                    ? new Date(request.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>

              {isProvider && request.status === "Pending" && (
                <button
                  className="emergency-submit"
                  disabled={busyId === request._id}
                  onClick={() => updateStatus(request._id, "accept")}
                >
                  <CheckCircle size={16} />
                  {busyId === request._id ? "Please wait..." : "Accept Request"}
                </button>
              )}

              {isProvider && request.status === "Accepted" &&
                String(request.assignedProvider?._id || request.assignedProvider) ===
                  String(user?.id) && (
                <button
                  className="emergency-submit"
                  disabled={busyId === request._id}
                  onClick={() => updateStatus(request._id, "complete")}
                >
                  <CheckCircle size={16} />
                  {busyId === request._id ? "Please wait..." : "Mark Completed"}
                </button>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
