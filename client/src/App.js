// App.js
import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Projectmanagement/Home'; // This is already wrapped
import Login from './Projectmanagement/Login/Login'
import Signup from './Projectmanagement/Login/Signup'
import VerifyOTP from "./Projectmanagement/Login/VerifyOTP"
import HomePage from "./Projectmanagement/Homepage/HomePage"
import './App.css';
import SectorMaster from './Projectmanagement/SectorMaster/SectorMaster';
import Addeditseectormaster from './Projectmanagement/SectorMaster/Addeditseectormaster';
import Projectgroup from './Projectmanagement/ProjectGroup/Projectgroup';
import Addeditprojectgroup from './Projectmanagement/ProjectGroup/Addeditprojectgroup';
import OrganizationMaster from './Projectmanagement/OrganizationMaster/OrganizationMaster';
import AddeditOrganization from './Projectmanagement/OrganizationMaster/AddeditOrganization';
import Incident from './Projectmanagement/Incident/Incident';
import AddeditIncident from './Projectmanagement/Incident/AddeditIncident';
import Incidentd from './Projectmanagement/ProjectGroup/Incidentd';
import ProjectGroupu from './Projectmanagement/UserScreen/ProjectGroup/ProjectGroupu';
import Projectmanagement from './Projectmanagement/Projectmanagemnthome/Projectmanagement';
import Incidentdetails from './Projectmanagement/UserScreen/Incident/Incidentdetails';
import Dashboard from './Projectmanagement/UserScreen/Dashboard/Dashboard';
import Resolution from './Projectmanagement/UserScreen/Resolve/Resolution';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/verifyotp' element={<VerifyOTP/>} />
        <Route path='/home' element={<HomePage/>} />
        <Route path='/sectormaster' element={<SectorMaster/>} />
        <Route path='/sectormaster/add' element={<Addeditseectormaster/>} />
        <Route path="/sectormaster/add/:sectorid" element={<Addeditseectormaster />}/> 

        <Route path='/projectgroup' element={<Projectgroup/>} />
        <Route path='/projectdetails/add' element={<Addeditprojectgroup/>} />
        <Route path='/projectdetails/add/:projectid' element={<Addeditprojectgroup/>} 
        />
        <Route path='/organizationmaster' element={<OrganizationMaster/>} />
        <Route path='/organizationmaster/add' element={<AddeditOrganization/>} />
        <Route path='/organizationmaster/add/:organizationid' element={<AddeditOrganization/>} />

        <Route path='/incident' element={<Incident/>} />
        <Route path='/incident/add' element={<AddeditIncident/>} />
        <Route path='/incident/add/:incidentid' element={<AddeditIncident/>} />
        <Route path='/incident/:projectid' element={<Incidentd/>} />
 
        <Route path='/projectmanagement' element={<Projectmanagement/>} />
        <Route path='/projectdetails' element={<ProjectGroupu/>} />
        <Route path="/addprojectgroupd" element={<Addeditprojectgroup />} />
        <Route path='/incidentdetails' element={<Incidentdetails/>} />
        <Route path='/resolve' element={<Resolution/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        
      </Routes>
    </Router>
  );
};

export default App;
