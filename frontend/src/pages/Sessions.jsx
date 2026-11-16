
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

function getUserInitials(name) {
  if (!name) return "U";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date) {
  if (!date) return "Not scheduled";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  if (!date) return "Not scheduled";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function Sessions() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [sessions, setSessions] = useState([]);
  const [reviewedSessionIds, setReviewedSessionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const currentUserId = String(
    currentUser._id || currentUser.id || ""
  );

  useEffect(() => {
    let isMounted = true;

    const fetchSessionsAndReviews = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [sessionsResponse, reviewsResponse] =
          await Promise.all([
            fetch(`${API_URL}/sessions`, { headers }),
            fetch(`${API_URL}/reviews/my`, { headers }),
          ]);

        const sessionsData = await sessionsResponse.json();
        const reviewsData = await reviewsResponse.json();

        if (!sessionsResponse.ok) {
          throw new Error(
            sessionsData.message || "Unable to load your sessions."
          );
        }

        if (!reviewsResponse.ok) {
          throw new Error(
            reviewsData.message || "Unable to load your reviews."
          );
        }

        const fetchedSessions = sessionsData.sessions || [];
        const reviews = reviewsData.reviews || [];

        const submittedSessionIds = reviews
          .map((review) => {
            const sessionReference =
              review.session || review.sessionId;

            if (
              sessionReference &&
              typeof sessionReference === "object"
            ) {
              return String(
                sessionReference._id ||
                sessionReference.id ||
                ""
              );
            }

            return String(sessionReference || "");
          })
          .filter(Boolean);

        if (isMounted) {
          setSessions(fetchedSessions);
          setReviewedSessionIds(submittedSessionIds);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSessionsAndReviews();

    return () => {
      isMounted = false;
    };
  }, [location.key, navigate]);

  const formattedSessions = sessions.map((session) => {
    const teacher = session.teacher || {};
    const student = session.student || {};

    const isTeacher =
      String(teacher._id || teacher.id || "") === currentUserId;

    const otherUser = isTeacher ? student : teacher;

    const sessionId = String(session._id || session.id || "");

    return {
      ...session,
      id: sessionId,
      name: otherUser.name || "SkillSwap Member",
      initials: getUserInitials(otherUser.name),
      role: otherUser.profession || "SkillSwap Member",
      type: isTeacher ? "Teaching" : "Learning",
      skill: session.skill || "Not specified",
      date: formatDate(session.scheduledAt),
      time: formatTime(session.scheduledAt),
      status:
        session.status?.toLowerCase() === "completed"
          ? "Completed"
          : session.status?.toLowerCase() === "cancelled"
          ? "Cancelled"
          : "Upcoming",
      reviewSubmitted: reviewedSessionIds.includes(sessionId),
    };
  });

  const upcomingSessions = formattedSessions.filter(
    (session) => session.status === "Upcoming"
  );

  const completedSessions = formattedSessions.filter(
    (session) => session.status === "Completed"
  );
  

  const cancelledSessions = formattedSessions.filter(
    (session) => session.status === "Cancelled"
  );

  const displayedSessions =
  activeTab === "upcoming"
    ? upcomingSessions
    : activeTab === "completed"
    ? completedSessions
    : cancelledSessions;

  const handleViewDetails = (session) => {
    navigate("/session-details", {
      state: { session },
    });
  };

  const handleWriteReview = (session) => {
    navigate("/write-review", {
      state: { session },
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page sessions-page">
            <p>Loading your sessions...</p>
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
            <h1>My Sessions</h1>
            <p>Manage your learning and teaching sessions.</p>
          </div>

          <div className="dashboard-header-actions">
            <div className="header-avatar">
              {getUserInitials(currentUser.name)}
            </div>
          </div>
        </header>

        <div className="profile-page sessions-page">
          <section className="sessions-heading">
            <h2>Learning Sessions</h2>
            <p>Keep track of your skill-sharing journey.</p>
          </section>

          {error && <p role="alert">{error}</p>}

          <section className="session-stats">
            <div className="session-stat-card">
              <h3>{formattedSessions.length}</h3>
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

            <div className="session-stat-card">
  <h3>{cancelledSessions.length}</h3>
  <p>Cancelled Sessions</p>
</div>
          </section>

          <div className="session-tabs">
            <button
              type="button"
              className={activeTab === "upcoming" ? "active" : ""}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming ({upcomingSessions.length})
            </button>

            <button
              type="button"
              className={activeTab === "completed" ? "active" : ""}
              onClick={() => setActiveTab("completed")}
            >
              Completed ({completedSessions.length})
            </button>

            <button
              type="button"
              className={activeTab === "cancelled" ? "active" : ""}
              onClick={() => setActiveTab("cancelled")}
            >
              Cancelled ({cancelledSessions.length})
            </button>
          </div>

          <section className="session-list">
            {displayedSessions.length > 0 ? (
              displayedSessions.map((session) => (
                <article
                  className="session-card"
                  key={session.id}
                >
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
                        type="button"
                        className="session-action-button"
                        onClick={() => handleViewDetails(session)}
                      >
                        View Details
                      </button>
                    ) : session.status === "Cancelled" ? (
                      <button
                        type="button"
                        className="session-action-button"
                        disabled
                      >
                        Session Cancelled
                      </button>
                    ) : session.reviewSubmitted ? (
                      <button
                        type="button"
                        className="session-action-button"
                        disabled
                      >
                        Review Submitted
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="session-action-button"
                        onClick={() => handleWriteReview(session)}
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
