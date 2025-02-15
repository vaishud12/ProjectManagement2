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



const Resolution=()=>{
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user_id = sessionStorage.getItem("user_id");
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
    if (user_id) {
      loadData(user_id);
    }
  }, [user_id]);
console.log(user_id)
  const loadData = async (user_id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API.GET_USER_RESOLUTION(user_id), {
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
        <h1 className="text-center mb-4 mt-16">Resolve Details</h1>
       
        <div
          className="table-responsive mb-4"
          style={{ maxWidth: "85%", margin: "0 auto", marginRight: "0" }}
        >
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th scope="col">No.</th>
                <th scope="col">IncidentID</th> {/* Add Project ID column */}
                <th scope="col">Resolutionid</th>
                <th scope="col">organization Name</th>
                <th scope="col">Sector</th>
                <th scope="col">Incident Category</th>
                <th scope="col">Incident Name</th>
                <th scope="col">Incident Owner</th>
                <th scope="col">Resolve date</th>
                <th scope="col">Resolve Remark</th>
                <th scope="col">Resolver</th>
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
                   
                    <td>{item.incidentid}</td>
                    <td>{item.resolveid }</td>
                    <td>{item.organizationname}</td>
                   
                    <td>{item.sector}</td>
                    
                    <td>{item.incidentcategory}</td>
                    <td>{item.incidentname}</td>
                   
                    
                    <td>{item.incidentowner}</td>
                    <td>{item.resolveddate}</td>
                    <td>{item.resolutionremark}</td>
                    <td>{item.resolvedby}</td>
                    

            <td>{item.filedescription}</td>

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
      

    </div>
    </div></div>
  );
};

export default Resolution

