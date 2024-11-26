import { useNavigate } from "react-router-dom"; // Import useNavigate
import Grid from "@mui/material/Grid";
import React, { useState, useEffect, useContext } from "react";
import ArgonBox from "components/ArgonBox";
import Button from "@mui/material/Button";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import axios from "axios";
import AlertForm from "./AlertForm";
import Loader from "./Loader";
import ViewAlert from "./ViewAlert"; // Import the ViewAlert component
import { AuthContext } from "../../AuthContext";

function Alerts() {
  const navigate = useNavigate(); // Initialize navigate function
  const [showViewAlert, setShowViewAlert] = useState(false); // Track which component to show
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { role, id } = useContext(AuthContext);

  useEffect(() => {
    
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    axios.get(`${baseURL}/api/get-tracked-vessels`)
      .then((response) => {
        const formattedData = response.data.map((vessel) => ({
          name: vessel.AIS.NAME || "",
          lat: Number(vessel.AIS.LATITUDE) || 0,
          lng: Number(vessel.AIS.LONGITUDE) || 0,
          heading: vessel.AIS.HEADING || 0,
          destination: vessel.AIS.DESTINATION || "",
          speed: vessel.AIS.SPEED || 0,
        }));
        setVessels(formattedData);
        setLoading(false);

      })
      .catch((err) => {
        console.error("Error fetching vessel data:", err);
        setLoading(false);

      });
     
  }, []);

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
                className={showViewAlert ? "ni ni-single-copy-04" :  "ni ni-fat-add"} // Conditionally change the icon
                sx={{ mr: 1 }}
              />
              {showViewAlert ? "View Saved Alerts" :  "Create Alert"}
            </Button>
          </Grid>
        </Grid>

        <Grid container mt={3}>
          <Grid item xs={12} md={0} lg={12} mt={3} mx={3}>
            {loading ? <Loader/> :(
            //* Render either AlertForm or ViewAlert based on state */
            showViewAlert ? <AlertForm  vessels={vessels}/> :  <ViewAlert />
          )}
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Alerts;
