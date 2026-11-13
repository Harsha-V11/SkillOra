import { Link } from 'react-router-dom'

function Login() {
  return (
    <div className="auth-page">

      {/* LEFT SIDE - PURPLE BRANDING */}
      <section className="auth-brand-section">

        <Link to="/" className="auth-brand-logo">
          SkillSwap<span>.</span>
        </Link>

        <div className="auth-brand-content">
          <h1>
            Share knowledge.
            <br />
            Build connections.
            <br />
            <span>Grow together.</span>
          </h1>

          <p>
            Discover new skills, learn from others,
            and share what you know with a community
            that grows together.
          </p>
        </div>

        {/* FLOATING SKILL CARDS */}
        <div className="floating-card skill-card-one">
          <span className="floating-card-label">✦ Programming</span>
          <h3>React Development</h3>
          <p>Learn components and hooks</p>
          <span className="card-status">Available to teach</span>
        </div>

        <div className="floating-card skill-card-two">
          <span className="floating-card-label">✦ Design</span>
          <h3>UI / UX Design</h3>
          <p>Learn creative design skills</p>
        </div>

        <div className="floating-card skill-card-three">
          <span className="floating-card-label">✦ Learning</span>
          <h3>JavaScript</h3>
          <p>Find someone to learn from</p>
        </div>

        <div className="auth-brand-footer">
          Learn something new. Teach something valuable.
        </div>

      </section>


      {/* RIGHT SIDE - LOGIN FORM */}
      <section className="auth-form-section">

        <div className="auth-form-wrapper">

          <div className="auth-form-heading">
            <h2>Welcome back!</h2>
            <p>Pick up right where you left off.</p>
          </div>

          <form className="auth-form">

            <div className="auth-input-group">
              <label htmlFor="email">Email Address</label>

              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-input-group">
              <div className="auth-password-heading">
                <label htmlFor="password">Password</label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="auth-submit-button">
              Log in
            </button>

          </form>

          <p className="auth-register-text">
            New here?
            <Link to="/register"> Create an account</Link>
          </p>

          <Link to="/" className="auth-home-link">
            ← Back to SkillSwap
          </Link>

        </div>

      </section>

    </div>
  )
}

export default Login