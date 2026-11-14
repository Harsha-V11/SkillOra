
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const sampleReviews = {
  "Rahul Sharma": [
    {
      id: 1,
      name: "Ananya",
      rating: 5,
      date: "12 Nov 2026",
      comment: "Explained React concepts very clearly. Great teaching experience!",
    },
    {
      id: 2,
      name: "Karthik",
      rating: 4,
      date: "08 Nov 2026",
      comment: "Very helpful and patient during the learning session.",
    },
  ],
  "Priya Reddy": [
    {
      id: 1,
      name: "Rahul",
      rating: 5,
      date: "10 Nov 2026",
      comment: "Excellent explanation of Python and Power BI.",
    },
  ],
  "Arjun Kumar": [
    {
      id: 1,
      name: "Sneha",
      rating: 5,
      date: "09 Nov 2026",
      comment: "Learned a lot about Figma. Very interactive session.",
    },
  ],
  "Sneha Patel": [
    {
      id: 1,
      name: "Priya",
      rating: 4,
      date: "07 Nov 2026",
      comment: "Good teaching experience and useful examples.",
    },
  ],
};

function TeacherReviews() {
  const { state } = useLocation();
  const teacher = state?.teacher;

  if (!teacher) {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="profile-page teacher-reviews-page">
          <h2>Teacher Reviews</h2>
          <p>Select a teacher from Discover People to see their reviews.</p>
          <Link to="/discover">Back to Discover People</Link>
        </div>
      </main>
    </div>
  );
}

  // Get reviews submitted by the current user
  const savedReviews = JSON.parse(
    localStorage.getItem("skillswap-reviews") || "[]"
  );

  // Find reviews belonging to this teacher
  const submittedReviews = savedReviews
    .filter((review) => review.teacherName === teacher.name)
    .map((review) => ({
      ...review,
      name: "You",
    }));

  // Combine sample reviews and submitted reviews
  const reviews = [
    ...(sampleReviews[teacher.name] || []),
    ...submittedReviews,
  ];

  // Update rating and review count
  const oldRating = teacher.rating || 0;
  const oldCount = teacher.reviewCount || 0;

  const newRatingTotal = submittedReviews.reduce(
    (total, review) => total + review.rating,
    0
  );

  const totalReviews = oldCount + submittedReviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          (oldRating * oldCount + newRatingTotal) / totalReviews
        ).toFixed(1)
      : "No ratings yet";

  return (
    <div className="dashboard-layout">
      <Sidebar/>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2>Teacher Reviews</h2>
        </header>

        <div className="profile-page teacher-reviews-page">
          <Link to="/discover" className="teacher-reviews-back">
            ← Back to Discover People
          </Link>

          <div className="teacher-review-summary">
            <div className="session-avatar">{teacher.initials}</div>
            <div>
              <h2>{teacher.name}</h2>
              <p>{teacher.role}</p>
              <div className="teacher-review-rating">
                ★ {averageRating} / 5
                <span>({totalReviews} reviews)</span>
              </div>
            </div>
          </div>

          <h2 className="teacher-reviews-title">Student Reviews</h2>

          {reviews.length > 0 ? (
            <div className="teacher-reviews-list">
              {reviews.map((review) => (
                <div className="teacher-review-card" key={review.id}>
                  <div className="teacher-review-header">
                    <div>
                      <h3>{review.name}</h3>
                      <small>{review.date}</small>
                    </div>
                    <span className="teacher-review-stars">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No written reviews available yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default TeacherReviews;
