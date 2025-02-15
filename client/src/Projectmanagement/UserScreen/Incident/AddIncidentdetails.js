import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../../ProjectGroup/Addeditproject.css";
import * as API from "../../../components/Endpoints/Endpoint";

const initialState = {
  tagpbinumber: "",
  pbi:"",
  organizationname:"",
  projectname:"",
  sector: "",
  application_type: "",
  incidentcategory: "",
  incidentname: "",
  incidentdescription: "",
  datetime: "",
  incidentowner: "",
  status: "",
  incidentresolver: "",
  priority: "",
  photo:null,
};

const AddIncidentdetails = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [state, setState] = useState(initialState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePath, setFilePath]=useState([]);
  const [descriptions, setDescriptions] = useState([]);

  const {
    tagpbinumber,
    pbi,
  sector,
  organizationname,
  projectname,
  application_type,
  incidentcategory,
  incidentname,
  incidentdescription,
  datetime,
  incidentowner,
  status,
  incidentresolver,
  priority,
  photo,
  } = state || {};
  const [organizationnames, setOrganizationnames] = useState([]);
  const [projectnames, setprojectnames] = useState([]);
  const [sectors, setSectors] = useState([]);
    const [applicationtype, setapplicationtype] = useState([]);
    const [incidentcategories, setincidentcategories] = useState([]);
    const [incidentnames, setincidentnames] = useState([]);
    const [incidentdescriptions, setincidentdescriptions] = useState([]);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { incidentid } = useParams();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(API.GET_SECTORS)
        .then((resp) => {
            console.log("Incident sector data:", resp.data);
            setSectors(resp.data);
        })
        .catch(error => {
            console.error("Error fetching incident sector:", error);
        });
}, []);

useEffect(() => {
  axios.get(API.GET_ORGANIZATION_NAME)
      .then((resp) => {
          console.log("Incident sector data:", resp.data);
          setOrganizationnames(resp.data);
      })
      .catch(error => {
          console.error("Error fetching incident sector:", error);
      });
}, []);

useEffect(() => {
  axios.get(API.GET_PROJECT_NAME)
      .then((resp) => {
          console.log("Incident sector data:", resp.data);
          setprojectnames(resp.data);
      })
      .catch(error => {
          console.error("Error fetching incident sector:", error);
      });
}, []);

useEffect(() => {
    if (sector) { // Fetch only if sector is selected
        axios.get(`${API.GET_APPLICATION_TYPES}?sector=${sector}`)
            .then((resp) => {
                console.log("Application type data:", resp.data);
                setapplicationtype(resp.data);
            })
            .catch(error => {
                console.error("Error fetching incident category:", error);
            });
    }
}, [sector]);
useEffect(() => {
  if (application_type) { // Fetch only if application_type is available
    axios.get(`${API.GET_INCIDENT_CATEGORIES}?application_type=${application_type}`)
      .then((resp) => {
        console.log("incident category data:", resp.data);
        setincidentcategories(resp.data);
      })
      .catch(error => {
        console.error("Error fetching incident category:", error);
      });
  }
}, [application_type]);
useEffect(() => {
  if (incidentcategory) { // Fetch only if sector is selected
      axios.get(`${API.GET_INCIDENT_NAME}?incidentcategory=${incidentcategory}`)
          .then((resp) => {
              console.log("Incident name data:", resp.data);
              setincidentnames(resp.data);
          })
          .catch(error => {
              console.error("Error fetching incident category:", error);
          });
  }
}, [incidentcategory]);

useEffect(() => {
  if (application_type) { // Fetch only if sector is selected
      axios.get(`${API.GET_INCIDENT_DESCRIPTION}?incidentname=${incidentname}`)
          .then((resp) => {
              console.log("Incident description data:", resp.data);
              setincidentdescriptions(resp.data);
          })
          .catch(error => {
              console.error("Error fetching incident category:", error);
          });
  }
}, [incidentname]);

  

