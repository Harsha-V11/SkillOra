
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const sampleUsers = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Frontend Developer",
    teachSkills: ["React", "JavaScript", "HTML"],
    learnSkills: ["Python", "UI/UX Design"],
    level: "Advanced",
    availability: "Available to teach",
    match: "You can learn React",
    initials: "RS",
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: 2,
    name: "Priya Reddy",
    role: "Data Analyst",
    teachSkills: ["Python", "Excel", "Power BI"],
    learnSkills: ["JavaScript", "React"],
    level: "Intermediate",
    availability: "Available to teach",
    match: "You can learn Python",
    initials: "PR",
    rating: 4.9,
    reviewCount: 32,
  },
  {
    id: 3,
    name: "Arjun Kumar",
    role: "UI/UX Designer",
    teachSkills: ["Figma", "UI/UX Design"],
    learnSkills: ["HTML", "CSS", "React"],
    level: "Advanced",
    availability: "Available to teach",
    match: "You can learn UI/UX Design",
    initials: "AK",
    rating: 4.6,
    reviewCount: 18,
  },
  {
    id: 4,
    name: "Sneha Patel",
    role: "Software Developer",
    teachSkills: ["Java", "Python", "SQL"],
    learnSkills: ["MongoDB", "React"],
    level: "Intermediate",
    availability: "Currently unavailable",
    match: "Skills match your interests",
    initials: "SP",
    rating: 4.7,
    reviewCount: 21,
  },
];

function Discover() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
const [selectedSkill, setSelectedSkill] = useState("All Skills");

const [sentRequests, setSentRequests] = useState(() =>
JSON.parse(localStorage.getItem("skillswap-sent-requests") || "[]")
);

const handleSendRequest = (user) => {
const alreadySent = sentRequests.some(
    (request) => request.userId === user.id
);

if (alreadySent) return;

const newRequest = {
    id: Date.now(),
    userId: user.id,
    name: user.name,
    initials: user.initials,
    role: user.role,
    wantsToLearn: user.teachSkills[0],
    canTeach: "React",
    status: "Pending",
};

const updatedRequests = [...sentRequests, newRequest];

setSentRequests(updatedRequests);

localStorage.setItem(
    "skillswap-sent-requests",
    JSON.stringify(updatedRequests)
);
};

  const skills = [
    "All Skills",
    "React",
    "JavaScript",
    "Python",
    "HTML",
    "Java",
    "MongoDB",
    "SQL",
    "Excel",
    "Power BI",
    "Figma",
    "UI/UX Design",
  ];

  const filteredUsers = sampleUsers.filter((user) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(searchValue) ||
      user.teachSkills.some((skill) =>
        skill.toLowerCase().includes(searchValue)
      ) ||
      user.learnSkills.some((skill) =>
        skill.toLowerCase().includes(searchValue)
      );

    const matchesSkill =
      selectedSkill === "All Skills" ||
      user.teachSkills.includes(selectedSkill) ||
      user.learnSkills.includes(selectedSkill);

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <h1>Discover People</h1>
            <p>Find people to exchange skills and learn together.</p>
          </div>

          <div className="dashboard-header-actions">
            <div className="header-avatar">U</div>
          </div>
        </header>

        <div className="profile-page discover-page">

          {/* INTRO */}
          <section className="discover-heading">
            <div>
              <h2>Find Your Learning Partner</h2>
              <p>
                Connect with people who can teach what you want to learn.
              </p>
            </div>

            <span>{filteredUsers.length} people found</span>
          </section>

          {/* SEARCH AND FILTER */}
          <section className="discover-filters">
            <input
              type="search"
              placeholder="Search by name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </section>

          {/* USER CARDS */}
          <section className="discover-grid">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <article className="discover-card" key={user.id}>

                  <div className="discover-card-header">
                    <div className="discover-avatar">
                      {user.initials}
                    </div>

                    <div>
                      <h3>{user.name}</h3>

                      <div className="discover-user-rating">
                        <span className="rating-stars">★</span>
                        <strong>{user.rating}</strong>
                        <span>({user.reviewCount} reviews)</span>
                      </div>

                      <Link
                        to="/teacher-reviews"
                        state={{ teacher: user }}
                        className="view-teacher-reviews"
                      >
                        View Reviews →
                      </Link>

                      <p>{user.role}</p>
                    </div>
                  </div>

                  <div className="discover-match">
                    ✦ {user.match}
                  </div>

                  <div className="discover-skills">
                    <h4>Can Teach</h4>
                    <div className="discover-tags">
                      {user.teachSkills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="discover-skills">
                    <h4>Wants to Learn</h4>
                    <div className="discover-tags learning">
                      {user.learnSkills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="discover-card-footer">
                    <span className="discover-level">
                      {user.level}
                    </span>

                    <span
                      className={
                        user.availability === "Available to teach"
                          ? "discover-status available"
                          : "discover-status unavailable"
                      }
                    >
                      {user.availability}
                    </span>
                  </div>

                  <div className="discover-actions">
                    <button
                      type="button"
                      className="discover-view-button"
                      onClick={() =>
                        navigate("/profile", {
                          state: { user: user },
                        })
                      }
                    >
                      View Profile
                    </button>

                   <button
                    type="button"
                    className="discover-request-button"
                    onClick={() => handleSendRequest(user)}
                    disabled={sentRequests.some(
                        (request) => request.userId === user.id
                    )}
                    >
                    {sentRequests.some(
                        (request) => request.userId === user.id
                    )
                        ? "Request Sent"
                        : "Send Request"}
                    </button>
                  </div>

                </article>
              ))
            ) : (
              <div className="discover-empty">
                <h3>No people found</h3>
                <p>Try searching with another name or skill.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

export default Discover;
