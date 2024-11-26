
  import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import axios from 'axios';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  CardContent
} from '@mui/material';
import Swal from 'sweetalert2';

// Define the columns for the data grid
const columns = [
  { name: 'NAME', header: 'Name', minWidth: 80 },
  { name: 'TYPE', header: 'Type', minWidth: 80 },
  { name: 'IMO', header: 'IMO', minWidth: 80 },
  { name: 'ETA', header: 'ETA', minWidth: 80 },
  { name: 'DESTINATION', header: 'Destination', minWidth: 80 },
  { name: 'SPEED', header: 'Speed', maxWidth: 80 },
  { name: 'LATITUDE', header: 'Latitude', maxWidth: 80 },
  { name: 'LONGITUDE', header: 'Longitude', maxWidth: 80 },
  { name: 'HEADING', header: 'Heading', maxWidth: 80 },
  { name: 'ZONE', header: 'Zone', maxWidth: 80 },
];

// Styles for the grid and header
const gridStyle = {
  minHeight: 450,
};

const headerStyle = {
  backgroundColor: 'blue',
  color: 'white',
  textAlign: 'center',
};

// CSS for blinking effect
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  .blink {
    animation: blink-animation 1s infinite;
  }

  @keyframes blink-animation {
    0% { background-color: yellow; }
    50% { background-color: transparent; }
    100% { background-color: yellow; }
  }
`;
document.head.appendChild(styleSheet);

// Function to download blob as a file
const downloadBlob = (blob, fileName = 'data.csv') => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.position = 'absolute';
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Main component definition
const VesselDetailsTable = ({ highlightRow, onRowClick }) => {
  const [vessels, setVessels] = useState([]);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  // Fetch vessel data from the API
  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-tracked-vessels`);
        const formattedData = response.data.map(vessel => ({
          NAME: vessel.AIS?.NAME || '',
          TYPE: vessel.SpireTransportType || '',
          IMO: vessel.AIS?.IMO || 0,
          ETA: vessel.AIS?.ETA || '',
          SPEED: vessel.AIS?.SPEED || 0,
          LATITUDE: vessel.AIS?.LATITUDE || 0,
          LONGITUDE: vessel.AIS?.LONGITUDE || 0,
          DESTINATION: vessel.AIS?.DESTINATION || '',
          HEADING: vessel.AIS?.HEADING || '',
          ZONE: vessel.AIS?.ZONE || '',
          isNew: isNewVessel(vessel), 
        }));
        setVessels(formattedData.reverse());
      } catch (error) {
        console.error('Error fetching tracked vessels:', error);
        setError(error.message);
      }
    };

    fetchVessels();
  }, []);

  // Determine if a vessel is new
  const isNewVessel = (vessel) => {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    return new Date(vessel.timestamp) > oneMinuteAgo; // Adjust this condition as needed
  };

  // Highlight a specific row based on the `highlightRow` prop
  useEffect(() => {
    if (highlightRow) {
      const row = vessels.find(vessel => vessel.IMO === highlightRow.imo);
      if (row) {
        handleRowClick({ data: row });
      }
    }
  }, [highlightRow, vessels]);

  // Handle row click to pass data to the parent component
  const handleRowClick = (row) => {
    const { NAME, IMO, LATITUDE, LONGITUDE, HEADING, ETA, DESTINATION } = row.data;
    onRowClick({ name: NAME, imo: IMO, lat: LATITUDE, lng: LONGITUDE, heading: HEADING, eta:ETA , destination:DESTINATION });
  };

  // Update search value state when input changes
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Filter vessels based on the search input
  const filteredVessels = vessels.filter(vessel =>
    Object.values(vessel).some(value =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  );

  // Export vessel data to CSV
  const exportCSV = () => {
    const header = columns.map(c => c.header).join(',');
    const rows = filteredVessels.map(vessel =>
      columns.map(c => vessel[c.name] || '').join(',')
    );
    const contents = [header].concat(rows).join('\n');
    const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'vessel-details.csv');
  };

  // Open the modal dialog
  const handleModalOpen = () => {
    setOpenModal(true);
  };

  // Close the modal dialog with an alert
  const handleModalClose = () => {
    setOpenModal(false);
    Swal.fire({
      title: 'Alert',
      text: 'You are about to close without saving!',
      icon: 'warning',
      confirmButtonText: 'OK'
    });
  };

  // Save input from the modal dialog
  const handleSave = () => {
    if (inputValue.trim() === '') {
      setInputError('Input cannot be empty');
      return;
    }
    setOpenModal(false);
    Swal.fire({
      title: 'Success!',
      text: 'Your custom data has been saved.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  };

  // Display error message if there is a problem with fetching data
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ position: 'relative', minHeight: 450 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={exportCSV}
            sx={{
              color: '#FFFFFF',
              backgroundColor: '#1976d2',
              fontSize: '0.8rem',
              padding: '6px 12px'
            }}
          >
            <i className="fa fa-file-excel-o" />&nbsp; Export Excel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleModalOpen}
            sx={{
              color: '#FFFFFF',
              backgroundColor: '#1976d2',
              fontSize: '0.8rem',
              padding: '6px 12px'
            }}
          >
            <i className="fa fa-database" />&nbsp; Custom Data
          </Button>
        </Box>
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Search"
          style={{ height: '30px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </Box>

      <ReactDataGrid
        columns={columns}
        dataSource={filteredVessels}
        idProperty="IMO"
        rowClassName={row =>
          highlightRow?.imo === row.IMO
            ? 'highlight-row'
            : row.isNew
              ? 'blink'
              : ''
        }
        onRowClick={handleRowClick}
        style={gridStyle}
        pagination
        headerStyle={headerStyle}
      />

      <Dialog open={openModal} onClose={handleModalClose}>
        <DialogTitle>Custom Data</DialogTitle>
        <DialogContent>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1">Enter your custom data here:</Typography>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              {inputError && <Typography color="error">{inputError}</Typography>}
            </Box>
          </CardContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} color="primary">Save</Button>
          <Button onClick={handleModalClose} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Define prop types for the component
VesselDetailsTable.propTypes = {
  highlightRow: PropTypes.shape({
    imo: PropTypes.number,
  }),
  onRowClick: PropTypes.func.isRequired,
};

export default VesselDetailsTable;
