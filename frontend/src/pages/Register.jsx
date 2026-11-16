
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

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

  const otpRefs = useRef([]);

   const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");

useEffect(() => {
  if (showOtp && !otpVerified) {
    otpRefs.current[0]?.focus();
  }
}, [showOtp, otpVerified]);

 

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState("");

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "email") {
      setShowOtp(false);
      setOtp(["", "", "", "", "", ""]);
      setOtpVerified(false);
      setVerificationToken("");
      setMessage("");
    }
  };

  // Send OTP to email
  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setSendingOtp(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
          }),
        }
      );

      const data = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            setShowOtp(false);
            setOtp(["", "", "", "", "", ""]);
            setOtpVerified(false);
            setVerificationToken("");
            setMessage("This email address is already registered. Please log in instead.");
            return;
          }

          throw new Error(data.message || "Unable to send OTP.");
        }

      setShowOtp(true);
      setOtp(["", "", "", "", "", ""]);
      setOtpVerified(false);
      setVerificationToken("");

      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle OTP input
  // Handle OTP input, auto-focus and paste
const handleOtpChange = (index, value) => {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    const updatedOtp = [...otp];
    updatedOtp[index] = "";
    setOtp(updatedOtp);
    return;
  }

  const updatedOtp = [...otp];

  // Support pasting multiple digits
  if (digits.length > 1) {
    digits.split("").slice(0, 6 - index).forEach((digit, i) => {
      updatedOtp[index + i] = digit;
    });
  } else {
    updatedOtp[index] = digits;
  }

  setOtp(updatedOtp);

  const nextIndex = Math.min(
    index + digits.length,
    5
  );

  otpRefs.current[nextIndex]?.focus();

  // Automatically verify when all six digits are entered
  if (updatedOtp.every((digit) => digit !== "")) {
    handleVerifyOtp(updatedOtp.join(""));
  }
};

// Handle pasting OTP
const handleOtpPaste = (e, index) => {
  e.preventDefault();

  const pastedDigits = e.clipboardData
    .getData("text")
    .replace(/\D/g, "");

  if (!pastedDigits) return;

  const updatedOtp = [...otp];

  pastedDigits.split("").slice(0, 6 - index).forEach((digit, i) => {
    updatedOtp[index + i] = digit;
  });

  setOtp(updatedOtp);

  const nextIndex = Math.min(index + pastedDigits.length, 5);

  otpRefs.current[nextIndex]?.focus();

  if (updatedOtp.every((digit) => digit !== "")) {
    handleVerifyOtp(updatedOtp.join(""));
  }
};

  // Verify OTP
  // Verify OTP automatically
const handleVerifyOtp = async (otpValue = otp.join("")) => {
  if (otpValue.length !== 6) return;

  if (verifyingOtp || otpVerified) return;

  setVerifyingOtp(true);
  setMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: otpValue,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "OTP verification failed.");
    }

    setVerificationToken(data.verificationToken);
    setOtpVerified(true);
    setMessage("Email verified successfully!");
  } catch (error) {
    setMessage(error.message);
  } finally {
    setVerifyingOtp(false);
  }
};

  // Create account after successful verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!otpVerified || !verificationToken) {
      setMessage("Please verify your email before registering.");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
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

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            verificationToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
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
                  disabled={otpVerified}
                  required
                />

                <button
                  type="button"
                  className="verify-email-button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || otpVerified}
                >
                  {otpVerified
                    ? "Verified"
                    : sendingOtp
                    ? "Sending..."
                    : showOtp
                    ? "Resend"
                    : "Verify"}
                </button>
              </div>
            </div>

            {/* OTP SECTION */}

            {showOtp && !otpVerified && (
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
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={digit}
                    aria-label={`OTP digit ${index + 1}`}
                    disabled={verifyingOtp}
                    onChange={(e) =>
                      handleOtpChange(index, e.target.value)
                    }
                    onPaste={(e) =>
                      handleOtpPaste(e, index)
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" &&
                        !digit &&
                        index > 0
                      ) {
                        otpRefs.current[index - 1]?.focus();
                      }

                      if (e.key === "ArrowLeft" && index > 0) {
                        otpRefs.current[index - 1]?.focus();
                      }

                      if (e.key === "ArrowRight" && index < 5) {
                        otpRefs.current[index + 1]?.focus();
                      }
                    }}
                  />
                ))}
              </div>

                <div className="otp-actions">

                  <span className="register-message" role="status">
                    {verifyingOtp
                      ? "Verifying OTP..."
                      : otp.every((digit) => digit !== "")
                      ? "OTP entered"
                      : "Enter your 6-digit OTP"}
                  </span>

                  <button
                    type="button"
                    className="resend-otp-button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || verifyingOtp}
                  >
                    {sendingOtp ? "Sending..." : "Resend code"}
                  </button>

            </div>

              </div>
            )}

            {otpVerified && (
              <p className="register-message" role="status">
                Email verified successfully!
              </p>
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
              disabled={loading || !otpVerified}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

        </div>

      </section>

    </div>
  );
}

export default Register;
