
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function SessionDetails() {
  const { state } = useLocation();
  const session = state?.session;

  if (!session) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page session-details-page">
            <h2>Session Details</h2>
            <p>Session information is not available.</p>
            <Link to="/sessions" className="session-back-button">
              Back to Sessions
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h2>Session Details</h2>
            <p>View your learning session information.</p>
          </div>
        </header>

        <div className="profile-page session-details-page">
          <Link to="/sessions" className="session-back-button">
            ← Back to My Sessions
          </Link>

          <section className="session-detail-card">
            <div className="session-detail-heading">
              <div className="session-avatar">
                {session.initials}
              </div>

              <div>
                <h2>{session.skill} Session</h2>
                <p>With {session.name}</p>
                <span className="profile-availability">
                  {session.status}
                </span>
              </div>
            </div>

            <div className="session-detail-grid">
              <div className="session-detail-item">
                <small>Participant</small>
                <strong>{session.name}</strong>
              </div>

              <div className="session-detail-item">
                <small>Role</small>
                <strong>{session.role}</strong>
              </div>

              <div className="session-detail-item">
                <small>Skill</small>
                <strong>{session.skill}</strong>
              </div>

              <div className="session-detail-item">
                <small>Session Type</small>
                <strong>{session.type}</strong>
              </div>

              <div className="session-detail-item">
                <small>Date</small>
                <strong>{session.date}</strong>
              </div>

              <div className="session-detail-item">
                <small>Time</small>
                <strong>{session.time}</strong>
              </div>
            </div>

            <div className="session-detail-actions">
              <Link
                to="/sessions"
                className="session-back-button"
              >
                Back to My Sessions
              </Link>

              {session.status === "Completed" && (
                <Link
                  to="/write-review"
                  state={{ session }}
                  className="profile-edit-button"
                >
                  Write a Review
                </Link>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SessionDetails;
