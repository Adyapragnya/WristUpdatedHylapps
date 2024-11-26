import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';

const ViewOrganization = () => {
  const [organizations, setOrganizations] = useState([]); // State to hold organization data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch organization data when the component mounts
  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

      

  
    axios.get(`${baseURL}/api/organizations/getData`) // Adjust the URL to your API endpoint
      .then((response) => {
        setOrganizations(response.data); // Set the fetched organization data
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations'); // Set error message if something goes wrong
        setLoading(false); // Stop loading if there's an error
      });
  }, []);

  // Define the columns for the data grid
  const columns = [
    { name: 'companyName', header: 'Company Name', defaultFlex: 1 },
    { name: 'address', header: 'Address', defaultFlex: 1 },
    { name: 'contactEmail', header: 'Contact Email', defaultFlex: 1 },
    { name: 'assignShips', header: 'Assigned Ships', defaultFlex: 1 },
    { name: 'adminFirstName', header: 'Admin First Name', defaultFlex: 1 },
    { name: 'adminLastName', header: 'Admin Last Name', defaultFlex: 1 },
    { name: 'adminEmail', header: 'Admin Email', defaultFlex: 1 },
    { name: 'adminContactNumber', header: 'Admin Contact', defaultFlex: 1 },
    {
      name: 'files',
      header: 'Files',
      defaultFlex: 1,
      render: ({ value }) => (
        value && value.length > 0 ? (
          <ul>
            {value.map((file, index) => (
              <li key={index}>
                {/* Adjust file URL to include the uploads directory */}
                <a href={`http://localhost:5000/${file}`} target="_blank" rel="noopener noreferrer">
                  {file.split('/').pop()}
                </a>
              </li>
            ))}
          </ul>
        ) : 'No files uploaded'
      ),
    },
  ];

  return (
    <div className="alert-form-container">
      <h2 className="text-center" style={{ color: "#0F67B1", marginBottom: "15px" }}>View Organizations</h2>

      {/* Display loading message */}
      {loading && <p>Loading organizations...</p>}

      {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}

      {/* Displaying the organization data in a table */}
      {!loading && organizations.length > 0 ? (
        <ReactDataGrid
          idProperty="_id"
          columns={columns}
          dataSource={organizations}
          style={{ minHeight: 500 }} // Adjust the height of the grid
          pagination
          defaultLimit={10} // Set default rows per page
        />
      ) : (
        !loading && <p>No organizations found.</p>
      )}
    </div>
  );
};

export default ViewOrganization;
