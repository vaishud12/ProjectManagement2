import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "./Home.css";
import UsersSidebarr from "../../components/UsersSidebarr";
import useEncryption from "../../components/Hooks/useEncryption"; // Import the hook

function Projectmanagement() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [email, setEmail] = useState(null); // State to store email
  const[userId, setUserId]=useState(null);
  const [isAdmin, setIsAdmin] = useState(null); // State to store isAdmin
  const [error, setError] = useState(null); // State to handle errors
  const { decryptData } = useEncryption(); // Use the decryption hook

  useEffect(() => {
    const token = sessionStorage.getItem("token");
  
    if (token) {
      try {
        // Decrypt the token
        const decryptedToken = decryptData(token);
  
        if (decryptedToken) {
          // Ensure the token contains email, isAdmin, and user_id
          if (
            decryptedToken.email &&
            decryptedToken.isAdmin !== undefined &&
            decryptedToken.user_id !== undefined
          ) {
            setEmail(decryptedToken.email); // Update email state
            setIsAdmin(decryptedToken.isAdmin); // Update isAdmin state
            setUserId(decryptedToken.user_id); // Update userId state
          } else {
            throw new Error("Required fields (email, isAdmin, user_id) not found in token.");
          }
        } else {
          throw new Error("Decryption failed.");
        }
      } catch (error) {
        setError("Invalid token. Please log in again.");
        console.error("Error decoding token:", error);
      }
    } else {
      setError("Token not found. Please log in.");
      console.warn("Token missing in sessionStorage.");
    }
  }, [decryptData]); // Include decryptData as a dependency
  
  return (
    <div className="home-page">
      <Navbar />

      <div className="home-layout">
        {/* Conditionally render UsersSidebarr when email is available */}
        {email ? (
          <UsersSidebarr setExpanded={setSidebarExpanded} email={email} />
        ) : (
          <p>Loading user details...</p>
        )}

        {/* Main Content */}
        <main
          className="main-content"
          style={{
            marginLeft: sidebarExpanded ? "200px" : "60px", // Adjust based on sidebar width
          }}
        >
          <h1 className="welcome-message">
            Welcome to Passion Project Management Framework
          </h1>
          {email ? (
            <p>
              Logged in as: <strong>{email}</strong> {isAdmin && "(Admin)"}
            </p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <p>Loading user details...</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default Projectmanagement;
