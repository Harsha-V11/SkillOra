import { useState } from "react";
import Sidebar from "../components/Sidebar";

const initialIncoming = [
  {
    id: 1,
    name: "Rahul Sharma",
    initials: "RS",
    role: "Frontend Developer",
    wantsToLearn: "React",
    canTeach: "Python",
    message: "I would love to learn React from you!",
    status: "Pending",
  },
  {
    id: 2,
    name: "Priya Reddy",
    initials: "PR",
    role: "Data Analyst",
    wantsToLearn: "JavaScript",
    canTeach: "Excel",
    message: "Interested in exchanging skills.",
    status: "Pending",
  },
];

const initialSent = [
  {
    id: 3,
    name: "Arjun Kumar",
    initials: "AK",
    role: "UI/UX Designer",
    wantsToLearn: "Figma",
    canTeach: "HTML",
    status: "Pending",
  },
  {
    id: 4,
    name: "Sneha Patel",
    initials: "SP",
    role: "Software Developer",
    wantsToLearn: "Python",
    canTeach: "Java",
    status: "Accepted",
  },
];

function Requests() {
  const [activeTab, setActiveTab] = useState("incoming");
  const [incoming, setIncoming] = useState(initialIncoming);
  const [sent, setSent] = useState(() => {
  const savedRequests = JSON.parse(
    localStorage.getItem("skillswap-sent-requests") || "[]"
  );

  return [...initialSent, ...savedRequests];
});

  const handleRequest = (id, status) => {
    setIncoming((previous) =>
      previous.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  };

  const getStatusClass = (status) => {
    return `request-status ${status.toLowerCase()}`;
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>My Requests</h1>
            <p>Manage your learning exchange requests.</p>
          </div>

          <div className="dashboard-header-actions">
            <div className="header-avatar">U</div>
          </div>
        </header>

        <div className="profile-page requests-page">
          {/* PAGE HEADING */}
          <section className="requests-heading">
            <h2>Learning Requests</h2>
            <p>Connect with people and start exchanging skills.</p>
          </section>

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
                {incoming.filter((item) => item.status === "Pending").length}
              </h3>
              <p>Pending Incoming</p>
            </div>
          </section>

          {/* TABS */}
          <div className="request-tabs">
            <button
              className={activeTab === "incoming" ? "active" : ""}
              onClick={() => setActiveTab("incoming")}
            >
              Incoming ({incoming.length})
            </button>

            <button
              className={activeTab === "sent" ? "active" : ""}
              onClick={() => setActiveTab("sent")}
            >
              Sent ({sent.length})
            </button>
          </div>

          {/* INCOMING REQUESTS */}
          {activeTab === "incoming" && (
            <section className="request-list">
              {incoming.length > 0 ? (
                incoming.map((request) => (
                  <article className="request-card" key={request.id}>
                    <div className="request-card-header">
                      <div className="request-avatar">
                        {request.initials}
                      </div>

                      <div className="request-user-info">
                        <h3>{request.name}</h3>
                        <p>{request.role}</p>
                      </div>

                      <span className={getStatusClass(request.status)}>
                        {request.status}
                      </span>
                    </div>

                    <div className="request-skill-details">
                      <div>
                        <small>Wants to learn</small>
                        <strong>{request.wantsToLearn}</strong>
                      </div>

                      <div>
                        <small>Can teach</small>
                        <strong>{request.canTeach}</strong>
                      </div>
                    </div>

                    <p className="request-message">
                      "{request.message}"
                    </p>

                    {request.status === "Pending" && (
                      <div className="request-actions">
                        <button
                          className="request-accept-button"
                          onClick={() =>
                            handleRequest(request.id, "Accepted")
                          }
                        >
                          Accept
                        </button>

                        <button
                          className="request-reject-button"
                          onClick={() =>
                            handleRequest(request.id, "Rejected")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <p className="request-empty">No incoming requests.</p>
              )}
            </section>
          )}

          {/* SENT REQUESTS */}
          {activeTab === "sent" && (
            <section className="request-list">
              {sent.map((request) => (
                <article className="request-card" key={request.id}>
                  <div className="request-card-header">
                    <div className="request-avatar">
                      {request.initials}
                    </div>

                    <div className="request-user-info">
                      <h3>{request.name}</h3>
                      <p>{request.role}</p>
                    </div>

                    <span className={getStatusClass(request.status)}>
                      {request.status}
                    </span>
                  </div>

                  <div className="request-skill-details">
                    <div>
                      <small>Want to learn</small>
                      <strong>{request.wantsToLearn}</strong>
                    </div>

                    <div>
                      <small>You can teach</small>
                      <strong>{request.canTeach}</strong>
                    </div>
                  </div>
                </article>
              ))}

              {sent.length === 0 && (
                <p className="request-empty">No sent requests yet.</p>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Requests;

