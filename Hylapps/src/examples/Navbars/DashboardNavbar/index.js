import { useState, useEffect, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import Badge from "@mui/material/Badge"; // Import Badge component
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
import './style.css';
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarDesktopMenu,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";
import {
  useArgonController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import Swal from 'sweetalert2';
import team2 from "assets/images/team-2.jpg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";
import Dialog from "@mui/material/Dialog"; // Import Dialog for popup form
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from 'axios';
import { AuthContext } from "../../../AuthContext";

function DashboardNavbar({ absolute, light, isMini, showButton, dropdownOptions, vesselEntries }) {
  console.log(vesselEntries);
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [satValues, setSatValues] = useState({});
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const { role, id } = useContext(AuthContext);
  
  
   // Fetch NAVSTAT intervals on mount
   useEffect(() => {
    const fetchSatIntervals = async () => {
      try {

        const baseURL = process.env.REACT_APP_API_BASE_URL;
    
       
        const response = await axios.get(`${baseURL}/api/sat-intervals`);
        const intervals = response.data;
        setSatValues({
          sat0: intervals.sat0 / 1000 / 60,
          sat1a: intervals.sat1a / 1000 / 60,
          sat1b: intervals.sat1b / 1000 / 60,
        });
      } catch (error) {
        console.error('Error fetching SAT intervals:', error);
      }
    };

    fetchSatIntervals();
  }, []);

  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  // useEffect(() => {
  //   setFilteredOptions(
  //     dropdownOptions.filter(option =>
  //       option.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //   );
  // }, [searchTerm, dropdownOptions]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(null);

  const handleDropdownClick = (event) => {
    setDropdownAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setDropdownAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSettingsOpen = () => {
    setOpenSettingsDialog(true);
  };

  const handleSettingsClose = () => {
    setOpenSettingsDialog(false);
  };

  const handleSatChange = (sat) => (event) => {
    setSatValues({ ...satValues, [sat]: event.target.value });
  };

  const handleFormSubmit = async () => {
    try {


      const baseURL = process.env.REACT_APP_API_BASE_URL;
    
      await axios.put(`${baseURL}/api/sat-intervals`, {
        sat0: satValues.sat0 * 1000 * 60,
        sat1a: satValues.sat1a * 1000 * 60,
        sat1b: satValues.sat1b * 1000 * 60,
     
      });
      handleSettingsClose();
      // Show success alert using SweetAlert2
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'SAT intervals updated successfully!',
      confirmButtonText: 'OK',
    });

    } catch (error) {
      console.error('Error updating SAT intervals:', error);
       // Show error alert using SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to update SAT intervals. Please try again.',
      confirmButtonText: 'OK',
    });
    }
  };

  const validateInputs = () => {
    for (const sat in satValues) {
      if (satValues[sat] < 0) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Input',
          text: `${sat.toUpperCase()} must be 0 or greater.`,
        });
        return false; // Return false if validation fails
      }
    }
    return true; // Return true if validation passes
  };

  const handleSubmit = () => {
    if (validateInputs()) {
      handleFormSubmit(); // Call the original submit function if validation passes
    }
  };

  const renderMenu = () => {
    const vesselEntriesArray = Array.isArray(vesselEntries)
      ? vesselEntries
      : Object.keys(vesselEntries).map((key) => ({ name: key, ...vesselEntries[key] }));
  
    return (
      <Menu
        anchorEl={openMenu}
        anchorReference={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={Boolean(openMenu)}
        onClose={handleCloseMenu}
        sx={{ mt: 2 }}
      >
        {vesselEntriesArray.length ? (
          vesselEntriesArray.map((vessel, index) => (
            <NotificationItem
              key={index}
              image={<DirectionsBoatIcon />}  // Use ship icon here
              title={vessel.name || "Unnamed Vessel"}
              date={vessel.entryTime || "No entry time available"}
              geofenceName={vessel.geofence || "No geofence name"}  // Add geofenceName
              onClick={handleCloseMenu}
            />
          ))
        ) : (
          <MenuItem disabled>No vessels available</MenuItem>
        )}
      </Menu>
    );
  };

  const renderDropdown = () => (
    <Menu
      anchorEl={dropdownAnchorEl}
      anchorReference="anchorEl"
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={Boolean(dropdownAnchorEl)}
      onClose={handleDropdownClose}
      sx={{ mt: 2, padding: 2, minWidth: 200 }}  // Add padding and minWidth for better layout
    >
      <MenuItem>
        <ArgonInput 
          placeholder="Search..." 
          fullWidth 
          onChange={handleSearchChange}
          value={searchTerm}
        />
      </MenuItem>

      {/* Dropdown options from props */}
      {filteredOptions.length ? (
        filteredOptions.map((option, index) => (
          <MenuItem key={index} onClick={() => {
            // Handle option selection if needed
            handleDropdownClose();
          }}>
            {option}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>No options available</MenuItem>
      )}
    </Menu>
  );

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
      style={{ marginTop: '-30px' }}
    >
      <Toolbar sx={(theme) => navbarContainer(theme, { navbarType })}>
        <ArgonBox
          color={light && transparentNavbar ? "white" : "dark"}
          mb={{ xs: 1, md: 0 }}
          sx={(theme) => navbarRow(theme, { isMini })}
        >
          <Breadcrumbs
            icon="home"
            title={route[route.length - 1]}
            route={route}
            light={transparentNavbar ? light : false}
          />
          <Icon fontSize="medium" sx={navbarDesktopMenu} onClick={handleMiniSidenav}>
            {miniSidenav ? "menu_open" : "menu"}
          </Icon>
        </ArgonBox>

        {isMini ? null : (
          <ArgonBox sx={(theme) => navbarRow(theme, { isMini })}>
            <ArgonBox color={light ? "white" : "inherit"} display="flex" alignItems="center">

              <IconButton
                size="small"
                color={light && transparentNavbar ? "white" : "dark"}
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon>{miniSidenav ? "menu_open" : "menu"}</Icon>
              </IconButton>
            
              {(role === "hyla admin" || role === "organization admin") && (
                <IconButton
                  size="small"
                  color={light && transparentNavbar ? "white" : "dark"}
                  sx={navbarIconButton}
                  onClick={handleSettingsOpen}  // Open settings dialog on click
                >
                  <Icon>settings</Icon>
                </IconButton>
                )}

<IconButton
  size="small"
  color={light && transparentNavbar ? "white" : "dark"}
  sx={navbarIconButton}
  aria-controls="notification-menu"
  aria-haspopup="true"
  variant="contained"
  onClick={handleOpenMenu}
>
  <Badge
    badgeContent={Object.keys(vesselEntries).length}
    // color="secondary"
    sx={{
      "& .MuiBadge-dot": {
        backgroundColor: light ? "white" : "black",
      },
      "& .MuiBadge-badge": {
        right: 0, // Adjust badge position horizontally
        top: -3, // Adjust badge position vertically
        padding: '0 4px', // Smaller padding
        fontSize: '0.75rem', // Smaller font size
        minWidth: '16px', // Smaller minimum width
        height: '16px', // Smaller height
        borderRadius: '50%', // Fully rounded badge
        display: 'flex', // Center text horizontally and vertically
        alignItems: 'center', // Center text vertically
        justifyContent: 'center', // Center text horizontally
        backgroundColor:'red'
      },
    }}
  >
    <Icon>notifications</Icon>
  </Badge>
</IconButton>
            </ArgonBox>
          </ArgonBox>
        )}
      </Toolbar>
      {renderDropdown()}
      {renderMenu()}
      {/* Settings Dialog for NAVSTAT Input */} 
      <Dialog
  open={openSettingsDialog}
  onClose={handleSettingsClose}
  className="dialog"
  fullWidth={false}
  maxWidth="xs"
  PaperProps={{
    style: {
      padding: '15px', // Slightly larger padding for better spacing
      borderRadius: '8px', 
     
      overflow: 'hidden', // No scrollbars
    }
  }}
>
  <DialogTitle
    className="dialog-title"
    style={{ fontSize: '1rem', textAlign: 'center', fontWeight: 'bold' }} // Keep title small and centered
  >
    UPDATE SAT INTERVALS<span style={{ marginLeft: '5px', fontSize: '12px', color: '#555' }}>(In Minutes)</span>
  </DialogTitle>
  <DialogContent
    className="dialog-content"
    style={{ padding: '8px', overflow: 'hidden' }} // Prevents overflow and keeps padding compact
  > 
    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
  {Object.keys(satValues).map((sat, index) => (
    <div key={sat} className="grid-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <label className="label" style={{ marginBottom: '3px', fontSize: '12px', color: '#555' }}>
        {`SAT ${index}`} {/* Displaying "STAT" followed by the index */}
      </label>
      <TextField
        className="text-field"
        type="number"
        value={satValues[sat]}
        onChange={handleSatChange(sat)}
        variant="outlined"
        inputProps={{ min: 0 }}
        style={{ width: '100px', fontSize: '12px' }} // Slightly wider input for usability
      />
    </div>
  ))}
</div>

  </DialogContent>
  <DialogActions
    className="dialog-actions"
    style={{ justifyContent: 'flex-end', padding: '8px' }} // Small padding for actions
  >
    <Button onClick={handleSettingsClose} color="secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>
      Cancel
    </Button>
    <Button onClick={handleSubmit} color="primary" variant="contained" style={{ fontSize: '12px', padding: '4px 8px' }}>
      Update
    </Button>
  </DialogActions>
</Dialog>

    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: true,
  isMini: false,
  showButton: false,
  dropdownOptions: [],
  vesselEntries: [],
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  showButton: PropTypes.bool,
  dropdownOptions: PropTypes.arrayOf(PropTypes.string),
  vesselEntries: PropTypes.arrayOf(PropTypes.object), // Add prop validation for notifications
};

export default DashboardNavbar;
