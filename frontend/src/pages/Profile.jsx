
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

const skillCatalogue = {
  Programming: ["JavaScript", "React", "Python", "HTML", "Java", "Node.js"],
  Database: ["MongoDB", "SQL"],
  "Data & Analytics": ["Excel", "Power BI", "Data Science"],
  Design: ["UI/UX Design", "Figma"],
  Business: ["Marketing", "Project Management"],
  Languages: ["English", "French"],
};

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_AVAILABILITY_DAYS =
  "Monday, Tuesday, Wednesday, Thursday, Friday";

const emptyProfile = {
  name: "",
  email: "",
  profession: "",
  bio: "",
  teachSkills: [],
  learnSkills: [],
  availabilityDays: DEFAULT_AVAILABILITY_DAYS,
  availabilityTime: "17:00-20:00",
  isTeachingOpen: true,
  certificationName: "",
  certificationIssuer: "",
  certificateUrl: "",
  profileImage: "",
};

// Convert saved availability days into an array.
function parseAvailabilityDays(value) {
  if (!value || value === "Not provided") return [];

  if (/monday\s*[-–—]\s*friday/i.test(value)) {
    return WEEK_DAYS.slice(0, 5);
  }

  return value
    .split(",")
    .map((day) => day.trim())
    .filter((day) => WEEK_DAYS.includes(day));
}

// Convert 12-hour time into 24-hour time.
function convertTo24Hour(time) {
  if (!time) return "";

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) return time;

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

// Read saved availability time.
function parseAvailabilityTime(value) {
  if (!value || value === "Not provided") {
    return { start: "17:00", end: "20:00" };
  }

  const parts = value.split(/\s*[-–—]\s*/);

  if (parts.length !== 2) {
    return { start: "17:00", end: "20:00" };
  }

  return {
    start: convertTo24Hour(parts[0].trim()),
    end: convertTo24Hour(parts[1].trim()),
  };
}

