
function User() {
  return (
    <section className="hero" id="home">
      <div className="hero-container">

        <div className="hero-content">
          <span className="hero-label">
            LEARN TOGETHER. GROW TOGETHER.
          </span>

          <h1>
            Share your skills.
            <br />
            <span>Learn something new.</span>
          </h1>

          <p>
            SkillSwap connects people who want to teach
            what they know with people who want to learn
            something new.
          </p>

          <div className="hero-actions">
            <a href="/register" className="btn btn-primary">
              Get started
            </a>

            <a href="#how-it-works" className="btn btn-secondary">
              Explore how it works
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <span className="card-label">AVAILABLE TO TEACH</span>

            <h3>React Development</h3>

            <p>Learn frontend development from someone who knows it.</p>

            <div className="skill-tags">
              <span>React</span>
              <span>JavaScript</span>
              <span>CSS</span>
            </div>
          </div>

          <div className="hero-floating-card">
            <span>Learning together</span>
            <strong>Skills. People. Growth.</strong>
          </div>
        </div>

      </div>
    </section>
  );
}

export default User;
