
import { Link } from "react-router-dom";

// 1. Personal Statistics
const personalStats = [
  {
    title: "Received Requests",
    value: 8,
    icon: "📩",
    description: "Requests from learners",
  },
  {
    title: "Sent Requests",
    value: 5,
    icon: "📤",
    description: "Requests you have sent",
  },
  {
    title: "Upcoming Sessions",
    value: 3,
    icon: "📅",
    description: "Sessions scheduled",
  },
  {
    title: "Completed Sessions",
    value: 12,
    icon: "✓",
    description: "Sessions completed",
  },
];

// 2. Community Overview
const communityStats = [
  {
    title: "Online Users",
    value: 24,
    icon: "🟢",
    description: "Currently using SkillSwap",
  },
  {
    title: "Available Teachers",
    value: 18,
    icon: "👨‍🏫",
    description: "Open to teaching",
  },
  {
    title: "Available Skills",
    value: 35,
    icon: "💡",
    description: "Skills in our catalogue",
  },
];

// 3. People Available to Teach
const availableTeachers = [
  {
    initials: "RS",
    name: "Rahul Sharma",
    role: "React Developer",
    skills: ["React", "JavaScript"],
    level: "Advanced",
    status: "Online",
  },
  {
    initials: "PN",
    name: "Priya Nair",
    role: "UI/UX Designer",
    skills: ["Figma", "UI/UX"],
    level: "Intermediate",
    status: "Offline",
  },
  {
    initials: "AR",
    name: "Arjun Reddy",
    role: "Data Analyst",
    skills: ["Python", "Power BI"],
    level: "Advanced",
    status: "Online",
  },
];

// 4. Recommended People
const recommendedUsers = [
  {
    initials: "RS",
    name: "Rahul Sharma",
    skills: "React · Node.js · TypeScript",
    level: "Expert",
    status: "Online",
  },
  {
    initials: "PN",
    name: "Priya Nair",
    skills: "Python · Data Science",
    level: "Advanced",
    status: "Online",
  },
  {
    initials: "AR",
    name: "Arjun Reddy",
    skills: "UI/UX Design · Figma",
    level: "Intermediate",
    status: "Away",
  },
];

// 5. Incoming Learning Requests
const requests = [
  {
    initials: "SI",
    name: "Sneha Iyer",
    skill: "wants to learn Python",
    time: "2h ago",
  },
  {
    initials: "VD",
    name: "Vikram Das",
    skill: "wants to learn Data Science",
    time: "3h ago",
  },
  {
    initials: "AR",
    name: "Ananya Rao",
    skill: "wants to learn React",
    time: "5h ago",
  },
];

// 6. Popular Skills
const popularSkills = [
  {
    icon: "⌘",
    title: "Programming",
    skills: "React, JavaScript",
  },
  {
    icon: "✎",
    title: "Design",
    skills: "UI/UX, Figma",
  },
  {
    icon: "▣",
    title: "Business",
    skills: "Excel, Marketing",
  },
  {
    icon: "◎",
    title: "Languages",
    skills: "English, French",
  },
];

