
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">

        <Link className="brand" to="/">
          SkillSwap<span>.</span>
        </Link>

        <div className="nav-links">
          <a href="/#how-it-works">How it works</a>
          <a href="/#features">Features</a>
          <a href="/#community">Community</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="login-link">
            Log in
          </Link>

          <Link to="/register" className="btn btn-primary">
            Get started
          </Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
