
import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "email") {
      setShowOtp(false);
      setOtp(["", "", "", "", "", ""]);
      setMessage("");
    }
  };

  const handleSendOtp = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setShowOtp(true);
    setMessage(
      "OTP interface is ready. Actual email delivery will be connected through our backend."
    );
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
  };

  const handleVerifyOtp = () => {
    if (otp.some((digit) => digit === "")) {
      setMessage("Please enter all 6 OTP digits.");
      return;
    }

    setMessage(
      "Email verification will be activated when we connect the backend."
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!showOtp) {
      setMessage("Please verify your email first.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setMessage("Please accept the Terms and Conditions.");
      return;
    }

    setMessage(
      "Registration form is ready. Account creation will be connected to the backend."
    );
  };

  return (
    <div className="auth-page">

      {/* LEFT BRANDING SECTION */}

      <section className="auth-brand-section">

        <Link to="/" className="auth-brand-logo">
          SkillSwap<span>.</span>
        </Link>

        <div className="auth-brand-content">
          <h1>
            Your skills
            <br />
            <span>have value.</span>
          </h1>

          <p>
            Join a community where everyone has
            something to teach and something to learn.
          </p>
        </div>

        <div className="floating-card skill-card-one">
          <span className="floating-card-label">
            ✦ AVAILABLE TO TEACH
          </span>
          <h3>React Development</h3>
          <p>Share what you know.</p>
        </div>

        <div className="floating-card skill-card-two">
          <span className="floating-card-label">
            ✦ WANT TO LEARN
          </span>
          <h3>Python</h3>
          <p>Learn something new.</p>
        </div>

        <div className="floating-card skill-card-three">
          <span className="floating-card-label">
            ✦ AVAILABLE TO TEACH
          </span>
          <h3>Graphic Design</h3>
          <p>Teach your skills.</p>
        </div>

        <div className="auth-brand-footer">
          Learn. Share. Grow together.
        </div>

      </section>

      {/* RIGHT REGISTRATION SECTION */}

      <section className="auth-form-section">

        <div className="auth-form-wrapper register-wrapper">

          <div className="register-top-link">
            Already have an account?
            <Link to="/login"> Log in</Link>
          </div>

          <div className="auth-form-heading">
            <h2>Create account</h2>
            <p>Join SkillSwap and start learning together.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>

            {/* FULL NAME */}

            <div className="auth-input-group">
              <label htmlFor="name">Full name</label>

              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* EMAIL */}

            <div className="auth-input-group">
              <label htmlFor="email">Email address</label>

              <div className="register-email-row">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="verify-email-button"
                  onClick={handleSendOtp}
                >
                  Verify
                </button>
              </div>
            </div>

            {/* OTP SECTION */}

            {showOtp && (
              <div className="otp-section">

                <div className="otp-heading">
                  <h4>Enter email verification code</h4>
                  <p>
                    We've sent a 6-digit OTP to your email address.
                  </p>
                </div>

                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      aria-label={`OTP digit ${index + 1}`}
                      onChange={(e) =>
                        handleOtpChange(index, e.target.value)
                      }
                    />
                  ))}
                </div>

                <div className="otp-actions">
                  <button
                    type="button"
                    className="verify-otp-button"
                    onClick={handleVerifyOtp}
                  >
                    Verify OTP
                  </button>

                  <button
                    type="button"
                    className="resend-otp-button"
                    onClick={handleSendOtp}
                  >
                    Resend code
                  </button>
                </div>

              </div>
            )}

            {/* PASSWORD */}

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>

              <div className="register-password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="auth-input-group">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="register-password-row">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* TERMS AND CONDITIONS */}

            <label className="register-terms">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />

              <span>
                I agree to the{" "}
                <Link to="/terms">Terms and Conditions</Link>
              </span>
            </label>

            {/* MESSAGE */}

            {message && (
              <p className="register-message" role="status">
                {message}
              </p>
            )}

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="auth-submit-button"
            >
              Create Account
            </button>

          </form>

        </div>

      </section>

    </div>
  );
}

export default Register;
