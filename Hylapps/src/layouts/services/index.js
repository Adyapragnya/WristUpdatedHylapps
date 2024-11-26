
  
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

// Dashboard layout components
import Slider from "layouts/dashboard/components/Slider";
// import Select from 'react-select';
import MyMapComponent from "./MyMapComponent";




// Data
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";
import salesTableData from "layouts/dashboard/data/salesTableData";
import categoriesListData from "layouts/dashboard/data/categoriesListData";
import  AlertEvents from "./AlertTimeline";
import Tables from "layouts/tables";
// import { Search } from "@mui/icons-material";

import moment from 'moment';
// import DetailedStaticsCard from "./DetailedStatisticsCard";
import CreateServices from "./CreateServices";

// import ReactSearchBox from "react-search-box";
function Services() {


  const handleDateChange = (date) => {
    setSelectedDateTime(date);
  };


  const { size } = typography;
  
  const [selectedOptions, setSelectedOptions] = useState();
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);

  // Function triggered on selection
  function handleSelect(data) {
    setSelectedOptions(data);
  }

  useEffect(() => {
    // Fetch vessel data from the backend API
    axios.get('http://localhost:5000/api/get-vessels')
      .then((response) => {
        // Log the response data to the console
        console.log(response.data);
        setVessels(response.data); // Set the fetched data to state
        
      })
      .catch((err) => {
        console.error('Error fetching vessel data:', err);
        setError(err.message); // Set error message
      });
  }, []);


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={0}>

     <Grid container spacing={3} mt={3}>
          <Grid item xs={12} md={6} lg={12}>
            <DetailedStatisticsCard1
              title="today's money"
              count="$53,000"
              icon={{ color: "info", component: <i className="ni ni-money-coins" /> }}
              percentage={{ color: "success", count: "+55%", text: "since yesterday" }}
            />
          </Grid>
          </Grid>


        <Grid container  mt={3} >
         

            
            <Grid item xs={12} md={0} lg={12}  mt={3}>
       
            <CreateServices />
            
  
       </Grid>

           
            </Grid>

      </ArgonBox>
      

        {/*  */}

       
      <Footer />
    </DashboardLayout>
  );
}

export default Services;
