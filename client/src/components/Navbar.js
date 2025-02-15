import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { CodeIcon, HamburgetMenuClose, HamburgetMenuOpen } from "./Icons";
import { FaUserCircle } from "react-icons/fa"; // Profile icon
import { FiLogOut } from "react-icons/fi"; // Logout icon
import { toast } from "react-toastify";
import useEncryption from "./Hooks/useEncryption"; // Import the decryption hook
import logo from "./images/logo.png"
function Navbar() {
  const [click, setClick] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(null);
  const { decryptData } = useEncryption(); // Use decryption hook
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      try {
        // Decrypt the token using the hook
        const decryptedToken = decryptData(token);

        if (decryptedToken) {
          // Ensure the token contains necessary details
          if (decryptedToken.email && decryptedToken.isAdmin !== undefined) {
            setUserEmail(decryptedToken.email); // Update email state
            setIsAdmin(decryptedToken.isAdmin); // Update isAdmin state
            setUserName(decryptedToken.userName || ""); // Optional: Handle userName
          } else {
            throw new Error("Invalid token structure.");
          }
        } else {
          throw new Error("Token decryption failed.");
        }
      } catch (error) {
        setError("Invalid token. Please log in again.");
        console.error("Error decoding token:", error);
      }
    } else {
      setError("Token not found. Please log in.");
      console.warn("Token missing in sessionStorage.");
    }
  }, [decryptData]); // Dependency on the hook function

  const handleLogoutClick = () => {
    const userConfirmed = window.confirm("Are you sure you want to logout?");
    if (userConfirmed) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user_id");
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const handleClick = () => setClick(!click);

  return (
    <nav className="navbar">
      <div className="nav-container">
      <NavLink
  exact
  to="/"
  className="nav-logo"
  style={{
    display: 'flex',
    alignItems: 'center', // Vertically centers the content
    textDecoration: 'none', // Optional: Removes underline
  }}
>
  <img
    src={logo}
    alt="logo"
    style={{
      height: '35px',  // Increased height
    width: 'auto', 
      objectFit: 'contain', // Maintains the aspect ratio
    }}
  />
</NavLink>


        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <NavLink
              exact
              to="/"
              activeClassName="active"
              className="nav-links"
              onClick={handleClick}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="/about"
              activeClassName="active"
              className="nav-links"
              onClick={handleClick}
            >
              About
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="/blog"
              activeClassName="active"
              className="nav-links"
              onClick={handleClick}
            >
              Blog
            </NavLink>
          </li>

          {/* Conditionally render login or user profile */}
          {!userEmail ? (
            <li className="nav-item">
              <NavLink
                exact
                to="/login"
                activeClassName="active"
                className="nav-links"
                onClick={handleClick}
              >
                Login
              </NavLink>
            </li>
          ) : (
            <li className="nav-item profile-menu">
              <div className="profile-container">
                <FaUserCircle size={24} className="profile-icon" />
                <span className="username">{userName || userEmail}</span> {/* Display userName or email */}
                <FiLogOut
                  size={20}
                  className="logout-icon"
                  onClick={handleLogoutClick}
                  title="Logout"
                  style={{ cursor: "pointer", marginLeft: "10px" }}
                />
              </div>
            </li>
          )}
        </ul>
        <div className="nav-icon" onClick={handleClick}>
          {click ? (
            <span className="icon">
              <HamburgetMenuOpen />
            </span>
          ) : (
            <span className="icon">
              <HamburgetMenuClose />
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
