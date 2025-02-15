import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import UsersSidebarr from "../../../components/UsersSidebarr";
import * as API from "../../../components/Endpoints/Endpoint";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "../../../components/Pagination/Pagination";
import NoDataAvailable from "../../../components/NoDataAvailable/NoDataAvailable";
import { useLocation } from "react-router-dom";
import Addeditprojectu from "./AddeditProjectu";

const ProjectGroupu = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [data, setData] = useState([]);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate(); 
  useEffect(() => {
    if (email) {
      loadData(email);
    }
  }, [email]);

  const loadData = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API.GET_USER_PROJECTS(email), {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setData(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err.response?.status === 404
          ? "No projects found for your email."
          : "An error occurred while fetching data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const filterData = useCallback(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(lowercasedQuery)
      )
    );
    setFilteredData(filtered);
  }, [searchQuery, data]);

  useEffect(() => {
    filterData();
  }, [data, searchQuery, filterData]);

  const deleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(API.DELETE_PROJECT_DETAILS(projectId), {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        loadData(email);
      } catch (err) {
        console.error("Error deleting project:", err);
        alert("Failed to delete the project. Please try again.");
      }
    }
  };

  
  const closeModal = () => {
    setChatbotVisible(false);
   
    document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
  };
  const openModal = () => setChatbotVisible(true);
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '1000px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#333',
  };
  return (
    <div style={{ marginTop: "30px", position: "relative" }}>
      <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <UsersSidebarr
          setExpanded={setSidebarExpanded}
          email={email}
          onMenuItemClick={(menuItem) =>
            console.log("Menu Item Clicked:", menuItem)
          }
        />
        <div
          style={{
            flex: 1,
            marginLeft: "220px",
            marginTop: "40px",
            padding: "20px",
            overflowY: "auto",
            backgroundColor: "transparent",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "20px",
              textAlign: "center",
              color: "#333",
            }}
          >
            Project Allocated Details
          </div>

          {loading ? (
            <p>Loading projects...</p>
          ) : error ? (
            <p style={{ color: "red", fontSize: "16px", textAlign: "center" }}>
              {error}
            </p>
          ) : (
            <>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "20px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                  maxWidth: "400px",
                  margin: "0 auto 20px",
                  display: "block",
                }}
              />

              <button
                style={{
                  backgroundColor: "#e23427",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  display: "block",
                  margin: "20px auto",
                  width: "200px",
                }}
                onClick={openModal}
              >
                Add Project
              </button>
              {chatbotVisible && (
        <div style={modalOverlayStyle}>
         
            <button style={closeButtonStyle} onClick={closeModal}>
              &times;
            </button>
            <Addeditprojectu
              onClose={closeModal}
              
              loadData={loadData}
            />
          
        </div>
      )}
              <div
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  margin: "0 auto",
                  padding: "20px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  marginTop: "20px",
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily: "'Arial', sans-serif",
                    fontSize: "14px",
                    textAlign: "left",
                    tableLayout: "auto",
                    backgroundColor: "transparent",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={headerCellStyle}>No.</th>
                      <th style={headerCellStyle}>Project ID</th>
                      <th style={headerCellStyle}>Organization Name</th>
                      <th style={headerCellStyle}>Sector</th>
                      <th style={headerCellStyle}>Project Name</th>
                      <th style={headerCellStyle}>Problem Statement</th>
                      <th style={headerCellStyle}>Solution</th>
                      <th style={headerCellStyle}>Expected AI Component</th>
                      <th style={headerCellStyle}>Social Impacts</th>
                      <th style={headerCellStyle}>Department Name and Group No</th>
                      <th style={headerCellStyle}>Name of Students</th>
                      <th style={headerCellStyle}>Mailids</th>
                      <th style={headerCellStyle}>Contact Details</th>
                      <th style={headerCellStyle}>Mentor Name</th>
                      <th style={headerCellStyle}>Mentor Mailids</th>
                      <th style={headerCellStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((item, index) => (
                        <tr key={item.projectid}>
                          <td>{index + indexOfFirstItem + 1}</td>
                          <td>{item.projectid}</td>
                          <td>{item.organizationname}</td>
                          <td>{item.sector}</td>
                          <td>{item.projectname}</td>
                          <td>{item.projectstatement}</td>
                          <td>{item.solutions}</td>
                          <td>{item.expectedcomponent}</td>
                          <td>{item.socialimpacts}</td>
                          <td>{item.departmentnamegroupno}</td>
                          <td>{item.studentnames}</td>
                          <td>{item.studentmailids}</td>
                          <td>{item.contactdetails}</td>
                          <td>{item.mentorname}</td>
                          <td>{item.mentormailids}</td>
                          <td>
                            <Link to={`/projectdetails/add/${item.projectid}`}>
                              <FaEdit size={24} />
                            </Link>
                            <MdDelete
                              size={24}
                              onClick={() => deleteProject(item.projectid)}
                              style={{ cursor: "pointer", marginLeft: "10px" }}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="16">
                          <NoDataAvailable message="No projects available." />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                paginate={paginate}
                totalPages={totalPages}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const headerCellStyle = {
  backgroundColor: "#f4f4f4",
  color: "#333",
  fontWeight: "bold",
  textAlign: "center",
  padding: "8px",
  border: "1px solid #ddd",
};

export default ProjectGroupu;
