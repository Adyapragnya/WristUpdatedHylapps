import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';

const ViewUser = () => {
  const [users, setUsers] = useState([]); // State to hold all user data
  const [filteredUsers, setFilteredUsers] = useState([]); // State to hold filtered data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedUserType, setSelectedUserType] = useState(''); // State to hold selected userType

  // Fetch user data when the component mounts
  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios.get(`${baseURL}/api/users/getData`) // Adjust the URL to your API endpoint
      .then((response) => {
        setUsers(response.data); // Set the fetched user data
        setFilteredUsers(response.data); // Initially, set filteredUsers to all users
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        setError('Failed to load users'); // Set error message if something goes wrong
        setLoading(false); // Stop loading if there's an error
      });
  }, []);

  // Handle the change of user type selection in dropdown
  const handleUserTypeChange = (event) => {
    const value = event.target.value;
    setSelectedUserType(value); // Update selected user type

    // Filter users based on the selected user type
    if (value === '') {
      setFilteredUsers(users); // Show all users if no specific type is selected
    } else {
      setFilteredUsers(users.filter(user => user.userType === value)); // Filter by user type
    }
  };

  // Define the columns for organizational users
  const organizationalColumns = [
    { name: 'userType', header: 'Category', defaultFlex: 1 },
    { name: 'selectedOrganization', header: 'Organization', defaultFlex: 1 },
    { name: 'address', header: 'Address', defaultFlex: 1 },
    { name: 'contactEmail', header: 'Contact Email', defaultFlex: 1 }, // Decrypted data
    { name: 'userFirstName', header: 'First Name', defaultFlex: 1 },
    { name: 'userLastName', header: 'Last Name', defaultFlex: 1 },
    { name: 'userEmail', header: 'Email', defaultFlex: 1 }, // Decrypted data
    { name: 'userContactNumber', header: 'Contact Number', defaultFlex: 1 }, // Decrypted data
  ];

  // Define the columns for guest users (without Organization, Address, and Contact Email)
  const guestColumns = [
    { name: 'userType', header: 'Category', defaultFlex: 1 },
    { name: 'userFirstName', header: 'First Name', defaultFlex: 1 },
    { name: 'userLastName', header: 'Last Name', defaultFlex: 1 },
    { name: 'userEmail', header: 'Email', defaultFlex: 1 }, // Decrypted data
    { name: 'userContactNumber', header: 'Contact Number', defaultFlex: 1 }, // Decrypted data
  ];

  // Select columns based on the selected user type
  const columns = selectedUserType === 'guest' ? guestColumns : organizationalColumns;

  return (
    <div className="alert-form-container">
      <h2 className="text-center" style={{ color: "#0F67B1", marginBottom: "15px" }}>View Users</h2>

      {/* Dropdown to filter by userType */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="userType" style={{ marginRight: '10px' }}>Filter by User Type:</label>
        <select
          id="userType"
          value={selectedUserType}
          onChange={handleUserTypeChange}
          style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">All</option>
          <option value="organizational user">Organizational User</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      {/* Display loading message */}
      {loading && <p>Loading users...</p>}

      {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}

      {/* Displaying the user data in a table */}
      {!loading && filteredUsers.length > 0 ? (
        <ReactDataGrid
          idProperty="_id"
          columns={columns} // Dynamically chosen columns based on user type
          dataSource={filteredUsers} // Display filtered users
          style={{ minHeight: 500 }} // Adjust the height of the grid
          pagination
          defaultLimit={10} // Set default rows per page
        />
      ) : (
        !loading && <p>No users found.</p>
      )}
    </div>
  );
};

export default ViewUser;
