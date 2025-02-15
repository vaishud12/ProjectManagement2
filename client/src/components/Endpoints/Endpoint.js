const BASE_URL = "http://localhost:5010/project-api/";
// const BASE_URL = "https://projectmgmt1.passionit.com/project-api/project-api/";
const BASE_IMAGE_URL = "http://localhost:5010/project-api/uploads";
// const BASE_IMAGE_URL = "https://projectmgmt1.passionit.com/project-api/project-api/uploads";
export const LOGIN = `${BASE_URL}login`;
export const SIGNUP = `${BASE_URL}signup`;

//****************sectormaster */************************ */
export const GET_SECTOR_MASTER = `${BASE_URL}sectormaster`;

export const DELETE_SECTOR_MASTER = (sectorid) =>
    `${BASE_URL}sectormasterdelete/${sectorid}`;

export const POST_SECTOR_MASTER = `${BASE_URL}sectormasterpost`;

export const GET_SPECIFIC_SECTOR_MASTER = (sectorid) =>
  `${BASE_URL}sectormasterget/${sectorid}`;

export const UPDATE_SPECIFIC_SECTOR_MASTER = (sectorid) =>
  `${BASE_URL}sectormasterupdate/${sectorid}`;

//************************* */
export const GET_PROJECT_DETAILS = `${BASE_URL}projectgroup`;
export const GET_SECTORS = `${BASE_URL}getsector`;
export const POST_SECTOR_UPLOAD_EXCEL = `${BASE_URL}sectoruploadExcel`;
export const GET_APPLICATION_TYPES = `${BASE_URL}getapplicationtype`;
export const GET_INCIDENT_CATEGORIES = `${BASE_URL}getincidentcategory`;
export const GET_INCIDENT_NAME = `${BASE_URL}getincidentname`;
export const GET_INCIDENT_DESCRIPTION = `${BASE_URL}getincidentdescription`;

export const POST_CREATE_INCIDENT = `${BASE_URL}generate-incident`;

export const GET_ORGANIZATION_NAME = `${BASE_URL}getorganization`;

export const GET_PROJECT_NAME = `${BASE_URL}getprojectname`;
export const GET_USER_PROJECTS = (email) => `${BASE_URL}user-projects/${email}`;
export const GET_USER_INCIDENTS = (email) => `${BASE_URL}user-incidents/${email}`;
export const GET_USER_RESOLUTION = (user_id) =>
  `${BASE_URL}user-resolve/${user_id}`;
export const DELETE_PROJECT_DETAILS = (projectid) =>
    `${BASE_URL}projectgroupdelete/${projectid}`;

export const POST_PROJECT_DETAILS = `${BASE_URL}projectgrouppost`;
export const POST_UPLOAD_EXCEL = `${BASE_URL}uploadExcel`;

export const SEND_PROJECT_EMAIL = 
`${BASE_URL}send-project-email`;

export const SEND_WHATSAPP = 
`${BASE_URL}send-whatsapp`;

export const GET_SPECIFIC_PROJECT_DETAILS = (projectid) =>
  `${BASE_URL}projectgroupget/${projectid}`;

export const UPDATE_SPECIFIC_PROJECT_DETAILS = (projectid) =>
  `${BASE_URL}projectgroupupdate/${projectid}`;

//****************organizationmaster */************************ */
export const GET_ORGANIZATION_MASTER = `${BASE_URL}organizationmaster`;

export const DELETE_ORGANIZATION_MASTER = (organizationid) => 
  `${BASE_URL}organizationdelete/${organizationid}`;


export const POST_ORGANIZATION = `${BASE_URL}organizationmasterpost`;

export const GET_SPECIFIC_ORGANIZATION_MASTER = (organizationid) =>
  `${BASE_URL}organizationmasterget/${organizationid}`;

export const UPDATE_SPECIFIC_ORGANIZATION_MASTER = (organizationid) =>
  `${BASE_URL}organizationmasterupdate/${organizationid}`;

export const POST_ORGANIZATION_UPLOAD_EXCEL = `${BASE_URL}organizationuploadExcel`;

//************************************Incident************************* */
export const POST_INCIDENT = `${BASE_URL}incidentpost`;

export const GET_INCIDENT= `${BASE_URL}incident`;

export const GET_DOWNLOAD_FILES= `${BASE_URL}download-files`;

  export const UPDATE_SPECIFIC_INCIDENT = (incidentid) =>
    `${BASE_URL}incidentupdate/${incidentid}`;

  export const SEND_INCIDENT_EMAIL = 
  `${BASE_URL}send-incident-email`;

  export const GET_SPECIFIC_INCIDENT = (incidentid) =>
    `${BASE_URL}incidentget/${incidentid}`;
  
  export const SET_PRIORITY_TIMES = 
  `${BASE_URL}set-priority-times`;

  export const DELETE_INCIDENT = (incidentid) =>
    `${BASE_URL}incidentdelete/${incidentid}`;
 export const GET_PRIORITY_TIME = 
  `${BASE_URL}get-priority-times`;

  export const GET_IMAGE_URL = (filename) => `${BASE_IMAGE_URL}/${filename}`;
  export const GET_FILE_URL = (filename) => `${BASE_IMAGE_URL}/${filename}`;

  export const POST_INCIDENT_UPLOAD_EXCEL = `${BASE_URL}incidentuploadExcel`;
  

/********************************Resolve**************************** */
export const POST_RESOLVE = `${BASE_URL}resolve`;
export const SEND_RESOLVE_EMAIL = 
  `${BASE_URL}send-resolve-email`;

/********************************SCORE CARD************************************************ */

export const RESET_PASSWORD_API = `${BASE_URL}reset-password`;
export const VALIDATE_TOKEN_API = `${BASE_URL}validate-reset-token`;
export const UPDATE_PASSWORD_API = `${BASE_URL}password`;
export const VERIFY_OTP_API = `${BASE_URL}verify-otp`;

export const GET_USER_GRAPH_DATA = (email) => 
  `${BASE_URL}graphprojects?email=${email}`;

export const GET_INCIDENT_GRAPH_DATA = (email) => 
  `${BASE_URL}incidentsbyorganization?email=${email}`;

export const GET_RESOLVE_GRAPH_DATA = (user_id) => 
  `${BASE_URL}resolvebyorganization?user_id=${user_id}`;

export const GET_PROJECT_COUNT = (email) => 
  `${BASE_URL}project-count?email=${email}`;

export const GET_INCIDENT_COUNT = (email) => 
  `${BASE_URL}incident-count?email=${email}`;

export const GET_RESOLVE_COUNT = (user_id) => 
  `${BASE_URL}resolve-count?user_id=${user_id}`;

export const POST_FILE_UPLOAD = `${BASE_URL}gitupload`;



