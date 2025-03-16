import React, { useState, useEffect, useContext } from "react"; // <-- ADDED: useContext import
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // <-- ADDED: Import AuthContext

const Navbar = () => {
  const { auth } = useContext(AuthContext); // <-- ADDED: Get auth state from context
  const isAuthenticated = auth.isAuthenticated; // <-- CHANGED: Use auth state instead of localStorage
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const token = auth.accessToken; // <-- CHANGED: Use auth.accessToken instead of localStorage.getItem

  useEffect(() => {
    const fetchUserProperty = async () => {
      if (!token) return;
      
      try {
        const response = await fetch("http://127.0.0.1:8000/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Check if user is an owner by comparing logged-in user with owner username
          if (data && data.owner_username === data.username) {
            setIsOwner(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };

    fetchUserProperty();
  }, [token]); // <-- CHANGED: Dependency now uses token from AuthContext

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home">Roomie World</Link>

        {/* Toggle button (hamburger) for small screens */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={isMobileMenuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
          onClick={toggleMobileMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links */}
        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
            </li>

            {/* Check if the user is logged in */}
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/cashflows">Cash Flows</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/damage-repair-reports">Repairs</Link>
                </li>
                {isOwner && (
                  <li className="nav-item">
                    <Link className="nav-link bg-dark" to="/owners-dashboard">Owner</Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className="nav-link text-white px-4 py-2 rounded" to="/logout">Log Out</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
