import React, { useContext } from "react";
import { useMemo } from 'react';
import ArgonBox from "components/ArgonBox";
import { AuthContext } from "./AuthContext"; // Import AuthContext to get the role
import Dashboard from "layouts/dashboard";
import Dashboardcopy from "layouts/dashboardcopy";
import Geofence from "layouts/geofence";
import Alerts from "layouts/Alerts";
import Organization from "layouts/Organization";
import CreateUsers from "layouts/Users";
import Services from "layouts/services";
import ResetPassword from "layouts/authentication/ResetPassword";
import SignIn from "layouts/authentication/sign-in";
import Operations from "layouts/WristOpsDashboard"
import VesselTracker from "layouts/ShipRADAR"
import SalesRadar from "layouts/SalesRadar"
import { Route } from "react-router-dom";

// Define all routes
const allRoutes = [
  {
    type: "route",
    name: "WRIST Sales RADAR",
    key: "SalesRadar",
    route: "/SalesRadar",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-sliders" />,
    element: <SalesRadar />,
  },

  // {
  //   type: "route",
  //   name: "WRIST Ops Dashboard",
  //   key: "WristOpsDashboard",
  //   route: "/WristOpsDashboard",
  //   icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-sliders" />,
  //   element: <Operations />,
  // },
  {
    type: "route",
    name: "WRIST Ops RADAR",
    key: "OpsRADAR",
    route: "/OpsRADAR",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-satellite-dish" />,
    element: <VesselTracker />,
  },
  {
    type: "route",
    name: "WRIST Dashboard",
    key: "HYLA",
    route: "/HYLA",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-house-laptop" />,
    element: <Dashboardcopy />, // Changed from component to element
  },
  {
    type: "route",
    name: "Ship Dashboard",
    key: "dashboard",
    route: "/dashboard/:vesselId",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa fa-ship" />,
    element: <Dashboard />, // Changed from component to element
  },
  {
    type: "route",
    name: "Geofence",
    key: "Geofence",
    route: "/Geofence",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-compass-drafting" />,
    element: <Geofence />, // Changed from component to element
  },
  {
    type: "route",
    name: "Alerts & Notifications",
    key: "alerts",
    route: "/alerts",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="fa-solid fa-envelope-open-text" />,
    element: <Alerts />, // Changed from component to element
  },
  {
    type: "route",
    name: "Create Organization",
    key: "create-organization",
    route: "/create-organization",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-sitemap" />,
    element: <Organization />, // Changed from component to element
  },
  {
    type: "route",
    name: "Create Users",
    key: "create-users",
    route: "/create-users",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa fa-users" />,
    element: <CreateUsers />, // Changed from component to element
  },
  // {
  //   type: "route",
  //   name: "Reports",
  //   key: "Reports",
  //   route: "/HYLA",
  //   icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa-solid fa-chart-simple" />,
  //   element: <Dashboardcopy />, // Changed from component to element
  // },
  // {
  //   type: "route",
  //   name: "Managed Services",
  //   key: "Managed Service",
  //   route: "/managed-services",
  //   icon: <ArgonBox component="i" color="success" fontSize="14px" className="fa fa-database" />,
  //   element: <Services />,
  // },

 
  {
    type: "route",
    name: "Reset Password",
    key: "reset-password",
    route: "/authentication/reset-password",
    icon: <ArgonBox component="i" color="info" fontSize="14px" className="fa-solid fa-key" />,
    element: <ResetPassword />, // Changed from component to element
  },
  {
    type: "route",
    name: "Logout",
    key: "sign-in",
    route: "/",
    icon: <ArgonBox component="i" color="warning" fontSize="14px" className="fa-solid fa-right-from-bracket" />,
    element: <SignIn />, // Changed from component to element
  },
];

// Function to filter routes based on role
const getFilteredRoutes = (role) => {
  if (role === "hyla admin") {
    // Return all routes for HYLA Admin
    return allRoutes;
  } else if (role === "organization admin") {
    // Return only specific routes for Organization Admin
    return allRoutes.filter((route) => ["sign-in" ,"reset-password" , "HYLA", "dashboard", "geofence" , "alerts", "create-users", "WristOpsDashboard", "OpsRADAR","SalesRadar"].includes(route.key));
  } else if (role === "organizational user") {
    // Return only specific routes for Organization User
    return allRoutes.filter((route) => ["sign-in" ,"reset-password" , "dashboard","WristOpsDashboard", "OpsRADAR","SalesRadar"].includes(route.key));
  } 
  else if (role === "guest") {
    // Return empty array or a default route for guest users
    return allRoutes.filter((route) => ["sign-in" ,"reset-password" , "HYLA", "dashboard"].includes(route.key));
  } 
  
  else  {
    // Return empty array or a default route for guest users
    return [];
  }
 
};

// Routes component where routes are filtered based on role
const routes = () => {
  const { role } = useContext(AuthContext); // Get the role from AuthContext

 // Get filtered routes based on role using useMemo for performance
 const filteredRoutes = useMemo(() => getFilteredRoutes(role), [role]);

  // Return the filtered routes array
  return filteredRoutes;
};  


export default routes;