function Dashboard() {
  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">

        <Link to="/" className="dashboard-logo">
          <span className="dashboard-logo-icon">S</span>
          SkillSwap<span className="logo-dot">.</span>
        </Link>

        <nav className="dashboard-nav">

          <a href="#overview" className="dashboard-nav-link active">
            <span>⌂</span> Overview
          </a>

          <a href="#recommended" className="dashboard-nav-link">
            <span>⌕</span> Discover People
          </a>

          <a href="#requests" className="dashboard-nav-link">
            <span>↗</span> My Requests
          </a>

          <a href="#sessions" className="dashboard-nav-link">
            <span>▦</span> My Sessions
          </a>

          <a href="#skills" className="dashboard-nav-link">
            <span>✦</span> My Skills
          </a>

         <Link to="/profile" className="dashboard-nav-link">
            <span>♟</span> My Profile
          </Link>
          <a href="#settings" className="dashboard-nav-link">
            <span>⚙</span> Settings
          </a>

        </nav>

        <div className="dashboard-sidebar-bottom">

          <Link to="/login" className="dashboard-nav-link">
            <span>⇥</span> Logout
          </Link>

          <div className="sidebar-user">
            <div className="sidebar-avatar">U</div>

            <div>
              <strong>Demo User</strong>
              <small>SkillSwap Member</small>
            </div>
          </div>

        </div>
      </aside>

      {/* MAIN DASHBOARD */}
      <main className="dashboard-main" id="overview">

        {/* HEADER */}
        <header className="dashboard-header">

          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's what's happening in SkillSwap.</p>
          </div>

          <div className="dashboard-header-actions">

            <input
              type="search"
              placeholder="Search people or skills..."
              aria-label="Search people or skills"
            />

            <button
              className="notification-button"
              aria-label="Notifications"
            >
              ♧
              <span></span>
            </button>

            <div className="header-avatar">U</div>

          </div>
        </header>

        {/* PERSONAL STATISTICS */}
        <section className="dashboard-stats">

          {personalStats.map((stat) => (
            <article
              className="dashboard-stat-card"
              key={stat.title}
            >

              <div className="stat-icon">
                {stat.icon}
              </div>

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
              <p>See what's happening in the SkillSwap community.</p>
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

            {/* PEOPLE AVAILABLE TO TEACH */}
            <section
              className="dashboard-panel available-teachers-panel"
              id="available-teachers"
            >

              <div className="panel-heading">
                <div>
                  <h2>People Available to Teach</h2>
                  <p>
                    Connect with people ready to share their knowledge.
                  </p>
                </div>

                <a href="#available-teachers">View all →</a>
              </div>

              <div className="recommended-list">

                {availableTeachers.map((teacher) => (
                  <div
                    className="recommended-user"
                    key={teacher.name}
                  >

                    <div className="person-avatar">
                      {teacher.initials}
                    </div>

                    <div className="person-details">
                      <h3>{teacher.name}</h3>
                      <p>{teacher.role}</p>

                      <div className="teacher-skills">
                        {teacher.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>

                      <span className="skill-level">
                        {teacher.level}
                      </span>
                    </div>

                    <div className="teacher-actions">

                      <span
                        className={`user-status ${
                          teacher.status.toLowerCase()
                        }`}
                      >
                        {teacher.status}
                      </span>

                      <button className="outline-button">
                        View Profile
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            </section>

            {/* RECOMMENDED PEOPLE */}
            <section
              className="dashboard-panel"
              id="recommended"
            >

              <div className="panel-heading">
                <h2>People You Can Learn From</h2>
                <a href="#recommended">View all →</a>
              </div>

              <div className="recommended-list">

                {recommendedUsers.map((user) => (
                  <div
                    className="recommended-user"
                    key={user.name}
                  >

                    <div className="person-avatar">
                      {user.initials}
                    </div>

                    <div className="person-details">
                      <h3>{user.name}</h3>
                      <p>{user.skills}</p>
                    </div>

                    <span className="skill-level">
                      {user.level}
                    </span>

                    <span
                      className={`user-status ${user.status.toLowerCase()}`}
                    >
                      {user.status}
                    </span>

                    <button className="outline-button">
                      Connect
                    </button>

                  </div>
                ))}

              </div>
            </section>

            {/* INCOMING LEARNING REQUESTS */}
            <section
              className="dashboard-panel"
              id="requests"
            >

              <div className="panel-heading">
                <h2>Incoming Learning Requests</h2>
                <a href="#requests">View all →</a>
              </div>

              <div className="request-list">

                {requests.map((request) => (
                  <div
                    className="request-row"
                    key={request.name}
                  >

                    <div className="person-avatar">
                      {request.initials}
                    </div>

                    <div className="person-details">
                      <h3>{request.name}</h3>
                      <p>{request.skill}</p>
                    </div>

                    <span className="request-time">
                      {request.time}
                    </span>

                    <div className="request-actions">
                      <button className="accept-button">
                        Accept
                      </button>

                      <button className="decline-button">
                        Decline
                      </button>
                    </div>

                  </div>
                ))}

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

              <div className="recent-activity">
                <div className="activity-dot"></div>

                <div>
                  <p>
                    You accepted a learning request from{" "}
                    <strong>Sneha Iyer</strong>.
                  </p>
                  <small>2 hours ago</small>
                </div>
              </div>

              <div className="recent-activity">
                <div className="activity-dot"></div>

                <div>
                  <p>
                    You discovered a new React learning opportunity.
                  </p>
                  <small>Yesterday</small>
                </div>
              </div>

            </section>

          </div>

          {/* RIGHT COLUMN */}
          <div className="dashboard-column">

            {/* POPULAR SKILLS */}
            <section
              className="dashboard-panel"
              id="skills"
            >

              <div className="panel-heading">
                <h2>Popular Skills</h2>
                <a href="#skills">View all →</a>
              </div>

              <div className="popular-skills">

                {popularSkills.map((skill) => (
                  <div
                    className="popular-skill"
                    key={skill.title}
                  >
                    <span>{skill.icon}</span>
                    <h3>{skill.title}</h3>
                    <p>{skill.skills}</p>
                  </div>
                ))}

              </div>
            </section>

            {/* UPCOMING SESSIONS */}
            <section
              className="dashboard-panel"
              id="sessions"
            >

              <div className="panel-heading">
                <h2>Upcoming Sessions</h2>
                <a href="#sessions">View all →</a>
              </div>

              <div className="upcoming-session">

                <div className="session-icon">▦</div>

                <div className="session-details">
                  <h3>React Basics for Beginners</h3>
                  <p>16 Nov 2026 · 5:00 PM</p>
                  <small>With Rahul Sharma</small>
                </div>

                <span className="session-status">
                  Confirmed
                </span>

              </div>
            </section>

          </div>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
