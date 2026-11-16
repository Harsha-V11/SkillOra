
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

function formatStatus(status) {
  return status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : "Pending";
}

function getUserInitials(name) {
  if (!name) return "U";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRequestDetails(request) {
  const exchangeMode = request.exchangeMode || "teacher-learner";

  return {
    exchangeMode,
    isMutual: exchangeMode === "mutual",
    requestedSkill: request.requestedSkill || request.skill || "Not specified",
    offeredSkill: request.offeredSkill || "",
  };
}

function getSessionRequestId(session) {
  return session.request?._id || session.request;
}

function Requests() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("incoming");
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");
  const [meetingLink, setMeetingLink] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // Fetch requests and existing sessions
  const fetchRequests = async () => {
    if (!token) {
      setError("Please log in to view your requests.");
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const [receivedResponse, sentResponse, sessionsResponse] =
        await Promise.all([
          fetch(`${API_URL}/requests/received`, { headers }),
          fetch(`${API_URL}/requests/sent`, { headers }),
          fetch(`${API_URL}/sessions`, { headers }),
        ]);

      const [receivedData, sentData, sessionsData] = await Promise.all([
        receivedResponse.json(),
        sentResponse.json(),
        sessionsResponse.json(),
      ]);

      if (!receivedResponse.ok) {
        throw new Error(
          receivedData.message || "Unable to load incoming requests."
        );
      }

      if (!sentResponse.ok) {
        throw new Error(
          sentData.message || "Unable to load sent requests."
        );
      }

      if (!sessionsResponse.ok) {
        throw new Error(
          sessionsData.message || "Unable to load your sessions."
        );
      }

      setIncoming(receivedData.requests || []);
      setSent(sentData.requests || []);
      setSessions(sessionsData.sessions || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Open another user's profile
  const handleViewProfile = (user) => {
    if (!user || !user._id) {
      setError("Unable to open this user's profile.");
      return;
    }

    navigate("/profile", {
      state: { user },
    });
  };

  // Accept or reject an incoming request
  const handleRequest = async (id, status) => {
    if (!token) {
      setError("Please log in again.");
      return;
    }

    setUpdatingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/requests/${id}/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: status.toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to ${status.toLowerCase()} request.`
        );
      }

      setIncoming((previous) =>
        previous.map((request) =>
          request._id === id
            ? {
                ...request,
                ...data.request,
                status: status.toLowerCase(),
              }
            : request
        )
      );

      setSuccess(`Request ${status.toLowerCase()} successfully.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingId("");
    }
  };

  // Check whether a direction already has a session
  const hasScheduledSession = (requestId, direction) => {
    return sessions.some(
      (session) =>
        String(getSessionRequestId(session)) === String(requestId) &&
        session.direction === direction
    );
  };

  // Open the scheduling form
  const openScheduleForm = (request, direction, skill) => {
    setScheduleTarget({
      requestId: request._id,
      direction,
      skill,
    });

    setScheduledAt("");
    setDuration("60");
    setMeetingLink("");
    setError("");
    setSuccess("");
  };

  // Close the scheduling form
  const closeScheduleForm = () => {
    setScheduleTarget(null);
    setScheduledAt("");
    setDuration("60");
    setMeetingLink("");
  };

  // Create a session
  const handleScheduleSession = async (event) => {
    event.preventDefault();

    if (!token || !scheduleTarget) {
      setError("Please log in again and try scheduling.");
      return;
    }

    if (hasScheduledSession(
      scheduleTarget.requestId,
      scheduleTarget.direction
    )) {
      setError("A session has already been scheduled for this direction.");
      return;
    }

    const selectedDate = new Date(scheduledAt);

    if (
      !scheduledAt ||
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate <= new Date()
    ) {
      setError("Please select a valid future date and time.");
      return;
    }

    setScheduling(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: scheduleTarget.requestId,
          direction: scheduleTarget.direction,
          scheduledAt: selectedDate.toISOString(),
          duration: Number(duration),
          meetingLink: meetingLink.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to schedule the session.");
      }

      setSessions((previous) => [...previous, data.session]);

      setSuccess(
        `${scheduleTarget.skill} session scheduled successfully.`
      );

      closeScheduleForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setScheduling(false);
    }
  };

  const getStatusClass = (status) => {
    return `request-status ${status?.toLowerCase() || "pending"}`;
  };

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  // Scheduling options for an accepted request
  const renderScheduleOptions = (request, details) => {
    if (request.status?.toLowerCase() !== "accepted") {
      return null;
    }

    const options = [
      {
        direction: "requested",
        skill: details.requestedSkill,
        label: "Schedule Requested Skill",
      },
    ];

    if (details.isMutual) {
      options.push({
        direction: "offered",
        skill: details.offeredSkill,
        label: "Schedule Offered Skill",
      });
    }

    return (
      <div className="request-schedule-section">
        <h4>Schedule Learning Sessions</h4>

        <p>
          Choose a teaching direction to arrange a session with this member.
        </p>

        <div className="request-actions">
          {options.map((option) => {
            const alreadyScheduled = hasScheduledSession(
              request._id,
              option.direction
            );

            return (
              <button
                key={option.direction}
                type="button"
                className="discover-view-button"
                disabled={alreadyScheduled}
                onClick={() =>
                  openScheduleForm(
                    request,
                    option.direction,
                    option.skill
                  )
                }
              >
                {alreadyScheduled
                  ? `${option.skill} Scheduled`
                  : option.label}
              </button>
            );
          })}
        </div>

        {scheduleTarget?.requestId === request._id && (
          <form
            className="session-schedule-form"
            onSubmit={handleScheduleSession}
          >
            <h4>Schedule: {scheduleTarget.skill}</h4>

            <p>
              {scheduleTarget.direction === "requested"
                ? "The request receiver will teach this skill."
                : "The request sender will teach this skill."}
            </p>

            <div>
              <label htmlFor={`scheduledAt-${request._id}`}>
                Date and Time
              </label>

              <input
                id={`scheduledAt-${request._id}`}
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor={`duration-${request._id}`}>
                Session Duration
              </label>

              <select
                id={`duration-${request._id}`}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1 hour 30 minutes</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>

            <div>
              <label htmlFor={`meetingLink-${request._id}`}>
                Meeting Link (Optional)
              </label>

              <input
                id={`meetingLink-${request._id}`}
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(event) => setMeetingLink(event.target.value)}
              />
            </div>

            <div className="request-actions">
              <button
                type="submit"
                className="request-accept-button"
                disabled={scheduling}
              >
                {scheduling ? "Scheduling..." : "Confirm Session"}
              </button>

              <button
                type="button"
                className="request-reject-button"
                disabled={scheduling}
                onClick={closeScheduleForm}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="profile-page requests-page">
            <p>Loading your requests...</p>
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
            <h1>My Requests</h1>
            <p>Manage your learning exchange requests.</p>
          </div>

          <div className="dashboard-header-actions">
            <div className="header-avatar">
              {getUserInitials(currentUser.name)}
            </div>
          </div>
        </header>

        <div className="profile-page requests-page">
          <section className="requests-heading">
            <h2>Learning Requests</h2>
            <p>
              Connect with people and start exchanging skills.
            </p>
          </section>

          {/* MESSAGES */}
          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}

          {/* REQUEST STATISTICS */}
          <section className="request-stats">
            <div className="request-stat-card">
              <h3>{incoming.length}</h3>
              <p>Incoming Requests</p>
            </div>

            <div className="request-stat-card">
              <h3>{sent.length}</h3>
              <p>Sent Requests</p>
            </div>

            <div className="request-stat-card">
              <h3>
                {
                  incoming.filter(
                    (item) => item.status?.toLowerCase() === "pending"
                  ).length
                }
              </h3>
              <p>Pending Incoming</p>
            </div>
          </section>

          {/* TABS */}
          <div className="request-tabs">
            <button
              type="button"
              className={activeTab === "incoming" ? "active" : ""}
              onClick={() => {
                setActiveTab("incoming");
                setError("");
                setSuccess("");
                closeScheduleForm();
              }}
            >
              Incoming ({incoming.length})
            </button>

            <button
              type="button"
              className={activeTab === "sent" ? "active" : ""}
              onClick={() => {
                setActiveTab("sent");
                setError("");
                setSuccess("");
                closeScheduleForm();
              }}
            >
              Sent ({sent.length})
            </button>
          </div>

          {/* INCOMING REQUESTS */}
          {activeTab === "incoming" && (
            <section className="request-list">
              {incoming.length > 0 ? (
                incoming.map((request) => {
                  const sender = request.sender || {};
                  const details = getRequestDetails(request);
                  const status = request.status?.toLowerCase() || "pending";

                  return (
                    <article
                      className="request-card"
                      key={request._id}
                    >
                      <div className="request-card-header">
                        <div className="request-avatar">
                          {getUserInitials(sender.name)}
                        </div>

                        <div className="request-user-info">
                          <h3>{sender.name || "SkillSwap Member"}</h3>
                          <p>
                            {sender.profession || "SkillSwap Member"}
                          </p>
                        </div>

                        <span className={getStatusClass(status)}>
                          {formatStatus(status)}
                        </span>
                      </div>

                      <div className="request-arrangement">
                        <h4>
                          {details.isMutual
                            ? "Mutual Skill Exchange"
                            : "Teacher–Learner"}
                        </h4>

                        {details.isMutual ? (
                          <p>
                            Both users will teach and learn from each other.
                          </p>
                        ) : (
                          <p>
                            This person wants to learn from you without
                            teaching a skill in return.
                          </p>
                        )}
                      </div>

                      <div className="request-skill-details">
                        <div>
                          <small>Sender wants to learn</small>
                          <strong>{details.requestedSkill}</strong>
                        </div>

                        <div>
                          <small>You will teach</small>
                          <strong>{details.requestedSkill}</strong>
                        </div>

                        {details.isMutual && (
                          <>
                            <div>
                              <small>Sender can teach you</small>
                              <strong>
                                {details.offeredSkill || "Not specified"}
                              </strong>
                            </div>

                            <div>
                              <small>You will learn</small>
                              <strong>
                                {details.offeredSkill || "Not specified"}
                              </strong>
                            </div>
                          </>
                        )}
                      </div>

                      <p className="request-message">
                        "{request.message || "Interested in exchanging skills."}"
                      </p>

                      <div className="request-actions">
                        <button
                          type="button"
                          className="discover-view-button"
                          onClick={() => handleViewProfile(sender)}
                        >
                          View Profile
                        </button>

                        {status === "pending" && (
                          <>
                            <button
                              type="button"
                              className="request-accept-button"
                              disabled={updatingId === request._id}
                              onClick={() =>
                                handleRequest(request._id, "Accepted")
                              }
                            >
                              {updatingId === request._id
                                ? "Please wait..."
                                : "Accept"}
                            </button>

                            <button
                              type="button"
                              className="request-reject-button"
                              disabled={updatingId === request._id}
                              onClick={() =>
                                handleRequest(request._id, "Rejected")
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>

                      {renderScheduleOptions(request, details)}
                    </article>
                  );
                })
              ) : (
                <p className="request-empty">
                  No incoming requests yet.
                </p>
              )}
            </section>
          )}

          {/* SENT REQUESTS */}
          {activeTab === "sent" && (
            <section className="request-list">
              {sent.length > 0 ? (
                sent.map((request) => {
                  const receiver = request.receiver || {};
                  const details = getRequestDetails(request);
                  const status = request.status?.toLowerCase() || "pending";

                  return (
                    <article
                      className="request-card"
                      key={request._id}
                    >
                      <div className="request-card-header">
                        <div className="request-avatar">
                          {getUserInitials(receiver.name)}
                        </div>

                        <div className="request-user-info">
                          <h3>{receiver.name || "SkillSwap Member"}</h3>
                          <p>
                            {receiver.profession || "SkillSwap Member"}
                          </p>
                        </div>

                        <span className={getStatusClass(status)}>
                          {formatStatus(status)}
                        </span>
                      </div>

                      <div className="request-arrangement">
                        <h4>
                          {details.isMutual
                            ? "Mutual Skill Exchange"
                            : "Teacher–Learner"}
                        </h4>

                        {details.isMutual ? (
                          <p>
                            Both users will teach and learn from each other.
                          </p>
                        ) : (
                          <p>
                            You will learn from this person without teaching
                            a skill in return.
                          </p>
                        )}
                      </div>

                      <div className="request-skill-details">
                        <div>
                          <small>You want to learn</small>
                          <strong>{details.requestedSkill}</strong>
                        </div>

                        <div>
                          <small>They will teach you</small>
                          <strong>{details.requestedSkill}</strong>
                        </div>

                        {details.isMutual && (
                          <>
                            <div>
                              <small>You offered to teach</small>
                              <strong>
                                {details.offeredSkill || "Not specified"}
                              </strong>
                            </div>

                            <div>
                              <small>They want to learn</small>
                              <strong>
                                {details.offeredSkill || "Not specified"}
                              </strong>
                            </div>
                          </>
                        )}
                      </div>

                      <p className="request-message">
                        "{request.message || "Skill exchange request sent."}"
                      </p>

                      <div className="request-actions">
                        <button
                          type="button"
                          className="discover-view-button"
                          onClick={() => handleViewProfile(receiver)}
                        >
                          View Profile
                        </button>
                      </div>

                      {renderScheduleOptions(request, details)}
                    </article>
                  );
                })
              ) : (
                <p className="request-empty">
                  No sent requests yet.
                </p>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Requests;
