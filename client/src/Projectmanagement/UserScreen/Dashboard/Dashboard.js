import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import UsersSidebarr from "../../../components/UsersSidebarr";
import * as API from "../../../components/Endpoints/Endpoint";
import NoDataAvailable from "../../../components/NoDataAvailable/NoDataAvailable";
import { Line } from "react-chartjs-2";
import { Bar, Pie} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement,ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [graphData, setGraphData] = useState([]);
  const [incidentData, setIncidentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const email = location.state?.email;
  const user_id = sessionStorage.getItem("user_id");
  const [resolveData, setResolveData] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const [incidentCount, setIncidentCount] = useState(0);
  const [resolveCount, setResolveCount] = useState(0);
  useEffect(() => {
    if (email) {
      loadGraphData(email);
      fetchIncidentGraphData(email);
    }
  }, [email]);

  const loadGraphData = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API.GET_USER_GRAPH_DATA(email), {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setGraphData(response.data);
    } catch (err) {
      console.error("Error fetching graph data:", err);
      setError(
        err.response?.status === 404
          ? "No data found for your email."
          : "An error occurred while fetching data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidentGraphData = async (email) => {
    try {
      const response = await axios.get(API.GET_INCIDENT_GRAPH_DATA(email), {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setIncidentData(response.data);
    } catch (error) {
      console.error("Error fetching incident graph data:", error);
    }
  };
  useEffect(() => {
    if (user_id) {
      const fetchResolveData = async () => {
        try {
          const response = await axios.get(API.GET_RESOLVE_GRAPH_DATA(user_id), {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          });
          setResolveData(response.data);
        } catch (error) {
          console.error("Error fetching resolve data:", error);
        }
      };
      fetchResolveData();
    }
  }, [user_id]);

  // Fetch all counts in a single useEffect
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch total project count
        const projectResponse = await axios.get(API.GET_PROJECT_COUNT(email));

        setProjectCount(projectResponse.data.project_count);

        // If email is available, fetch incident count
        if (email) {
          const incidentResponse = await axios.get(
            API.GET_INCIDENT_COUNT(email)
          );
          setIncidentCount(incidentResponse.data.incident_count);
        }

        // If userId is available, fetch resolve count
       

        if (user_id) {
          const resolveResponse = await axios.get(
            API.GET_RESOLVE_COUNT(user_id)
          );
          setResolveCount(resolveResponse.data.resolve_count);
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, [email, user_id]);
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Data Visualization for User",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const incidentChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Incident Count by Organization",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const chartData = {
    labels: graphData?.map((data) => data.projectname), // Use projectname as the label
    datasets: [
      {
        label: "Project Count",
        data: graphData?.map((data) => parseInt(data.project_count)), // Convert project_count to a number
        borderColor: "#4e73df",
        backgroundColor: "#4e73df",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const incidentChartData = {
    labels: incidentData?.map((data) => data.organizationname),
    datasets: [
      {
        label: "Incident Count",
        data: incidentData?.map((data) => data.incident_count),
        borderColor: "#36a2eb",
        backgroundColor: "#36a2eb",
        fill: false,
        tension: 0.1,
      },
    ],
  };
// Prepare Pie Chart data
const pieChartData = {
  labels: resolveData.map((data) => data.organizationname),
  datasets: [
    {
      data: resolveData.map((data) => parseInt(data.resolve_count, 10)),
      backgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
      hoverBackgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
    },
  ],
};

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Resolved Incidents by Organization",
    },
  },
};

// Styles for the component
const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    margin: "20px auto",
    maxWidth: "80%",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
  },
  card: {
    flex: 1,
    margin: "0 20px",
    padding: "20px",
    textAlign: "center",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "10px",
  },
  count: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  notificationContainer: {
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "250px",
    padding: "20px",
    backgroundColor: "#fffcf8",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    borderRadius: "10px",
    zIndex: 999,
  },
  notificationTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
    alignItems: "center",
  },
  notificationItem: {
    fontSize: "16px",
    marginBottom: "10px",
    color: "#333",
    alignItems:"center",
  },
};


  return (
    <div style={{ marginTop: "30px", position: "relative" }}>
  <Navbar />
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      height: "100vh",
      overflow: "hidden",
    }}
  >
    <UsersSidebarr
      setExpanded={setSidebarExpanded}
      email={email}
      onMenuItemClick={(menuItem) =>
        console.log("Menu Item Clicked:", menuItem)
      }
    />
    <div
      style={{
        flex: 1,
        marginLeft: "220px",
        marginTop: "40px",
        padding: "20px",
        overflowY: "auto",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
          textAlign: "center",
          color: "#333",
        }}
      >
        Dashboard
      </div>

      {loading ? (
        <p>Loading graph data...</p>
      ) : error ? (
        <p style={{ color: "red", fontSize: "16px", textAlign: "center" }}>
          {error}
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "48%",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              backgroundColor: "white",
            }}
          >
            <Line data={chartData} options={chartOptions} />
          </div>
          {/* Incident Bar Graph */}
          <div
            style={{
              width: "45%",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              backgroundColor: "white",
            }}
          >
            <Bar data={incidentChartData} options={incidentChartOptions} />
          </div>

          <div
            style={{
              width: "45%",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              backgroundColor: "white",
            }}
          >
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>

          {/* Stats Overview Container - Adjusted Layout */}
<div
  style={{
    width: "45%", // Adjust to fit alongside the Pie chart
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    backgroundColor: "white",
    marginLeft: "20px", // Adds a gap between Pie chart and the stats container
    display: "flex",
    flexDirection: "column", // Arrange items vertically
    justifyContent: "center", // Vertically center content
    alignItems: "center", // Horizontally center content
  }}
>
  <div style={styles.notificationTitle}>Stats Overview</div>
  <div style={styles.notificationItem}>Total Projects: {projectCount}</div>
  <div style={styles.notificationItem}>Total Incidents: {incidentCount}</div>
  <div style={styles.notificationItem}>Total Resolves: {resolveCount}</div>
</div>

        </div>
      )}
    </div>
  </div>
</div>

  );
};

export default Dashboard;
