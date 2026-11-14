
import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("Public");

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
            <p>Manage your preferences and account visibility.</p>
          </div>

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
                onChange={(e) => setNotifications(e.target.checked)}
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
                onChange={(e) => setEmailUpdates(e.target.checked)}
              />
            </div>
          </div>

          <div className="settings-card">
            <h2>Privacy</h2>

            <div className="settings-option">
              <div>
                <h3>Profile Visibility</h3>
                <p>Choose who can see your profile.</p>
              </div>

              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
              >
                <option>Public</option>
                <option>Private</option>
              </select>
            </div>
          </div>

          <div className="settings-card">
            <h2>Account</h2>
            <p>Manage your SkillSwap account.</p>
            <Link to="/profile" className="outline-button">
              Edit Profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
