
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

const skillCatalogue = {
  Programming: ["HTML", "JavaScript", "React", "Python", "Java", "Node.js"],
  Database: ["MongoDB", "SQL"],
  "Data & Analytics": ["Excel", "Power BI", "Data Science"],
  Design: ["UI/UX Design", "Figma"],
  Business: ["Marketing", "Project Management"],
  Languages: ["English", "French"],
};

const allCatalogueSkills = Object.values(skillCatalogue).flat();

function MySkills() {
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);

  const [modalType, setModalType] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch skills from MongoDB
  useEffect(() => {
    let isActive = true;

    const fetchSkills = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (isActive) {
          setMessage("Please log in to view your skills.");
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch skills.");
        }

        if (isActive) {
          setTeachSkills(
            Array.isArray(data.user.teachSkills)
              ? data.user.teachSkills
              : []
          );

          setLearnSkills(
            Array.isArray(data.user.learnSkills)
              ? data.user.learnSkills
              : []
          );
        }
      } catch (error) {
        if (isActive) {
          setMessage(error.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchSkills();

    return () => {
      isActive = false;
    };
  }, []);

  // Open the Add Skills popup
  const openSkillModal = (type) => {
    setModalType(type);
    setSearch("");

    setSelectedSkills(
      type === "teach"
        ? [...teachSkills]
        : [...learnSkills]
    );
  };

  // Select or deselect skills inside the popup
  const toggleSelectedSkill = (skill) => {
    setSelectedSkills((previous) =>
      previous.includes(skill)
        ? previous.filter((item) => item !== skill)
        : [...previous, skill]
    );
  };

  // Add selected skills to the appropriate section
  const confirmSkills = () => {
    const uniqueSkills = [...new Set(
      selectedSkills.map((skill) => skill.trim()).filter(Boolean)
    )];

    if (modalType === "teach") {
      setTeachSkills(uniqueSkills);
    } else {
      setLearnSkills(uniqueSkills);
    }

    setSaved(false);
    setMessage("");
    setModalType("");
  };

  // Remove teaching skill
  const removeTeachSkill = (skill) => {
    setTeachSkills((previous) =>
      previous.filter((item) => item !== skill)
    );

    setSaved(false);
    setMessage("");
  };

  // Remove learning skill
  const removeLearnSkill = (skill) => {
    setLearnSkills((previous) =>
      previous.filter((item) => item !== skill)
    );

    setSaved(false);
    setMessage("");
  };

  // Save skills to MongoDB
  const saveSkills = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in again to save your skills.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setMessage("");

    try {
      const payload = {
        teachSkills: [...new Set(teachSkills)],
        learnSkills: [...new Set(learnSkills)],
      };

      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save skills.");
      }

      const updatedTeachSkills = Array.isArray(data.user?.teachSkills)
        ? data.user.teachSkills
        : payload.teachSkills;

      const updatedLearnSkills = Array.isArray(data.user?.learnSkills)
        ? data.user.learnSkills
        : payload.learnSkills;

      setTeachSkills(updatedTeachSkills);
      setLearnSkills(updatedLearnSkills);

      setSaved(true);
      setMessage("Changes saved successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Include existing custom skills in the modal.
  const getModalCategories = () => {
    const categories = Object.entries(skillCatalogue).map(
      ([category, skills]) => ({
        category,
        skills: skills.filter((skill) =>
          skill.toLowerCase().includes(search.toLowerCase())
        ),
      })
    );

    const customSkills = selectedSkills.filter(
      (skill) => !allCatalogueSkills.includes(skill)
    );

    if (customSkills.length > 0) {
      categories.push({
        category: "Other Skills",
        skills: customSkills.filter((skill) =>
          skill.toLowerCase().includes(search.toLowerCase())
        ),
      });
    }

    return categories.filter((item) => item.skills.length > 0);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">
          <div className="profile-page my-skills-page">
            <p>Loading your skills...</p>
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
          <h2>My Skills</h2>
        </header>

        <div className="profile-page my-skills-page">
          <div className="reviews-heading">
            <h1>My Skills</h1>
            <p>
              Manage the skills you can teach and the skills you want to learn.
            </p>
          </div>

          {message && (
            <p
              className="my-skills-success"
              role="status"
            >
              {message}
            </p>
          )}

          {/* SKILL SUMMARY */}
          <div className="my-skills-summary">
            <div className="my-skills-summary-card">
              <span>Teaching Skills</span>
              <h2>{teachSkills.length}</h2>
              <small>Skills you can teach</small>
            </div>

            <div className="my-skills-summary-card">
              <span>Learning Skills</span>
              <h2>{learnSkills.length}</h2>
              <small>Skills you want to learn</small>
            </div>
          </div>

          {/* TEACHING SKILLS CARD */}
          <section className="my-skills-card">
            <div className="my-skills-heading">
              <div>
                <h2>Skills I Can Teach</h2>
                <p>Share your knowledge with the community.</p>
              </div>

              <span>{teachSkills.length} Skills</span>
            </div>

            <div className="my-skills-selected">
              {teachSkills.length > 0 ? (
                teachSkills.map((skill) => (
                  <div className="my-skill-item" key={skill}>
                    <div className="my-skill-information">
                      <strong>{skill}</strong>
                      <small>Available to teach</small>
                    </div>

                    <button
                      type="button"
                      className="my-skill-remove"
                      onClick={() => removeTeachSkill(skill)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="my-skills-empty">
                  You haven't added any teaching skills yet.
                </p>
              )}
            </div>

            <button
              type="button"
              className="my-skills-add-button"
              onClick={() => openSkillModal("teach")}
            >
              + Add Teaching Skills
            </button>
          </section>

          {/* LEARNING SKILLS CARD */}
          <section className="my-skills-card">
            <div className="my-skills-heading">
              <div>
                <h2>Skills I Want to Learn</h2>
                <p>Choose what you would like to learn from others.</p>
              </div>

              <span>{learnSkills.length} Skills</span>
            </div>

            <div className="my-learning-skill-list">
              {learnSkills.length > 0 ? (
                learnSkills.map((skill) => (
                  <div className="my-learning-skill" key={skill}>
                    <span>{skill}</span>

                    <button
                      type="button"
                      className="my-skill-remove"
                      onClick={() => removeLearnSkill(skill)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="my-skills-empty">
                  You haven't added any learning skills yet.
                </p>
              )}
            </div>

            <button
              type="button"
              className="my-skills-add-button"
              onClick={() => openSkillModal("learn")}
            >
              + Add Learning Skills
            </button>
          </section>

          {/* SAVE CHANGES */}
          <div className="my-skills-save-area">
            {saved && (
              <span className="my-skills-success">
                Changes saved successfully!
              </span>
            )}

            <button
              type="button"
              className="my-skills-save-button"
              onClick={saveSkills}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </main>

      {/* ADD SKILLS POPUP */}
      {modalType && (
        <div
          className="my-skills-modal-overlay"
          onClick={() => setModalType("")}
        >
          <div
            className="my-skills-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="my-skills-modal-header">
              <div>
                <h2>
                  {modalType === "teach"
                    ? "Add Teaching Skills"
                    : "Add Learning Skills"}
                </h2>

                <p>
                  Select the skills you want to{" "}
                  {modalType === "teach" ? "teach" : "learn"}.
                </p>
              </div>

              <button
                type="button"
                className="my-skills-modal-close"
                onClick={() => setModalType("")}
              >
                ×
              </button>
            </div>

            <input
              type="search"
              className="my-skills-search"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="my-skills-modal-content">
              {getModalCategories().map(({ category, skills }) => (
                <div
                  className="my-skills-category"
                  key={category}
                >
                  <h4>{category}</h4>

                  <div className="my-skills-options">
                    {skills.map((skill) => (
                      <label
                        className={
                          selectedSkills.includes(skill)
                            ? "selected"
                            : ""
                        }
                        key={skill}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill)}
                          onChange={() =>
                            toggleSelectedSkill(skill)
                          }
                        />

                        {skill}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {getModalCategories().length === 0 && (
                <p className="my-skills-empty">
                  No matching skills found.
                </p>
              )}
            </div>

            <div className="my-skills-modal-footer">
              <span>{selectedSkills.length} selected</span>

              <div>
                <button
                  type="button"
                  className="my-skills-cancel-button"
                  onClick={() => setModalType("")}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="my-skills-save-button"
                  onClick={confirmSkills}
                >
                  Add Skills
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MySkills;
