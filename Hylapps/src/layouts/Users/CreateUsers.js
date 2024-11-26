import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './User.css';
import CryptoJS from 'crypto-js';


const CreateUsers = () => {
  const [organizationNames, setOrganizationNames] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [address, setAddress] = useState('');
  const [orgId, setOrgId] = useState('');
  
  const [contactEmail, setContactEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userContactNumber, setUserContactNumber] = useState('');

  useEffect(() => {
    const fetchOrganizationNames = async () => {
      try { 
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await fetch(`${baseURL}/api/organizations`);
        const data = await response.json();
        setOrganizationNames(data);
      } catch (error) {
        console.error('Error fetching organization names:', error);
      }
    };

    fetchOrganizationNames();
  }, []);

  const handleOrganizationChange = async (e) => {
    const organizationName = e.target.value;
    setSelectedOrganization(organizationName);

    if (organizationName) {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await fetch(`${baseURL}/api/organizations/${organizationName}`);
        const organizationData = await response.json();
        setOrgId(organizationData.orgId);
        setAddress(organizationData.address);
        setContactEmail(organizationData.contactEmail);
      } catch (error) {
        console.error('Error fetching organization data:', error);
        Swal.fire('Error', 'Failed to load organization details.', 'error');
      }
    } else {
      setOrgId('');
      setAddress('');
      setContactEmail('');
    }
  };

  const encryptData = (data) => {
    const secretKey = process.env.REACT_APP_SECRET_KEY; // Use a secret key from your environment variables
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validations = [
      { condition: !userType, message: 'Please select a User Category.' },
      { condition: userType === 'organizational user' && !selectedOrganization, message: 'Please select an Organization Name.' },
      { condition: !userFirstName, message: 'Please enter the User First Name.' },
      { condition: !userLastName, message: 'Please enter the User Last Name.' },
      { condition: !userEmail || !validateEmail(userEmail), message: 'Please enter a valid User Email.' },
      { condition: !userContactNumber || !validatePhoneNumber(userContactNumber), message: 'Please enter a valid User Contact Number.' },
    ];

    for (const { condition, message } of validations) {
      if (condition) {
        return Swal.fire('Error', message, 'error');
      }
    }

    const result = await Swal.fire({
      title: 'Confirm User Creation',
      text: 'Do you want to save this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!',
    });

    if (result.isConfirmed) {
      const userData = {
        orgId: userType === 'organizational user' ? orgId : null,
        selectedOrganization: userType === 'organizational user' ? selectedOrganization : null,
        address: userType === 'organizational user' ? address : null,
        contactEmail: userType === 'organizational user' ? encryptData(contactEmail) : null, // Encrypting the contactEmail
        userFirstName,
        userLastName,
        userEmail: encryptData(userEmail), // Encrypting the userEmail
        userContactNumber: encryptData(userContactNumber), // Encrypting the userContactNumber
        userType,
      };

      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;

        const response = await fetch(`${baseURL}/api/users/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          Swal.fire('Saved!', 'The user has been saved.', 'success');
          resetForm();
        } else {
          throw new Error('Failed to save user data.');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to save user data. Please try again.', 'error');
      }
    }
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
      resetForm();
      Swal.fire('Cancelled!', 'Your action has been cancelled.', 'info');
    }
  };

  const resetForm = () => {
    setSelectedOrganization('');
    setOrgId('');
    setAddress('');
    setContactEmail('');
    setUserFirstName('');
    setUserLastName('');
    setUserEmail('');
    setUserContactNumber('');
    setUserType('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhoneNumber = (phone) => {
    const indiaPattern = /^[6-9]\d{9}$/;
    const usaPattern = /^(\+1-?)?\d{10}$/;
    return indiaPattern.test(phone) || usaPattern.test(phone);
  };

  return (
    <div className="alert-form-container">
      <form className="alert-form" onSubmit={handleSubmit}>
        <h2 className="text-center" style={{ color: '#0F67B1' }}>Create Users</h2>
        <hr />

        <div className="category-container">
          <label htmlFor="userType">
            Category:
            <select id="userType" value={userType} onChange={(e) => setUserType(e.target.value)} className="category-dropdown">
              <option value="">Select Category</option>
              <option value="organizational user">Organizational User</option>
              <option value="guest">Guest</option>
            </select>
          </label>

          {userType === 'organizational user' && (
            <label className="organization-label" htmlFor="selectedOrganization">
              Organization Name:
              <select id="selectedOrganization" value={selectedOrganization} onChange={handleOrganizationChange}>
                <option value="">Select Organization</option>
                {organizationNames.map((organization) => (
                  <option key={organization} value={organization}>
                    {organization}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {userType === 'organizational user' && (
          <div className="two-column">
            <label htmlFor="address">
              Address:
              <input
                id="address"
                type="text"
                value={address}
                disabled
                placeholder="Address will be auto-filled"
                aria-label="Address"
              />
            </label>

            <label htmlFor="contactEmail">
              Contact Email:
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                disabled
                placeholder="Email will be auto-filled"
                aria-label="Contact Email"
              />
            </label>
          </div>
        )}

        <hr />
        <h4 style={{ color: "#0F67B1" }}>User Details</h4>
        <div className="two-column">
          <label htmlFor="userFirstName">
            First Name:
            <input
              id="userFirstName"
              type="text"
              value={userFirstName}
              onChange={(e) => setUserFirstName(e.target.value)}
              required
              aria-label="User First Name"
            />
          </label>

          <label htmlFor="userLastName">
            Last Name:
            <input
              id="userLastName"
              type="text"
              value={userLastName}
              onChange={(e) => setUserLastName(e.target.value)}
              required
              aria-label="User Last Name"
            />
          </label>
        </div>

        <div className="two-column">
          <label htmlFor="userEmail">
            Email:
            <input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              aria-label="User Email"
            />
          </label>

          <label htmlFor="userContactNumber">
            Contact Number:
            <input
              id="userContactNumber"
              type="text"
              value={userContactNumber}
              onChange={(e) => setUserContactNumber(e.target.value)}
              required
              aria-label="User Contact Number"
            />
          </label>
        </div>

        <div className="button-group">
          <button type="submit" className="submit-button">Create User</button>
          <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateUsers;
