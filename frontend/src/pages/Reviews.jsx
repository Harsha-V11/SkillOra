
import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const initialReviews = [
  {
    id: 1,
    name: "Rahul Sharma",
    initials: "RS",
    skill: "React",
    rating: 5,
    date: "12 Nov 2026",
    comment:
      "Excellent learning experience! Very helpful and explained concepts clearly.",
    type: "Received",
  },
  {
    id: 2,
    name: "Priya Reddy",
    initials: "PR",
    skill: "JavaScript",
    rating: 4,
    date: "10 Nov 2026",
    comment:
      "Great session with practical examples. I learned many useful things.",
    type: "Received",
  },
  {
    id: 3,
    name: "Arjun Kumar",
    initials: "AK",
    skill: "Figma",
    rating: 5,
    date: "08 Nov 2026",
    comment:
      "A very good experience. The session was interactive and useful.",
    type: "Given",
  },
];

function Reviews() {
  const [activeTab, setActiveTab] = useState("received");

  // Load reviews submitted by the current user
  const [savedReviews] = useState(() =>
    JSON.parse(localStorage.getItem("skillswap-reviews") || "[]")
  );

  // Convert submitted reviews into Given Reviews
  const submittedReviews = savedReviews.map((review) => ({
    id: `submitted-${review.id}`,
    name: review.teacherName,
    initials: review.teacherName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    skill: review.skill,
    rating: review.rating,
    date: review.date,
    comment: review.comment,
    type: "Given",
  }));

  // Combine existing reviews with newly submitted reviews
  const allReviews = [...initialReviews, ...submittedReviews];

  const receivedReviews = allReviews.filter(
    (review) => review.type === "Received"
  );

  const givenReviews = allReviews.filter(
    (review) => review.type === "Given"
  );

  const displayedReviews =
    activeTab === "received" ? receivedReviews : givenReviews;

  const averageRating =
    receivedReviews.length > 0
      ? receivedReviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / receivedReviews.length
      : 0;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2>Reviews & Ratings</h2>
        </header>

        <div className="profile-page reviews-page">
          <div className="reviews-heading">
            <h1>Reviews & Ratings</h1>
            <p>See what people say about your learning experiences.</p>
          </div>

          <div className="reviews-stats">
            <div className="review-stat-card">
              <small>Average Rating</small>
              <h2>
                {averageRating.toFixed(1)} <span>★</span>
              </h2>
            </div>

            <div className="review-stat-card">
              <small>Reviews Received</small>
              <h2>{receivedReviews.length}</h2>
            </div>

            <div className="review-stat-card">
              <small>Reviews Given</small>
              <h2>{givenReviews.length}</h2>
            </div>
          </div>

          <div className="reviews-tabs">
            <button
              className={activeTab === "received" ? "active" : ""}
              onClick={() => setActiveTab("received")}
            >
              Received Reviews ({receivedReviews.length})
            </button>

            <button
              className={activeTab === "given" ? "active" : ""}
              onClick={() => setActiveTab("given")}
            >
              Given Reviews ({givenReviews.length})
            </button>
          </div>

          <div className="reviews-list">
            {displayedReviews.length > 0 ? (
              displayedReviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-card-header">
                    <div className="review-person">
                      <div className="session-avatar">
                        {review.initials}
                      </div>
                      <div>
                        <h3>{review.name}</h3>
                        <p>{review.date}</p>
                      </div>
                    </div>

                    <span className="review-skill">{review.skill}</span>
                  </div>

                  <div className="review-stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>

                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            ) : (
              <p>No reviews available yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Reviews;
