
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-form-heading">
            <h2>Welcome back!</h2>
            <p>Pick up right where you left off.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {message && (
              <p className="register-message" role="alert">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
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
  );
}

export default Login;
