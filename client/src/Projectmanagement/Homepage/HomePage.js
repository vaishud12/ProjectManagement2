import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebarr from "../../components/Sidebarr";
import "./Home.css";
import {jwtDecode} from "jwt-decode"; // Correct import for jwtDecode

function HomePage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        sessionStorage.setItem("user_id", decodedToken.userId);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  // Handler for menu item click
  const handleMenuItemClick = (menuItem) => {
    console.log("Menu Item Clicked:", menuItem);
    // Add navigation or logic here based on `menuItem`
  };

  return (
    <div className="home-page">
      <Navbar/>

      <div className="home-layout">
        {/* Sidebar */}
        <Sidebarr
          setExpanded={setSidebarExpanded}
          onMenuItemClick={handleMenuItemClick}
        />

        {/* Main Content */}
        <main
          className="main-content"
          style={{
            marginLeft: sidebarExpanded ? "200px" : "60px", // Adjust based on sidebar width
          }}
        >
          <h1 className="welcome-message">
            Welcome to Passion Framework Project Management
          </h1>
        </main>
      </div>
    </div>
  );
}

export default HomePage;
