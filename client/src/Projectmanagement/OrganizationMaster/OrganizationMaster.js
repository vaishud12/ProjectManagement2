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
const OrganizationMaster = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [file, setFile] = useState(null);


  useEffect(() => {
    loadData();
  }, []); // Added organizationName to dependency array

  const loadData = async () => {
    try {
      const response = await axios.get(
        API.GET_ORGANIZATION_MASTER
      );
      const sortedData = response.data.sort(
        (a, b) => b.organizationid - a.organizationid
      );
      setData(sortedData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const deleteProject = async (organizationid) => {
    console.log('organizationid in deleteProject:', organizationid); // Add this line
    if (window.confirm("Are you sure?")) {
      try {
        const response = await axios.delete(
          API.DELETE_ORGANIZATION_MASTER(organizationid)
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

    // Use FormData to send the file
    const formData = new FormData();
    formData.append('file', file); // 'file' is the key expected by the backend

    try {
        const response = await axios.post(API.POST_ORGANIZATION_UPLOAD_EXCEL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.status === 200) {
            alert('Data uploaded successfully and emails sent!');
        }
    } catch (error) {
        console.error("Error uploading data:", error.response?.data || error.message);
        alert("Error uploading data.");
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
            to="/organizationmaster/add"
   
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
                <th scope="col">Organization no</th> {/* Add Project ID column */}

                <th scope="col">Oragnization Name</th>
                <th scope="col">College Name</th>
                <th scope="col">Employee code</th>
                <th scope="col">Employee Name</th>
                <th scope="col">Employee Email</th>
                <th scope="col">Employee Phone no</th>
                <th scope="Col">Country</th>
                <th scope="col">State</th>
                <th scope="col">City</th>
                
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <NoDataAvailable />
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.organizationid}>
                    <td>{index + indexOfFirstItem + 1}</td>
                    <td>{item.organizationid}</td> {/* Display Project ID here */}
                    <td>{item.organizationname}</td>
                    <td>{item.collegename}</td>
                    <td>{item.employeecode}</td>
                    <th>{item.employeename}</th>
                    <th>{item.employeeemail}</th>
                    <th>{item.employeephoneno}</th>
                    <th>{item.country}</th>
                    <td>{item.statey}</td>
                    <td>{item.city}</td>
                                        
                    <td>
                      <Link to={`/organizationmaster/add/${item.organizationid}`}>
                        <FaEdit size={24} />
                      </Link>
                      <MdDelete
                        size={24}
                        onClick={() => deleteProject(item.organizationid)}
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

export default OrganizationMaster

