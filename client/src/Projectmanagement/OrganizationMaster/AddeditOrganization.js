import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import * as API from "../../components/Endpoints/Endpoint";
import Navbar from "../../components/Navbar";
import Sidebarr from "../../components/Sidebarr";

const initialState = {
  organizationname: "",
  collegename: "",
  employeecode: "",
  employeename:"",
  employeeemail:"",
  employeephoneno:"",
  country:"",
  statey: "",
  city: "",
};

const AddeditOrganization = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [state, setState] = useState(initialState);
  const { organizationname, collegename, employeecode, employeeemail, employeename, employeephoneno, country, statey, city } = state;
  const navigate = useNavigate();
  const { organizationid } = useParams();

  // Fetch initial data for organization
  useEffect(() => {
    if (organizationid) {
      axios
        .get(API.GET_SPECIFIC_ORGANIZATION_MASTER(organizationid))
        .then((resp) => setState({ ...resp.data[0] }))
        .catch((error) => {
          console.error("An error occurred while fetching organization details:", error);
        });
    }
  }, [organizationid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!organizationname || !collegename || !employeecode || !employeeemail || !employeename || !employeephoneno || !country || !statey || !city) {
      toast.error("Please provide all the inputs");
      return;
    }
  
    const data = {
      organizationname,
      collegename,
      employeecode,
      employeeemail,
      employeename,
      employeephoneno,
      country,
      statey,
      city,
    };
  
    if (!organizationid) {
      console.log("Adding new organization:", data);
      axios
        .post(API.POST_ORGANIZATION, data)
        .then(() => {
          setState(initialState);
          toast.success("Organization Added");
          setTimeout(() => navigate("/organizationmaster"), 500);
        })
        .catch((err) => {
          console.error("Add error:", err);
          toast.error(err.response?.data || "Add failed");
        });
    } else {
      console.log("Updating organization:", organizationid, data);
      axios
        .put(API.UPDATE_SPECIFIC_ORGANIZATION_MASTER(organizationid), data)
        .then(() => {
          setState(initialState);
          toast.success("Organization Updated");
          setTimeout(() => navigate("/organizationmaster"), 500);
        })
        .catch((err) => {
          console.error("Update error:", err);
          toast.error(err.response?.data || "Update failed");
        });
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
        <div className="flex flex-col items-center justify-center w-full min-h-screen">
          <div className="form-container w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold mb-6">
              {organizationid ? "Edit Organization" : "Add Organization"}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="organizationname" className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input
                  type="text"
                  id="organizationname"
                  name="organizationname"
                  placeholder="Enter the Organization Name"
                  value={organizationname || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="collegename" className="block text-sm font-medium text-gray-700">College Name</label>
                <input
                  type="text"
                  id="collegename"
                  name="collegename"
                  placeholder="Enter the College Name"
                  value={collegename || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="employeecode" className="block text-sm font-medium text-gray-700">Employee Code</label>
                <input
                  type="text"
                  id="employeecode"
                  name="employeecode"
                  placeholder="Enter the Employee Code"
                  value={employeecode || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="employeeemail" className="block text-sm font-medium text-gray-700">Employee Email</label>
                <input
                  type="text"
                  id="employeeemail"
                  name="employeeemail"
                  placeholder="Enter the Employee Email"
                  value={employeeemail || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="employeename" className="block text-sm font-medium text-gray-700">Employee Name</label>
                <input
                  type="text"
                  id="employeename"
                  name="employeename"
                  placeholder="Enter the Employee Name"
                  value={employeename || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="employeephoneno" className="block text-sm font-medium text-gray-700">Employee Phone no</label>
                <input
                  type="text"
                  id="employeephoneno"
                  name="employeephoneno"
                  placeholder="Enter the Employee Phoneno"
                  value={employeephoneno || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  placeholder="Enter the Country"
                  value={country || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="statey" className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  id="statey"
                  name="statey"
                  placeholder="Enter the State"
                  value={statey || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="Enter the City"
                  value={city || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex space-x-4">
                <input
                  type="submit"
                  value={organizationid ? "Update" : "Save"}
                  className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700"
                />
                <Link to="/organizationmaster">
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

export default AddeditOrganization;
