
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";


const skillCatalogue = {
  Programming: [
    "JavaScript",
    "React",
    "Python",
    "HTML",
    "Java",
    "Node.js",
  ],
  Database: ["MongoDB", "SQL"],
  "Data & Analytics": ["Excel", "Power BI", "Data Science"],
  Design: ["UI/UX Design", "Figma"],
  Business: ["Marketing", "Project Management"],
  Languages: ["English", "French"],
};

function Profile() {
  const location = useLocation();

const viewedUser = location.state?.user;
const isViewingOther = Boolean(viewedUser);
  const [isEditing, setIsEditing] = useState(false);
  const [teachSearch, setTeachSearch] = useState("");
  const [learnSearch, setLearnSearch] = useState("");

  const [profile, setProfile] = useState({
    name: "Demo User",
    bio: "Hello! I'm a technology enthusiast who enjoys learning new skills and sharing knowledge with others. I'm interested in web development and creative technologies.",

    teachSkills: [
      { name: "React", level: "Advanced" },
      { name: "JavaScript", level: "Intermediate" },
      { name: "HTML", level: "Advanced" },
    ],

    learnSkills: ["Python", "UI/UX Design", "Node.js"],

    availabilityDays: "Monday – Friday",
    availabilityTime: "5:00 PM – 8:00 PM",
    isTeachingOpen: true,
    certificationName: "",
    certificationIssuer: "",
    certificateUrl: "",
  });

  const [formData, setFormData] = useState(profile);
  const displayedProfile = viewedUser
  ? {
      ...profile,
      name: viewedUser.name || profile.name,
      bio:
        viewedUser.bio ||
        `${viewedUser.role || "SkillSwap member"} interested in sharing and learning new skills.`,
      teachSkills: (viewedUser.teachSkills || profile.teachSkills).map(
        (skill) =>
          typeof skill === "string"
            ? { name: skill, level: "Not specified" }
            : skill
      ),
      learnSkills: viewedUser.learnSkills || profile.learnSkills,
      isTeachingOpen:
        viewedUser.isTeachingOpen ??
        viewedUser.isAvailable ??
        viewedUser.available ??
        profile.isTeachingOpen,
    }
  : profile;

  const handleEdit = () => {
    setFormData(profile);
    setTeachSearch("");
    setLearnSearch("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(profile);
    setTeachSearch("");
    setLearnSearch("");
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillToggle = (skill, type) => {
    setFormData((previous) => {
      if (type === "teach") {
        const exists = previous.teachSkills.some(
          (item) => item.name === skill
        );

        return {
          ...previous,
          teachSkills: exists
            ? previous.teachSkills.filter((item) => item.name !== skill)
            : [...previous.teachSkills, { name: skill, level: "Beginner" }],
        };
      }

      const exists = previous.learnSkills.includes(skill);

      return {
        ...previous,
        learnSkills: exists
          ? previous.learnSkills.filter((item) => item !== skill)
          : [...previous.learnSkills, skill],
      };
    });
  };

  const handleSkillLevelChange = (skill, level) => {
    setFormData((previous) => ({
      ...previous,
      teachSkills: previous.teachSkills.map((item) =>
        item.name === skill ? { ...item, level } : item
      ),
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
      <Sidebar/>

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

                {/* SKILLS I CAN TEACH */}
                <div className="profile-form-group">
                  <h3>Skills I Can Teach</h3>
                  <p>Select your skills and proficiency levels.</p>

                  <input
                    type="search"
                    className="skill-search-input"
                    placeholder="Search skills to teach..."
                    value={teachSearch}
                    onChange={(e) => setTeachSearch(e.target.value)}
                  />

                  {Object.entries(skillCatalogue).map(([category, skills]) => {
                    const filteredSkills = skills.filter((skill) =>
                      skill.toLowerCase().includes(teachSearch.toLowerCase())
                    );

                    if (filteredSkills.length === 0) return null;

                    return (
                      <div className="skill-category" key={category}>
                        <h4>{category}</h4>

                        <div className="skill-selection-grid">
                          {filteredSkills.map((skill) => {
                            const selected = formData.teachSkills.some(
                              (item) => item.name === skill
                            );

                            const currentSkill = formData.teachSkills.find(
                              (item) => item.name === skill
                            );

                            return (
                              <div
                                className="skill-selection-item"
                                key={skill}
                              >
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() =>
                                      handleSkillToggle(skill, "teach")
                                    }
                                  />
                                  {skill}
                                </label>

                                {selected && (
                                  <select
                                    value={currentSkill.level}
                                    onChange={(e) =>
                                      handleSkillLevelChange(
                                        skill,
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">
                                      Intermediate
                                    </option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                  </select>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {Object.values(skillCatalogue).flat().filter((skill) =>
                    skill.toLowerCase().includes(teachSearch.toLowerCase())
                  ).length === 0 && <p>No matching skills found.</p>}
                </div>

                {/* SKILLS I WANT TO LEARN */}
                <div className="profile-form-group">
                  <h3>Skills I Want to Learn</h3>

                  <input
                    type="search"
                    className="skill-search-input"
                    placeholder="Search skills to learn..."
                    value={learnSearch}
                    onChange={(e) => setLearnSearch(e.target.value)}
                  />

                  {Object.entries(skillCatalogue).map(([category, skills]) => {
                    const filteredSkills = skills.filter((skill) =>
                      skill.toLowerCase().includes(learnSearch.toLowerCase())
                    );

                    if (filteredSkills.length === 0) return null;

                    return (
                      <div className="skill-category" key={category}>
                        <h4>{category}</h4>

                        <div className="skill-selection-grid">
                          {filteredSkills.map((skill) => (
                            <label className="skill-checkbox" key={skill}>
                              <input
                                type="checkbox"
                                checked={formData.learnSkills.includes(skill)}
                                onChange={() =>
                                  handleSkillToggle(skill, "learn")
                                }
                              />
                              {skill}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {Object.values(skillCatalogue).flat().filter((skill) =>
                    skill.toLowerCase().includes(learnSearch.toLowerCase())
                  ).length === 0 && <p>No matching skills found.</p>}
                </div>

                {/* AVAILABILITY */}
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

                {/* CERTIFICATIONS */}
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
            {isViewingOther && (
                <Link to="/discover" className="profile-back-button">
                  ← Back to Discover People
                </Link>
              )}
              <section className="profile-header">
                <div className="profile-avatar">
                  {displayedProfile.name.charAt(0).toUpperCase()}
                </div>

                <div className="profile-header-info">
                  <h1>{displayedProfile.name}</h1>
                  <p>{isViewingOther ? displayedProfile.role || "SkillSwap Member" : "SkillSwap Member"}</p>

                  <span className="profile-availability">
                    {displayedProfile.isTeachingOpen
                      ? "Available to teach"
                      : "Not available to teach"}
                  </span>
                </div>

                {!isViewingOther && (
                  <button
                    className="profile-edit-button"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                )}
              </section>

              <section className="profile-section">
                <h2>About Me</h2>
                <p>{displayedProfile.bio}</p>
              </section>

              <section className="profile-section">
                <h2>Skills I Can Teach</h2>
                <div className="profile-skills">
                  {displayedProfile.teachSkills.map((skill) => (
                    <span key={skill.name}>
                      {skill.name} · {skill.level}
                    </span>
                  ))}
                </div>
              </section>

              <section className="profile-section">
                <h2>Skills I Want to Learn</h2>
                <div className="profile-skills">
                  {displayedProfile.learnSkills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </section>

              <section className="profile-section">
                <h2>Teaching Availability</h2>
                <p>{displayedProfile.availabilityDays}</p>
                <p>Preferred time: {displayedProfile.availabilityTime}</p>
              </section>

              <section className="profile-section">
              <h2>Certifications</h2>

              {displayedProfile.certificationName ? (
                <>
                  <h3>{displayedProfile.certificationName}</h3>
                  <p>{displayedProfile.certificationIssuer}</p>

                  {displayedProfile.certificateUrl && (
                    <a
                      href={displayedProfile.certificateUrl}
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
