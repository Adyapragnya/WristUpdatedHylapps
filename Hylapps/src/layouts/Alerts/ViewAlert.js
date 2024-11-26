import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import './ViewAlert.css'; // Ensure your CSS file has appropriate styles

const ViewAlert = () => {
  const [alerts, setAlerts] = useState([]); // State to hold the alerts
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);

  // Fetch alerts when the component mounts
  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios.get(`${baseURL}/api/alert/`) // Adjust the URL to your API endpoint
      .then((response) => {
        setAlerts(response.data); // Set the alerts data in state
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts'); // Set error message if something goes wrong
        setLoading(false); // Stop loading if there's an error
      });
  }, []);

  // Define the columns for the data grid
  const columns = [
    {
      name: 'fromDate',
      header: 'From Date',
      defaultFlex: 1,
      render: ({ value }) => (value ? new Date(value).toLocaleDateString() : 'N/A'), // Display 'null' if value is null
    },
    {
      name: 'toDate',
      header: 'To Date',
      defaultFlex: 1,
      render: ({ value }) => (value ? new Date(value).toLocaleDateString() : 'N/A'), // Display 'null' if value is null
    },
    { name: 'message', header: 'Message', defaultFlex: 1 },
    { name: 'shipParameter', header: 'Ship Parameter', defaultFlex: 1 },
    { name: 'operator', header: 'Operator', defaultFlex: 1 },
    { name: 'parameterValue', header: 'Parameter Value', defaultFlex: 1 },
    {
      name: 'whatsapp',
      header: 'WhatsApp',
      defaultFlex: 1,
      render: ({ value }) => (value ? 'Yes' : 'No'),
    },
    {
      name: 'email',
      header: 'Email',
      defaultFlex: 1,
      render: ({ value }) => (value ? 'Yes' : 'No'),
    },
  ];

  return (
    <div className="alert-form-container">
      <h2 className="text-center" style={{ color: "#0F67B1", marginBottom: "15px" }}>View Alerts</h2>

      {/* Display loading message */}
      {loading && <p>Loading alerts...</p>}

      {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}

      {/* Displaying the alerts */}
      {!loading && alerts.length > 0 ? (
        <ReactDataGrid
          idProperty="_id"
          columns={columns}
          dataSource={alerts}
          style={{ minHeight: 500 }} // Adjust the height of the grid
          pagination
          defaultLimit={10} // Set default rows per page
        />
      ) : (
        !loading && <p>No alerts found.</p>
      )}
    </div>
  );
};

export default ViewAlert;
