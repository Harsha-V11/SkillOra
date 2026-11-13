
import { useState } from "react";
import { Link } from "react-router-dom";


const skillCatalogue = {
  Programming: [
    "JavaScript",
    "React",
    "Python",
    "Java",
    "Node.js",
  ],

  Database: [
    "MongoDB",
    "SQL",
  ],

  "Data & Analytics": [
    "Excel",
    "Power BI",
    "Data Science",
  ],

  Design: [
    "UI/UX Design",
    "Figma",
  ],

  Business: [
    "Marketing",
    "Project Management",
  ],

  Languages: [
    "English",
    "French",
  ],
};

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Demo User",
    bio: "Hello! I'm a technology enthusiast who enjoys learning new skills and sharing knowledge with others. I'm interested in web development and creative technologies.",
    skillsToTeach: "React · Advanced, JavaScript · Intermediate, HTML · Advanced",
    skillsToLearn: "Python, UI/UX Design, Node.js",
    availabilityDays: "Monday – Friday",
    availabilityTime: "5:00 PM – 8:00 PM",
    isTeachingOpen: true,
    certificationName: "",
    certificationIssuer: "",
    certificateUrl: "",
  });

  const [formData, setFormData] = useState(profile);

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">

        <Link to="/" className="dashboard-logo">
          <span className="dashboard-logo-icon">S</span>
          SkillSwap<span className="logo-dot">.</span>
        </Link>

        <nav className="dashboard-nav">

          <Link to="/dashboard" className="dashboard-nav-link">
            <span>⌂</span> Overview
          </Link>

          <a href="/dashboard#recommended" className="dashboard-nav-link">
            <span>⌕</span> Discover People
          </a>

          <a href="/dashboard#requests" className="dashboard-nav-link">
            <span>↗</span> My Requests
          </a>

          <a href="/dashboard#sessions" className="dashboard-nav-link">
            <span>▦</span> My Sessions
          </a>

          <a href="/dashboard#skills" className="dashboard-nav-link">
            <span>✦</span> My Skills
          </a>

          <Link to="/profile" className="dashboard-nav-link active">
            <span>♙</span> My Profile
          </Link>

          <a href="/dashboard#settings" className="dashboard-nav-link">
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

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        {/* HEADER */}
        <header className="dashboard-header">

          <div>
            <h1>{isEditing ? "Edit Profile" : "My Profile"}</h1>
            <p>
              {isEditing
                ? "Update your personal information and skills."
                : "Manage your personal information and skills."}
            </p>
          </div>

          <div className="dashboard-header-actions">

            <input
              type="search"
              placeholder="Search people or skills..."
              aria-label="Search people or skills"
            />

            <button className="notification-button" aria-label="Notifications">
              ♧
              <span></span>
            </button>

            <div className="header-avatar">U</div>

          </div>
        </header>

        {/* PROFILE CONTENT */}
        <div className="profile-page">

          {isEditing ? (

            /* EDIT PROFILE FORM */
            <section className="profile-section">

              <h2>Edit Your Information</h2>

              <form onSubmit={handleSave}>

                <div className="profile-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label>About Me</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>

                <div className="profile-form-group">
                  <label>Skills I Can Teach</label>
                  <input
                    type="text"
                    name="skillsToTeach"
                    value={formData.skillsToTeach}
                    onChange={handleChange}
                  />
                  <small>Separate skills with commas.</small>
                </div>

                <div className="profile-form-group">
                  <label>Skills I Want to Learn</label>
                  <input
                    type="text"
                    name="skillsToLearn"
                    value={formData.skillsToLearn}
                    onChange={handleChange}
                  />
                  <small>Separate skills with commas.</small>
                </div>

                <div className="profile-form-group">
                  <label>Available Days</label>
                  <input
                    type="text"
                    name="availabilityDays"
                    value={formData.availabilityDays}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-form-group">
                  <label>Preferred Time</label>
                  <input
                    type="text"
                    name="availabilityTime"
                    value={formData.availabilityTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-checkbox-label">
                    <input
                      type="checkbox"
                      name="isTeachingOpen"
                      checked={formData.isTeachingOpen}
                      onChange={handleChange}
                    />
                    Available to teach
                  </label>
                </div>

                <h2>Certifications</h2>

                <div className="profile-form-group">
                  <label>Certificate Name</label>
                  <input
                    type="text"
                    name="certificationName"
                    value={formData.certificationName}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-form-group">
                  <label>Issuing Organization</label>
                  <input
                    type="text"
                    name="certificationIssuer"
                    value={formData.certificationIssuer}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-form-group">
                  <label>Certificate URL (Optional)</label>
                  <input
                    type="url"
                    name="certificateUrl"
                    value={formData.certificateUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-form-actions">

                  <button type="submit" className="profile-edit-button">
                    Save Changes
                  </button>

                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>

                </div>

              </form>
            </section>

          ) : (

            /* NORMAL PROFILE VIEW */
            <>

              <section className="profile-header">

                <div className="profile-avatar">
                  {profile.name.charAt(0).toUpperCase()}
                </div>

                <div className="profile-header-info">
                  <h1>{profile.name}</h1>
                  <p>SkillSwap Member</p>

                  <span className="profile-availability">
                    {profile.isTeachingOpen
                      ? "Available to teach"
                      : "Not available to teach"}
                  </span>
                </div>

                <button
                  className="profile-edit-button"
                  onClick={handleEdit}
                >
                  Edit Profile
                </button>

              </section>

              <section className="profile-section">
                <h2>About Me</h2>
                <p>{profile.bio}</p>
              </section>

              <section className="profile-section">
                <h2>Skills I Can Teach</h2>
                <div className="profile-skills">
                  {profile.skillsToTeach.split(",").filter(Boolean).map((skill, index) => (
                    <span key={index}>{skill.trim()}</span>
                  ))}
                </div>
              </section>

              <section className="profile-section">
                <h2>Skills I Want to Learn</h2>
                <div className="profile-skills">
                  {profile.skillsToLearn.split(",").filter(Boolean).map((skill, index) => (
                    <span key={index}>{skill.trim()}</span>
                  ))}
                </div>
              </section>

              <section className="profile-section">
                <h2>Teaching Availability</h2>
                <p>{profile.availabilityDays}</p>
                <p>Preferred time: {profile.availabilityTime}</p>
              </section>

              <section className="profile-section">
                <h2>Certifications</h2>

                {profile.certificationName ? (
                  <>
                    <h3>{profile.certificationName}</h3>
                    <p>{profile.certificationIssuer}</p>

                    {profile.certificateUrl && (
                      <a
                        href={profile.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Certificate
                      </a>
                    )}
                  </>
                ) : (
                  <p>No certifications added yet.</p>
                )}
              </section>

              <section className="profile-section">
                <h2>Learning Activity</h2>

                <div className="profile-activity">
                  <div>
                    <h3>12</h3>
                    <p>Completed Sessions</p>
                  </div>

                  <div>
                    <h3>5</h3>
                    <p>Skills Shared</p>
                  </div>

                  <div>
                    <h3>4.8</h3>
                    <p>Average Rating</p>
                  </div>
                </div>
              </section>

            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default Profile;
