import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types'; 
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct import

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [id, setId] = useState(null);
  const [loginEmail, setLoginEmail] = useState(null);
  const [adminId, setAdminId ] = useState(null);
  const navigate = useNavigate();
    
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      setIsAuthenticated(true); // Update the state to true if token exists
      try {
        const decodedToken = jwtDecode(token);
        setRole(decodedToken.role); // Set role from token
        setId(decodedToken.id);
        setLoginEmail(decodedToken.email);
        setAdminId(decodedToken.AdminId);
        console.log("roleeeee",role);
        console.log("emaillllll:",loginEmail);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token"); // Clear invalid token
        setIsAuthenticated(false); // Update state
        setRole(null); // Reset role
        setId(null);
        setLoginEmail(null);
        setAdminId(null);
      }
    } else {
      setIsAuthenticated(false); // Set to false if no token
    }
  }, []);
  
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, role, setRole ,id, setId, loginEmail, setLoginEmail, adminId, setAdminId}}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};