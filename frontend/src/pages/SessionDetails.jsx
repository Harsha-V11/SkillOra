
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

function SessionDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [session, setSession] = useState(state?.session || null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sessionId = session?._id || session?.id;

  useEffect(() => {
    let isMounted = true;

    const fetchSessionDetails = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!sessionId) {
        if (isMounted) {
          setError("Session ID is missing. Please open this session from My Sessions.");
          setPageLoading(false);
        }
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const sessionResponse = await fetch(
          `${API_URL}/sessions/${sessionId}`,
          { headers }
        );

        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok) {
          throw new Error(sessionData.message || "Unable to load session.");
        }

        if (!sessionData.session) {
          throw new Error("Session information is not available.");
        }

        if (isMounted) {
          setSession((previous) => ({
            ...previous,
            ...sessionData.session,
          }));
        }

        // Review history is optional for displaying session details.
        try {
          const reviewsResponse = await fetch(
            `${API_URL}/reviews/my`,
            { headers }
          );

          const reviewsData = await reviewsResponse.json();

          if (reviewsResponse.ok && isMounted) {
            const reviews = reviewsData.reviews || [];

            const hasReviewed = reviews.some((review) => {
              const reference = review.session || review.sessionId;

              const reviewedId =
                typeof reference === "object"
                  ? reference?._id || reference?.id
                  : reference;

              return String(reviewedId || "") === String(sessionId);
            });

            setReviewSubmitted(hasReviewed);
          }
        } catch {
          // Do not block session details if review history is unavailable.
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load session details.");
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    fetchSessionDetails();

    return () => {
      isMounted = false;
    };
  }, [sessionId, navigate]);

  const updateSessionStatus = async (newStatus) => {
    if (!sessionId || loading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in again to update this session.");
      return;
    }

    const actionText =
      newStatus === "completed" ? "complete" : "cancel";

    if (!window.confirm(`Are you sure you want to ${actionText} this session?`)) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/sessions/${sessionId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update session status.");
      }

      setSession((previous) => ({
        ...previous,
        ...(data.session || {}),
        status: newStatus,
      }));

      setSuccess(
        newStatus === "completed"
          ? "Session marked as completed successfully."
          : "Session cancelled successfully."
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (pageLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page session-details-page">
            <p>Loading session details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page session-details-page">
            <h2>Session Details</h2>
            <p>{error || "Session information is not available."}</p>
            <Link to="/sessions" className="session-back-button">
              Back to Sessions
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentStatus = String(session.status || "").toLowerCase();

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const teacher = session.teacher || {};
  const student = session.student || {};

  const teacherId = teacher._id || teacher.id;
  const studentId = student._id || student.id;

  const isTeacher = String(teacherId) === String(currentUser._id || currentUser.id);

  const otherParticipant = isTeacher ? student : teacher;

  const participantName =
    session.name ||
    otherParticipant.name ||
    "SkillSwap Member";

  const participantRole =
    session.role ||
    (isTeacher ? "Student" : "Teacher");

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
                {session.initials || participantName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <h2>{session.skill} Session</h2>
                <p>With {participantName}</p>
                <span className="profile-availability">
                  {formatStatus(currentStatus)}
                </span>
              </div>
            </div>

            <div className="session-detail-grid">
              <div className="session-detail-item">
                <small>Participant</small>
                <strong>{participantName}</strong>
              </div>

              <div className="session-detail-item">
                <small>Role</small>
                <strong>{participantRole}</strong>
              </div>

              <div className="session-detail-item">
                <small>Skill</small>
                <strong>{session.skill || "Not specified"}</strong>
              </div>

              <div className="session-detail-item">
                <small>Session Type</small>
                <strong>{session.type || "Not specified"}</strong>
              </div>

              <div className="session-detail-item">
                <small>Date</small>
                <strong>
                  {session.date ||
                    (session.scheduledAt
                      ? new Date(session.scheduledAt).toLocaleDateString("en-IN")
                      : "Not scheduled")}
                </strong>
              </div>

              <div className="session-detail-item">
                <small>Time</small>
                <strong>
                  {session.time ||
                    (session.scheduledAt
                      ? new Date(session.scheduledAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Not scheduled")}
                </strong>
              </div>

              {session.duration && (
                <div className="session-detail-item">
                  <small>Duration</small>
                  <strong>{session.duration} minutes</strong>
                </div>
              )}

              {session.meetingLink && (
                <div className="session-detail-item">
                  <small>Meeting Link</small>
                  <strong>
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Meeting
                    </a>
                  </strong>
                </div>
              )}
            </div>

            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}

            <div className="session-detail-actions">
              <Link to="/sessions" className="session-back-button">
                Back to My Sessions
              </Link>

              {currentStatus === "upcoming" && (
                <div>
                  <button
                    type="button"
                    className="profile-edit-button"
                    onClick={() => updateSessionStatus("completed")}
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Mark as Completed"}
                  </button>

                  <button
                    type="button"
                    className="session-back-button"
                    onClick={() => updateSessionStatus("cancelled")}
                    disabled={loading}
                  >
                    Cancel Session
                  </button>
                </div>
              )}

              {currentStatus === "completed" && !reviewSubmitted && (
                <Link
                  to="/write-review"
                  state={{ session }}
                  className="profile-edit-button"
                >
                  Write a Review
                </Link>
              )}

              {currentStatus === "completed" && reviewSubmitted && (
                <button
                  type="button"
                  className="session-back-button"
                  disabled
                >
                  Review Submitted
                </button>
              )}

              {currentStatus === "cancelled" && (
                <span>Session Cancelled</span>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default SessionDetails;
