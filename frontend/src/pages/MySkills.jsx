
import { useState } from "react";
import Sidebar from "../components/Sidebar";

const skillCatalogue = {
  Programming: ["HTML", "JavaScript", "React", "Python", "Java", "Node.js"],
  Database: ["MongoDB", "SQL"],
  "Data & Analytics": ["Excel", "Power BI", "Data Science"],
  Design: ["UI/UX Design", "Figma"],
  Business: ["Marketing", "Project Management"],
  Languages: ["English", "French"],
};

const defaultTeachSkills = [
  { name: "React", level: "Advanced" },
  { name: "JavaScript", level: "Intermediate" },
  { name: "HTML", level: "Advanced" },
];

const defaultLearnSkills = ["Python", "UI/UX Design", "Node.js"];

function MySkills() {
  const [teachSkills, setTeachSkills] = useState(() =>
    JSON.parse(
      localStorage.getItem("skillswap-teach-skills") ||
        JSON.stringify(defaultTeachSkills)
    )
  );

  const [learnSkills, setLearnSkills] = useState(() =>
    JSON.parse(
      localStorage.getItem("skillswap-learn-skills") ||
        JSON.stringify(defaultLearnSkills)
    )
  );

  const [modalType, setModalType] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [saved, setSaved] = useState(false);

  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  // Open the Add Skills popup
  const openSkillModal = (type) => {
    setModalType(type);
    setSearch("");
    setSelectedSkills(
      type === "teach"
        ? teachSkills.map((skill) => skill.name)
        : [...learnSkills]
    );
  };

  // Select or deselect skills inside the popup
  const toggleSelectedSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((item) => item !== skill)
        : [...prev, skill]
    );
  };

  // Add selected skills to the appropriate section
  const confirmSkills = () => {
    if (modalType === "teach") {
      setTeachSkills((prev) => {
        const existing = [...prev];

        selectedSkills.forEach((skill) => {
          if (!existing.some((item) => item.name === skill)) {
            existing.push({ name: skill, level: "Beginner" });
          }
        });

        return existing.filter((item) =>
          selectedSkills.includes(item.name)
        );
      });
    } else {
      setLearnSkills(selectedSkills);
    }

    setSaved(false);
    setModalType("");
  };

  const removeTeachSkill = (skill) => {
    setTeachSkills((prev) =>
      prev.filter((item) => item.name !== skill)
    );
    setSaved(false);
  };

  const removeLearnSkill = (skill) => {
    setLearnSkills((prev) => prev.filter((item) => item !== skill));
    setSaved(false);
  };

  const updateLevel = (skill, level) => {
    setTeachSkills((prev) =>
      prev.map((item) =>
        item.name === skill ? { ...item, level } : item
      )
    );
    setSaved(false);
  };

  const saveSkills = () => {
    localStorage.setItem(
      "skillswap-teach-skills",
      JSON.stringify(teachSkills)
    );

    localStorage.setItem(
      "skillswap-learn-skills",
      JSON.stringify(learnSkills)
    );

    setSaved(true);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar/>

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
                  <div className="my-skill-item" key={skill.name}>
                    <div className="my-skill-information">
                      <strong>{skill.name}</strong>
                      <small>Teaching proficiency</small>
                    </div>

                    <select
                      value={skill.level}
                      onChange={(e) =>
                        updateLevel(skill.name, e.target.value)
                      }
                    >
                      {levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="my-skill-remove"
                      onClick={() => removeTeachSkill(skill.name)}
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
            >
              Save Changes
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
              {Object.entries(skillCatalogue).map(([category, skills]) => {
                const filteredSkills = skills.filter((skill) =>
                  skill.toLowerCase().includes(search.toLowerCase())
                );

                if (filteredSkills.length === 0) return null;

                return (
                  <div className="my-skills-category" key={category}>
                    <h4>{category}</h4>

                    <div className="my-skills-options">
                      {filteredSkills.map((skill) => (
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
                            onChange={() => toggleSelectedSkill(skill)}
                          />
                          {skill}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              {!Object.values(skillCatalogue).flat().some((skill) =>
                skill.toLowerCase().includes(search.toLowerCase())
              ) && (
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
