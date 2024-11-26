import React, { useState, useEffect, useContext } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Tabs, Tab } from "@mui/material";
import axios from "axios";
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MyMapComponent from "./MyMapComponent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Vesseleighthours from "./Vesseleighthours";
import Vesseltwentyfourhours from "./Vesseltwentyfourhours";
import VesselSixhours from "./VesselSixhours";
import ShipsinPort from "./shipsinport";
import Loader from "./Loader";
import { AuthContext } from "../../AuthContext";

function Geofence() {
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [vesselEntries, setVesselEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [tabAnimation, setTabAnimation] = useState({ opacity: 1 });

  const handleTabChange = (event, newValue) => {
    // Start fading out
    setTabAnimation({ opacity: 0, transition: "opacity 0.4s ease-in-out" });
    setTimeout(() => {
      // Switch tabs after fade-out
      setSelectedTab(newValue);
      setTabAnimation({ opacity: 1, transition: "opacity 0.4s ease-in-out" }); // Fade in
    }, 400); // Match the fade-out duration
  };

  const handleRowClick = (vessel) => {
    const selected = vessels.find((v) => v.name === vessel.name);
    if (selected) {
      setSelectedVessel(selected);
    }
  };

  const calculateMapCenter = () => {
    if (vessels.length === 0) return [0, 0];
    const latSum = vessels.reduce((sum, vessel) => sum + vessel.lat, 0);
    const lngSum = vessels.reduce((sum, vessel) => sum + vessel.lng, 0);
    return [latSum / vessels.length, lngSum / vessels.length];
  };

  const center = selectedVessel
    ? [selectedVessel.lat, selectedVessel.lng]
    : calculateMapCenter();
  const zoom = selectedVessel ? 10 : 6;

  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios
      .get(`${baseURL}/api/get-tracked-vessels`)
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

  if (loading) {
    return <Loader />;
  }

  return (
    <DashboardLayout>
    <br></br>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <DashboardNavbar vesselEntries={vesselEntries} />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <MyMapComponent
                  zoom={zoom}
                  center={center}
                  vessels={vessels}
                  selectedVessel={selectedVessel}
                  setVesselEntries={setVesselEntries}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <br />
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          centered
          sx={{
            background: "#D4F6FF",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Tab label="In Port" />
          <Tab label="Within 6 Hours" />
          <Tab label="Within 24 Hours" />
          <Tab label="Beyond 24 Hours" />
        </Tabs>

        <div style={tabAnimation}>
          <Grid container spacing={3} mt={1}>
            {selectedTab === 0 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                  <h3 style={{ color: "#0F67B1", marginBottom: "5px" }}>
                    Ships In Port
                  </h3>
                  <ShipsinPort
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )}
            {selectedTab === 1 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                  <h3 style={{ color: "#0F67B1", marginBottom: "5px" }}>
                    Ships Within 6 Hours
                  </h3>
                  <VesselSixhours
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )}
            {selectedTab === 2 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                  <h3 style={{ color: "#0F67B1", marginBottom: "5px" }}>
                    Ships Within 24 Hours
                  </h3>
                  <Vesseltwentyfourhours
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )}
            {selectedTab === 3 && (
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    backgroundColor: "#ffffff",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                  <h3 style={{ color: "#0F67B1", marginBottom: "5px" }}>
                    Ships Beyond 24 Hours
                  </h3>
                  <Vesseleighthours
                    vesselEntries={vesselEntries}
                    vessels={vessels}
                    onRowClick={handleRowClick}
                  />
                </Card>
              </Grid>
            )}
          </Grid>
        </div>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Geofence;