// Display availability in a readable 12-hour format.
function formatAvailabilityTime(value) {
  const { start, end } = parseAvailabilityTime(value);

  const format = (time) => {
    if (!time) return "Not provided";

    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  return `${format(start)} – ${format(end)}`;
}

// Organize available skills into categories.
const getSkillCategories = (selectedSkills, search) => {
  const categories = Object.entries(skillCatalogue).map(
    ([category, skills]) => ({
      category,
      skills: skills.filter((skill) =>
        skill.toLowerCase().includes(search.toLowerCase())
      ),
    })
  );

  const catalogueSkills = Object.values(skillCatalogue).flat();

  const customSkills = selectedSkills.filter(
    (skill) => !catalogueSkills.includes(skill)
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

function Profile() {
  const location = useLocation();
  const viewedUser = location.state?.user;
  const userId = viewedUser?._id || viewedUser?.id;
  const isViewingOther = Boolean(viewedUser);

  const [isEditing, setIsEditing] = useState(false);
  const [teachSearch, setTeachSearch] = useState("");
  const [learnSearch, setLearnSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profileError, setProfileError] = useState(false);

  const [profile, setProfile] = useState(emptyProfile);
  const [formData, setFormData] = useState(emptyProfile);

  const [activity, setActivity] = useState({
    completedSessions: null,
    averageRating: null,
  });

  // Load profile information.
  useEffect(() => {
    let isActive = true;

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (isActive) {
          setMessage("Please log in to view this profile.");
          setProfileError(true);
          setLoading(false);
        }
        return;
      }

      if (isViewingOther && !userId) {
        if (isActive) {
          setMessage(
            "Unable to identify this member. Please open the profile again from Discover."
          );
          setProfileError(true);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setMessage("");
        setProfileError(false);

        setActivity({
          completedSessions: null,
          averageRating: null,
        });

        const endpoint = isViewingOther
          ? `${API_URL}/users/${userId}`
          : `${API_URL}/users/me`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        const user = data.user;

        // Use the default days only if the saved value is empty.
        const savedAvailabilityDays =
          typeof user.availabilityDays === "string"
            ? user.availabilityDays.trim()
            : "";

        const availabilityDays =
          !savedAvailabilityDays ||
          savedAvailabilityDays === "Not provided"
            ? DEFAULT_AVAILABILITY_DAYS
            : savedAvailabilityDays;

        const loadedProfile = {
          name: user.name || "",
          email: isViewingOther ? "" : user.email || "",
          profession: user.profession || "",
          bio: user.bio || "",

          teachSkills: Array.isArray(user.teachSkills)
            ? user.teachSkills
            : [],

          learnSkills: Array.isArray(user.learnSkills)
            ? user.learnSkills
            : [],

          availabilityDays: parseAvailabilityDays(
            availabilityDays
          ).join(", "),

          availabilityTime: (() => {
            const { start, end } = parseAvailabilityTime(
              user.availabilityTime || ""
            );

            return `${start}-${end}`;
          })(),

          isTeachingOpen: user.isTeachingOpen ?? true,
          certificationName: user.certificationName || "",
          certificationIssuer: user.certificationIssuer || "",
          certificateUrl: user.certificateUrl || "",
          profileImage: user.profileImage || "",
        };

        if (!isActive) return;

        setProfile(loadedProfile);
        setFormData(loadedProfile);
        setLoading(false);

        // Load reviews independently.
        try {
          const reviewResponse = await fetch(
            `${API_URL}/reviews/user/${user._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const reviewData = await reviewResponse.json();

          if (!reviewResponse.ok) {
            throw new Error("Unable to load reviews.");
          }

          const reviews = reviewData.reviews || [];

          const averageRating =
            reviews.length > 0
              ? (
                  reviews.reduce(
                    (total, review) =>
                      total + Number(review.rating || 0),
                    0
                  ) / reviews.length
                ).toFixed(1)
              : "—";

          if (isActive) {
            setActivity((previous) => ({
              ...previous,
              averageRating,
            }));
          }
        } catch (error) {
          console.error("Review loading error:", error);
        }

        // Load completed sessions for the logged-in user.
        if (!isViewingOther) {
          try {
            const sessionResponse = await fetch(
              `${API_URL}/sessions`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const sessionData = await sessionResponse.json();

            if (!sessionResponse.ok) {
              throw new Error("Unable to load session activity.");
            }

            const sessions = sessionData.sessions || [];

            const completedSessions = sessions.filter(
              (session) => session.status === "completed"
            ).length;

            if (isActive) {
              setActivity((previous) => ({
                ...previous,
                completedSessions,
              }));
            }
          } catch (error) {
            console.error("Session loading error:", error);
          }
        }
      } catch (error) {
        if (isActive) {
          setMessage(error.message);
          setProfileError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, [isViewingOther, userId]);

  const displayedProfile = profile;

  const handleEdit = () => {
    setFormData({ ...profile });
    setTeachSearch("");
    setLearnSearch("");
    setMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setTeachSearch("");
    setLearnSearch("");
    setMessage("");
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Select or deselect available teaching days.
  const handleAvailabilityDayToggle = (day) => {
    setFormData((previous) => {
      const selectedDays = parseAvailabilityDays(
        previous.availabilityDays
      );

      const updatedDays = selectedDays.includes(day)
        ? selectedDays.filter((item) => item !== day)
        : [...selectedDays, day];

      const sortedDays = WEEK_DAYS.filter((item) =>
        updatedDays.includes(item)
      );

      return {
        ...previous,
        availabilityDays: sortedDays.join(", "),
      };
    });
  };

  // Update the common start and end times.
  const handleAvailabilityTimeChange = (field, value) => {
    setFormData((previous) => {
      const current = parseAvailabilityTime(
        previous.availabilityTime
      );

      const updated = {
        ...current,
        [field]: value,
      };

      return {
        ...previous,
        availabilityTime: `${updated.start}-${updated.end}`,
      };
    });
  };

  // Select or deselect skills.
  const handleSkillToggle = (skill, type) => {
    setFormData((previous) => {
      if (type === "teach") {
        const exists = previous.teachSkills.includes(skill);

        return {
          ...previous,
          teachSkills: exists
            ? previous.teachSkills.filter((item) => item !== skill)
            : [...previous.teachSkills, skill],
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

  // Save profile information.
  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Your login session is missing. Please log in again.");
      return;
    }

    if (!formData.name.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }

    if (parseAvailabilityDays(formData.availabilityDays).length === 0) {
      setMessage("Please select at least one available day.");
      return;
    }

    const { start, end } = parseAvailabilityTime(
      formData.availabilityTime
    );

    if (!start || !end || start >= end) {
      setMessage("End time must be later than start time.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        profession: formData.profession,
        bio: formData.bio,
        teachSkills: formData.teachSkills,
        learnSkills: formData.learnSkills,
        availabilityDays: formData.availabilityDays,
        availabilityTime: formData.availabilityTime,
        isTeachingOpen: formData.isTeachingOpen,
        certificationName: formData.certificationName,
        certificationIssuer: formData.certificationIssuer,
        certificateUrl: formData.certificateUrl,
        profileImage: formData.profileImage,
      };

      console.log("Sending profile update:", payload);

      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("API status:", response.status);

      const data = await response.json();

      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your profile.");
      }

      const user = data.user || payload;

      const updatedProfile = {
        ...formData,
        name: user.name ?? payload.name,
        email: user.email ?? profile.email,
        profession: user.profession ?? payload.profession,
        bio: user.bio ?? payload.bio,
        teachSkills: user.teachSkills ?? payload.teachSkills,
        learnSkills: user.learnSkills ?? payload.learnSkills,

        availabilityDays:
          user.availabilityDays ?? payload.availabilityDays,

        availabilityTime:
          user.availabilityTime ?? payload.availabilityTime,

        isTeachingOpen: user.isTeachingOpen ?? payload.isTeachingOpen,
        certificationName:
          user.certificationName ?? payload.certificationName,
        certificationIssuer:
          user.certificationIssuer ?? payload.certificationIssuer,
        certificateUrl: user.certificateUrl ?? payload.certificateUrl,
        profileImage: user.profileImage ?? payload.profileImage,
      };

      setProfile(updatedProfile);
      setFormData(updatedProfile);

      // Update basic user information in local storage.
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            name: updatedProfile.name,
            email: updatedProfile.email,
          })
        );
      } catch (error) {
        console.error("Unable to update local user data:", error);
      }

      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile save error:", error);
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page">
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page">
            <h2>Profile Unavailable</h2>
            <p className="profile-message" role="alert">
              {message}
            </p>
            <Link to={isViewingOther ? "/discover" : "/dashboard"}>
              {isViewingOther
                ? "← Back to Discover"
                : "← Back to Dashboard"}
            </Link>
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
            <h1>
              {isEditing
                ? "Edit Profile"
                : isViewingOther
                ? "Member Profile"
                : "My Profile"}
            </h1>

            <p>
              {isEditing
                ? "Update your personal information and skills."
                : isViewingOther
                ? "View this member's information, skills and availability."
                : "Manage your personal information and skills."}
            </p>
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
              ♧<span></span>
            </button>

            <div className="header-avatar">
              {displayedProfile.name
                ? displayedProfile.name.charAt(0).toUpperCase()
                : "U"}
            </div>
          </div>
        </header>

        <div className="profile-page">
          {message && (
            <p className="profile-message" role="status">
              {message}
            </p>
          )}

          {isEditing ? (
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
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                  />
                </div>

                <div className="profile-form-group">
                  <label>Profession</label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    placeholder="Add your profession"
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
                  <h3>Skills I Can Teach</h3>
                  <p>Select the skills you can teach.</p>

                  <input
                    type="search"
                    className="skill-search-input"
                    placeholder="Search skills to teach..."
                    value={teachSearch}
                    onChange={(e) => setTeachSearch(e.target.value)}
                  />

                  {getSkillCategories(
                    formData.teachSkills,
                    teachSearch
                  ).map(({ category, skills }) => (
                    <div className="skill-category" key={category}>
                      <h4>{category}</h4>

                      <div className="skill-selection-grid">
                        {skills.map((skill) => (
                          <label
                            className="skill-checkbox"
                            key={skill}
                          >
                            <input
                              type="checkbox"
                              checked={formData.teachSkills.includes(skill)}
                              onChange={() =>
                                handleSkillToggle(skill, "teach")
                              }
                            />
                            {skill}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {getSkillCategories(
                    [
                      ...formData.teachSkills,
                      ...Object.values(skillCatalogue).flat(),
                    ],
                    teachSearch
                  ).length === 0 && <p>No matching skills found.</p>}
                </div>

                <div className="profile-form-group">
                  <h3>Skills I Want to Learn</h3>

                  <input
                    type="search"
                    className="skill-search-input"
                    placeholder="Search skills to learn..."
                    value={learnSearch}
                    onChange={(e) => setLearnSearch(e.target.value)}
                  />

                  {getSkillCategories(
                    formData.learnSkills,
                    learnSearch
                  ).map(({ category, skills }) => (
                    <div className="skill-category" key={category}>
                      <h4>{category}</h4>

                      <div className="skill-selection-grid">
                        {skills.map((skill) => (
                          <label
                            className="skill-checkbox"
                            key={skill}
                          >
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
                  ))}

                  {getSkillCategories(
                    [
                      ...formData.learnSkills,
                      ...Object.values(skillCatalogue).flat(),
                    ],
                    learnSearch
                  ).length === 0 && <p>No matching skills found.</p>}
                </div>

                {/* Teaching availability */}
                <div className="profile-form-group">
                  <h3>Available Days</h3>
                  <p>Select the days when you are available to teach.</p>

                  <div className="skill-selection-grid">
                    {WEEK_DAYS.map((day) => (
                      <label className="skill-checkbox" key={day}>
                        <input
                          type="checkbox"
                          checked={parseAvailabilityDays(
                            formData.availabilityDays
                          ).includes(day)}
                          onChange={() =>
                            handleAvailabilityDayToggle(day)
                          }
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="profile-form-group">
                  <h3>Preferred Teaching Hours</h3>
                  <p>
                    Choose one common time range for your selected days.
                  </p>

                  <div className="profile-form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={
                        parseAvailabilityTime(
                          formData.availabilityTime
                        ).start
                      }
                      onChange={(e) =>
                        handleAvailabilityTimeChange(
                          "start",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={
                        parseAvailabilityTime(
                          formData.availabilityTime
                        ).end
                      }
                      onChange={(e) =>
                        handleAvailabilityTimeChange(
                          "end",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
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
                    placeholder="https://..."
                  />
                </div>

                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="profile-edit-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <>
              {isViewingOther && (
                <Link to="/discover" className="profile-back-button">
                  ← Back to Discover People
                </Link>
              )}

              <section className="profile-header">
                <div className="profile-avatar">
                  {displayedProfile.profileImage ? (
                    <img
                      src={displayedProfile.profileImage}
                      alt={displayedProfile.name}
                    />
                  ) : (
                    displayedProfile.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="profile-header-info">
                  <h1>{displayedProfile.name}</h1>

                  <p>
                    {displayedProfile.profession || "SkillSwap Member"}
                  </p>

                  <span className="profile-availability">
                    {displayedProfile.isTeachingOpen
                      ? "Available to teach"
                      : "Not available to teach"}
                  </span>

                  {!isViewingOther && displayedProfile.email && (
                    <p>{displayedProfile.email}</p>
                  )}
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
                <p>
                  {displayedProfile.bio || "No introduction added yet."}
                </p>
              </section>

              <section className="profile-section">
                <h2>Skills I Can Teach</h2>

                <div className="profile-skills">
                  {displayedProfile.teachSkills.length > 0 ? (
                    displayedProfile.teachSkills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))
                  ) : (
                    <p>No teaching skills added yet.</p>
                  )}
                </div>
              </section>

              <section className="profile-section">
                <h2>Skills I Want to Learn</h2>

                <div className="profile-skills">
                  {displayedProfile.learnSkills.length > 0 ? (
                    displayedProfile.learnSkills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))
                  ) : (
                    <p>No learning goals added yet.</p>
                  )}
                </div>
              </section>

              <section className="profile-section">
                <h2>Teaching Availability</h2>

                <p>
                  Available days:{" "}
                  <strong>
                    {displayedProfile.availabilityDays || "Not provided"}
                  </strong>
                </p>

                <p>
                  Preferred time:{" "}
                  <strong>
                    {formatAvailabilityTime(
                      displayedProfile.availabilityTime
                    )}
                  </strong>
                </p>
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
                    <h3>
                      {activity.completedSessions === null
                        ? "—"
                        : activity.completedSessions}
                    </h3>
                    <p>Completed Sessions</p>
                  </div>

                  <div>
                    <h3>{displayedProfile.teachSkills.length}</h3>
                    <p>Teaching Skills</p>
                  </div>

                  <div>
                    <h3>{activity.averageRating ?? "—"}</h3>
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
