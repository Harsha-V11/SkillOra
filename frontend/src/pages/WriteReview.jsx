
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const API_URL = "http://localhost:5000/api";

function WriteReview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const session = state?.session;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [validSession, setValidSession] = useState(false);

  const sessionId = session?._id || session?.id;

  useEffect(() => {
    let isMounted = true;

    const checkReviewEligibility = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!sessionId) {
        setChecking(false);
        return;
      }

      try {
        const [sessionResponse, reviewsResponse] = await Promise.all([
          fetch(`${API_URL}/sessions/${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/reviews/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const sessionData = await sessionResponse.json();
        const reviewsData = await reviewsResponse.json();

        if (!sessionResponse.ok) {
          throw new Error(sessionData.message || "Unable to verify session.");
        }

        if (!reviewsResponse.ok) {
          throw new Error(reviewsData.message || "Unable to check your reviews.");
        }

        const currentSession = sessionData.session;
        const reviews = reviewsData.reviews || [];

        const hasReviewed = reviews.some((review) => {
          const reference = review.session || review.sessionId;
          const reviewedId =
            typeof reference === "object"
              ? reference?._id || reference?.id
              : reference;

          return String(reviewedId || "") === String(sessionId);
        });

        if (isMounted) {
          setAlreadyReviewed(hasReviewed);
          setValidSession(currentSession?.status === "completed");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to verify review eligibility.");
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    };

    checkReviewEligibility();

    return () => {
      isMounted = false;
    };
  }, [sessionId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write your feedback.");
      return;
    }

    if (!validSession || alreadyReviewed) {
      setError("This session is not eligible for another review.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to submit a review.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit your review.");
      }

      setSuccess("Your review has been submitted successfully!");
      setAlreadyReviewed(true);

      setTimeout(() => {
        navigate("/sessions");
      }, 1200);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page write-review-page">
            <h2>Write a Review</h2>
            <p>Select a completed session to write a review.</p>
            <Link to="/sessions">Back to Sessions</Link>
          </div>
        </main>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page write-review-page">
            <p>Checking review eligibility...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!validSession || alreadyReviewed || error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-page write-review-page">
            <h2>Write a Review</h2>

            {error ? (
              <p role="alert">{error}</p>
            ) : alreadyReviewed ? (
              <p>You have already submitted a review for this session.</p>
            ) : (
              <p>Only completed sessions are eligible for reviews.</p>
            )}

            <Link to="/sessions">Back to Sessions</Link>
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
          <h2>Write a Review</h2>
        </header>

        <div className="profile-page write-review-page">
          <Link to="/sessions" className="write-review-back">
            ← Back to Sessions
          </Link>

          <div className="write-review-card">
            <h2>Share Your Experience</h2>

            <p className="write-review-description">
              Your feedback helps other members understand the
              learning experience.
            </p>

            <div className="write-review-teacher">
              <div className="session-avatar">
                {session.initials || "U"}
              </div>

              <div>
                <h3>{session.name || "SkillSwap Member"}</h3>
                <p>
                  {session.skill || "Skill"} · {session.date || "Session"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label>How would you rate this session?</label>

              <div className="write-review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    disabled={submitting}
                    aria-label={`Rate ${star} out of 5 stars`}
                    aria-pressed={rating === star}
                    onClick={() => {
                      setRating(star);
                      setError("");
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={
                      star <= (hoverRating || rating) ? "selected" : ""
                    }
                  >
                    ★
                  </button>
                ))}
              </div>

              <p className="write-review-rating-text">
                {rating === 0
                  ? "Select your rating"
                  : `${rating} out of 5 stars`}
              </p>

              <label htmlFor="review-comment">
                Write your feedback
              </label>

              <textarea
                id="review-comment"
                rows="5"
                placeholder="Share your experience..."
                value={comment}
                maxLength={1000}
                disabled={submitting}
                onChange={(e) => {
                  setComment(e.target.value);
                  setError("");
                }}
              />

              <p>{comment.length}/1000 characters</p>

              {error && (
                <p className="write-review-error" role="alert">
                  {error}
                </p>
              )}

              {success && (
                <p role="status">{success}</p>
              )}

              <button
                type="submit"
                className="write-review-submit"
                disabled={submitting || Boolean(success)}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WriteReview;
