import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import * as API from "../../components/Endpoints/Endpoint";
import Navbar from "../../components/Navbar";
import Sidebarr from "../../components/Sidebarr";

const initialState = {
  sector: "",
  application_type: "",
  incidentcategory:"",
  incidentname:"",
  incidentdescription:"",
};

const Addeditseectormaster = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [state, setState] = useState(initialState);
  const { sector, application_type, incidentcategory,incidentname,incidentdescription } = state;
  const navigate = useNavigate();
  const { sectorid } = useParams();

  useEffect(() => {
    if (sectorid) {
      axios
        .get(API.GET_SPECIFIC_SECTOR_MASTER(sectorid))
        .then((resp) => setState({ ...resp.data[0] }))
        .catch((error) => {
          console.error("An error occurred while fetching the sector Details:", error);
        });
    }
  }, [sectorid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!sector || !application_type) {
      toast.error("Please provide all the inputs");
    } else {
      if (!sectorid) {
        axios
          .post(API.POST_SECTOR_MASTER, {
            sector,
            application_type,
            incidentcategory,incidentname,incidentdescription,
          })
          .then(() => {
            setState(initialState);
            toast.success("Sector group Added");
            setTimeout(() => navigate("/sectormaster"), 500);
          })
          .catch((err) => toast.error(err.response.data));
      } else {
        axios
          .put(API.UPDATE_SPECIFIC_SECTOR_MASTER(sectorid), {
            sector,
            application_type,incidentcategory,incidentname,incidentdescription,
          })
          .then(() => {
            setState(initialState);
            toast.success("Sector group Updated");
            setTimeout(() => navigate("/sectormaster"), 500);
          })
          .catch((err) => toast.error(err.response.data));
      }
    }
  };

  const handleMenuItemClick = (menuItem) => {
    console.log("Menu Item Clicked:", menuItem);
    // Add navigation or logic here based on `menuItem`
  };

  return (
    <div className="home-page">
      <Navbar />

      <div className="home-layout flex">
        {/* Sidebar */}
        <Sidebarr
          setExpanded={setSidebarExpanded}
          onMenuItemClick={handleMenuItemClick}
        />

        {/* Centered Form Container */}
        <div className="flex flex-col items-center justify-center w-full min-h-full">
          <div className="form-container w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold mb-6">
              {sectorid ? "Edit Sector" : "Add Sector"}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Sector</label>
                <input
                  type="text"
                  id="sector"
                  name="sector"
                  placeholder="Enter the Sector Name"
                  value={sector || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="application_type" className="block text-sm font-medium text-gray-700">Application Type</label>
                <input
                  type="text"
                  id="application_type"
                  name="application_type"
                  placeholder="Enter the Application Type"
                  value={application_type || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="incidentcategory" className="block text-sm font-medium text-gray-700">Incident Category</label>
                <input
                  type="text"
                  id="incidentcategory"
                  name="incidentcategory"
                  placeholder="Enter the Incident Category"
                  value={incidentcategory || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="incidentname" className="block text-sm font-medium text-gray-700">Incident Name</label>
                <input
                  type="text"
                  id="incidentname"
                  name="incidentname"
                  placeholder="Enter the Incident name"
                  value={incidentname || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="incidentdescription" className="block text-sm font-medium text-gray-700">Incident Description</label>
                <input
                  type="text"
                  id="incidentdescription"
                  name="incidentdescription"
                  placeholder="Enter the incident description"
                  value={incidentdescription || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex space-x-4">
                <input
                  type="submit"
                  value={sectorid ? "Update" : "Save"}
                  className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700"
                />
                <Link to="/sectormaster">
                  <input
                    type="button"
                    value="Go Back"
                    className="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700"
                  />
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addeditseectormaster;
