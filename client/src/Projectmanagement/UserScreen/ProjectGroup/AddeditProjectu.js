import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../../ProjectGroup/Addeditproject.css"
import * as API from "../../../components/Endpoints/Endpoint";

const initialState = {
  sector: "",
  organizationname:"",
  projectname: "",
  projectstatement: "",
  solutions: "",
  expectedcomponent: "",
  socialimpacts: "",
  departmentnamegroupno: "",
  studentnames: "",
  
  studentmailids: "",
  contactdetails: "",
  mentorname: "",
  mentormailids:"",
};

const Addeditprojectu = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [state, setState] = useState(initialState);
  const {
    sector,
    organizationname,
    projectname,
    projectstatement,
    solutions,
    expectedcomponent,
    socialimpacts,
    departmentnamegroupno,
    studentnames,
    studentmailids,
    contactdetails,
    mentorname,
    mentormailids,
  } = state;
  const [sectorComp, setSectorComp] = useState([]);
  const [organizationamecomp, setorganizationnamecomp] = useState([]);
  const { projectid } = useParams();
  const navigate = useNavigate();

  // Fetch initial data for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await axios.get(API.GET_SECTORS);
        setSectorComp(response.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error.message);
        if (error.response) {
          console.error("Response Data:", error.response.data);
        }
      }
    };
    const fetchDropdownDatao = async () => {
      try {
        const response = await axios.get(API.GET_ORGANIZATION_NAME);
        setorganizationnamecomp(response.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error.message);
        if (error.response) {
          console.error("Response Data:", error.response.data);
        }
      }
    };

  fetchDropdownDatao();
    fetchDropdownData();
  }, []);
  useEffect(() => {
    console.log("Project ID in useEffect:", projectid);

    if (!projectid) {
        console.error("Project ID is undefined or invalid");
        return;
    }

    axios
        .get(API.GET_SPECIFIC_PROJECT_DETAILS(projectid))
        .then((resp) => {
            if (resp.data.length === 0) {
                console.warn("No project details found for the given ID");
                return;
            }
            setState({ ...resp.data[0] }); // Update state with the project details
        })
        .catch((error) => {
            if (error.response && error.response.status === 404) {
                console.error("Project not found:", error.response.data);
            } else {
                console.error(
                    "An error occurred while fetching the Project Details:",
                    error.message
                );
            }
        });
}, [projectid]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (
      !sector ||
      !organizationname ||
      !projectname ||
      !projectstatement ||
      !solutions ||
      !expectedcomponent ||
      !socialimpacts ||
      !departmentnamegroupno ||
      !studentnames ||
      !studentmailids ||
      !contactdetails ||
      !mentorname ||
      !mentormailids
    ) {
      toast.error("Please provide all the inputs");
    } else {
      const projectData = {
        sector,
        organizationname,
        projectname,
        projectstatement,
        solutions,
        expectedcomponent,
        socialimpacts,
        departmentnamegroupno,
        studentnames,
        studentmailids,
        contactdetails,  // Ensure this is a comma-separated string of phone numbers
        mentorname,
        mentormailids,
      };
  
      // Prepare the WhatsApp message
      const whatsappMessage = `*Project Details*\n\n` +
        `*Sector:* ${sector}\n` + `*Organization Name:* ${organizationname}\n` +
        `*Project Name:* ${projectname}\n` +
        `*Project Statement:* ${projectstatement}\n` +
        `*Solutions:* ${solutions}\n` +
        `*Expected Component:* ${expectedcomponent}\n` +
        `*Social Impacts:* ${socialimpacts}\n` +
        `*Department Name/Group No:* ${departmentnamegroupno}\n` +
        `*Student Names:* ${studentnames}\n` +
        `*Student Mail IDs:* ${studentmailids}\n` +
        `*Contact Details:* ${contactdetails}\n` +
        `*Mentor Name:* ${mentorname}\n` +
        `*Mentor Mail IDs:* ${mentormailids}`;
  
      // URL encode the message
      const encodedMessage = encodeURIComponent(whatsappMessage);
  
      // Split the contact details string into an array of phone numbers
      const phoneNumbers = contactdetails.split(',').map((number) => number.trim());  // Trim any spaces around the numbers
  
      // Iterate over each phone number and create a WhatsApp URL for each
      phoneNumbers.forEach((phoneNumber) => {
        // Construct the WhatsApp URL for each phone number
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
        // Open WhatsApp with pre-filled message
        window.open(whatsappUrl, '_blank');
      });
  
      // Proceed with sending email and backend actions
      axios
        .post(API.SEND_PROJECT_EMAIL, projectData)
        .then(() => {
          toast.success("Project email sent successfully.");
        })
        .catch((err) => toast.error(err.response.data));
  
      // Check if we are creating or updating the project
      if (!projectid) {
        // Create new project
        axios
          .post(API.POST_PROJECT_DETAILS, projectData)
          .then(() => {
            setState(initialState);
            toast.success("Project Added");
            setTimeout(() => navigate("/projectgroup"), 500);
          })
          .catch((err) => toast.error(err.response.data));
      } else {
        // Update existing project
        axios
          .put(API.UPDATE_SPECIFIC_PROJECT_DETAILS(projectid), projectData)
          .then(() => {
            setState(initialState);
            toast.success("Project Updated");
            setTimeout(() => navigate("/projectgroup"), 500);
          })
          .catch((err) => toast.error(err.response.data));
      }
    }
  };
  
  
  
  return (
    <div className="home-page">
      

      <div className="home-layout">
        
    <div className="add-edit-project-container mt-6">
      <form onSubmit={handleSubmit} className="add-edit-project-form">
        <div className="add-edit-project-grid">
          {/* Sector Dropdown */}
          <div>
  <label htmlFor="sector">Sector:</label>
  <select
    id="sector"
    name="sector"
    value={state.sector}
    onChange={handleInputChange}
    className="add-edit-project-input"
  >
    <option value="">Select Sector</option>
    {sectorComp.map((sector) => (
      <option key={sector.sectorid} value={sector.sector}>
        {sector.sector}
      </option>
    ))}
  </select>
</div>

<div>
  <label htmlFor="organizationname">Organization Name:</label>
  <select
    id="organizationname"
    name="organizationname"
    value={state.organizationname}
    onChange={handleInputChange}
    className="add-edit-project-input"
  >
    <option value="">Select Organization</option>
    {organizationamecomp.map((organizationname) => (
      <option key={organizationname.organizationid} value={organizationname.organizationname}>
        {organizationname.organizationname}
      </option>
    ))}
  </select>
</div>


          {/* Responsibility Group Dropdown */}
          <div>
            <label>Project Name:</label>
            <input
              type="text"
              id="projectname"
              name="projectname"
              value={state.projectname}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>

          <div>
            <label>Project Statement</label>
            <input
              type="text"
              id="projectstatement"
              name="projectstatement"
              value={state.projectstatement}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          <div>
            <label>Solution</label>
            <input
              type="text"
              id="solutions"
              name="solutions"
              value={state.solutions}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          <div>
            <label>Expected AI Components</label>
            <input
              type="text"
              id="expectedcomponent"
              name="expectedcomponent"
              value={state.expectedcomponent}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          <div>
            <label>Social Impacts</label>
            <input
              type="text"
              id="socialimpacts"
              name="socialimpacts"
              value={state.socialimpacts}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          <div>
            <label>Department Name & group no.</label>
            <input
              type="text"
              id="departmentnamegroupno"
              name="departmentnamegroupno"
              value={state.departmentnamegroupno}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          <div>
            <label>Student Names</label>
            <input
              type="text"
              id="studentnames"
              name="studentnames"
              value={state.studentnames}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          
          <div>
            <label>Student mailids</label>
            <input
              type="text"
              id="studentmailids"
              name="studentmailids"
              value={state.studentmailids}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
        
          <div>
            <label>Contact Details</label>
            <input
              type="text"
              id="contactdetails"
              name="contactdetails"
              value={state.contactdetails}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          <div>
            <label>Mentor Names</label>
            <input
              type="text"
              id="mentorname"
              name="mentorname"
              value={state.mentorname}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
          <div>
            <label>Mentor mailids</label>
            <input
              type="text"
              id="mentormailids"
              name="mentormailids"
              value={state.mentormailids}
              onChange={handleInputChange}
              className="add-edit-project-input"
            />
          </div>
        </div>

        <input
            className="btn btn-round btn-signup"
            type="submit"
            value={projectid ? "Update" : "Save"}
          />
          <Link to="/projectdetails">
            <input
              className="btn btn-round btn-signup"
              type="button"
              value="Go back"
            />
          </Link>
      </form>
    </div>
    </div>
    </div>
  );
};

export default Addeditprojectu;
