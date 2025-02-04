import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Just Link for navigation

const Navbar = () => {
  const isAuthenticated = !!localStorage.getItem("access_token"); // Check if the user is logged in by checking for JWT token
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // Track if the logged-in user is an owner

  const token = localStorage.getItem("access_token");

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
            setIsOwner(true); // Set isOwner to true if the logged-in user is an owner
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };

    fetchUserProperty();
  }, [token]);

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
