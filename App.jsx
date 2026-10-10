
import { useState } from "react";
import "./Auth.css";
import Dashboard from "./Dashboard.jsx";

const API = "http://localhost:5000/api/auth";

function getSavedUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem("resqlinkUser") || "null"
    );
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getSavedUser);

  const [page, setPage] = useState(() => {
    const token = sessionStorage.getItem("resqlinkToken");
    return token && getSavedUser() ? "welcome" : "login";
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("requester");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitForm(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint =
        page === "register" ? "/register" : "/login";

      const body =
        page === "register"
          ? { name, email, password, role }
          : { email, password };

      const response = await fetch(API + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong"
        );
      }

      if (page === "register") {
        setMessage("Account created! Please log in.");
        setPassword("");
        setPage("login");
      } else {
        sessionStorage.setItem(
          "resqlinkToken",
          data.token
        );

        sessionStorage.setItem(
          "resqlinkUser",
          JSON.stringify(data.user)
        );

        setUser(data.user);
        setPage("welcome");
      }
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Check your backend."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("resqlinkToken");
    sessionStorage.removeItem("resqlinkUser");

    setUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("requester");
    setMessage("");
    setPage("login");
  }

  // Main Dashboard
  if (page === "dashboard" && user) {
    return (
      <Dashboard
        user={user}
        onLogout={logout}
      />
    );
  }

  // Welcome Screen
  if (page === "welcome" && user) {
    return (
      <main className="welcome-screen">
        <nav className="welcome-nav">
          <div className="auth-brand">
            <span className="brand-symbol">R</span>
            ResQLink
          </div>

          <button
            className="auth-small-button"
            onClick={logout}
          >
            Logout
          </button>
        </nav>

        <section className="welcome-content">
          <div className="welcome-icon">✦</div>

          <p className="auth-eyebrow">
            YOUR EMERGENCY RESOURCE NETWORK
          </p>

          <h1>
            Welcome aboard,
            <br />
            <span>{user.name}!</span>
          </h1>

          <p className="welcome-description">
            Every resource matters. Every second counts.
            Together, we can connect people with the help
            they need.
          </p>

          <div className="welcome-profile">
            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <p>{user.email}</p>
            </div>

            <span className="role-pill">
              {user.role}
            </span>
          </div>

          <button
            className="auth-primary-button"
            onClick={() => setPage("dashboard")}
          >
            Explore Dashboard <span>→</span>
          </button>

          <p className="welcome-footer">
            CONNECTING RESOURCES. SAVING LIVES.
          </p>
        </section>
      </main>
    );
  }

  const isRegister = page === "register";

  // Login and Registration
  return (
    <main className="auth-screen">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <span className="brand-symbol">R</span>
          ResQLink
        </div>

        <div className="brand-message">
          <p className="auth-eyebrow">
            EMERGENCY RESOURCE NETWORK
          </p>

          <h1>
            Help is closer
            <br />
            than you <span>think.</span>
          </h1>

          <p>
            A smarter way to connect emergency needs
            with available resources.
          </p>
        </div>

        <div className="brand-bottom">
          <span>01 · CONNECT</span>
          <span>02 · RESPOND</span>
          <span>03 · RESCUE</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <p className="auth-eyebrow">
            {isRegister
              ? "CREATE YOUR ACCOUNT"
              : "WELCOME BACK"}
          </p>

          <h2>
            {isRegister ? "Join ResQLink" : "Sign in"}
          </h2>

          <p className="auth-subtitle">
            {isRegister
              ? "Be part of a network that makes a difference."
              : "Sign in to continue to your resource network."}
          </p>

          <form onSubmit={submitForm}>
            {isRegister && (
              <>
                <label>Full name</label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </>
            )}

            <label>Email address</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
                />

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />

            {isRegister && (
              <>
                <label>Account type</label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="requester">
                    Help requester
                  </option>

                  <option value="provider">
                    Resource provider
                  </option>
                </select>
              </>
            )}

            {message && (
              <p className="auth-message" role="status">
                {message}
              </p>
            )}

            <button
              className="auth-primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isRegister
                ? "Create Account →"
                : "Sign In →"}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister
              ? "Already have an account?"
              : "New to ResQLink?"}{" "}

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setPassword("");
                setPage(
                  isRegister ? "login" : "register"
                );
              }}
            >
              {isRegister ? "Sign in" : "Create account"}
            </button>
          </p>

          <p className="auth-legal">
            RESQLINK · CONNECTING RESOURCES. SAVING LIVES.
          </p>
        </div>
      </section>
    </main>
  );
}
