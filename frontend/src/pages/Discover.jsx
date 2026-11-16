
import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

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

const normalizeSkill = (skill) =>
  String(skill || "").trim().toLowerCase();

function Discover() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [myTeachSkills, setMyTeachSkills] = useState([]);
  const [myLearnSkills, setMyLearnSkills] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [selectedSkill, setSelectedSkill] = useState("All Skills");
  const [selectedMode, setSelectedMode] = useState("all");

  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState("");
  const [requestDraft, setRequestDraft] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Keep search input synchronized with URL parameters
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Fetch users, own profile and sent requests
  useEffect(() => {
    const fetchDiscoverData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to discover people.");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const [usersResponse, profileResponse, requestsResponse] =
          await Promise.all([
            fetch(`${API_URL}/discover`, { headers }),
            fetch(`${API_URL}/users/me`, { headers }),
            fetch(`${API_URL}/requests/sent`, { headers }),
          ]);

        const [usersData, profileData, requestsData] =
          await Promise.all([
            usersResponse.json(),
            profileResponse.json(),
            requestsResponse.json(),
          ]);

        if (!usersResponse.ok) {
          throw new Error(usersData.message || "Unable to load users.");
        }

        if (!profileResponse.ok) {
          throw new Error(
            profileData.message || "Unable to load your profile."
          );
        }

        if (!requestsResponse.ok) {
          throw new Error(
            requestsData.message || "Unable to load your requests."
          );
        }

        const formattedUsers = (usersData.users || [])
          .filter(
            (user) =>
              Array.isArray(user.teachSkills) &&
              user.teachSkills.length > 0
          )
          .map((user) => ({
            ...user,
            id: user._id,
            role: user.profession || "SkillSwap Member",
            teachSkills: user.teachSkills || [],
            learnSkills: user.learnSkills || [],
            initials: user.name
              ? user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "U",
            isTeachingOpen: user.isTeachingOpen !== false,
            availability:
              user.isTeachingOpen !== false
                ? "Available to teach"
                : "Currently unavailable",
          }));

        setUsers(formattedUsers);
        setMyTeachSkills(profileData.user?.teachSkills || []);
        setMyLearnSkills(profileData.user?.learnSkills || []);
        setSentRequests(requestsData.requests || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoverData();
  }, []);

  // Skills the other person can teach you
  const getRequestedSkillMatches = (user) => {
    return user.teachSkills.filter((skill) =>
      myLearnSkills.some(
        (mySkill) => normalizeSkill(mySkill) === normalizeSkill(skill)
      )
    );
  };

  // Skills you can teach the other person
  const getOfferedSkillMatches = (user) => {
    return user.learnSkills.filter((skill) =>
      myTeachSkills.some(
        (mySkill) => normalizeSkill(mySkill) === normalizeSkill(skill)
      )
    );
  };

  // Check matching arrangements
  const getUserMatches = (user) => {
    const requestedSkills = getRequestedSkillMatches(user);
    const offeredSkills = getOfferedSkillMatches(user);

    return {
      requestedSkills,
      offeredSkills,
      canMutuallyExchange:
        requestedSkills.length > 0 && offeredSkills.length > 0,
      canTeachYou: requestedSkills.length > 0,
    };
  };

  // Check for an existing pending request
  const hasPendingRequest = (
    userId,
    mode,
    requestedSkill,
    offeredSkill
  ) => {
    return sentRequests.some((request) => {
      const receiverId = request.receiver?._id || request.receiver;

      const existingMode = request.exchangeMode || "teacher-learner";
      const existingRequestedSkill =
        request.requestedSkill || request.skill || "";

      return (
        String(receiverId) === String(userId) &&
        request.status === "pending" &&
        existingMode === mode &&
        normalizeSkill(existingRequestedSkill) ===
          normalizeSkill(requestedSkill) &&
        normalizeSkill(request.offeredSkill || "") ===
          normalizeSkill(mode === "mutual" ? offeredSkill : "")
      );
    });
  };

  // Check whether any pending request exists for this person
  const hasAnyPendingRequest = (userId) => {
    return sentRequests.some((request) => {
      const receiverId = request.receiver?._id || request.receiver;

      return (
        String(receiverId) === String(userId) &&
        request.status === "pending"
      );
    });
  };

  // Open request form
  const openRequestForm = (user) => {
    const matches = getUserMatches(user);

    if (!user.isTeachingOpen) {
      setError("This user is currently unavailable for teaching.");
      return;
    }

    const availableModes = [];

    if (matches.canMutuallyExchange) {
      availableModes.push("mutual");
    }

    if (matches.canTeachYou) {
      availableModes.push("teacher-learner");
    }

    if (availableModes.length === 0) {
      setError("There is no matching learning opportunity with this user.");
      return;
    }

    let initialMode = "";

    if (selectedMode === "mutual" && matches.canMutuallyExchange) {
      initialMode = "mutual";
    } else if (
      selectedMode === "teacher-learner" &&
      matches.canTeachYou
    ) {
      initialMode = "teacher-learner";
    } else if (availableModes.length === 1) {
      initialMode = availableModes[0];
    }

    setRequestDraft({
      user,
      availableModes,
      mode: initialMode,
      requestedSkill: matches.requestedSkills[0] || "",
      offeredSkill: matches.offeredSkills[0] || "",
    });

    setError("");
    setSuccess("");
  };

  // Change selected arrangement
  const changeRequestMode = (mode) => {
    if (!requestDraft) return;

    const matches = getUserMatches(requestDraft.user);

    setRequestDraft({
      ...requestDraft,
      mode,
      requestedSkill: matches.requestedSkills[0] || "",
      offeredSkill: matches.offeredSkills[0] || "",
    });

    setError("");
  };

  // Send request
  const handleSendRequest = async () => {
    if (!requestDraft || !requestDraft.mode) {
      setError("Please choose a learning arrangement.");
      return;
    }

    const {
      user,
      mode,
      requestedSkill,
      offeredSkill,
    } = requestDraft;

    if (!requestedSkill) {
      setError("Please select a skill you want to learn.");
      return;
    }

    if (mode === "mutual" && !offeredSkill) {
      setError("Please select a skill you can teach in return.");
      return;
    }

    if (
      hasPendingRequest(
        user.id,
        mode,
        requestedSkill,
        offeredSkill
      )
    ) {
      setError("This matching request is already pending.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in again to send a request.");
      return;
    }

    setSendingRequest(user.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: user.id,
          exchangeMode: mode,
          requestedSkill,
          offeredSkill: mode === "mutual" ? offeredSkill : "",
          message:
            mode === "mutual"
              ? `Hi ${user.name}, I would like to learn ${requestedSkill} from you and teach you ${offeredSkill} in return. Would you be interested in a mutual skill exchange?`
              : `Hi ${user.name}, I would like to learn ${requestedSkill} from you. Would you be interested in teaching me?`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send request.");
      }

      setSentRequests((previous) => [
        ...previous,
        {
          ...data.request,
          receiver: user,
          status: "pending",
        },
      ]);

      setRequestDraft(null);

      setSuccess(
        `Your ${
          mode === "mutual" ? "Mutual Skill Exchange" : "Teacher–Learner"
        } request to ${user.name} has been sent successfully.`
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setSendingRequest("");
    }
  };

  // Search and filters
  const filteredUsers = users.filter((user) => {
    const matches = getUserMatches(user);

    const hasValidMatch =
      (selectedMode === "all" &&
        (matches.canMutuallyExchange || matches.canTeachYou)) ||
      (selectedMode === "mutual" && matches.canMutuallyExchange) ||
      (selectedMode === "teacher-learner" && matches.canTeachYou);

    if (!hasValidMatch || !user.isTeachingOpen) {
      return false;
    }

    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      String(user.name || "").toLowerCase().includes(searchValue) ||
      String(user.role || "").toLowerCase().includes(searchValue) ||
      user.teachSkills.some((skill) =>
        normalizeSkill(skill).includes(searchValue)
      ) ||
      user.learnSkills.some((skill) =>
        normalizeSkill(skill).includes(searchValue)
      );

    const matchesSkill =
      selectedSkill === "All Skills" ||
      user.teachSkills.some(
        (skill) =>
          normalizeSkill(skill) === normalizeSkill(selectedSkill)
      ) ||
      user.learnSkills.some(
        (skill) =>
          normalizeSkill(skill) === normalizeSkill(selectedSkill)
      );

    return matchesSearch && matchesSkill;
  });

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page discover-page">
            <p>Loading people...</p>
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
            <h1>Discover People</h1>
            <p>Find people to exchange skills and learn together.</p>
          </div>

          <div className="dashboard-header-actions">
            <div className="header-avatar">
              {JSON.parse(localStorage.getItem("user") || "{}")
                .name?.charAt(0)
                .toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <div className="profile-page discover-page">
          <section className="discover-heading">
            <div>
              <h2>Find Your Learning Partner</h2>
              <p>
                Connect with people who can teach what you want to learn.
              </p>
            </div>

            <span>{filteredUsers.length} opportunities found</span>
          </section>

          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}

          {/* ARRANGEMENT FILTER */}
          <section className="discover-filters">
            {[
              { label: "All Opportunities", value: "all" },
              { label: "Mutual", value: "mutual" },
              { label: "Teacher–Learner", value: "teacher-learner" },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`discover-view-button ${
                  selectedMode === filter.value ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedMode(filter.value);
                  setRequestDraft(null);
                  setError("");
                  setSuccess("");
                }}
                aria-pressed={selectedMode === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </section>

          {/* SEARCH AND SKILL FILTER */}
          <section className="discover-filters">
            <input
              type="search"
              placeholder="Search by name or skill..."
              value={search}
              onChange={(e) => {
                const value = e.target.value;

                setSearch(value);

                if (value.trim()) {
                  setSearchParams(
                    { search: value },
                    { replace: true }
                  );
                } else {
                  setSearchParams({}, { replace: true });
                }
              }}
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
              filteredUsers.map((user) => {
                const matches = getUserMatches(user);
                const pending = hasAnyPendingRequest(user.id);
                const draftIsOpen = requestDraft?.user.id === user.id;

                return (
                  <article className="discover-card" key={user.id}>
                    <div className="discover-card-header">
                      <div className="discover-avatar">
                        {user.initials}
                      </div>

                      <div>
                        <h3>{user.name}</h3>

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

                    {/* MATCH LABELS */}
                    <div className="discover-match">
                      {matches.canMutuallyExchange && (
                        <p>✦ Mutual match</p>
                      )}

                      {matches.canTeachYou && (
                        <p>✦ Can teach you</p>
                      )}
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
                        {user.learnSkills.length > 0 ? (
                          user.learnSkills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))
                        ) : (
                          <span>No learning skills added</span>
                        )}
                      </div>
                    </div>

                    <div className="discover-card-footer">
                      <span className="discover-level">
                        Skill Exchange
                      </span>

                      <span className="discover-status available">
                        {user.availability}
                      </span>
                    </div>

                    <div className="discover-actions">
                      <button
                        type="button"
                        className="discover-view-button"
                        onClick={() =>
                          navigate("/profile", {
                            state: { user },
                          })
                        }
                      >
                        View Profile
                      </button>

                      <button
                        type="button"
                        className="discover-request-button"
                        onClick={() => {
                          if (draftIsOpen) {
                            setRequestDraft(null);
                          } else {
                            openRequestForm(user);
                          }
                        }}
                        disabled={
                          sendingRequest === user.id ||
                          !user.isTeachingOpen
                        }
                      >
                        {sendingRequest === user.id
                          ? "Sending..."
                          : draftIsOpen
                            ? "Close Selection"
                            : pending
                              ? "Send Another Request"
                              : "Send Request"}
                      </button>
                    </div>

                    {/* REQUEST ARRANGEMENT SELECTION */}
                    {draftIsOpen && (
                      <div className="discover-request-form">
                        <h4>Choose Learning Arrangement</h4>

                        {requestDraft.availableModes.length > 1 ? (
                          <select
                            value={requestDraft.mode}
                            onChange={(e) =>
                              changeRequestMode(e.target.value)
                            }
                          >
                            <option value="">Select arrangement</option>
                            <option value="mutual">
                              Mutual Skill Exchange
                            </option>
                            <option value="teacher-learner">
                              Teacher–Learner
                            </option>
                          </select>
                        ) : (
                          <p>
                            Arrangement:{" "}
                            {requestDraft.mode === "mutual"
                              ? "Mutual Skill Exchange"
                              : "Teacher–Learner"}
                          </p>
                        )}

                        {requestDraft.mode && (
                          <>
                            <p>
                              {requestDraft.mode === "mutual"
                                ? "Both of you will teach and learn from each other."
                                : "You will learn from this person without teaching a skill in return."}
                            </p>

                            <label>Skill you want to learn</label>

                            <select
                              value={requestDraft.requestedSkill}
                              onChange={(e) =>
                                setRequestDraft({
                                  ...requestDraft,
                                  requestedSkill: e.target.value,
                                })
                              }
                            >
                              {matches.requestedSkills.map((skill) => (
                                <option key={skill} value={skill}>
                                  {skill}
                                </option>
                              ))}
                            </select>

                            {requestDraft.mode === "mutual" && (
                              <>
                                <label>
                                  Skill you can teach in return
                                </label>

                                <select
                                  value={requestDraft.offeredSkill}
                                  onChange={(e) =>
                                    setRequestDraft({
                                      ...requestDraft,
                                      offeredSkill: e.target.value,
                                    })
                                  }
                                >
                                  {matches.offeredSkills.map((skill) => (
                                    <option key={skill} value={skill}>
                                      {skill}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}

                            <button
                              type="button"
                              className="discover-request-button"
                              onClick={handleSendRequest}
                              disabled={
                                sendingRequest === user.id ||
                                !requestDraft.requestedSkill ||
                                (requestDraft.mode === "mutual" &&
                                  !requestDraft.offeredSkill)
                              }
                            >
                              {sendingRequest === user.id
                                ? "Sending..."
                                : "Send Request"}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="discover-empty">
                <h3>No matching opportunities found</h3>
                <p>
                  Try another arrangement, search term or skill.
                  You may also need to add your teaching or learning skills
                  to your profile.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Discover;
