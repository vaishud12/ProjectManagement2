import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import * as API from "../../../components/Endpoints/Endpoint"
import Navbar from "../../../components/Navbar";
import UsersSidebarr from "../../../components/UsersSidebarr"
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "../../../components/Pagination/Pagination";
import NoDataAvailable from "../../../components/NoDataAvailable/NoDataAvailable"
import * as XLSX from "xlsx";

import AddIncidentdetails from "./AddIncidentdetails";
import AddResolve from "../Resolve/AddResolve";

const Incidentdetails=()=>{
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
  const location = useLocation();
  console.log(location);
  const email = location.state?.email;
  const [priorityTimes, setPriorityTimes] = useState({
    critical: '',
    veryhigh: '',
    high: '',
    medium: '',
    low: ''
});
const [file, setFile] = useState(null);

const [chatbotVisible, setChatbotVisible] = useState(false);
const [resolutionVisible, setResolutionVisible] = useState(false);  
const [editItem, setEditItem] = useState(null);
const [resolutionItem, setResolutionItem] = useState(null);
const [fViewVisible, setFViewVisible] = useState(false);
const [showResolveModal, setShowResolveModal] = useState(false);
const [selectedIncident, setSelectedIncident] = useState(null);
const handleOpenResolveModal = (incidentId) => {
  // Find the selected incident by incidentId from your incident data
  const incident = data.find(item => item.incidentid === incidentId); // Replace incidentsData with data
  setSelectedIncident(incident); // Set selected incident
  setShowResolveModal(true); // Open modal
};
const handleCloseResolveModal = () => {
  setShowResolveModal(false);
  setSelectedIncident(null);
};

const handleResolveSubmit = (data) => {
  // Add logic to handle the form data submission
  console.log('Resolved Incident Data:', data);
  handleCloseResolveModal();
};
const openFViewModal = (item) => {
    setSelectedIncident(item);
    setFViewVisible(true);
};

const closeFViewModal = () => {
    setFViewVisible(false);
};
// Update the size state on window resize
const isSmallScreen = window.innerWidth <= 768;
const isVerySmallScreen = window.innerWidth <= 480;

useEffect(() => {
    if (email) {
      loadData(email);
    }
  }, [email]);
console.log(email)
  const loadData = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API.GET_USER_INCIDENTS(email), {
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

  const deleteProject = async (incidentid) => {
    if (window.confirm("Are you sure?")) {
      try {
        const response = await axios.delete(
          API.DELETE_INCIDENT(incidentid)
        );
        if (response.status === 200) {
          toast.success("Project Deleted Successfully");
          loadData();
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while deleting the project.");
      }
    }
  };
  const handlePriorityTimesSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post(API.SET_PRIORITY_TIMES, priorityTimes);
        alert('Priority times updated successfully.');
    } catch (err) {
        console.error('Error updating priority times:', err);
        alert('Failed to update priority times.');
    }
};

const handlePriorityTimeChange = (e) => {
    const { name, value } = e.target;
    setPriorityTimes(prevTimes => ({
        ...prevTimes,
        [name]: value
    }));
};

const handleUpload = async () => {
  if (!file) {
      alert("Please upload an Excel file.");
      return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetNames = workbook.SheetNames;
      const sheet = workbook.Sheets[sheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      try {
          const response = await axios.post(API.POST_INCIDENT_UPLOAD_EXCEL, jsonData);  // Backend API URL
          if (response.status === 200) {
              alert('Data uploaded successfully and emails sent!');
          }
      } catch (error) {
          console.error("Error uploading data:", error);
          alert("Error uploading data.");
      }
  };
  reader.readAsArrayBuffer(file);
};


const downloadExcel = () => {
  // Prepare data for Excel
  const tableData = data.map((item, index) => ({
    "No.": index + 1,
    
    "Organization Name": item.organizationname || "",
    "Project Name": item.projectname || "",
    "Sector": item.sector || "",
    
    "Incident Category": item.incidentcategory || "",
    "Incident Name": item.incidentname || "",
    
    "File Path": item.file ? API.GET_FILE_URL(item.file) : "No file available",
  }));

  // Create a new workbook and add the table data
  const worksheet = XLSX.utils.json_to_sheet(tableData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Incidents");

  // Trigger the file download
  XLSX.writeFile(workbook, "Incident_Details.xlsx");
}; 
const handleDownload = async () => {
  try {
      const response = await fetch(API.GET_DOWNLOAD_FILES);
      const data = await response.json();

      if (data.files.length === 0) {
          alert('No files to download');
          return;
      }

      // Download each file
      data.files.forEach((fileUrl) => {
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = fileUrl.split('/').pop(); // Extract file name
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      });

      alert('Files downloaded successfully!');
  } catch (error) {
      console.error('Error downloading files:', error);
  }
};
const handleAddIncidentClick = () => {
  setEditItem(null);  // Clear any previous edit item
  setChatbotVisible(true);
  document.body.style.overflow = 'hidden';
};

// const handleEditUserClick = (item) => {
//   setEditItem(item);
//   setChatbotVisible(true);
//   document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
// };

const handleResolveClick = (item) => {
  setResolutionItem(item);
  setResolutionVisible(true);
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  setChatbotVisible(false);
  setResolutionVisible(false);
  document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
};
const openModal = () => setChatbotVisible(true);

const handleFileChange = (e) => {
setFile(e.target.files[0]);
};
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const handleMenuItemClick = (menuItem) => {
    console.log("Menu Item Clicked:", menuItem);
    // Add navigation or logic here based on `menuItem`
  };


 
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
    <div className="home-page">
      <Navbar />

      <div className="home-layout">
        {/* Sidebar */}
        <UsersSidebarr
        email={email}
          setExpanded={setSidebarExpanded}
          onMenuItemClick={handleMenuItemClick}
        />
    <div className="container">
      
      <div className="mt-4">
        <h1 className="text-center mb-4 mt-16">Incident Details</h1>
        <div style={{
    display: 'flex',
    flexDirection: 'column', // Arrange elements vertically
    alignItems: 'center', // Center elements horizontally
    gap: '10px', // Space between elements
    marginTop: '20px' // Space above the container
}}>
    <p style={{
        fontSize: '16px',
        textAlign:'center',
        fontFamily: 'Poppins',
        margin: '0 0 10px 0', // Space below the text
        color: '#333' // Dark text color
    }}>
        Select file to upload details
    </p>
    <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileChange} 
        style={{
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            padding: '8px', 
            fontSize: '14px', 
            fontFamily: 'Poppins', 
            width: '100%', 
            maxWidth: '300px'
        }} 
    />
    <button 
        onClick={handleUpload} 
        style={{
            backgroundColor: '#3385ffdf', 
            color: 'white', 
            padding: '10px 20px', 
            fontSize: '16px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            transition: 'background-color 0.3s', 
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom:'4px',
        }}
    >
        upload
    </button>
</div>
<div>
<div className="mb-4 flex items-center justify-between">
  <div className="input-group">
    <button className="btn btn-round btn-signup ml-auto" onClick={openModal}>
      Add Incident
    </button>
  </div>
</div>


      {chatbotVisible && (
        <div style={modalOverlayStyle}>
         
            <button style={closeButtonStyle} onClick={closeModal}>
              &times;
            </button>
            <AddIncidentdetails
              onClose={closeModal}
              editItem={editItem}
              loadData={loadData}
            />
          
        </div>
      )}
    </div>
      {/* {resolutionVisible && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <span style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }} onClick={closeModal}>&times;</span>
            <ResolutionAddEdit onClose={closeModal} editItem={resolutionItem} loadData={loadData} />
          </div>
        </div>
      )} */}

{/* {fViewVisible && selectedIncident && (
  <div style={ufViewModalOverlayStyle}>
    <div style={ufViewModalContentStyle}>
      <span
        style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}
        onClick={closeFViewModal}
      >
        &times;
      </span>
      <UFview
        isOpen={fViewVisible}
        closeModal={closeFViewModal}
        incident={selectedIncident}
      />
    </div>
  </div>
)} */}
        <div className="flex flex-col items-center p-4 w-full">
    <form onSubmit={handlePriorityTimesSubmit} className="w-full max-w-[1000px]">
        <h3 className="text-center font-bold mb-6 text-2xl">Set Priority Time</h3>
        <div className="flex flex-wrap gap-4 justify-center mb-6">
            {Object.keys(priorityTimes).map(priority => (
                <div key={priority} className="flex-1 min-w-[150px] max-w-[250px] w-full">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}:
                        <input
                            type="text"
                            name={priority}
                            value={priorityTimes[priority]}
                            onChange={handlePriorityTimeChange}
                            placeholder="Time in hours"
                            min="0"
                            className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm mb-3"
                        />
                    </label>
                </div>
            ))}
        </div>
        <button
            type="submit"
            className="w-4/5 sm:w-[150px] mx-auto py-2 text-sm font-bold text-white bg-blue-600 rounded-md cursor-pointer mt-4"
        >
            Save
        </button>
    </form>
</div>
<div className="text-right mb-3">
            <button
              onClick={downloadExcel}
              style={{
                backgroundColor: "#3385ffdf",
                color: "white",
                padding: "10px 20px",
                fontSize: "16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Download Excel
            </button>
          </div>

        <div
          className="table-responsive mb-4"
          style={{ maxWidth: "85%", margin: "0 auto", marginRight: "0" }}
        >
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Tag (PBI Number)</th> {/* Add Project ID column */}
                <th scope="col">PBI</th>
                <th scope="col">organization Name</th>
                <th scope="col">Project Name</th>
                <th scope="col">Sector</th>
                <th scope="col">Application Type</th>
                <th scope="col">Incident Category</th>
                <th scope="col">Incident Name</th>
                <th scope="col">Incident Description</th>
                <th scope="col">Date-Time</th>
                <th scope="col">Incident Owner</th>
                <th scope="col">Status</th>
                <th scope="col">Priority</th>
                <th scope="col">Incident Resolver</th>
                <th scope="col">Image</th>
                <th scope="col">File Description</th>
                <th scope="col">File<button onClick={handleDownload} style={{ padding: '10px', fontSize: '16px' }}>
                Download Incident Files
            </button></th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <NoDataAvailable />
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.incidentid}>
                    <td>{index + indexOfFirstItem + 1}</td>
                    <td>{item.tagpbinumber}</td> {/* Display Project ID here */}
                    <td>{item.pbi}</td>
                    <td>{item.organizationname}</td>
                    <td>{item.projectname}</td>
                    <td>{item.sector}</td>
                    <td>{item.application_type}</td>
                    <td>{item.incidentcategory}</td>
                    <td>{item.incidentname}</td>
                    <td>{item.incidentdescription}</td>
                    <td>{item.datetime}</td>
                    <td>{item.incidentowner}</td>
                    <td>{item.status}</td>
                    <td>{item.priority}</td>
                    <td>{item.incidentresolver}</td>
                    <td>
                {item.photo ? (
                                <img
                                    src={API.GET_IMAGE_URL(item.photo)} // Update this based on your image path
                                    alt={item.incidentname}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
                                />
                            ) : (
                                <p>No Image</p>
                            )}
                           
            </td>

            <td>{item.descriptions}</td>

            <td>
  {item.file ? (
    <a
      href={API.GET_FILE_URL(item.file)} // URL where the file can be accessed
      download // Optional: This will prompt the file download on click
      style={{
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        color: "#007bff",
      }}
    >
      <i
        className="fas fa-download" // Font Awesome download icon
        style={{ fontSize: "24px", marginRight: "8px" }}
      ></i>
      Download File
    </a>
  ) : (
    <p>No File Available</p>
  )}
</td>
            
                    
                    <td>
                    <button className="btn btn-edit" onClick={() => handleOpenResolveModal(item.incidentid)}>Resolve</button>
                      <MdDelete
                        size={24}
                        onClick={() => deleteProject(item.incidentid)}
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                      />
                      
                    </td>
                  </tr>

                ))
              )}
            </tbody>
          </table>
        </div>
        {data.length > itemsPerPage && (
          <div className="d-flex justify-content-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={setCurrentPage}
            />
          </div>
        )}
      </div>
      
{showResolveModal && (
  <AddResolve
    show={showResolveModal}
    handleClose={handleCloseResolveModal}
    incidentData={selectedIncident}
    onSubmit={handleResolveSubmit}
  />
)}
    </div>
    </div></div>
  );
};

export default Incidentdetails

