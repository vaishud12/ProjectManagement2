import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from "../../components/Pagination/Pagination";
import Navbar from "../../components/Navbar";
import Sidebarr from "../../components/Sidebarr";
import * as API from "../../components/Endpoints/Endpoint";
import * as XLSX from "xlsx";
const SectorMaster = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get(API.GET_SECTOR_MASTER);
      const sortedData = response.data.sort((a, b) => b.sectorid - a.sectorid);
      setData(sortedData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const deleteGovernanceGroup = async (sectorid) => {
    if (window.confirm("Are you sure?")) {
      try {
        const response = await axios.delete(API.DELETE_SECTOR_MASTER(sectorid));
        if (response.status === 200) {
          toast.success("Governance Group Deleted Successfully");
          loadData();
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          toast.error(
            "Cannot delete Governance Group as there are associates present."
          );
        } else {
          console.error(error);
          toast.error("An error occurred while deleting Governance Group.");
        }
      }
    }
  };

  // Calculate the index of the first and last items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the data to get the current items for the current page
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Group items by sector
  const groupedItems = currentItems.reduce((acc, item) => {
    const sector = item.sector;
    if (!acc[sector]) acc[sector] = [];
    acc[sector].push(item);
    return acc;
  }, {});

  // Flatten the groupedItems back into an array
  const flatItems = Object.entries(groupedItems).map(([sector, items]) => ({
    sector,
    items,
  }));

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleMenuItemClick = (menuItem) => {
    console.log("Menu Item Clicked:", menuItem);
    // Add navigation or logic here based on `menuItem`
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
            const response = await axios.post(API.POST_SECTOR_UPLOAD_EXCEL, jsonData);  // Backend API URL
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

    
const handleFileChange = (e) => {
  setFile(e.target.files[0]);
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
            <h1 className="text-center mb-4 mt-16">Sector Group</h1>
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
              <Link to="/sectormaster/add">
                <div className="input-group center">
                  <button className="btn btn-round btn-signup">
                    Add Sector Group
                  </button>
                </div>
              </Link>
            </div>
            <div
              className="table-responsive mb-4 d-flex justify-content-end"
              style={{ maxWidth: "85%", margin: "0 auto", marginRight: 0 }}
            >
              <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">No.</th>
                    <th scope="col" className="w-25">
                      Sector
                    </th>
                    <th scope="col" className="w-25">
                      Application Type
                    </th>
                    <th scope="col" className="w-25">
                      Incident category
                    </th>
                    <th scope="col" className="w-25">
                      Incident Name
                    </th>
                    <th scope="col" className="w-25">
                      Incident Description
                    </th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
  {flatItems.map((group, groupIndex) => {
    return group.items.map((item, index) => {
      // Global row number is calculated considering pagination
      const globalRowNumber =
        index + groupIndex * itemsPerPage + 1 + (currentPage - 1) * itemsPerPage;

      return (
        <tr key={item.sectorid}>
          {/* Sequential Numbering */}
          <td>{globalRowNumber}</td>

          {/* Merge Sector column for consecutive rows */}
          {index === 0 ? (
            <td rowSpan={group.items.length}>{group.sector}</td>
          ) : null}

          <td>{item.application_type}</td>
          <td>{item.incidentcategory}</td>
          <td>{item.incidentname}</td>
          <td>{item.incidentdescription}</td>

          <td>
            <Link to={`/sectormaster/add/${item.sectorid}`}>
              <FaEdit size={24} />
            </Link>

            <MdDelete
              size={24}
              onClick={() => deleteGovernanceGroup(item.sectorid)}
            />
          </td>
        </tr>
      );
    });
  })}
</tbody>


              </table>
            </div>
            <div className="d-flex justify-content-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorMaster;
