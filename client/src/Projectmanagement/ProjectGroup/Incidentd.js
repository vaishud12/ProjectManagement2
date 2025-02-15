import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import  generateIncidentData  from '../../components/QuantileAPI'; // Correct import

const Incidentd = () => {
  const location = useLocation();
  const { project } = location.state || {}; // Ensure project is passed through state
  const [incidentData, setIncidentData] = useState(null);

  useEffect(() => {
    if (project) {
      const fetchIncidentData = async () => {
        try {
          const data = await generateIncidentData(project); // Using generateIncidentData
          setIncidentData(data);
        } catch (error) {
          console.error("Error generating incident data:", error);
        }
      };

      fetchIncidentData();
    }
  }, [project]);

  return (
    <div>
      <h1>Incident Details</h1>
      {incidentData ? (
        <div>
          <p>Tag: {incidentData.tag}</p>
          <p>PBI Number: {incidentData.pbiNumber}</p>
          <p>Incident Name: {incidentData.incidentName}</p>
          <p>Incident Description: {incidentData.incidentDescription}</p>
          <p>Category: {incidentData.incidentCategory}</p>
          <p>Priority: {incidentData.priority}</p>
        </div>
      ) : (
        <p>Loading incident data...</p>
      )}
    </div>
  );
};

export default Incidentd;
