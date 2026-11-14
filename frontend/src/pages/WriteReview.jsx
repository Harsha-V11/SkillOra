
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function WriteReview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const session = state?.session;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write your feedback.");
      return;
    }

    const existingReviews = JSON.parse(
      localStorage.getItem("skillswap-reviews") || "[]"
    );

    const newReview = {
      id: Date.now(),
      teacherName: session.name,
      skill: session.skill,
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("en-IN"),
    };

    localStorage.setItem(
      "skillswap-reviews",
      JSON.stringify([...existingReviews, newReview])
    );

    alert("Your review has been submitted successfully!");
    navigate("/sessions");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar/>

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
              Your feedback helps other learners choose the right teacher.
            </p>

            <div className="write-review-teacher">
              <div className="session-avatar">{session.initials}</div>
              <div>
                <h3>{session.name}</h3>
                <p>{session.skill} · {session.date}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label>How would you rate this session?</label>

              <div className="write-review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
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
                placeholder="Share your experience with this teacher..."
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setError("");
                }}
              />

              {error && <p className="write-review-error">{error}</p>}

              <button type="submit" className="write-review-submit">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WriteReview;
