
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

function Settings() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load settings.");
        }

        const user = data.user;

        setNotifications(user.notifications ?? true);
        setEmailUpdates(user.emailUpdates ?? false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  const handleSaveSettings = async () => {
    const token = localStorage.getItem("token");

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notifications,
          emailUpdates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save settings.");
      }

      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <p>Loading settings...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2>Settings</h2>
        </header>

        <div className="profile-page settings-page">
          <div className="reviews-heading">
            <h1>Account Settings</h1>
            <p>Manage your preferences and account settings.</p>
          </div>

          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}

          <div className="settings-card">
            <h2>Notifications</h2>

            <div className="settings-option">
              <div>
                <h3>Push Notifications</h3>
                <p>Receive notifications about requests and sessions.</p>
              </div>

              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => {
                  setNotifications(e.target.checked);
                  setMessage("");
                }}
              />
            </div>

            <div className="settings-option">
              <div>
                <h3>Email Updates</h3>
                <p>Receive updates and announcements through email.</p>
              </div>

              <input
                type="checkbox"
                checked={emailUpdates}
                onChange={(e) => {
                  setEmailUpdates(e.target.checked);
                  setMessage("");
                }}
              />
            </div>
          </div>

          <div className="settings-card">
            <h2>Account</h2>
            <p>Manage your SkillSwap account.</p>

            <Link to="/profile" className="outline-button">
              Edit Profile
            </Link>
          </div>

          <button
            className="primary-button"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default Settings;
