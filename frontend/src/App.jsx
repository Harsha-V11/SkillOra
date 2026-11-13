
import "./App.css"
import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"

import Navbar from "./components/navBar"
import User from "./components/User"
import Features from "./components/Features"
import HowItWorks from "./components/howItWorks"
import CallToAction from "./components/callToAction"
import Footer from "./components/Footer"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile";

function Home() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <User />
        <Features />
        <HowItWorks />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}

function App() {

  // Load the previously selected theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("skillswap-theme") || "light"
  })

  // Apply theme globally and save the selection
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("skillswap-theme", theme)
  }, [theme])

  // Switch between light and dark mode
  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    )
  }

  return (
    <div className="app-shell">

      {/* GLOBAL THEME SWITCH */}
      
        <button
            className={`theme-toggle ${theme}`}
            onClick={toggleTheme}
            type="button"
            aria-label="Switch theme"
        >
        <span className={`theme-icon sun ${theme === "light" ? "active" : ""}`}>
        ☀
        </span>

        <span className={`theme-icon moon ${theme === "dark" ? "active" : ""}`}>
        ☾
        </span>
        </button>


      {/* APPLICATION ROUTES */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

    </div>
  )
}

export default App
