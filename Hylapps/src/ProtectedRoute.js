import React, { useContext } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext"; // Adjust the path as needed

const getFallbackRoute = (role) => {
    // Return default routes based on role
    if (role === "hyla admin") {
        return "/dashboard"; // Example fallback for admin
    } else if (role === "organization admin") {
        return "/HYLA"; // Example fallback for organization admin
    }
    // Add more role checks as needed
    return "/authentication/sign-in"; // Default fallback
};

const ProtectedRoute = ({ element }) => {
    const { role, isAuthenticated } = useContext(AuthContext);

    const authorizedRoutes = [
        "sign-in",
        "reset-password",
        "HYLA",
        "dashboard",
    ];

    const isAuthorized = authorizedRoutes.includes(element.props.path) || role;

    return (
        isAuthenticated && isAuthorized ? (
            element
        ) : (
            <Navigate to={getFallbackRoute(role)} />
        )
    );
};

// Add PropTypes validation
ProtectedRoute.propTypes = {
    element: PropTypes.element.isRequired, // Validate that element is a React element
};

export default ProtectedRoute;
