import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import * as API from "../../components/Endpoints/Endpoint"
import Navbar from "../../components/Navbar";
import Sidebarr from "../../components/Sidebarr"
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "../../components/Pagination/Pagination";
import NoDataAvailable from "../../components/NoDataAvailable/NoDataAvailable"
import * as XLSX from "xlsx";
const Incident = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [priorityTimes, setPriorityTimes] = useState({
    critical: '',
    veryhigh: '',
    high: '',
    medium: '',
    low: ''
});
const [file, setFile] = useState(null);
  // const [token, setToken] = useState('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'); // Your GitHub token

  const handleFileChangeg= (e) => {
    setFile(e.target.files[0]);
  };

  const handlefilesubmit = async () => {
    if (!file) {
      alert('Please upload an Excel file.');
      return;
    }

    
    const reader = new FileReader();
    reader.onload = async () => {
      const data = reader.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      for (const row of json) {
        let { OrganizationName, IncidentCategory, ProjectName, FilePath } = row;

        if (!OrganizationName || !IncidentCategory || !ProjectName || !FilePath) {
          alert('Missing required fields in Excel. Please check your file.');
          continue;
        }

        const fileName = FilePath.split(/[/\\]/).pop(); // Extract only filename
        const repoName = OrganizationName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        // Check if repository exists
        if (await repositoryExists(repoName)) {
          alert("Repository already exists.");
        } else {
          await createRepository(repoName);
          alert(`Repository created successfully: ${repoName}`);
        }

        const folderPath = `${IncidentCategory}/${ProjectName}`;
        await ensureFolderExists(repoName, IncidentCategory);
        await ensureFolderExists(repoName, folderPath);

        const fileToUpload = new File([file], fileName);
        const fileContent = await readFile(fileToUpload);

        if (await fileExists(repoName, `${folderPath}/${fileName}`)) {
          alert(`File "${fileName}" already exists in the repository.`);
        } else {
          await uploadFileToGitHub(repoName, fileContent, `${folderPath}/${fileName}`);
          alert(`File "${fileName}" uploaded successfully.`);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const repositoryExists = async (repoName) => {
    try {
      await axios.get(`https://api.github.com/repos/vaishud12/${repoName}`);
      return true;
    } catch (error) {
      return false;
    }
  };

  const createRepository = async (repoName) => {
    try {
      await axios.post(
        `https://api.github.com/user/repos`,
        { name: repoName, private: false },
        { headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      alert('Error creating repository. Please check your GitHub permissions.');
    }
  };

  const ensureFolderExists = async (repoName, folderPath) => {
    try {
      await axios.get(`https://api.github.com/repos/vaishud12/${repoName}/contents/${folderPath}`);
    } catch (error) {
      if (error.response?.status === 404) {
        await uploadFileToGitHub(repoName, '', `${folderPath}/.gitkeep`);
      }
    }
  };

  const fileExists = async (repoName, filePath) => {
    try {
      await axios.get(`https://api.github.com/repos/vaishud12/${repoName}/contents/${filePath}`);
      return true; // File exists
    } catch (error) {
      return false; // File does not exist
    }
  };

  const readFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target.result;
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadFileToGitHub = async (repoName, fileContent, filePath) => {
    try {
      await axios.put(
        `https://api.github.com/repos/vaishud12/${repoName}/contents/${filePath}`,
        {
          message: 'Upload file via API from Excel',
          content: fileContent,
        },
        { headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      alert('Error uploading file. Please check if its alraedy exist or not.');
    }
  };

  
  useEffect(() => {
    loadData();
  }, []); // Added organizationName to dependency array

  const loadData = async () => {
    try {
      const response = await axios.get(
        API.GET_INCIDENT
      );
      const sortedData = response.data.sort(
        (a, b) => b.projectid - a.projectid
      );
      setData(sortedData);
    } catch (error) {
      console.error("Error loading data:", error);
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
    
    "OrganizationName": item.organizationname || "",
    
   
    "IncidentCategory": item.incidentcategory || "",
   
    "ProjectName": item.projectname || "",

    "FilePath": item.file ? API.GET_FILE_URL(item.file) : "No file available",
  }));

  // Create a new workbook and add the table data
  const worksheet = XLSX.utils.json_to_sheet(tableData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Incidents");

  // Trigger the file download
  XLSX.writeFile(workbook, "Incident_Details.xlsx");
}; 
const handleDownloadAll = async () => {
  try {
    const response = await fetch(API.GET_DOWNLOAD_FILES);
    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to download files.');
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'files.zip'; // Name of the downloaded ZIP file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Files downloaded successfully!');
  } catch (error) {
    console.error('Error downloading files:', error);
    alert('An error occurred while downloading the files.');
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
        <div className="mb-4 d-flex justify-content-end">
          <Link
            to="/incident/add"
   
          >
            <div className="input-group center">
              <button className="btn btn-round btn-signup">Add Incident</button>
            </div>
          </Link>
        </div>

        
<div className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-9">
  <form
    onSubmit={handlePriorityTimesSubmit}
    className="w-full max-w-[1000px] bg-white shadow-md rounded-lg p-6 sm:p-8 lg:p-10"
  >
    <h3 className="text-center font-bold text-2xl text-gray-800 mb-6">
      Set Priority Time
    </h3>
    <div className="flex flex-wrap gap-4 justify-center mb-6">
      {Object.keys(priorityTimes).map((priority) => (
        <div
          key={priority}
          className="flex-1 min-w-[150px] max-w-[250px] w-full"
        >
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {priority.charAt(0).toUpperCase() + priority.slice(1)}:
            <input
              type="text"
              name={priority}
              value={priorityTimes[priority]}
              onChange={handlePriorityTimeChange}
              placeholder="Time in hours"
              min="0"
              className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>
      ))}
    </div>
    <button
      type="submit"
      className="w-full sm:w-auto px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200 rounded-md text-sm font-semibold shadow-md"
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
{/*Github file upload*/}
  {/* Instructions Section */}
  <div
            className="instructions-section"
            style={{
              margin: "20px auto",
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              maxWidth: "800px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>
              **Steps to Share Files to GitHub**
            </h2>
            <ol style={{ lineHeight: "1.8" }}>
              <li>
                <strong>Download all the files to your local system:</strong> 
                Use the provided "Download Incident Files" button to download all the files in a `.zip` format. Extract the files to a folder on your local system.
              </li>
              <li>
                <strong>Download the Excel sheet provided:</strong> 
                Use the "Download Excel" button to download the sheet containing details about the files.
              </li>
              <li>
                <strong>Update the Excel sheet with correct URLs:</strong> 
                For each file, ensure you provide the correct URL where the file will be stored after uploading to the GitHub repository. This step is important to maintain accurate file references.
              </li>
              <li>
                <strong>Upload the updated Excel file to the GitHub repository:</strong>
                Follow these steps:
                <ol>
                  
                  
                  <li>
                
                <p>
                  Use the form below to upload your updated Excel file. Click on the **Submit** button after selecting the file.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChangeg}
                    style={{
                      padding: "8px",
                      fontSize: "14px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      marginBottom: "10px",
                    }}
                  />
                  <button
                    onClick={handlefilesubmit}
                    style={{
                      backgroundColor: "#3385ffdf",
                      color: "white",
                      padding: "10px 20px",
                      fontSize: "16px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    Submit
                  </button>
                </div>
              </li>
                  <li>
                    Verify that the updated Excel file appears in the GitHub repository.
                  </li>
                 
                </ol>
              </li>
            </ol>
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
                <th scope="col">File<button onClick={handleDownloadAll} className="w-full sm:w-auto px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200 rounded-md text-sm font-semibold shadow-md">
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
                      <Link to={`/incident/add/${item.incidentid}`}>
                        <FaEdit size={24} />
                      </Link>
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

export default Incident;

