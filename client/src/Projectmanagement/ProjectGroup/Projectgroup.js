import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import * as API from "../../components/Endpoints/Endpoint"; // Adjust the import path as needed
import Navbar from "../../components/Navbar";
import Sidebarr from "../../components/Sidebarr"
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "../../components/Pagination/Pagination";
import NoDataAvailable from "../../components/NoDataAvailable/NoDataAvailable"
import * as XLSX from "xlsx";
import  generateIncidentData  from '../../components/QuantileAPI';
const Projectgroup = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const userId = sessionStorage.getItem("user_id");
  const location = useLocation();
  const [file, setFile] = useState(null);


  useEffect(() => {
    loadData();
  }, []); // Added organizationName to dependency array

  const loadData = async () => {
    try {
      const response = await axios.get(
        API.GET_PROJECT_DETAILS
      );
      const sortedData = response.data.sort(
        (a, b) => b.projectid - a.projectid
      );
      setData(sortedData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const deleteProject = async (projectid) => {
    if (window.confirm("Are you sure?")) {
      try {
        const response = await axios.delete(
          API.DELETE_PROJECT_DETAILS(projectid)
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
            const response = await axios.post(API.POST_UPLOAD_EXCEL, jsonData);  // Backend API URL
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
const generateIncident = async (projectid) => {
  try {
    const project = data.find((item) => item.projectid === projectid);
    if (!project) return;

    // Call the Quantile API to generate incident data
    const incidentData = await generateIncidentData(project);

    // Store the generated incident data in the database
    await axios.post(API.POST_CREATE_INCIDENT, incidentData);

    toast.success("Incident generated and saved successfully.");
  } catch (error) {
    console.error("Error generating or saving incident:", error);
    toast.error("Failed to generate or save incident.");
  }
};
    
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
  return (
    <div className="home-page">
      <Navbar />

      <div className="home-layout">
        {/* Sidebar */}
        <Sidebarr
          setExpanded={setSidebarExpanded}
          onMenuItemClick={handleMenuItemClick}
        />
    <div className="container">
      
      <div className="mt-4">
        <h1 className="text-center mb-4 mt-16">Project Details</h1>
        
        <div style={{
    display: 'flex',
    flexDirection: 'column', // Arrange elements vertically
    alignItems: 'center', // Center elements horizontally
    gap: '10px', // Space between elements
    marginTop: '20px' // Space above the container
}}>
    <p style={{
        fontSize: '16px',
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

        <div className="mb-4 d-flex justify-content-end">
          <Link
            to="/projectdetails/add"
   
          >
            <div className="input-group center">
              <button className="btn btn-round btn-signup">Add Project</button>
            </div>
          </Link>
        </div>

        <div
          className="table-responsive mb-4"
          style={{ maxWidth: "85%", margin: "0 auto", marginRight: "0" }}
        >
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Project ID</th> {/* Add Project ID column */}
                <th scope="col">Organization Name</th>
                <th scope="col">Sector</th>
                <th scope="col">Project Name</th>
                <th scope="col">Problem Statement</th>
                <th scope="col">Solution</th>
                <th scope="col">Expected AI Component</th>
                <th scope="col">Social Impacts</th>
                <th scope="col">Department Name and Group No</th>
                <th scope="col">Name of Students</th>
                <th scope="col">Mailids</th>
                <th scope="col">Contact Details</th>
                <th scope="col">Mentor Name</th>
                <th scope="col">Mentor Mailids</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <NoDataAvailable />
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.projectid}>
                    <td>{index + indexOfFirstItem + 1}</td>
                    <td>{item.projectid}</td> {/* Display Project ID here */}
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
                      <Link to={`/incident/${item.projectid}`} onClick={() => generateIncident(item.projectid)}>
                            Create Incident
                          </Link>
                      <MdDelete
                        size={24}
                        onClick={() => deleteProject(item.projectid)}
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

export default Projectgroup;

