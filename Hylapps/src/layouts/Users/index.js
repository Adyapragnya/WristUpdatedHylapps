
  
  /* eslint-disable no-unused-vars */
/**
=========================================================
* Argon Dashboard 2 MUI - v3.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-material-ui
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import React, { useState,useEffect } from "react";
// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import axios from "axios";
// Argon Dashboard 2 MUI example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DetailedStatisticsCard from "examples/Cards/StatisticsCards/DetailedStatisticsCard";
import SalesTable from "examples/Tables/SalesTable";
import CategoriesList from "examples/Lists/CategoriesList";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import DetailedStatisticsCard1 from "examples/Cards/StatisticsCards/DetailedStatisticsCard1";
// Argon Dashboard 2 MUI base styles
import typography from "assets/theme/base/typography";
import Button from "@mui/material/Button";
// Dashboard layout components
import Slider from "layouts/dashboard/components/Slider";
// import Select from 'react-select';
import MyMapComponent from "./MyMapComponent";
import CreateUsers from './CreateUsers'; // If the file is named in lowercase
import ViewUser from './ViewUser';
import Loader from "./Loader";


// Data
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";
import salesTableData from "layouts/dashboard/data/salesTableData";
import categoriesListData from "layouts/dashboard/data/categoriesListData";
import AlertEvents from "./AlertTimeline";
import Tables from "layouts/tables";
// import { Search } from "@mui/icons-material";

import moment from 'moment';
// import DetailedStaticsCard from "./DetailedStatisticsCard";


// import ReactSearchBox from "react-search-box";
function Alerts() {


  const handleDateChange = (date) => {
    setSelectedDateTime(date);
  };


  const { size } = typography;
  const [showViewAlert, setShowViewAlert] = useState(false); // Track which component to show
  const [selectedOptions, setSelectedOptions] = useState();
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] =useState(true);

  // Function triggered on selection
  function handleSelect(data) {
    setSelectedOptions(data);
  }

  useEffect(() => {
    // Fetch vessel data from the backend API
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios.get(`${baseURL}/api/get-vessels`)
      .then((response) => {
        // Log the response data to the console
        console.log(response.data);
        setVessels(response.data); // Set the fetched data to state
        setLoading(false);

        
      })
      .catch((err) => {
        console.error('Error fetching vessel data:', err);
        setError(err.message); // Set error message
        setLoading(false);

      });
  }, []);

    if(loading) {
      return <Loader />;
    }

  return (
    <DashboardLayout>
    <DashboardNavbar />
    <ArgonBox py={0}>
      <Grid container spacing={3} mt={0}>
        <Grid item xs={12} md={6} lg={12} mr={3} container justifyContent="flex-end">
          {/* Toggle between AlertForm and ViewAlert */}
          <Button
            variant="contained"
            color="warning"
            onClick={() => setShowViewAlert(!showViewAlert)} // Toggle component visibility
            sx={{
              color: (theme) => theme.palette.warning.main,
              display: "flex",
              alignItems: "center"
            }}
          >
            <ArgonBox
              component="i"
              color="warning"
              fontSize="14px"
              className={showViewAlert ? "ni ni-single-copy-04" : "ni ni-fat-add"} // Conditionally change the icon
              sx={{ mr: 1 }}
            />
            {showViewAlert ? "View Users" : "Create User"}
          </Button>
        </Grid>
      </Grid>

      <Grid container mt={3}>
        <Grid item xs={12} md={0} lg={12} mt={3} mx={3}>
          {/* Render either AlertForm or ViewAlert based on state */}
          {showViewAlert ? <CreateUsers /> :<ViewUser />}
        </Grid>
      </Grid>
    </ArgonBox>
    <Footer />
  </DashboardLayout>
  );
}

export default Alerts;