useEffect(() => {
  if (!incidentid) return;

  axios
    .get(API.GET_SPECIFIC_INCIDENT(incidentid))
    .then((resp) => {
      console.log("API Response Data:", resp.data);
      if (resp.data && resp.data[0]) {
        setState({ ...resp.data[0] });
        setLoading(false);  // Set loading to false once data is loaded
      } else {
        console.error("API response does not contain expected data");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      setLoading(false);  // Set loading to false in case of error
    });
}, [incidentid]);




 
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setState((prevState) => ({ ...prevState, [name]: value }));
};


  const handlePhotoChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
  
    // Update the state with the new photo, keeping other fields intact
    setState(prevState => ({
      ...prevState,  // Spread the previous state to retain other fields
      photo: file,   // Update the photo field
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submitted");
    console.log("Form data:", {
        tagpbinumber,pbi,organizationname, projectname,
        sector,application_type,
        incidentcategory,
        incidentname,
        incidentowner,
        incidentdescription,
        datetime,
        incidentresolver,
        status,priority
    });

    if (
        !tagpbinumber ||
        !pbi ||
        !sector ||
        !application_type ||
        !incidentcategory ||
        !incidentname ||
        !incidentowner ||
        !incidentdescription ||
        !datetime ||
        !incidentowner ||
        !incidentresolver 
    ) {
        alert("Please provide a value for each input field");
        return;
    }

   
    setLoading(true);
    try {
        // Fetch priority times from the server
        const priorityResponse = await axios.get(API.GET_PRIORITY_TIME);
        const priorityTimes = priorityResponse.data;

        // Determine the appropriate priority time
        let timeFrame = '24 hours'; // Default value
        switch (priority) {
            case 'critical':
                timeFrame = priorityTimes.critical;
                break;
            case 'veryhigh':
                timeFrame = priorityTimes.veryhigh;
                break;
            case 'high':
                timeFrame = priorityTimes.high;
                break;
            case 'medium':
                timeFrame = priorityTimes.medium;
                break;
            case 'low':
                timeFrame = priorityTimes.low;
                break;
            default:
                break;
        }

        // Create FormData object
        const formData = new FormData();
        formData.append('tagpbinumber', tagpbinumber);
        formData.append('pbi', pbi);
        formData.append('organizationname', organizationname);
        formData.append('projectname', projectname);
        formData.append('sector', sector);
        formData.append('application_type', application_type);
        formData.append('incidentcategory', incidentcategory);
        formData.append('incidentname', incidentname);
        formData.append('incidentowner', incidentowner);
        formData.append('incidentdescription', incidentdescription);
        formData.append('date-time', datetime);
        formData.append('incidentresolver', incidentresolver);
        formData.append('status', status);
        
        // Append tags
       
        formData.append('priority', priority);
        // Append the description
        formData.append('description', descriptions);

        // Append photo only if it's a new one
        if (photo) {
            formData.append('photo', photo);
        }
        if (selectedFiles) {
          formData.append('file', selectedFiles); // Append single file
      }

     
        console.log("Form Data:", formData);
        console.log("Checking if incidentid exists:", incidentid);

        // Submit data
        if (incidentid) {
            // For updating an existing record
            await axios.put(API.UPDATE_SPECIFIC_INCIDENT(incidentid), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } else {
            // For creating a new record
            await axios.post(API.POST_INCIDENT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }

        // Reset state
        setState(initialState);
        toast.success(`${incidentid ? 'Incident updated' : 'Incident added'} successfully`);

        // Prepare FormData object for email payload
        const emailFormData = new FormData();
        emailFormData.append('email1', incidentresolver);
        emailFormData.append('from', incidentowner);
        emailFormData.append('tagpbinumber', tagpbinumber);
        emailFormData.append('pbi', pbi);
        emailFormData.append('organizationname', organizationname);
        emailFormData.append('projectname', projectname);
        emailFormData.append('sector', sector);
        emailFormData.append('application_type', application_type);
        emailFormData.append('incidentcategory', incidentcategory);
        emailFormData.append('incidentname', incidentname);
        emailFormData.append('incidentowner', incidentowner);
        emailFormData.append('incidentdescription', incidentdescription);
        emailFormData.append('datetime', datetime);
        emailFormData.append('incidentresolver', incidentresolver);
        emailFormData.append('status', status);
        emailFormData.append('priority', priority);
       

        // Append photo for email if available
        if (photo) {
            emailFormData.append('photo', photo); // Attach the file for the email
        }

        if (selectedFiles) {
          emailFormData.append('file', selectedFiles); // Attach other selected files
      }

      if (descriptions) {
          emailFormData.append('description', descriptions); // Attach the description for the email
      }

        console.log("Email FormData:", emailFormData);

        // Send email with incident details
        const emailResponse = await axios.post(API.SEND_INCIDENT_EMAIL, emailFormData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("Email response:", emailResponse);

        if (emailResponse.status === 200) {
            toast.success('Email sent successfully');
            setEmailSent(true);
        }

        // Prepare and open WhatsApp URL
        const message = `This Incident ${incidentname} Should be Resolved within ${timeFrame}!!!!! ... Sector: ${sector}, Incident Category: ${incidentcategory}\nIncident Name: ${incidentname}\nIncident Owner: ${incidentowner}\nIncident Description: ${incidentdescription}\nDate: ${datetime}\nRaised to User: ${incidentresolver}\nStatus: ${status}\npriority:${priority}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        
    } catch (error) {
        console.error("Submit error:", error);
        toast.error("An error occurred while processing the request.");
    }
};
const handleFileChange = (event) => {
  const file = event.target.files[0]; // Get the first selected file
  setSelectedFiles(file); 
  
  // If you want to capture the file path (machine path), you can do this:
  const filePath = file ? file.path : ''; // This will give you the file path on the machine (local path)
  setFilePath(filePath);// Store the file directly (not as an array)
};

const handleDescriptionChange = (e) => {
    setDescriptions(e.target.value); // Update the description state
  };

  
  const handleMenuItemClick = (menuItem) => {
    console.log("Menu Item Clicked:", menuItem);
    // Add navigation or logic here based on `menuItem`
  };
  return (
   
      

      <div className="home-layout">
        
    <div className="add-edit-project-container mt-9">
      <form onSubmit={handleSubmit} className="add-edit-project-form">
        <div className="add-edit-project-grid">
        <div>
            <label>Tag (PBI Number):</label>
            <input
              type="text"
              id="tagpbinumber"
              name="tagpbinumber"
              value={state?.tagpbinumber || ''}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
        </div>
          <div>
            <label>PBI:</label>
            <input
              type="text"
              id="pbi"
              name="pbi"
              value={state?.pbi}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          {/* Sector Dropdown */}
          <div>
                        <label>Organization Name</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            id="organizationname"
                            name="organizationname"
                            value={state.organizationname}
                            onChange={handleInputChange}
                        >
                            <option value=""> Select sector</option>
                            {organizationnames.map((organame, index) => (
                                <option
                                    key={organame.organizationid}
                                    value={organame.organizationname}
                                >
                                    {organame.organizationname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Project Name</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            id="projectname"
                            name="projectname"
                            value={state.projectname}
                            onChange={handleInputChange}
                        >
                            <option value=""> Select Project Name</option>
                            {projectnames.map((proname, index) => (
                                <option
                                    key={proname.projectid}
                                    value={proname.projectname}
                                >
                                    {proname.projectname}
                                </option>
                            ))}
                        </select>
                    </div>

          <div>
                        <label>Sector</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            id="sector"
                            name="sector"
                            value={state?.sector}
                            onChange={handleInputChange}
                        >
                            <option value=""> Select sector</option>
                            {sectors.map((sectory, index) => (
                                <option
                                    key={sectory.sectorid}
                                    value={sectory.sector}
                                >
                                    {sectory.sector}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Application Type</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            id="application_type"
                            name="application_type"
                            value={state.application_type}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Application Type</option>
                            {applicationtype.map((application, index) => (
                                <option
                                    key={application.sectorid}
                                    value={application.application_type}
                                >
                                    {application.application_type}
                                </option>
                            ))}
                        </select>
                    </div>


          {/* Responsibility Group Dropdown */}
          <div>
                        <label>Incident Category</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            id="incidentcategory"
                            name="incidentcategory"
                            value={state.incidentcategory}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Incident category</option>
                            {incidentcategories.map((category, index) => (
                                <option
                                    key={category.sectorid}
                                    value={category.incidentcategory}
                                >
                                    {category.incidentcategory}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Incident Name</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            id="incidentname"
                            name="incidentname"
                            value={state.incidentname}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Incident Name</option>
                            {incidentnames.map((name, index) => (
                                <option
                                    key={name.sectorid}
                                    value={name.incidentname}
                                >
                                    {name.incidentname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Incident Description</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            id="incidentdescription"
                            name="incidentdescription"
                            value={state?.incidentdescription}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Incident description</option>
                            {incidentdescriptions.map((description, index) => (
                                <option
                                    key={description.sectorid}
                                    value={description.incidentdescription}
                                >
                                    {description.incidentdescription}
                                </option>
                            ))}
                        </select>
                    </div>

          <div>
            <label>Date Time</label>
            <input
              type="datetime-local"
              id="datetime"
              name="datetime"
              value={state.datetime}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          <div>
            <label>Incident Owner email</label>
            <input
              type="text"
              id="incidentowner"
              name="incidentowner"
              value={state.incidentowner}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          <div>
          <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={state.status}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Status</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="inprogress">In Progress</option>
                        <option value="onhold">On Hold</option>
                    </select>
          </div>
          <div>
          <label htmlFor="priority">priority</label>
<div onChange={handleInputChange} style={{ margin: '10px 0' }}>
    <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', cursor: 'pointer', color: '#ff0000' }}>
        <input
            type="radio"
            name="priority"
            value="critical"
            checked={priority === "critical" || incidentid?.priority === "critical"}  // Prefill with editItem priority
            style={{ marginRight: '8px' }}
        />
      critical
    </label> 
    <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', cursor: 'pointer', color: '#ff4500' }}>
        <input
            type="radio"
            name="priority"
            value="veryhigh"
            checked={priority === "veryhigh" || incidentid?.priority === "veryhigh" }
            style={{ marginRight: '8px' }}
        />
      veryhigh
    </label>
    <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', cursor: 'pointer', color: '#ff8c00' }}>
        <input
            type="radio"
            name="priority"
            value="high"
            checked={priority === "high" || incidentid?.priority === "high"}
            style={{ marginRight: '8px' }}
        />
        high
    </label>
    <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', cursor: 'pointer', color: '#ffd700' }}>
        <input
            type="radio"
            name="priority"
            value="medium"
            checked={priority === "medium" || incidentid?.priority === "medium"}
            style={{ marginRight: '8px' }}
        />
       medium
    </label>
    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#32cd32' }}>
        <input
            type="radio"
            name="priority"
            value="low"
            checked={priority === "low" || incidentid?.priority === "low"}
            style={{ marginRight: '8px' }}
        />
        low
    </label>
    </div>
          </div>
          
          <div>
            <label>Incident Resolver</label>
            <input
              type="text"
              id="incidentresolver"
              name="incidentresolver"
              value={state.incidentresolver}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
        
          <div>
  <label htmlFor="photo">Upload Photo</label>
  <input
    type="file"
    name="photo"
    onChange={handlePhotoChange}
    // Disable input if in edit mode
  />

  {/* Display the selected file name */}
  {photo && <p>Selected file: {photo.name}</p>}

  {/* Display the previously uploaded file name if editing an existing incident */}
  {incidentid && (
    <div>
      <p>Previously uploaded file: {state.photo || 'No photo uploaded'}</p>
      
    </div>
  )}
</div>

<div>
<div>
        <label htmlFor="file">Upload Files</label>
        <input
          type="file"
          id="file"
          name="file"
          multiple
          onChange={handleFileChange}
        />
      </div>

      <div
        style={{
          margin: "20px 0",
          padding: "10px",
          borderRadius: "8px",
          backgroundColor: "#f8f8f8",
        }}
      >
        <label>
          Description:
          <input
            type="text"
            value={descriptions || ""}
            onChange={(e) => handleDescriptionChange(e)} // Pass event correctly
            placeholder="Enter description"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </label>
      </div>
      </div>
    </div>

        <input
            className="btn btn-round btn-signup"
            type="submit"
            value={incidentid ? "Update" : "Save"}
          />
          <Link to="/incident">
            <input
              className="btn btn-round btn-signup"
              type="button"
              value="Go back"
            />
          </Link>
      </form>
    </div>
    </div>
    
  );
};

export default AddIncidentdetails;



