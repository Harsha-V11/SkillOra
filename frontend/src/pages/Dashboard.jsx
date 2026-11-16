
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  if (!date) return "Date not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({});
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);

  const [dashboardSearch, setDashboardSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          profileResponse,
          receivedResponse,
          sentResponse,
          sessionsResponse,
          usersResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/users/me`, { headers }),
          fetch(`${API_URL}/requests/received`, { headers }),
          fetch(`${API_URL}/requests/sent`, { headers }),
          fetch(`${API_URL}/sessions`, { headers }),
          fetch(`${API_URL}/discover`, { headers }),
        ]);

        const [
          profileData,
          receivedData,
          sentData,
          sessionsData,
          usersData,
        ] = await Promise.all([
          profileResponse.json(),
          receivedResponse.json(),
          sentResponse.json(),
          sessionsResponse.json(),
          usersResponse.json(),
        ]);

        if (!profileResponse.ok) {
          throw new Error(profileData.message || "Unable to load profile.");
        }

        if (!receivedResponse.ok) {
          throw new Error(
            receivedData.message || "Unable to load received requests."
          );
        }

        if (!sentResponse.ok) {
          throw new Error(
            sentData.message || "Unable to load sent requests."
          );
        }

        if (!sessionsResponse.ok) {
          throw new Error(
            sessionsData.message || "Unable to load sessions."
          );
        }

        if (!usersResponse.ok) {
          throw new Error(usersData.message || "Unable to load users.");
        }

        setProfile(profileData.user || {});
        setReceivedRequests(receivedData.requests || []);
        setSentRequests(sentData.requests || []);
        setSessions(sessionsData.sessions || []);
        setUsers(usersData.users || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const pendingReceived = receivedRequests.filter(
    (request) => request.status === "pending"
  );

  const pendingSent = sentRequests.filter(
    (request) => request.status === "pending"
  );

  const upcomingSessions = sessions.filter(
    (session) => session.status === "upcoming"
  );

  const completedSessions = sessions.filter(
    (session) => session.status === "completed"
  );

  const availableTeachers = users.filter(
    (user) =>
      String(user._id) !== String(profile._id) &&
      user.isTeachingOpen !== false &&
      Array.isArray(user.teachSkills) &&
      user.teachSkills.length > 0
  );

  const myLearnSkills = (profile.learnSkills || []).map((skill) =>
    String(skill).trim().toLowerCase()
  );

  const recommendedUsers = availableTeachers
    .map((user) => {
      const matchingSkills = (user.teachSkills || []).filter((skill) =>
        myLearnSkills.includes(String(skill).trim().toLowerCase())
      );

      return {
        ...user,
        matchingSkills,
      };
    })
    .filter((user) => user.matchingSkills.length > 0);

  const uniqueSkills = [
    ...new Set(
      users
        .flatMap((user) => user.teachSkills || [])
        .map((skill) => String(skill).trim())
        .filter(Boolean)
    ),
  ];

  // Combine received and sent requests for recent activity
  const recentActivities = [
    ...receivedRequests.map((request) => ({
      ...request,
      activityType: "received",
      personName: request.sender?.name || "a SkillSwap member",
    })),

    ...sentRequests.map((request) => ({
      ...request,
      activityType: "sent",
      personName: request.receiver?.name || "a SkillSwap member",
    })),
  ]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return (
        (Number.isNaN(dateB) ? 0 : dateB) -
        (Number.isNaN(dateA) ? 0 : dateA)
      );
    })
    .slice(0, 3);

  const personalStats = [
    {
      title: "Received Requests",
      value: pendingReceived.length,
      icon: "📩",
      description: "Waiting for your response",
    },
    {
      title: "Sent Requests",
      value: sentRequests.length,
      icon: "📤",
      description: "Total requests you have sent",
    },
    {
      title: "Upcoming Sessions",
      value: upcomingSessions.length,
      icon: "📅",
      description: "Sessions scheduled",
    },
    {
      title: "Completed Sessions",
      value: completedSessions.length,
      icon: "✓",
      description: "Sessions completed",
    },
  ];

  const communityStats = [
    {
      title: "Registered Members",
      value: users.length + 1,
      icon: "👥",
      description: "Members in the community",
    },
    {
      title: "Available Teachers",
      value: availableTeachers.length,
      icon: "👨‍🏫",
      description: "Members open to teaching",
    },
    {
      title: "Available Skills",
      value: uniqueSkills.length,
      icon: "💡",
      description: "Skills members can teach",
    },
  ];

  // Search people and skills in Discover
  const handleSearch = (e) => {
    e.preventDefault();

    const searchValue = dashboardSearch.trim();

    if (searchValue) {
      navigate(`/discover?search=${encodeURIComponent(searchValue)}`);
    } else {
      navigate("/discover");
    }
  };

  const handleRequestResponse = async (requestId, status) => {
    const token = localStorage.getItem("token");

    try {
      setActionLoading(requestId);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/requests/${requestId}/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update request.");
      }

      setReceivedRequests((previous) =>
        previous.map((request) =>
          request._id === requestId
            ? { ...request, status }
            : request
        )
      );

      setSuccessMessage(`Request ${status} successfully.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleViewProfile = (user) => {
    navigate("/profile", {
      state: { user },
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <p>Loading your dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main" id="overview">

        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back, {profile.name?.split(" ")[0] || "Member"}!
              Here's what's happening in SkillSwap.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <form onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search people or skills..."
                aria-label="Search people or skills"
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
              />
            </form>

            <button
              className="notification-button"
              aria-label="View requests"
              onClick={() => navigate("/requests")}
            >
              ♧
              <span></span>
            </button>

            <div className="header-avatar">
              {getUserInitials(profile.name)}
            </div>
          </div>
        </header>

        {error && <p role="alert">{error}</p>}
        {successMessage && <p role="status">{successMessage}</p>}

        {/* PERSONAL STATISTICS */}
        <section className="dashboard-stats">
          {personalStats.map((stat) => (
            <article
              className="dashboard-stat-card"
              key={stat.title}
            >
              <div className="stat-icon">{stat.icon}</div>

              <div className="stat-info">
                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
                <small>{stat.description}</small>
              </div>
            </article>
          ))}
        </section>

        {/* COMMUNITY OVERVIEW */}
        <section className="community-overview">
          <div className="panel-heading">
            <div>
              <h2>Community Overview</h2>
              <p>Explore the SkillSwap community.</p>
            </div>
          </div>

          <div className="community-stats">
            {communityStats.map((stat) => (
              <article
                className="community-stat-card"
                key={stat.title}
              >
                <div className="community-stat-icon">
                  {stat.icon}
                </div>

                <div>
                  <h3>{stat.value}</h3>
                  <p>{stat.title}</p>
                  <span>{stat.description}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* DASHBOARD CONTENT */}
        <div className="dashboard-content-grid">

          {/* LEFT COLUMN */}
          <div className="dashboard-column">

            {/* AVAILABLE TEACHERS */}
            <section
              className="dashboard-panel available-teachers-panel"
              id="available-teachers"
            >
              <div className="panel-heading">
                <div>
                  <h2>People Available to Teach</h2>
                  <p>Connect with people ready to share their knowledge.</p>
                </div>

                <Link to="/discover">View all →</Link>
              </div>

              <div className="recommended-list">
                {availableTeachers.slice(0, 3).length > 0 ? (
                  availableTeachers.slice(0, 3).map((teacher) => (
                    <div
                      className="recommended-user"
                      key={teacher._id}
                    >
                      <div className="person-avatar">
                        {getUserInitials(teacher.name)}
                      </div>

                      <div className="person-details">
                        <h3>{teacher.name}</h3>
                        <p>{teacher.profession || "SkillSwap Member"}</p>

                        <div className="teacher-skills">
                          {(teacher.teachSkills || [])
                            .slice(0, 3)
                            .map((skill) => (
                              <span key={skill}>{skill}</span>
                            ))}
                        </div>
                      </div>

                      <div className="teacher-actions">
                        <button
                          className="outline-button"
                          onClick={() => handleViewProfile(teacher)}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No available teachers found yet.</p>
                )}
              </div>
            </section>

            {/* RECOMMENDED PEOPLE */}
            <section
              className="dashboard-panel"
              id="recommended"
            >
              <div className="panel-heading">
                <h2>People You Can Learn From</h2>
                <Link to="/discover">View all →</Link>
              </div>

              <div className="recommended-list">
                {recommendedUsers.slice(0, 3).length > 0 ? (
                  recommendedUsers.slice(0, 3).map((user) => (
                    <div
                      className="recommended-user"
                      key={user._id}
                    >
                      <div className="person-avatar">
                        {getUserInitials(user.name)}
                      </div>

                      <div className="person-details">
                        <h3>{user.name}</h3>
                        <p>{user.matchingSkills.join(" · ")}</p>
                      </div>

                      <button
                        className="outline-button"
                        onClick={() => navigate("/discover")}
                      >
                        Connect
                      </button>
                    </div>
                  ))
                ) : (
                  <p>
                    No matching teachers found for your learning skills yet.
                  </p>
                )}
              </div>
            </section>

            {/* INCOMING REQUESTS */}
            <section
              className="dashboard-panel"
              id="requests"
            >
              <div className="panel-heading">
                <h2>Incoming Learning Requests</h2>
                <Link to="/requests">View all →</Link>
              </div>

              <div className="request-list">
                {pendingReceived.slice(0, 3).length > 0 ? (
                  pendingReceived.slice(0, 3).map((request) => (
                    <div
                      className="request-row"
                      key={request._id}
                    >
                      <div className="person-avatar">
                        {getUserInitials(request.sender?.name)}
                      </div>

                      <div className="person-details">
                        <h3>
                          {request.sender?.name || "SkillSwap Member"}
                        </h3>

                        <p>
                          Wants to learn{" "}
                          {request.requestedSkill || request.skill}
                        </p>

                        <small>
                          {request.exchangeMode === "mutual"
                            ? `Offers to teach ${request.offeredSkill}`
                            : "Teacher–Learner arrangement"}
                        </small>
                      </div>

                      <div className="request-actions">
                        <button
                          className="accept-button"
                          disabled={actionLoading === request._id}
                          onClick={() =>
                            handleRequestResponse(request._id, "accepted")
                          }
                        >
                          {actionLoading === request._id
                            ? "Please wait..."
                            : "Accept"}
                        </button>

                        <button
                          className="decline-button"
                          disabled={actionLoading === request._id}
                          onClick={() =>
                            handleRequestResponse(request._id, "rejected")
                          }
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No pending incoming requests.</p>
                )}
              </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section
              className="dashboard-panel"
              id="activity"
            >
              <div className="panel-heading">
                <h2>Recent Activity</h2>
              </div>

              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    className="recent-activity"
                    key={`${activity.activityType}-${activity._id}`}
                  >
                    <div className="activity-dot"></div>

                    <div>
                      <p>
                        {activity.activityType === "received"
                          ? "You received a request from "
                          : "You sent a request to "}

                        <strong>{activity.personName}</strong>
                        {" "}— {activity.status}.
                      </p>

                      <small>{formatDate(activity.createdAt)}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recent request activity yet.</p>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="dashboard-column">

            {/* YOUR SKILLS */}
            <section
              className="dashboard-panel"
              id="skills"
            >
              <div className="panel-heading">
                <h2>Your Skills</h2>
                <Link to="/my-skills">Manage →</Link>
              </div>

              <div className="popular-skills">
                <div className="popular-skill">
                  <span>🎓</span>
                  <h3>Teaching Skills</h3>
                  <p>
                    {(profile.teachSkills || []).join(", ") ||
                      "No teaching skills added"}
                  </p>
                </div>

                <div className="popular-skill">
                  <span>📚</span>
                  <h3>Learning Skills</h3>
                  <p>
                    {(profile.learnSkills || []).join(", ") ||
                      "No learning skills added"}
                  </p>
                </div>
              </div>
            </section>

            {/* UPCOMING SESSIONS */}
            <section
              className="dashboard-panel"
              id="sessions"
            >
              <div className="panel-heading">
                <h2>Upcoming Sessions</h2>
                <Link to="/sessions">View all →</Link>
              </div>

              {upcomingSessions.slice(0, 3).length > 0 ? (
                upcomingSessions.slice(0, 3).map((session) => {
                  const teacher = session.teacher || {};
                  const student = session.student || {};

                  const otherUser =
                    String(teacher._id) === String(profile._id)
                      ? student
                      : teacher;

                  return (
                    <div
                      className="upcoming-session"
                      key={session._id}
                    >
                      <div className="session-icon">▦</div>

                      <div className="session-details">
                        <h3>{session.skill}</h3>
                        <p>{formatDate(session.scheduledAt)}</p>

                        <small>
                          With {otherUser.name || "SkillSwap Member"}
                        </small>
                      </div>

                      <span className="session-status">
                        Confirmed
                      </span>
                    </div>
                  );
                })
              ) : (
                <p>No upcoming sessions scheduled.</p>
              )}
            </section>

            {/* REQUEST SUMMARY */}
            <section className="dashboard-panel">
              <div className="panel-heading">
                <h2>Your Request Activity</h2>
                <Link to="/requests">View all →</Link>
              </div>

              <p>
                Pending sent requests: {pendingSent.length}
              </p>

              <p>
                Total received requests: {receivedRequests.length}
              </p>

              <p>
                Total sent requests: {sentRequests.length}
              </p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
