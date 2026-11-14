
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const initialSessions = [
  {
    id: 1,
    name: "Rahul Sharma",
    initials: "RS",
    role: "Frontend Developer",
    skill: "React",
    type: "Learning",
    date: "18 Nov 2026",
    time: "10:00 AM",
    status: "Upcoming",
  },
  {
    id: 2,
    name: "Priya Reddy",
    initials: "PR",
    role: "Data Analyst",
    skill: "Excel",
    type: "Teaching",
    date: "20 Nov 2026",
    time: "02:00 PM",
    status: "Upcoming",
  },
  {
    id: 3,
    name: "Arjun Kumar",
    initials: "AK",
    role: "UI/UX Designer",
    skill: "Figma",
    type: "Learning",
    date: "10 Nov 2026",
    time: "11:00 AM",
    status: "Completed",
  },
];

function Sessions() {
    const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sessions] = useState(initialSessions);

  const upcomingSessions = sessions.filter(
    (session) => session.status === "Upcoming"
  );

  const completedSessions = sessions.filter(
    (session) => session.status === "Completed"
  );

  const displayedSessions =
    activeTab === "upcoming"
      ? upcomingSessions
      : completedSessions;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>My Sessions</h1>
            <p>Manage your learning and teaching sessions.</p>
          </div>

          <div className="dashboard-header-actions">
            <div className="header-avatar">U</div>
          </div>
        </header>

        <div className="profile-page sessions-page">

          {/* HEADING */}
          <section className="sessions-heading">
            <h2>Learning Sessions</h2>
            <p>Keep track of your skill-sharing journey.</p>
          </section>

          {/* STATISTICS */}
          <section className="session-stats">
            <div className="session-stat-card">
              <h3>{sessions.length}</h3>
              <p>Total Sessions</p>
            </div>

            <div className="session-stat-card">
              <h3>{upcomingSessions.length}</h3>
              <p>Upcoming Sessions</p>
            </div>

            <div className="session-stat-card">
              <h3>{completedSessions.length}</h3>
              <p>Completed Sessions</p>
            </div>
          </section>

          {/* TABS */}
          <div className="session-tabs">
            <button
              className={activeTab === "upcoming" ? "active" : ""}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming ({upcomingSessions.length})
            </button>

            <button
              className={activeTab === "completed" ? "active" : ""}
              onClick={() => setActiveTab("completed")}
            >
              Completed ({completedSessions.length})
            </button>
          </div>

          {/* SESSION LIST */}
          <section className="session-list">
            {displayedSessions.length > 0 ? (
              displayedSessions.map((session) => (
                <article className="session-card" key={session.id}>

                  <div className="session-card-header">
                    <div className="session-avatar">
                      {session.initials}
                    </div>

                    <div className="session-user-info">
                      <h3>{session.name}</h3>
                      <p>{session.role}</p>
                    </div>

                    <span
                      className={`session-status ${session.status.toLowerCase()}`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <div className="session-details">
                    <div>
                      <small>Skill</small>
                      <strong>{session.skill}</strong>
                    </div>

                    <div>
                      <small>Session Type</small>
                      <strong>{session.type}</strong>
                    </div>

                    <div>
                      <small>Date</small>
                      <strong>{session.date}</strong>
                    </div>

                    <div>
                      <small>Time</small>
                      <strong>{session.time}</strong>
                    </div>
                  </div>

                  <div className="session-card-footer">
                    <span>
                      {session.type === "Learning"
                        ? "Learning from"
                        : "Teaching"}
                    </span>

                    {session.status === "Upcoming" ? (
                      <button
                            className="session-action-button"
                        onClick={() =>
                            navigate("/session-details", { state: { session } })
                        }
                        >
                        View Details
                    </button>
                    ) : (
                        <button
                            className="session-action-button"
                            onClick={() =>
                            navigate("/write-review", { state: { session } })
                            }
                        >
                            Write a Review
                        </button>
                    )}
                  </div>

                </article>
              ))
            ) : (
              <div className="session-empty">
                <h3>No sessions found</h3>
                <p>
                  Your {activeTab} sessions will appear here.
                </p>
                <Link to="/discover">
                  Discover People
                </Link>
              </div>
            )}
          </section>
        </div>


        
      </main>
    </div>
  );
}

export default Sessions;
