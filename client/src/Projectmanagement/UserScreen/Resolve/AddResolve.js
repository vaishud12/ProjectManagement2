import React, { useState, useEffect } from "react";
import * as API from "../../../components/Endpoints/Endpoint";

const AddResolve = ({ show, handleClose, incidentData }) => {
  const [formData, setFormData] = useState({
    resolutionRemark: "",
    resolvedBy: "",
    resolvedDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [fileDescription, setFileDescription] = useState("");
  const user_id = sessionStorage.getItem("user_id");
  console.log(user_id)
  // Fetch incident data using GET API
  useEffect(() => {
    const fetchIncidentData = async () => {
      try {
        const response = await fetch(API.GET_SPECIFIC_INCIDENT(incidentData.incidentid));
        if (!response.ok) {
          throw new Error("Failed to fetch incident details");
        }
        const data = await response.json();
        console.log("Fetched Incident Data:", data);
      } catch (err) {
        console.error(err.message);
      }
    };

    if (incidentData?.incidentid) {
      fetchIncidentData();
    }
  }, [incidentData]);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    // Prepare FormData for sending to backend
    const formDataToSend = new FormData();
  
    // Append incident data to FormData
    formDataToSend.append("incidentid", incidentData.incidentid);
    formDataToSend.append("organizationname", incidentData.organizationname);
    formDataToSend.append("sector", incidentData.sector);
    formDataToSend.append("incidentcategory", incidentData.incidentcategory);
    formDataToSend.append("incidentname", incidentData.incidentname);
    formDataToSend.append("incidentowner", incidentData.incidentowner);
  
    // Append resolution data
    formDataToSend.append("resolutionremark", formData.resolutionRemark);
    formDataToSend.append("resolvedby", formData.resolvedBy);
    formDataToSend.append("resolveddate", formData.resolvedDate);
  formDataToSend.append("user_id", formData.user_id)
    // Append file if it exists
    if (file) {
      formDataToSend.append("file", file); // File is appended here
    }
  
    // Append file description
    formDataToSend.append("filedescription", fileDescription);
  
    try {
      // Step 1: Resolve the incident
      const resolveResponse = await fetch(API.POST_RESOLVE, {
        method: "POST",
        body: formDataToSend,
      });
  
      if (!resolveResponse.ok) {
        throw new Error("Failed to resolve the incident.");
      }
  
      const resolveResult = await resolveResponse.json();
      console.log("Incident resolved:", resolveResult);
  
      // Step 2: Prepare FormData for email payload
      const emailFormData = new FormData();
      emailFormData.append("incidentid", incidentData.incidentid);
      emailFormData.append("organizationname", incidentData.organizationname);
      emailFormData.append("sector", incidentData.sector);
      emailFormData.append("incidentcategory", incidentData.incidentcategory);
      emailFormData.append("incidentname", incidentData.incidentname);
      emailFormData.append("incidentowner", incidentData.incidentowner);
      emailFormData.append("resolutionremark", formData.resolutionRemark);
      emailFormData.append("resolvedby", formData.resolvedBy);
      emailFormData.append("resolveddate", formData.resolvedDate);
      emailFormData.append("filedescription", fileDescription);
 
      // Attach the file to the email payload
      if (file) {
        emailFormData.append("file", file);
      }
  
      const emailResponse = await fetch(API.SEND_RESOLVE_EMAIL, {
        method: "POST",
        body: emailFormData, // Sending FormData directly for email
      });
  
      if (!emailResponse.ok) {
        throw new Error("Failed to send the email.");
      }
  
      console.log("Email sent successfully");
      handleClose(); // Close the modal on successful submission
    } catch (err) {
      setError("Failed to resolve the incident or send the email. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    show && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Resolve Incident</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={handleClose}
            >
              ✖
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Display all relevant incident data */}
            {incidentData && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      IncidentID
                    </label>
                    <input
                      type="text"
                      value={incidentData.incidentid || "N/A"}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={incidentData.organizationname || "N/A"}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sector
                    </label>
                    <input
                      type="text"
                      value={incidentData.sector || "N/A"}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Incident Category
                    </label>
                    <input
                      type="text"
                      value={incidentData.incidentcategory || "N/A"}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Incident Name
                    </label>
                    <input
                      type="text"
                      value={incidentData.incidentname || "N/A"}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Incident Owner
                    </label>
                    <input
                      type="text"
                      value={incidentData.incidentowner || "N/A"}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>
              </>
            )}
            {/* Fields for resolution */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Resolution Remark
              </label>
              <textarea
                name="resolutionRemark"
                value={formData.resolutionRemark}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Resolved By
              </label>
              <input
                type="text"
                name="resolvedBy"
                value={formData.resolvedBy}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Resolved Date
              </label>
              <input
                type="datetime-local"
                name="resolvedDate"
                value={formData.resolvedDate}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            {/* File upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                File Description
              </label>
              <textarea
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="Describe the file..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2 hover:bg-gray-300"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Resolving..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default AddResolve;
