// CreateServices.js
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select'; // Importing react-select
import './services.css';

const CreateServices = () => {
  const [organizationNames, setOrganizationNames] = useState([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [assignedShips, setAssignedShips] = useState([]);
  const [usersSubscribed, setUsersSubscribed] = useState([]);
  const [vesselsSubscribedCount, setVesselsSubscribedCount] = useState(0);
  const [geofenceYesNo, setGeofenceYesNo] = useState('');
  const [customGeofenceYesNo, setCustomGeofenceYesNo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchOrganizationNames = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
     
        const response = await fetch(`${baseURL}/api/organizations`);
        if (!response.ok) throw new Error('Failed to fetch organizations');
        
        const data = await response.json();
        const options = data.map(org => ({ value: org, label: org })); // Use companyName
        setOrganizationNames(options);
        console.log(data);
      } catch (error) {
        console.error('Error fetching organization names:', error);
        Swal.fire('Error', 'Unable to fetch organization names. Please try again later.', 'error');
      }
    };

    fetchOrganizationNames(); // Enable fetching from the API
  }, []);

 

 
  const handleOrganizationChange = async (selectedOptions) => {
    const selectedOrg = selectedOptions[0]; // Get the first selected organization
    setSelectedOrganizations(selectedOptions || []);

    if (selectedOrg) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/organizations/getAvailableVessels/${selectedOrg.value}`);
        if (!response.ok) throw new Error('Failed to fetch available vessels');
        console.log(selectedOrg);
        const { assignShips } = await response.json();
        setVesselsSubscribedCount(assignShips); // Update the vessels subscribed count
        console.log(assignShips);
      } catch (error) {
        console.error('Error fetching available vessels:', error);
        Swal.fire('Error', 'Unable to fetch available vessels. Please try again later.', 'error');
      }
    }
  };

  const handleShipChange = (selectedOptions) => {
    setAssignedShips(selectedOptions || []);
  };

  const handleUserChange = (selectedOptions) => {
    setUsersSubscribed(selectedOptions || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrganizations.length || vesselsSubscribedCount < 0) {
      return Swal.fire('Error', 'Please select at least one Organization Name and a valid Vessels Subscribed Count.', 'error');
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const userData = {
        selectedOrganizations: selectedOrganizations.map(option => option.value),
        assignedShips: assignedShips.map(option => option.value),
        usersSubscribed: usersSubscribed.map(option => option.value),
        vesselsSubscribedCount,
        geofenceYesNo,
        customGeofenceYesNo,
        fromDate,
        toDate,
      };

      const encryptedData = encryptUserData(userData);

      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(encryptedData),
        });

        if (response.ok) {
          Swal.fire({
            title: 'Saved!',
            text: 'The user has been saved.',
            icon: 'success',
          });
        } else {
          throw new Error('Failed to save user data.');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to save user data. Please try again.', 'error');
      }
    }
  };

  const encryptUserData = (data) => {
    return data; // Replace this with the actual encrypted data
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, go back!',
    });

    if (result.isConfirmed) {
      setSelectedOrganizations([]);
      setAssignedShips([]);
      setUsersSubscribed([]);
      setVesselsSubscribedCount(0); // Reset count
      setFromDate('');
      setToDate('');

      Swal.fire({
        title: 'Cancelled!',
        text: 'Your action has been cancelled.',
        icon: 'info',
      });
    }
  };

  const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

  return (
    <div className="alert-form-container">
      <form className="alert-form" onSubmit={handleSubmit}>
        <h2 className="text-center" style={{ color: '#0F67B1' }}>Managed Services</h2>
        <span style={{ display: 'block', marginLeft: '5px', fontSize: "17px", color: "#1F316F", textAlign: "right", marginTop: "-30px" }}>
          Available Vessels: {vesselsSubscribedCount} 
        </span> {/* Show available count */}

        <hr />

        <div className="two-column">
        <label className="organization-label">
            Organization Name:
            <Select
              options={organizationNames}
              value={selectedOrganizations}
              onChange={handleOrganizationChange}
              className="basic-multi-select"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  height: '38px',
                  minHeight: '38px',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#0F67B1',
                  color: 'white',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: 'white',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: 'white',
                  ':hover': {
                    backgroundColor: '#e75b5b',
                    color: 'white',
                  },
                }),
              }}
            />
          </label>
          <label>
            Users Subscribed:
            <Select
              isMulti
              options={[
                { value: 'User A', label: 'User A' },
                { value: 'User B', label: 'User B' },
                { value: 'User C', label: 'User C' },
              ]}
              value={usersSubscribed}
              onChange={handleUserChange}
              className="basic-multi-select"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  height: '38px', // Adjust height here
                  minHeight: '38px', // Minimum height
                }),
              }}
            />
          </label>
        </div>

        <div className="two-column">
          <label>
            Add Ships:
            <Select
              isMulti
              options={[
                { value: 'Ship A', label: 'Ship A' },
                { value: 'Ship B', label: 'Ship B' },
                { value: 'Ship C', label: 'Ship C' },
              ]}
              value={assignedShips}
              onChange={handleShipChange}
              className="basic-multi-select"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  height: '38px', // Adjust height here
                  minHeight: '38px', // Minimum height
                }),
              }}
            />
          </label>
          <label>
            Vessels Subscribed Count:
            <input
              type="number"
              value={vesselsSubscribedCount}
              onChange={(e) => {
                const count = Math.min(e.target.value, 100); // Calculate the count with a maximum limit
                if (count > 20) { // Assuming 20 is the limit you want to enforce
                  Swal.fire('Caution', 'You cannot cross the limit of 20 vessels.', 'warning');
                } else {
                  setVesselsSubscribedCount(count); // Update the count if within limits
                }
              }}
              min="0"
              max="100" // Set a maximum limit
              placeholder="Enter count"
              required
            />
          </label>
        </div>

        <div className="two-column">
          <label>
            Enable Geofence & Alerts:
            <select value={geofenceYesNo} onChange={(e) => setGeofenceYesNo(e.target.value)}>
              <option value="">Select Yes/No</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label>
            Enable Custom Geofence & Alerts:
            <select value={customGeofenceYesNo} onChange={(e) => setCustomGeofenceYesNo(e.target.value)}>
              <option value="">Select Yes/No</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>

        <div className="two-column">
          <label>
            From Date:
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              min={currentDate} // Restrict to current date or future dates
              required
            />
          </label>
          <label>
            To Date:
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate} // Ensure To Date is not before From Date
              required
            />
          </label>
        </div>
              <hr></hr>
        <div className="text-center button-group">
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateServices;
